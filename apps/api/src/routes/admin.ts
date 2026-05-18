import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "@repo/db";
import { kpiSubmissions, dataQualityScores } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { K_ANONYMITY_THRESHOLD } from "@repo/shared/constants/kpi";
import { z } from "zod";

const LOW_QUALITY_THRESHOLD = 80;

function checkAdminAuth(request: FastifyRequest, reply: FastifyReply, app: FastifyInstance): boolean {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    app.log.warn("[admin] ADMIN_SECRET not set — admin routes disabled");
    reply.status(503).send({ error: { code: "ADMIN_DISABLED", message: "Admin secret not configured" } });
    return false;
  }
  if (request.headers.authorization !== `Bearer ${adminSecret}`) {
    reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Invalid admin secret" } });
    return false;
  }
  return true;
}

const outlierBodySchema = z.object({ isOutlier: z.boolean() });

export async function adminRoutes(app: FastifyInstance) {
  // GET /api/v1/admin/sync-health
  app.get("/api/v1/admin/sync-health", async (request, reply) => {
    if (!checkAdminAuth(request, reply, app)) return;

    const allConnections = await db.query.codatConnections.findMany({
      columns: { status: true, organizationId: true, provider: true, syncFailedAt: true, lastSyncAt: true },
    });

    const connectionSummary = { linked: 0, deauthorized: 0, pending_auth: 0, unlinked: 0 };
    const recentFailures: Array<{ organizationId: string; provider: string; syncFailedAt: string; lastSyncAt: string | null }> = [];

    for (const conn of allConnections) {
      const key = conn.status as keyof typeof connectionSummary;
      if (key in connectionSummary) connectionSummary[key]++;

      if (conn.syncFailedAt && (!conn.lastSyncAt || conn.syncFailedAt > conn.lastSyncAt)) {
        recentFailures.push({
          organizationId: conn.organizationId,
          provider: conn.provider,
          syncFailedAt: conn.syncFailedAt.toISOString(),
          lastSyncAt: conn.lastSyncAt?.toISOString() ?? null,
        });
      }
    }
    recentFailures.sort((a, b) => b.syncFailedAt.localeCompare(a.syncFailedAt));

    const orgs = await db.query.organizations.findMany({
      columns: { id: true, agencySize: true, region: true, serviceType: true },
    });

    const orgsWithData = await db.query.kpiSubmissions.findMany({
      columns: { organizationId: true },
    });
    const orgsWithDataSet = new Set(orgsWithData.map((s) => s.organizationId));

    const segmentMap = new Map<string, { agencySize: string; region: string; serviceType: string; orgCount: number }>();
    for (const org of orgs) {
      if (!orgsWithDataSet.has(org.id)) continue;
      const key = `${org.agencySize}|${org.region}|${org.serviceType}`;
      const existing = segmentMap.get(key) ?? { agencySize: org.agencySize, region: org.region, serviceType: org.serviceType, orgCount: 0 };
      existing.orgCount++;
      segmentMap.set(key, existing);
    }

    const segmentHealth = [...segmentMap.values()]
      .map((s) => ({ ...s, belowThreshold: s.orgCount < K_ANONYMITY_THRESHOLD }))
      .sort((a, b) => a.orgCount - b.orgCount);

    return reply.send({ data: { connectionSummary, recentFailures, segmentHealth } });
  });

  // GET /api/v1/admin/data-quality
  app.get("/api/v1/admin/data-quality", async (request, reply) => {
    if (!checkAdminAuth(request, reply, app)) return;

    const scores = await db.query.dataQualityScores.findMany();

    const totalOrgs = scores.length;
    const platformAvgScore = totalOrgs > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalOrgs)
      : 0;
    const lowScoreCount = scores.filter((s) => s.score < LOW_QUALITY_THRESHOLD).length;

    const orgsSorted = [...scores]
      .sort((a, b) => a.score - b.score)
      .map((s) => ({
        organizationId: s.organizationId,
        score: s.score,
        issues: s.issues,
        periodsAvailable: s.periodsAvailable,
        computedAt: s.computedAt.toISOString(),
      }));

    return reply.send({ data: { platformAvgScore, totalOrgs, lowScoreCount, orgs: orgsSorted } });
  });

  // GET /api/v1/admin/outliers
  app.get("/api/v1/admin/outliers", async (request, reply) => {
    if (!checkAdminAuth(request, reply, app)) return;

    const outlierRows = await db.query.kpiSubmissions.findMany({
      where: (k, { eq: eqFn }) => eqFn(k.isOutlier, true),
    });

    return reply.send({
      data: outlierRows.map((o) => ({
        id: o.id,
        organizationId: o.organizationId,
        periodYear: o.periodYear,
        revenueGrowth: o.revenueGrowth,
        grossMargin: o.grossMargin,
        netMargin: o.netMargin,
        isOutlier: o.isOutlier,
      })),
    });
  });

  // PATCH /api/v1/admin/kpi-submissions/:id/outlier
  app.patch("/api/v1/admin/kpi-submissions/:id/outlier", async (request, reply) => {
    if (!checkAdminAuth(request, reply, app)) return;

    const { id } = request.params as { id: string };
    const result = outlierBodySchema.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: { code: "INVALID_BODY", message: "isOutlier (boolean) required" } });
    }
    const { isOutlier } = result.data;

    const updated = await db
      .update(kpiSubmissions)
      .set({ isOutlier })
      .where(eq(kpiSubmissions.id, id))
      .returning({ id: kpiSubmissions.id, isOutlier: kpiSubmissions.isOutlier });

    if (!updated.length) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Submission not found" } });
    }

    app.log.info({ submissionId: id, isOutlier, adminAction: "outlier-flag" }, "[admin] outlier flag updated");

    return reply.send({ data: updated[0] });
  });
}
