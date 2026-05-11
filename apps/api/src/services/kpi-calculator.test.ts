import { describe, it, expect } from "vitest";
import { computeKpis } from "./kpi-calculator.js";
import type { AnnualMetrics } from "./coa-normalizer.js";

function makeMetrics(year: number, revenue: number, cogs: number, netProfit: number): AnnualMetrics {
  return { year, totalRevenue: revenue, totalCogs: cogs, totalNetProfit: netProfit, periodsCount: 12 };
}

describe("computeKpis", () => {
  it("computes gross margin correctly", () => {
    const [result] = computeKpis([makeMetrics(2024, 100, 60, 20)]);
    expect(result?.grossMargin).toBeCloseTo(40);
  });

  it("computes net margin correctly", () => {
    const [result] = computeKpis([makeMetrics(2024, 100, 60, 20)]);
    expect(result?.netMargin).toBeCloseTo(20);
  });

  it("computes revenue growth year-over-year", () => {
    const results = computeKpis([
      makeMetrics(2023, 100, 50, 10),
      makeMetrics(2024, 110, 55, 11),
    ]);
    expect(results[1]?.revenueGrowth).toBeCloseTo(10);
  });

  it("returns null revenueGrowth for the first (oldest) year", () => {
    const [result] = computeKpis([makeMetrics(2024, 100, 40, 20)]);
    expect(result?.revenueGrowth).toBeNull();
  });

  it("returns null margins when revenue is zero", () => {
    const [result] = computeKpis([makeMetrics(2024, 0, 0, 0)]);
    expect(result?.grossMargin).toBeNull();
    expect(result?.netMargin).toBeNull();
  });

  it("returns null revenueGrowth when prior year revenue is zero", () => {
    const results = computeKpis([
      makeMetrics(2023, 0, 0, 0),
      makeMetrics(2024, 100, 40, 20),
    ]);
    expect(results[1]?.revenueGrowth).toBeNull();
  });

  it("handles negative net profit", () => {
    const [result] = computeKpis([makeMetrics(2024, 100, 60, -10)]);
    expect(result?.netMargin).toBeCloseTo(-10);
  });

  it("returns results for each year in input order", () => {
    const results = computeKpis([
      makeMetrics(2022, 80, 30, 10),
      makeMetrics(2023, 90, 35, 12),
      makeMetrics(2024, 100, 40, 15),
    ]);
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.year)).toEqual([2022, 2023, 2024]);
  });
});
