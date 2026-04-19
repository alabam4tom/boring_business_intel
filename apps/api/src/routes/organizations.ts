import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { organizations, organizationMembers } from "@repo/db/schema";
import { createOrganizationSchema } from "@repo/shared/schemas/organization";
import { uuidv7 } from "uuidv7";

export async function organizationRoutes(app: FastifyInstance) {
  app.post("/api/v1/organizations", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const result = createOrganizationSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: result.error.flatten() } });
    }

    const { name, agencySize, region, serviceType } = result.data;

    const existing = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });

    if (existing) {
      return reply.status(409).send({ error: { code: "ALREADY_IN_ORG", message: "User already belongs to an organization" } });
    }

    const orgId = uuidv7();

    await db.transaction(async (tx) => {
      await tx.insert(organizations).values({ id: orgId, name, agencySize, region, serviceType });
      await tx.insert(organizationMembers).values({
        id: uuidv7(),
        organizationId: orgId,
        userId: session.user.id,
        role: "owner",
      });
    });

    return reply.status(201).send({ data: { id: orgId, name } });
  });

  app.get("/api/v1/organizations/mine", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });

    if (!membership) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "No organization found" } });
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, membership.organizationId),
    });

    return reply.send({ data: { ...org, role: membership.role } });
  });
}
