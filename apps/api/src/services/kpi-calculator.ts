import type { AnnualMetrics } from "./coa-normalizer.js";

export type KpiResult = {
  year: number;
  revenueGrowth: number | null;
  grossMargin: number | null;
  netMargin: number | null;
};

export function computeKpis(annualMetrics: AnnualMetrics[]): KpiResult[] {
  return annualMetrics.map((metrics, idx) => {
    const prev = idx > 0 ? annualMetrics[idx - 1] : null;

    const grossMargin =
      metrics.totalRevenue > 0
        ? ((metrics.totalRevenue - metrics.totalCogs) / metrics.totalRevenue) * 100
        : null;

    const netMargin =
      metrics.totalRevenue > 0
        ? (metrics.totalNetProfit / metrics.totalRevenue) * 100
        : null;

    const revenueGrowth =
      prev && prev.year === metrics.year - 1 && prev.totalRevenue > 0
        ? ((metrics.totalRevenue - prev.totalRevenue) / prev.totalRevenue) * 100
        : null;

    return { year: metrics.year, revenueGrowth, grossMargin, netMargin };
  });
}
