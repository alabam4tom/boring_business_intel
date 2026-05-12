import type PgBoss from "pg-boss";
import type { CodatSyncPayload } from "./index.js";
import { db } from "@repo/db";
import { kpiSubmissions, codatConnections, dataQualityScores } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { fetchCodatPnl } from "../services/codat-client.js";
import { normalizeToAnnual } from "../services/coa-normalizer.js";
import { computeKpis } from "../services/kpi-calculator.js";
import { computeDataQuality, isOutlierSubmission } from "../services/data-quality.js";

export async function codatSyncWorker(jobs: PgBoss.JobWithMetadata<CodatSyncPayload>[]): Promise<void> {
  for (const job of jobs) {
    try {
      await runSync(job.data);
    } catch (err) {
      console.error({ jobId: job.id, retryCount: job.retryCount, retryLimit: job.retryLimit, ...job.data, err }, "[codat-sync] job failed");
      // Stamp syncFailedAt when all retries are exhausted
      if (job.retryCount >= job.retryLimit) {
        await db
          .update(codatConnections)
          .set({ syncFailedAt: new Date(), updatedAt: new Date() })
          .where(eq(codatConnections.codatConnectionId, job.data.codatConnectionId));
        console.error(
          { organizationId: job.data.organizationId, codatCompanyId: job.data.codatCompanyId },
          "[codat-sync] all retries exhausted — sync_failed_at set"
        );
      }
      throw err;
    }
  }
}

async function runSync(payload: CodatSyncPayload): Promise<void> {
  const { organizationId, codatConnectionId, codatCompanyId } = payload;

  const pnlResponse = await fetchCodatPnl(codatCompanyId);

  const annualMetrics = normalizeToAnnual(pnlResponse.reports);

  if (!annualMetrics.length) {
    throw new Error("[codat-sync] no valid periods after normalization — will retry");
  }

  const kpiResults = computeKpis(annualMetrics);

  for (const kpi of kpiResults) {
    const outlier = isOutlierSubmission(kpi);
    await db
      .insert(kpiSubmissions)
      .values({
        id: uuidv7(),
        organizationId,
        periodYear: kpi.year,
        revenueGrowth: kpi.revenueGrowth,
        grossMargin: kpi.grossMargin,
        netMargin: kpi.netMargin,
        isOutlier: outlier,
      })
      .onConflictDoUpdate({
        target: [kpiSubmissions.organizationId, kpiSubmissions.periodYear],
        set: {
          revenueGrowth: kpi.revenueGrowth,
          grossMargin: kpi.grossMargin,
          netMargin: kpi.netMargin,
          isOutlier: outlier,
        },
      });
  }

  const totalPeriodsAvailable = annualMetrics.reduce((sum, m) => sum + m.periodsCount, 0);
  const { score, issues } = computeDataQuality(kpiResults, totalPeriodsAvailable);

  await db
    .insert(dataQualityScores)
    .values({
      id: uuidv7(),
      organizationId,
      score,
      periodsAvailable: totalPeriodsAvailable,
      issues,
    })
    .onConflictDoUpdate({
      target: [dataQualityScores.organizationId],
      set: { score, periodsAvailable: totalPeriodsAvailable, issues, computedAt: new Date() },
    });

  await db
    .update(codatConnections)
    .set({ lastSyncAt: new Date() })
    .where(eq(codatConnections.codatConnectionId, codatConnectionId));

  console.info(
    { organizationId, codatCompanyId, yearsIngested: kpiResults.length, score },
    "[codat-sync] sync complete"
  );
}
