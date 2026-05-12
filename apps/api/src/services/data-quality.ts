export type KpiRow = {
  year: number;
  revenueGrowth: number | null;
  grossMargin: number | null;
  netMargin: number | null;
};

export type DataQualityResult = {
  score: number;
  issues: string[];
};

export function isOutlierSubmission(row: KpiRow): boolean {
  if (row.revenueGrowth !== null && (row.revenueGrowth < -99 || row.revenueGrowth > 1000)) return true;
  if (row.grossMargin !== null && (row.grossMargin < -200 || row.grossMargin > 200)) return true;
  if (row.netMargin !== null && (row.netMargin < -200 || row.netMargin > 200)) return true;
  return false;
}

export function computeDataQuality(submissions: KpiRow[], periodsAvailable: number): DataQualityResult {
  const issues: string[] = [];

  if (periodsAvailable < 12) {
    issues.push("INCOMPLETE_DATA");
  } else if (periodsAvailable < 24) {
    issues.push("PARTIAL_DATA");
  }

  const hasInconsistentMargins = submissions.some(
    (s) =>
      s.grossMargin !== null &&
      s.netMargin !== null &&
      s.netMargin > s.grossMargin + 5
  );
  if (hasInconsistentMargins) issues.push("INCONSISTENT_MARGINS");

  const hasAnomalous = submissions.some(isOutlierSubmission);
  if (hasAnomalous) issues.push("ANOMALOUS_VALUES");

  let score = Math.round(Math.min(periodsAvailable / 24, 1) * 100);
  if (issues.includes("INCONSISTENT_MARGINS")) score -= 20;
  if (issues.includes("ANOMALOUS_VALUES")) score -= 15;
  score = Math.max(0, score);

  return { score, issues };
}
