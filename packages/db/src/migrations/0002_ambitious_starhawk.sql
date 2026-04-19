CREATE TABLE "kpi_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"period_year" integer NOT NULL,
	"revenue_growth" double precision,
	"gross_margin" double precision,
	"net_margin" double precision,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kpi_submissions" ADD CONSTRAINT "kpi_submissions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "kpi_submissions_org_year_unique" ON "kpi_submissions" USING btree ("organization_id","period_year");