CREATE TYPE "public"."agency_size" AS ENUM('micro', 'small', 'mid', 'large');--> statement-breakpoint
CREATE TYPE "public"."org_role" AS ENUM('owner', 'admin', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('north_america', 'europe', 'apac', 'latam', 'middle_east_africa');--> statement-breakpoint
CREATE TYPE "public"."service_type" AS ENUM('full_service', 'creative_branding', 'digital_marketing', 'web_development', 'pr_communications', 'content_production');--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" "org_role" NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"agency_size" "agency_size" NOT NULL,
	"region" "region" NOT NULL,
	"service_type" "service_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "organization_members_user_id_unique" ON "organization_members" USING btree ("user_id");