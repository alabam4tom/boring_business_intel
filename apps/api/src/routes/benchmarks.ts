import type { FastifyInstance } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { db } from "@repo/db";
import { benchmarkSeeds } from "@repo/db/schema";
import { sql, and, eq, inArray } from "drizzle-orm";
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

    const ownSubmissions = await db.query.kpiSubmissions.findMany({
      where: (k, { eq }) => eq(k.organizationId, membership.organizationId),
    });
    if (!ownSubmissions.length) {
      return reply.send({ data: [] });
    }

    const years = ownSubmissions.map((s) => s.periodYear);
    const yearsSql = sql.join(years.map((y) => sql`${y}`), sql`, `);

    // Real peer percentiles
    let peerRows: PercentileRow[] = [];
    try {
      const result = await db.execute(sql`
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
          AND k.period_year  IN (${yearsSql})
          AND k.is_outlier   = false
        GROUP BY k.period_year
        ORDER BY k.period_year DESC
      `);
      peerRows = Array.from(result as unknown as Iterable<Record<string, unknown>>) as PercentileRow[];
    } catch (err) {
      app.log.error(err, "benchmark peer query failed");
    }

    // Seed data for years that don't meet threshold
    const peerByYear = Object.fromEntries(peerRows.map((r) => [r.period_year, r]));
    const yearsNeedingSeed = years.filter((y) => {
      const row = peerByYear[y];
      return !row || row.peer_count < K_ANONYMITY_THRESHOLD;
    });

    const seeds = yearsNeedingSeed.length
      ? await db.select().from(benchmarkSeeds).where(
          and(
            eq(benchmarkSeeds.agencySize, org.agencySize),
            eq(benchmarkSeeds.region, org.region),
            eq(benchmarkSeeds.serviceType, org.serviceType),
            inArray(benchmarkSeeds.periodYear, yearsNeedingSeed),
          ),
        )
      : [];

    const seedByYear = Object.fromEntries(seeds.map((s) => [s.periodYear, s]));
    const ownByYear = Object.fromEntries(ownSubmissions.map((s) => [s.periodYear, s]));

    const data = years.map((year) => {
      const own = ownByYear[year];
      const peer = peerByYear[year];
      const seed = seedByYear[year];
      const peerCount = peer?.peer_count ?? 0;
      const thresholdMet = peerCount >= K_ANONYMITY_THRESHOLD;

      let source: "peers" | "seed" | "none";
      let stats: { revenueGrowth: { p25: number | null; median: number | null; p75: number | null }; grossMargin: { p25: number | null; median: number | null; p75: number | null }; netMargin: { p25: number | null; median: number | null; p75: number | null } } | null = null;

      if (thresholdMet && peer && org.subscriptionTier !== "free") {
        source = "peers";
        stats = {
          revenueGrowth: { p25: peer.rg_p25, median: peer.rg_median, p75: peer.rg_p75 },
          grossMargin:   { p25: peer.gm_p25, median: peer.gm_median, p75: peer.gm_p75 },
          netMargin:     { p25: peer.nm_p25, median: peer.nm_median, p75: peer.nm_p75 },
        };
      } else if (seed) {
        source = "seed";
        stats = {
          revenueGrowth: { p25: seed.revenueGrowthP25, median: seed.revenueGrowthMedian, p75: seed.revenueGrowthP75 },
          grossMargin:   { p25: seed.grossMarginP25,   median: seed.grossMarginMedian,   p75: seed.grossMarginP75   },
          netMargin:     { p25: seed.netMarginP25,     median: seed.netMarginMedian,     p75: seed.netMarginP75     },
        };
      } else {
        source = "none";
      }

      return {
        periodYear: year,
        peerCount,
        thresholdMet,
        needed: thresholdMet ? null : K_ANONYMITY_THRESHOLD - peerCount,
        source,
        own: {
          revenueGrowth: own?.revenueGrowth ?? null,
          grossMargin:   own?.grossMargin   ?? null,
          netMargin:     own?.netMargin     ?? null,
        },
        peers: stats,
      };
    }).sort((a, b) => b.periodYear - a.periodYear);

    return reply.send({ data, subscriptionTier: org.subscriptionTier });
  });
}
