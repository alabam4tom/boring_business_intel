import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const integrationStatusEnum = pgEnum("integration_status", [
  "pending_auth",
  "linked",
  "deauthorized",
  "unlinked",
]);

export const integrationProviderEnum = pgEnum("integration_provider", [
  "quickbooks_online",
  "xero",
]);

export const codatConnections = pgTable("codat_connections", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  provider: integrationProviderEnum("provider").notNull(),
  codatCompanyId: text("codat_company_id").notNull(),
  codatConnectionId: text("codat_connection_id"),
  status: integrationStatusEnum("status").notNull().default("pending_auth"),
  consentAcceptedAt: timestamp("consent_accepted_at", { withTimezone: true }),
  linkedAt: timestamp("linked_at", { withTimezone: true }),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_codat_connections_company_id").on(table.codatCompanyId),
  uniqueIndex("codat_connections_org_provider_linked_unique")
    .on(table.organizationId, table.provider)
    .where(sql`status = 'linked'`),
  uniqueIndex("codat_connections_org_provider_pending_unique")
    .on(table.organizationId, table.provider)
    .where(sql`status = 'pending_auth'`),
]);
