import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const dataQualityScores = pgTable("data_quality_scores", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  periodsAvailable: integer("periods_available").notNull(),
  issues: text("issues").array().notNull().default([]),
  computedAt: timestamp("computed_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_data_quality_scores_org_id").on(table.organizationId),
  uniqueIndex("data_quality_scores_org_unique").on(table.organizationId),
]);
