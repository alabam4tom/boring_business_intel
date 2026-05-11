import type { FastifyInstance } from "fastify";
import { Webhook } from "svix";
import { db } from "@repo/db";
import { codatConnections } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { getBoss } from "../../workers/index.js";
import type { CodatSyncPayload } from "../../workers/index.js";

type CodatWebhookEvent = {
  CompanyId?: string;
  ConnectionId?: string;
  Type?: string;
  EventType?: string;
  Data?: Record<string, unknown>;
};

export async function codatWebhookRoutes(app: FastifyInstance) {
  app.post(
    "/api/v1/webhooks/codat",
    { config: { rawBody: true } },
    async (request, reply) => {
      const secret = process.env.CODAT_WEBHOOK_SECRET;
      if (!secret) {
        app.log.warn("CODAT_WEBHOOK_SECRET not configured — rejecting webhook");
        return reply.status(503).send({ error: "Webhook not configured" });
      }

      const rawBody = (request as unknown as { rawBody: Buffer }).rawBody;
      const webhookId = request.headers["webhook-id"] as string | undefined;
      const webhookTimestamp = request.headers["webhook-timestamp"] as string | undefined;
      const webhookSignature = request.headers["webhook-signature"] as string | undefined;

      if (!webhookId || !webhookTimestamp || !webhookSignature) {
        return reply.status(400).send({ error: "Missing webhook signature headers" });
      }

      try {
        const wh = new Webhook(secret);
        wh.verify(rawBody.toString(), {
          "webhook-id": webhookId,
          "webhook-timestamp": webhookTimestamp,
          "webhook-signature": webhookSignature,
        });
      } catch {
        app.log.warn("Codat webhook signature verification failed");
        return reply.status(401).send({ error: "Invalid webhook signature" });
      }

      const event = request.body as CodatWebhookEvent;
      const eventType = event.Type ?? event.EventType ?? "";
      const codatCompanyId = event.CompanyId;
      const codatConnectionId = event.ConnectionId;

      app.log.info({ eventType, codatCompanyId, codatConnectionId }, "Codat webhook received");

      if (eventType === "connection.connected" && codatCompanyId) {
        const connection = await db.query.codatConnections.findFirst({
          where: (c, { and, eq }) =>
            and(eq(c.codatCompanyId, codatCompanyId), eq(c.status, "pending_auth")),
          orderBy: (c, { desc }) => [desc(c.createdAt)],
        });

        if (connection) {
          const resolvedConnectionId = codatConnectionId ?? connection.codatConnectionId;

          await db
            .update(codatConnections)
            .set({
              status: "linked",
              codatConnectionId: resolvedConnectionId,
              linkedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(codatConnections.id, connection.id));

          if (!resolvedConnectionId) {
            app.log.warn({ codatCompanyId, action: "integration.connected" }, "Codat connection.connected event missing connectionId — skipping codat-sync job");
          } else {
            try {
              const payload: CodatSyncPayload = {
                organizationId: connection.organizationId,
                codatConnectionId: resolvedConnectionId,
                codatCompanyId,
                triggeredBy: "webhook",
              };
              await getBoss().send("codat-sync", payload);
              app.log.info({ organizationId: connection.organizationId, provider: connection.provider, action: "integration.connected" }, `${connection.provider} connected, codat-sync job enqueued`);
            } catch (err) {
              app.log.error(err, "Failed to enqueue codat-sync job");
            }
          }
        } else {
          app.log.warn({ codatCompanyId, action: "integration.connected" }, "Codat connection.connected event: no matching local connection found");
        }
      } else if (
        (eventType === "connection.disconnected" || eventType === "connection.failed") &&
        codatCompanyId
      ) {
        const connection = await db.query.codatConnections.findFirst({
          where: (c, { and, eq, or }) =>
            and(
              eq(c.codatCompanyId, codatCompanyId),
              or(eq(c.status, "linked"), eq(c.status, "pending_auth"))
            ),
          orderBy: (c, { desc }) => [desc(c.createdAt)],
        });

        if (connection) {
          await db
            .update(codatConnections)
            .set({
              status: eventType === "connection.failed" ? "deauthorized" : "unlinked",
              updatedAt: new Date(),
            })
            .where(eq(codatConnections.id, connection.id));

          app.log.info({ codatCompanyId, eventType, provider: connection.provider, action: "integration.disconnected" }, `${connection.provider} connection status updated`);
        } else {
          app.log.warn({ codatCompanyId, eventType }, "Codat disconnect event: no active connection found");
        }
      }

      return reply.send({ ok: true });
    }
  );
}
