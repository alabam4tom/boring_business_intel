import type { CodatPnlReport } from "./codat-client.js";

export type AnnualMetrics = {
  year: number;
  totalRevenue: number;
  totalCogs: number;
  totalNetProfit: number;
  periodsCount: number;
};

export function normalizeToAnnual(reports: CodatPnlReport[]): AnnualMetrics[] {
  const byYear = new Map<number, { revenue: number; cogs: number; netProfit: number; count: number }>();

  for (const report of reports) {
    const revenue = report.income?.value ?? 0;
    const cogs = report.costOfSales?.value ?? 0;
    const netProfit = report.netProfit ?? 0;

    if (!revenue) {
      console.warn(`[coa-normalizer] skipping period ${report.fromDate}: income.value is null/0`);
      continue;
    }

    const year = new Date(report.fromDate).getUTCFullYear();
    const existing = byYear.get(year) ?? { revenue: 0, cogs: 0, netProfit: 0, count: 0 };
    byYear.set(year, {
      revenue: existing.revenue + revenue,
      cogs: existing.cogs + cogs,
      netProfit: existing.netProfit + netProfit,
      count: existing.count + 1,
    });
  }

  return Array.from(byYear.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, { revenue, cogs, netProfit, count }]) => ({
      year,
      totalRevenue: revenue,
      totalCogs: cogs,
      totalNetProfit: netProfit,
      periodsCount: count,
    }));
}
