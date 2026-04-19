import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { sql } from "drizzle-orm";
import { K_ANONYMITY_THRESHOLD } from "@repo/shared/constants/kpi";

type PercentileRow = {
  period_year: number;
  peer_count: number;
  rg_p25: number | null;
  rg_median: number | null;
  rg_p75: number | null;
  gm_p25: number | null;
  gm_median: number | null;
  gm_p75: number | null;
  nm_p25: number | null;
  nm_median: number | null;
  nm_p75: number | null;
};

export async function benchmarkRoutes(app: FastifyInstance) {
  app.get("/api/v1/benchmarks", async (request, reply) => {
    const session = await app.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session?.user) {
      return reply.status(401).send({ error: { code: "UNAUTHORIZED", message: "Not authenticated" } });
    }

    // Get org profile
    const membership = await db.query.organizationMembers.findFirst({
      where: (m, { eq }) => eq(m.userId, session.user.id),
    });
    if (!membership) {
      return reply.status(404).send({ error: { code: "NO_ORG", message: "No organization found" } });
    }

    const org = await db.query.organizations.findFirst({
      where: (o, { eq }) => eq(o.id, membership.organizationId),
    });
    if (!org) {
      return reply.status(404).send({ error: { code: "NOT_FOUND", message: "Organization not found" } });
    }

    // Get years this org has submitted
    const ownSubmissions = await db.query.kpiSubmissions.findMany({
      where: (k, { eq }) => eq(k.organizationId, membership.organizationId),
    });
    if (!ownSubmissions.length) {
      return reply.send({ data: [] });
    }

    const years = ownSubmissions.map((s) => s.periodYear);

    // Query peer percentiles — same agencySize, region, serviceType
    const rows = await db.execute(sql`
      SELECT
        k.period_year,
        COUNT(DISTINCT k.organization_id)::int AS peer_count,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY k.revenue_growth) AS rg_p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY k.revenue_growth) AS rg_median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY k.revenue_growth) AS rg_p75,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY k.gross_margin)   AS gm_p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY k.gross_margin)   AS gm_median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY k.gross_margin)   AS gm_p75,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY k.net_margin)     AS nm_p25,
        PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY k.net_margin)     AS nm_median,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY k.net_margin)     AS nm_p75
      FROM kpi_submissions k
      JOIN organizations o ON k.organization_id = o.id
      WHERE o.agency_size  = ${org.agencySize}
        AND o.region       = ${org.region}
        AND o.service_type = ${org.serviceType}
        AND k.period_year  = ANY(${years})
      GROUP BY k.period_year
      ORDER BY k.period_year DESC
    `) as PercentileRow[];

    const ownByYear = Object.fromEntries(ownSubmissions.map((s) => [s.periodYear, s]));

    const data = rows.map((row) => {
      const own = ownByYear[row.period_year];
      const thresholdMet = row.peer_count >= K_ANONYMITY_THRESHOLD;

      return {
        periodYear: row.period_year,
        peerCount: row.peer_count,
        thresholdMet,
        needed: thresholdMet ? null : K_ANONYMITY_THRESHOLD - row.peer_count,
        own: {
          revenueGrowth: own?.revenueGrowth ?? null,
          grossMargin: own?.grossMargin ?? null,
          netMargin: own?.netMargin ?? null,
        },
        peers: thresholdMet ? {
          revenueGrowth: { p25: row.rg_p25, median: row.rg_median, p75: row.rg_p75 },
          grossMargin:   { p25: row.gm_p25, median: row.gm_median, p75: row.gm_p75 },
          netMargin:     { p25: row.nm_p25, median: row.nm_median, p75: row.nm_p75 },
        } : null,
      };
    });

    return reply.send({ data });
  });
}
