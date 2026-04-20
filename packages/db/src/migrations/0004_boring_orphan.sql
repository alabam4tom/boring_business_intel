CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "ls_customer_id" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "ls_subscription_id" text;