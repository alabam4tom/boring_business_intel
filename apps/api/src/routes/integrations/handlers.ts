import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { codatConnections } from "@repo/db/schema";
import { AppError } from "@repo/shared/errors";
import { and, eq, or } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { createCodatCompany, createCodatConnection, deleteCodatConnection, QBO_PLATFORM_KEY, XERO_PLATFORM_KEY } from "../../services/codat-client.js";
import { connectQuickBooksSchema, connectXeroSchema } from "./schemas.js";
import { getBoss } from "../../workers/index.js";

type Provider = "quickbooks_online" | "xero";

const PROVIDER_MAP: Record<string, Provider> = {
  quickbooks: "quickbooks_online",
  xero: "xero",
};

async function requireOwner(app: FastifyInstance, request: FastifyRequest) {
  const session = await app.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
  if (!session?.user) throw new AppError("UNAUTHORIZED", "Not authenticated", 401);

  const membership = await db.query.organizationMembers.findFirst({
    where: (m, { eq }) => eq(m.userId, session.user.id),
  });
  if (!membership) throw new AppError("NO_ORG", "No organization found", 404);
  if (membership.role !== "owner") throw new AppError("FORBIDDEN", "Only organization owners can manage integrations", 403);

  return { session, membership };
}

async function connectProvider(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  provider: Provider,
  platformKey: string,
  schema: typeof connectQuickBooksSchema
) {
  const session = await app.auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
  if (!session?.user) {
    return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
  }

  const result = schema.safeParse(request.body);
  if (!result.success) {
    return reply.status(400).send({ error: { code: "CONSENT_REQUIRED", message: "Consent must be accepted to proceed" } });
  }

  const membership = await db.query.organizationMembers.findFirst({
    where: (m, { eq }) => eq(m.userId, session.user.id),
  });
  if (!membership) {
    return reply.status(404).send({ error: { code: "NO_ORG", message: "No organization found" } });
  }
  if (membership.role !== "owner") {
    return reply.status(403).send({ error: { code: "FORBIDDEN", message: "Only organization owners can connect integrations" } });
  }

  const existingLinked = await db.query.codatConnections.findFirst({
    where: (c, { and, eq }) =>
      and(
        eq(c.organizationId, membership.organizationId),
        eq(c.provider, provider),
        eq(c.status, "linked")
      ),
  });
  if (existingLinked) {
    const providerLabel = provider === "quickbooks_online" ? "QuickBooks" : "Xero";
    return reply.status(409).send({ error: { code: "INTEGRATION_ALREADY_CONNECTED", message: `A ${providerLabel} connection is already active` } });
  }

  // Clean up stale pending_auth rows before creating a new attempt
  await db.delete(codatConnections).where(
    and(
      eq(codatConnections.organizationId, membership.organizationId),
      eq(codatConnections.provider, provider),
      eq(codatConnections.status, "pending_auth")
    )
  );

  const org = await db.query.organizations.findFirst({
    where: (o, { eq }) => eq(o.id, membership.organizationId),
  });
  if (!org) {
    return reply.status(404).send({ error: { code: "ORG_NOT_FOUND", message: "Organization not found" } });
  }

  let codatCompanyId: string;
  try {
    codatCompanyId = await createCodatCompany(org.name);
  } catch (err) {
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message } });
    }
    app.log.error(err, "Codat company creation failed");
    return reply.status(502).send({ error: { code: "CODAT_ERROR", message: "Failed to set up accounting connection" } });
  }

  // Insert row before createCodatConnection so a fast webhook can find it
  const rowId = uuidv7();
  await db.insert(codatConnections).values({
    id: rowId,
    organizationId: membership.organizationId,
    provider,
    codatCompanyId,
    codatConnectionId: null,
    status: "pending_auth",
    consentAcceptedAt: new Date(),
  });

  let connectionId: string;
  let linkUrl: string;
  try {
    const conn = await createCodatConnection(codatCompanyId, platformKey);
    connectionId = conn.connectionId;
    linkUrl = conn.linkUrl;
  } catch (err) {
    await db.delete(codatConnections).where(eq(codatConnections.id, rowId)).catch(() => {});
    if (err instanceof AppError) {
      return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message } });
    }
    app.log.error(err, "Codat connection setup failed");
    return reply.status(502).send({ error: { code: "CODAT_ERROR", message: "Failed to set up accounting connection" } });
  }

  try {
    await db.update(codatConnections)
      .set({ codatConnectionId: connectionId })
      .where(eq(codatConnections.id, rowId));
  } catch (err) {
    await db.delete(codatConnections).where(eq(codatConnections.id, rowId)).catch(() => {});
    await deleteCodatConnection(codatCompanyId, connectionId).catch(() => {});
    app.log.error(err, "Failed to store Codat connection ID after creation");
    return reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "Failed to complete accounting connection setup" } });
  }

  app.log.info({ organizationId: membership.organizationId, provider, action: "integration.connect_initiated" }, "Accounting connection initiated");

  return reply.status(201).send({ data: { linkUrl } });
}

