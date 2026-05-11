CREATE TABLE "data_quality_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"score" integer NOT NULL,
	"periods_available" integer NOT NULL,
	"issues" text[] DEFAULT '{}' NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "data_quality_scores" ADD CONSTRAINT "data_quality_scores_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_data_quality_scores_org_id" ON "data_quality_scores" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "data_quality_scores_org_unique" ON "data_quality_scores" USING btree ("organization_id");