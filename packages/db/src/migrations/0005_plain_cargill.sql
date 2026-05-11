CREATE TYPE "public"."integration_provider" AS ENUM('quickbooks_online', 'xero');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('pending_auth', 'linked', 'deauthorized', 'unlinked');--> statement-breakpoint
CREATE TABLE "codat_connections" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"codat_company_id" text NOT NULL,
	"codat_connection_id" text,
	"status" "integration_status" DEFAULT 'pending_auth' NOT NULL,
	"consent_accepted_at" timestamp with time zone,
	"linked_at" timestamp with time zone,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "codat_connections" ADD CONSTRAINT "codat_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;