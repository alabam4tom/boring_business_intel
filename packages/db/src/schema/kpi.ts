import { doublePrecision, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const kpiSubmissions = pgTable(
  "kpi_submissions",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    periodYear: integer("period_year").notNull(),
    revenueGrowth: doublePrecision("revenue_growth"),
    grossMargin: doublePrecision("gross_margin"),
    netMargin: doublePrecision("net_margin"),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    uniqueOrgYear: uniqueIndex("kpi_submissions_org_year_unique").on(table.organizationId, table.periodYear),
  }),
);
