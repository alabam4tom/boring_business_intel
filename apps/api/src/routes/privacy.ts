import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { codatConnections, kpiSubmissions, dataQualityScores, organizationMembers } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getBoss, type DataCleanupPayload } from "../workers/index.js";

const ACCESSED_CATEGORIES = [
  "Revenue",
  "Cost of Goods Sold",
  "Gross Profit",
  "Operating Expenses",
  "Net Income / Net Profit",
];

const deleteConfirmSchema = z.object({ confirm: z.literal(true) });

export async function privacyRoutes(app: FastifyInstance) {
  // GET /api/v1/privacy/data-summary — show what data is stored (any member)
  app.get("/api/v1/privacy/data-summary", async (request, reply) => {
    const session = await app.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });

    if (!membership) {
      return reply.send({
        data: {
          connectedProviders: [],
          kpiData: { periodsAvailable: 0, years: [], oldestPeriod: null, newestPeriod: null },
          dataQuality: { score: null, computedAt: null },
          categories: ACCESSED_CATEGORIES,
        },
      });
    }

    const orgId = membership.organizationId;

    const [connections, submissions, quality] = await Promise.all([
      db.query.codatConnections.findMany({
        where: (c, { eq }) => eq(c.organizationId, orgId),
      }),
      db.select({ periodYear: kpiSubmissions.periodYear })
        .from(kpiSubmissions)
        .where(eq(kpiSubmissions.organizationId, orgId))
        .orderBy(kpiSubmissions.periodYear),
      db.query.dataQualityScores.findFirst({
        where: (dq, { eq }) => eq(dq.organizationId, orgId),
      }),
    ]);

    const years = submissions.map((s) => s.periodYear);

    return reply.send({
      data: {
        connectedProviders: connections.map((c) => ({
          provider: c.provider,
          status: c.status,
          lastSyncAt: c.lastSyncAt?.toISOString() ?? null,
        })),
        kpiData: {
          periodsAvailable: years.length,
          years,
          oldestPeriod: years.length > 0 ? years[0]! : null,
          newestPeriod: years.length > 0 ? years[years.length - 1]! : null,
        },
        dataQuality: {
          score: quality?.score ?? null,
          computedAt: quality?.computedAt?.toISOString() ?? null,
        },
        categories: ACCESSED_CATEGORIES,
      },
    });
  });

  // POST /api/v1/privacy/delete-account — queue deletion, sign out (any member)
  app.post("/api/v1/privacy/delete-account", async (request, reply) => {
    const session = await app.auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    const result = deleteConfirmSchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "CONFIRMATION_REQUIRED", message: "You must confirm the deletion request" } });
    }

    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });

    const payload: DataCleanupPayload = {
      userId: session.user.id,
      email: session.user.email,
      organizationId: membership?.organizationId ?? null,
    };

    await getBoss().send("data-cleanup", payload);

    // Invalidate session immediately
    try {
      await app.auth.api.signOut({ headers: fromNodeHeaders(request.headers) });
    } catch {
      // Non-fatal — job already queued
    }

    return reply.status(202).send({ data: { queued: true } });
  });
}
