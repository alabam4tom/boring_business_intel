import type { FastifyInstance, FastifyRequest } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { organizations, organizationMembers, invitations, user as userTable } from "@repo/db/schema";
import { eq, and } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { randomBytes } from "crypto";
import { z } from "zod";

const inviteBodySchema = z.object({ email: z.string().email() });
const roleBodySchema = z.object({ role: z.enum(["admin", "viewer"]) });

type AuthErr = { status: number; code: string; message: string };

async function resolveAuth(app: FastifyInstance, request: FastifyRequest) {
  const session = await app.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session?.user) {
    return { error: { status: 401, code: "UNAUTHORIZED", message: "Not authenticated" } as AuthErr, session: null, membership: null };
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: (m, { eq }) => eq(m.userId, session.user.id),
  });
  if (!membership) {
    return { error: { status: 404, code: "NO_ORG", message: "No organization found" } as AuthErr, session, membership: null };
  }

  return { error: null as null, session, membership };
}

export async function membersRoutes(app: FastifyInstance) {
  // GET /api/v1/members — list org members (any member)
  app.get("/api/v1/members", async (request, reply) => {
    const auth = await resolveAuth(app, request as never);
    if (auth.error) return reply.status(auth.error.status).send({ error: { code: auth.error.code, message: auth.error.message } });
    const { membership } = auth;

    const members = await db
      .select({
        id: organizationMembers.id,
        userId: organizationMembers.userId,
        role: organizationMembers.role,
        joinedAt: organizationMembers.joinedAt,
        name: userTable.name,
        email: userTable.email,
      })
      .from(organizationMembers)
      .innerJoin(userTable, eq(organizationMembers.userId, userTable.id))
      .where(eq(organizationMembers.organizationId, membership!.organizationId));

    return reply.send({ data: members });
  });

  // POST /api/v1/members/invite — send invite (owner or admin)
  app.post("/api/v1/members/invite", async (request, reply) => {
    const auth = await resolveAuth(app, request as never);
    if (auth.error) return reply.status(auth.error.status).send({ error: { code: auth.error.code, message: auth.error.message } });
    const { membership } = auth;

    if (membership!.role === "viewer") {
      return reply.status(403).send({ error: { code: "FORBIDDEN", message: "Only owners and admins can invite members" } });
    }

    const result = inviteBodySchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Invalid email address" } });
    }
    const { email } = result.data;

    // Check if email already belongs to an existing member of this org
    const existingMember = await db
      .select({ id: organizationMembers.id })
      .from(organizationMembers)
      .innerJoin(userTable, eq(organizationMembers.userId, userTable.id))
      .where(
        and(
          eq(organizationMembers.organizationId, membership!.organizationId),
          eq(userTable.email, email),
        )
      )
      .limit(1);

    if (existingMember.length > 0) {
      return reply.status(409).send({ error: { code: "ALREADY_MEMBER", message: "This email already belongs to a member of your organization" } });
    }

    // Check for existing pending (non-expired) invitation
    const existingInvite = await db.query.invitations.findFirst({
      where: (inv, { eq, and, gt }) =>
        and(
          eq(inv.organizationId, membership!.organizationId),
          eq(inv.email, email),
          gt(inv.expiresAt, new Date()),
        ),
    });

    if (existingInvite) {
      return reply.status(409).send({ error: { code: "INVITE_PENDING", message: "An invitation has already been sent to this email" } });
    }

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inviteId = uuidv7();

    await db.insert(invitations).values({
      id: inviteId,
      organizationId: membership!.organizationId,
      email,
      role: "viewer",
      token,
      expiresAt,
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      const org = await db.query.organizations.findFirst({
        where: (o, { eq }) => eq(o.id, membership!.organizationId),
      });
      const appUrl = process.env.APP_URL ?? "http://localhost:3000";
      const inviteUrl = `${appUrl}/invitations/accept?token=${token}`;
      const from = process.env.EMAIL_FROM ?? "noreply@boringbusinessintel.com";
      const orgName = org?.name ?? "your organization";

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: email,
          subject: `You've been invited to join ${orgName} on BoringBusinessIntel`,
          html: `<p>You've been invited to join <strong>${orgName}</strong>.</p><p><a href="${inviteUrl}">Accept invitation</a></p><p>This link expires in 7 days.</p>`,
        }),
      });

      if (!emailRes.ok) {
        app.log.warn({ email, status: emailRes.status }, "Resend email delivery failed — invitation still created");
      }
    } else {
      app.log.warn({ email }, "RESEND_API_KEY not set — skipping invite email");
    }

    return reply.status(201).send({ data: { id: inviteId, email, expiresAt: expiresAt.toISOString() } });
  });

  // GET /api/v1/invitations/:token — validate invite token (public)
  app.get("/api/v1/invitations/:token", async (request, reply) => {
    const { token } = request.params as { token: string };

    const invite = await db.query.invitations.findFirst({
      where: (inv, { eq }) => eq(inv.token, token),
    });

    if (!invite) {
      return reply.status(404).send({ error: { code: "INVITE_NOT_FOUND", message: "Invitation not found" } });
    }

    if (invite.expiresAt < new Date()) {
      return reply.status(410).send({ error: { code: "INVITE_EXPIRED", message: "This invitation has expired" } });
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, invite.organizationId),
    });

    return reply.send({
      data: {
        email: invite.email,
        orgName: org?.name ?? "",
        role: invite.role,
      },
    });
  });

  // POST /api/v1/invitations/:token/accept — accept invite (authenticated)
  app.post("/api/v1/invitations/:token/accept", async (request, reply) => {
    const session = await app.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const { token } = request.params as { token: string };

    const invite = await db.query.invitations.findFirst({
      where: (inv, { eq }) => eq(inv.token, token),
    });

    if (!invite) {
      return reply.status(404).send({ error: { code: "INVITE_NOT_FOUND", message: "Invitation not found" } });
    }

    if (invite.expiresAt < new Date()) {
      return reply.status(410).send({ error: { code: "INVITE_EXPIRED", message: "This invitation has expired" } });
    }

    if (session.user.email !== invite.email) {
      return reply.status(403).send({ error: { code: "EMAIL_MISMATCH", message: "This invitation was sent to a different email address" } });
    }

    const existingMembership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });

    if (existingMembership) {
      return reply.status(409).send({ error: { code: "ALREADY_IN_ORG", message: "You already belong to an organization" } });
    }

    await db.transaction(async (tx) => {
      await tx.insert(organizationMembers).values({
        id: uuidv7(),
        organizationId: invite.organizationId,
        userId: session.user.id,
        role: invite.role,
      });
      await tx.delete(invitations).where(eq(invitations.id, invite.id));
    });

    return reply.status(201).send({ data: { organizationId: invite.organizationId, role: invite.role } });
  });

  // PATCH /api/v1/members/:memberId/role — change role (owner only)
  app.patch("/api/v1/members/:memberId/role", async (request, reply) => {
    const auth = await resolveAuth(app, request as never);
    if (auth.error) return reply.status(auth.error.status).send({ error: { code: auth.error.code, message: auth.error.message } });
    const { membership } = auth;

    if (membership!.role !== "owner") {
      return reply.status(403).send({ error: { code: "FORBIDDEN", message: "Only owners can change member roles" } });
    }

    const result = roleBodySchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Role must be 'admin' or 'viewer'" } });
    }
    const { role } = result.data;

    const { memberId } = request.params as { memberId: string };

    if (memberId === membership!.id) {
      return reply.status(400).send({ error: { code: "CANNOT_CHANGE_OWN_ROLE", message: "You cannot change your own role" } });
    }

    const target = await db.query.organizationMembers.findFirst({
      where: (m, { eq, and }) =>
        and(
          eq(m.id, memberId),
          eq(m.organizationId, membership!.organizationId),
        ),
    });

    if (!target) {
      return reply.status(404).send({ error: { code: "MEMBER_NOT_FOUND", message: "Member not found" } });
    }

    if (target.role === "owner") {
      return reply.status(400).send({ error: { code: "CANNOT_DEMOTE_OWNER", message: "Cannot change the role of the organization owner" } });
    }

    await db.update(organizationMembers)
      .set({ role })
      .where(eq(organizationMembers.id, memberId));

    return reply.send({ data: { id: memberId, role } });
  });

  // DELETE /api/v1/members/:memberId — remove member (owner only)
  app.delete("/api/v1/members/:memberId", async (request, reply) => {
    const auth = await resolveAuth(app, request as never);
    if (auth.error) return reply.status(auth.error.status).send({ error: { code: auth.error.code, message: auth.error.message } });
    const { membership } = auth;

    if (membership!.role !== "owner") {
      return reply.status(403).send({ error: { code: "FORBIDDEN", message: "Only owners can remove members" } });
    }

    const { memberId } = request.params as { memberId: string };

    if (memberId === membership!.id) {
      return reply.status(400).send({ error: { code: "CANNOT_REMOVE_SELF", message: "You cannot remove yourself" } });
    }

    const target = await db.query.organizationMembers.findFirst({
      where: (m, { eq, and }) =>
        and(
          eq(m.id, memberId),
          eq(m.organizationId, membership!.organizationId),
        ),
    });

    if (!target) {
      return reply.status(404).send({ error: { code: "MEMBER_NOT_FOUND", message: "Member not found" } });
    }

    await db.delete(organizationMembers).where(eq(organizationMembers.id, memberId));

    return reply.send({ data: { removed: true } });
  });
}
