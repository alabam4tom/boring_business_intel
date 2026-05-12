import { describe, it, expect } from "vitest";
import { computeDataQuality, isOutlierSubmission } from "./data-quality.js";

const clean = { year: 2024, revenueGrowth: 10, grossMargin: 40, netMargin: 8 };
const clean2 = { year: 2023, revenueGrowth: 5, grossMargin: 38, netMargin: 6 };

describe("isOutlierSubmission", () => {
  it("returns false for clean data", () => {
    expect(isOutlierSubmission(clean)).toBe(false);
  });

  it("flags revenueGrowth < -99", () => {
    expect(isOutlierSubmission({ ...clean, revenueGrowth: -100 })).toBe(true);
  });

  it("flags revenueGrowth > 1000", () => {
    expect(isOutlierSubmission({ ...clean, revenueGrowth: 1001 })).toBe(true);
  });

  it("flags grossMargin < -200", () => {
    expect(isOutlierSubmission({ ...clean, grossMargin: -201 })).toBe(true);
  });

  it("flags grossMargin > 200", () => {
    expect(isOutlierSubmission({ ...clean, grossMargin: 201 })).toBe(true);
  });

  it("flags netMargin < -200", () => {
    expect(isOutlierSubmission({ ...clean, netMargin: -201 })).toBe(true);
  });

  it("flags netMargin > 200", () => {
    expect(isOutlierSubmission({ ...clean, netMargin: 201 })).toBe(true);
  });

  it("treats null values as non-outlier", () => {
    expect(isOutlierSubmission({ year: 2024, revenueGrowth: null, grossMargin: null, netMargin: null })).toBe(false);
  });

  it("accepts boundary values as non-outlier", () => {
    expect(isOutlierSubmission({ ...clean, revenueGrowth: -99 })).toBe(false);
    expect(isOutlierSubmission({ ...clean, revenueGrowth: 1000 })).toBe(false);
    expect(isOutlierSubmission({ ...clean, grossMargin: 200 })).toBe(false);
    expect(isOutlierSubmission({ ...clean, netMargin: -200 })).toBe(false);
  });
});

describe("computeDataQuality", () => {
  it("score 100 for 2 years (24 months) of clean data", () => {
    const result = computeDataQuality([clean, clean2], 24);
    expect(result.score).toBe(100);
    expect(result.issues).toEqual([]);
  });

  it("score proportional to periods when < 24", () => {
    const result = computeDataQuality([clean], 12);
    expect(result.score).toBe(50);
    expect(result.issues).toEqual(["PARTIAL_DATA"]);
  });

  it("adds INCOMPLETE_DATA when periodsAvailable < 12", () => {
    const result = computeDataQuality([clean], 6);
    expect(result.issues).toContain("INCOMPLETE_DATA");
    expect(result.issues).not.toContain("PARTIAL_DATA");
  });

  it("deducts 20 for INCONSISTENT_MARGINS", () => {
    const inconsistent = { year: 2024, revenueGrowth: 10, grossMargin: 20, netMargin: 30 };
    const result = computeDataQuality([inconsistent], 24);
    expect(result.score).toBe(80);
    expect(result.issues).toContain("INCONSISTENT_MARGINS");
  });

  it("deducts 15 for ANOMALOUS_VALUES", () => {
    const anomalous = { ...clean, revenueGrowth: 9999 };
    const result = computeDataQuality([anomalous], 24);
    expect(result.score).toBe(85);
    expect(result.issues).toContain("ANOMALOUS_VALUES");
  });

  it("deducts both for inconsistent margins + anomalous values, clamps to 0", () => {
    const bad = { year: 2024, revenueGrowth: 9999, grossMargin: 10, netMargin: 50 };
    const result = computeDataQuality([bad], 6);
    // base ~25, -20, -15 = -10 → clamped to 0
    expect(result.score).toBe(0);
    expect(result.issues).toContain("INCONSISTENT_MARGINS");
    expect(result.issues).toContain("ANOMALOUS_VALUES");
  });

  it("does not add INCONSISTENT_MARGINS when difference is <= 5", () => {
    const borderline = { year: 2024, revenueGrowth: 10, grossMargin: 20, netMargin: 25 };
    const result = computeDataQuality([borderline], 24);
    expect(result.issues).not.toContain("INCONSISTENT_MARGINS");
  });
});
