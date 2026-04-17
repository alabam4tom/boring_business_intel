export const K_ANONYMITY_THRESHOLD = 30;

export const KPI_METRICS = ["revenue_growth", "gross_margin", "net_margin"] as const;
export type KpiMetric = (typeof KPI_METRICS)[number];
