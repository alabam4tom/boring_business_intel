import { doublePrecision, integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { agencySizeEnum, regionEnum, serviceTypeEnum } from "./organizations.js";

export const benchmarkSeeds = pgTable(
  "benchmark_seeds",
  {
    id: text("id").primaryKey(),
    agencySize: agencySizeEnum("agency_size").notNull(),
    region: regionEnum("region").notNull(),
    serviceType: serviceTypeEnum("service_type").notNull(),
    periodYear: integer("period_year").notNull(),
    revenueGrowthP25: doublePrecision("revenue_growth_p25"),
    revenueGrowthMedian: doublePrecision("revenue_growth_median"),
    revenueGrowthP75: doublePrecision("revenue_growth_p75"),
    grossMarginP25: doublePrecision("gross_margin_p25"),
    grossMarginMedian: doublePrecision("gross_margin_median"),
    grossMarginP75: doublePrecision("gross_margin_p75"),
    netMarginP25: doublePrecision("net_margin_p25"),
    netMarginMedian: doublePrecision("net_margin_median"),
    netMarginP75: doublePrecision("net_margin_p75"),
  },
  (table) => ({
    uniqueSegmentYear: uniqueIndex("benchmark_seeds_segment_year_unique").on(
      table.agencySize, table.region, table.serviceType, table.periodYear,
    ),
  }),
);
