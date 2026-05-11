import { describe, it, expect } from "vitest";
import { normalizeToAnnual } from "./coa-normalizer.js";
import type { CodatPnlReport } from "./codat-client.js";

function makeReport(fromDate: string, income: number, cogs: number, netProfit: number): CodatPnlReport {
  return {
    fromDate,
    toDate: fromDate,
    income: { name: "Income", value: income, items: [] },
    costOfSales: { name: "Cost of Sales", value: cogs, items: [] },
    grossProfit: income - cogs,
    expenses: { name: "Expenses", value: 0, items: [] },
    netProfit,
  };
}

describe("normalizeToAnnual", () => {
  it("aggregates multiple months in the same year", () => {
    const reports = [
      makeReport("2024-01-01T00:00:00Z", 10000, 4000, 2000),
      makeReport("2024-02-01T00:00:00Z", 12000, 5000, 3000),
    ];
    const result = normalizeToAnnual(reports);
    expect(result).toHaveLength(1);
    expect(result).toMatchObject([
      { year: 2024, totalRevenue: 22000, totalCogs: 9000, totalNetProfit: 5000, periodsCount: 2 },
    ]);
  });

  it("groups reports across two years, sorted ascending", () => {
    const reports = [
      makeReport("2024-06-01T00:00:00Z", 10000, 3000, 2000),
      makeReport("2023-06-01T00:00:00Z", 8000, 2500, 1500),
    ];
    const result = normalizeToAnnual(reports);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.year)).toEqual([2023, 2024]);
  });

  it("skips periods with zero income", () => {
    const reports = [
      makeReport("2024-01-01T00:00:00Z", 0, 1000, -1000),
      makeReport("2024-02-01T00:00:00Z", 10000, 3000, 2000),
    ];
    const result = normalizeToAnnual(reports);
    expect(result).toHaveLength(1);
    expect(result).toMatchObject([{ periodsCount: 1, totalRevenue: 10000 }]);
  });

  it("handles null income gracefully without throwing", () => {
    const reports = [
      { ...makeReport("2024-01-01T00:00:00Z", 0, 0, 0), income: null as unknown as CodatPnlReport["income"] },
      makeReport("2024-02-01T00:00:00Z", 5000, 1000, 800),
    ];
    expect(() => normalizeToAnnual(reports)).not.toThrow();
    const result = normalizeToAnnual(reports);
    expect(result).toMatchObject([{ periodsCount: 1 }]);
  });

  it("returns empty array for all-zero income reports", () => {
    const reports = [
      makeReport("2024-01-01T00:00:00Z", 0, 0, 0),
      makeReport("2024-02-01T00:00:00Z", 0, 0, 0),
    ];
    expect(normalizeToAnnual(reports)).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(normalizeToAnnual([])).toHaveLength(0);
  });
});
