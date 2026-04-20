import { pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
export const subscriptionTierEnum = pgEnum("subscription_tier", ["free", "pro", "enterprise"]);
import { user } from "./auth.js";

export const agencySizeEnum = pgEnum("agency_size", [
  "micro",
  "small",
  "mid",
  "large",
]);

export const regionEnum = pgEnum("region", [
  "north_america",
  "europe",
  "apac",
  "latam",
  "middle_east_africa",
]);

export const serviceTypeEnum = pgEnum("service_type", [
  "full_service",
  "creative_branding",
  "digital_marketing",
  "web_development",
  "pr_communications",
  "content_production",
]);

export const orgRoleEnum = pgEnum("org_role", ["owner", "admin", "viewer"]);

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  agencySize: agencySizeEnum("agency_size").notNull(),
  region: regionEnum("region").notNull(),
  serviceType: serviceTypeEnum("service_type").notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("free"),
  lsCustomerId: text("ls_customer_id"),
  lsSubscriptionId: text("ls_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: orgRoleEnum("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    oneOrgPerUser: uniqueIndex("organization_members_user_id_unique").on(
      table.userId,
    ),
  }),
);
