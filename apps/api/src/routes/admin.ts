import type { FastifyInstance } from "fastify";
import { db } from "@repo/db";
import { K_ANONYMITY_THRESHOLD } from "@repo/shared/constants/kpi";

export async function adminRoutes(app: FastifyInstance) {
  app.get("/api/v1/admin/sync-health", async (request, reply) => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      app.log.warn("[admin] ADMIN_SECRET not set — admin routes disabled");
      return reply.status(503).send({ error: { code: "ADMIN_DISABLED", message: "Admin secret not configured" } });
    }

    const auth = request.headers.authorization;
    if (auth !== `Bearer ${adminSecret}`) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Invalid admin secret" } });
    }

    // Connection summary + recent failures
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

    // Segment health
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

    return reply.send({
      data: { connectionSummary, recentFailures, segmentHealth },
    });
  });
}
