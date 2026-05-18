import type PgBoss from "pg-boss";
import { db } from "@repo/db";
import { getBoss } from "./index.js";

function buildMonthlyReportHtml(
  name: string,
  kpi: { periodYear: number; revenueGrowth: number | null; grossMargin: number | null; netMargin: number | null },
): string {
  const fmt = (v: number | null) => (v != null ? `${v.toFixed(1)}%` : "N/A");
  const appUrl = process.env.APP_URL ?? "https://app.boringbusinessintel.com";
  return `
    <p>Hi ${name},</p>
    <p>Here are your <strong>${kpi.periodYear}</strong> financial metrics on BoringBusinessIntel:</p>
    <ul>
      <li>Revenue Growth: <strong>${fmt(kpi.revenueGrowth)}</strong></li>
      <li>Gross Margin: <strong>${fmt(kpi.grossMargin)}</strong></li>
      <li>Net Margin: <strong>${fmt(kpi.netMargin)}</strong></li>
    </ul>
    <p><a href="${appUrl}/dashboard">View your full benchmark comparison →</a></p>
    <p>The BoringBusinessIntel team</p>
  `;
}

export async function monthlyReportWorker(jobs: PgBoss.Job[]): Promise<void> {
  // Load all KPI submissions, deduplicate by org keeping most recent year
  const allSubmissions = await db.query.kpiSubmissions.findMany({
    columns: { organizationId: true, periodYear: true, revenueGrowth: true, grossMargin: true, netMargin: true },
  });

  const latestByOrg = new Map<string, typeof allSubmissions[0]>();
  for (const row of allSubmissions) {
    const existing = latestByOrg.get(row.organizationId);
    if (!existing || row.periodYear > existing.periodYear) {
      latestByOrg.set(row.organizationId, row);
    }
  }

  console.info({ orgCount: latestByOrg.size }, "[monthly-report] processing orgs");

  let enqueued = 0;
  for (const [orgId, kpi] of latestByOrg) {
    try {
      const membership = await db.query.organizationMembers.findFirst({
        where: (m, { and, eq: eqFn }) => and(eqFn(m.organizationId, orgId), eqFn(m.role, "owner")),
      });
      if (!membership) {
        console.warn({ orgId }, "[monthly-report] no owner found — skipping");
        continue;
      }

      const owner = await db.query.user.findFirst({
        where: (u, { eq: eqFn }) => eqFn(u.id, membership.userId),
      });
      if (!owner) {
        console.warn({ orgId, userId: membership.userId }, "[monthly-report] owner user not found — skipping");
        continue;
      }

      await getBoss().send("email-send", {
        to: owner.email,
        subject: `Your ${kpi.periodYear} benchmark update — BoringBusinessIntel`,
        html: buildMonthlyReportHtml(owner.name ?? "there", kpi),
      });
      enqueued++;
    } catch (err) {
      console.error({ orgId, err }, "[monthly-report] failed to process org — skipping");
    }
  }

  console.info({ enqueued }, "[monthly-report] email jobs queued");
}