export async function integrationHandlers(app: FastifyInstance) {
  app.post("/api/v1/integrations/quickbooks/connect", async (request, reply) => {
    return connectProvider(app, request, reply, "quickbooks_online", QBO_PLATFORM_KEY, connectQuickBooksSchema);
  });

  app.post("/api/v1/integrations/xero/connect", async (request, reply) => {
    return connectProvider(app, request, reply, "xero", XERO_PLATFORM_KEY, connectXeroSchema);
  });

  app.post("/api/v1/integrations/:provider/sync", async (request, reply) => {
    try {
      const { membership } = await requireOwner(app, request);
      const { provider: providerParam } = request.params as { provider: string };
      const provider = PROVIDER_MAP[providerParam];
      if (!provider) {
        return reply.status(400).send({ error: { code: "INVALID_PROVIDER", message: "Unknown provider" } });
      }

      const conn = await db.query.codatConnections.findFirst({
        where: (c, { and, eq }) =>
          and(eq(c.organizationId, membership.organizationId), eq(c.provider, provider), eq(c.status, "linked")),
      });
      if (!conn || !conn.codatConnectionId) {
        return reply.status(404).send({ error: { code: "NOT_CONNECTED", message: "No active connection found for this provider" } });
      }

      await getBoss().send("codat-sync", {
        organizationId: membership.organizationId,
        codatConnectionId: conn.codatConnectionId,
        codatCompanyId: conn.codatCompanyId,
        triggeredBy: "manual",
      });

      app.log.info({ organizationId: membership.organizationId, provider, action: "integration.manual_sync" }, "Manual re-sync triggered");
      return reply.status(202).send({ data: { message: "Sync initiated" } });
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message } });
      app.log.error(err);
      return reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "Unexpected error" } });
    }
  });

  app.delete("/api/v1/integrations/:provider", async (request, reply) => {
    try {
      const { membership } = await requireOwner(app, request);
      const { provider: providerParam } = request.params as { provider: string };
      const provider = PROVIDER_MAP[providerParam];
      if (!provider) {
        return reply.status(400).send({ error: { code: "INVALID_PROVIDER", message: "Unknown provider" } });
      }

      const conn = await db.query.codatConnections.findFirst({
        where: (c, { and, eq, or }) =>
          and(
            eq(c.organizationId, membership.organizationId),
            eq(c.provider, provider),
            or(eq(c.status, "linked"), eq(c.status, "pending_auth"))
          ),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
      });
      if (!conn) {
        return reply.status(404).send({ error: { code: "NOT_CONNECTED", message: "No active connection found for this provider" } });
      }

      // Best-effort Codat deletion — don't fail if Codat is unavailable
      if (conn.codatConnectionId) {
        try {
          await deleteCodatConnection(conn.codatCompanyId, conn.codatConnectionId);
        } catch (err) {
          app.log.warn({ organizationId: membership.organizationId, provider, err }, "Codat deletion failed — continuing with local disconnect");
        }
      }

      await db.update(codatConnections)
        .set({ status: "unlinked", updatedAt: new Date() })
        .where(eq(codatConnections.id, conn.id));

      app.log.info({ organizationId: membership.organizationId, provider, action: "integration.disconnected" }, "Integration disconnected");
      return reply.status(204).send();
    } catch (err) {
      if (err instanceof AppError) return reply.status(err.statusCode).send({ error: { code: err.code, message: err.message } });
      app.log.error(err);
      return reply.status(500).send({ error: { code: "INTERNAL_ERROR", message: "Unexpected error" } });
    }
  });

  app.get("/api/v1/integrations", async (request, reply) => {
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
      return reply.send({
        data: {
          quickbooks_online: { status: "none", linkedAt: null, lastSyncAt: null },
          xero: { status: "none", linkedAt: null, lastSyncAt: null },
        },
      });
    }

    const connections = await db.query.codatConnections.findMany({
      where: (c, { eq }) => eq(c.organizationId, membership.organizationId),
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    });

    const byProvider = (provider: Provider) => {
      const providerConns = connections.filter((c) => c.provider === provider);
      const conn =
        providerConns.find((c) => c.status === "linked") ??
        providerConns.find((c) => c.status === "pending_auth") ??
        providerConns[0];
      if (!conn) return { status: "none" as const, linkedAt: null, lastSyncAt: null };
      return {
        status: conn.status,
        linkedAt: conn.linkedAt?.toISOString() ?? null,
        lastSyncAt: conn.lastSyncAt?.toISOString() ?? null,
      };
    };

    return reply.send({
      data: {
        quickbooks_online: byProvider("quickbooks_online"),
        xero: byProvider("xero"),
      },
    });
  });
}
