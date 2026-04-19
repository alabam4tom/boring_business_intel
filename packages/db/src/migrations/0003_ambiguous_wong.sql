CREATE TABLE "benchmark_seeds" (
	"id" text PRIMARY KEY NOT NULL,
	"agency_size" "agency_size" NOT NULL,
	"region" "region" NOT NULL,
	"service_type" "service_type" NOT NULL,
	"period_year" integer NOT NULL,
	"revenue_growth_p25" double precision,
	"revenue_growth_median" double precision,
	"revenue_growth_p75" double precision,
	"gross_margin_p25" double precision,
	"gross_margin_median" double precision,
	"gross_margin_p75" double precision,
	"net_margin_p25" double precision,
	"net_margin_median" double precision,
	"net_margin_p75" double precision
);
--> statement-breakpoint
CREATE UNIQUE INDEX "benchmark_seeds_segment_year_unique" ON "benchmark_seeds" USING btree ("agency_size","region","service_type","period_year");