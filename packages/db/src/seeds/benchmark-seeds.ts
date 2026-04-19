import { db } from "../index.js";
import { benchmarkSeeds } from "../schema/seeds.js";

type AgencySize = "micro" | "small" | "mid" | "large";
type Region = "north_america" | "europe" | "apac" | "latam" | "middle_east_africa";
type ServiceType = "full_service" | "creative_branding" | "digital_marketing" | "web_development" | "pr_communications" | "content_production";

const AGENCY_SIZES: AgencySize[] = ["micro", "small", "mid", "large"];
const REGIONS: Region[] = ["north_america", "europe", "apac", "latam", "middle_east_africa"];
const SERVICE_TYPES: ServiceType[] = ["full_service", "creative_branding", "digital_marketing", "web_development", "pr_communications", "content_production"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2021 }, (_, i) => 2022 + i);

// Base gross margin median by service type
const GROSS_MARGIN_BASE: Record<ServiceType, number> = {
  web_development:     62,
  creative_branding:   58,
  full_service:        52,
  pr_communications:   48,
  digital_marketing:   47,
  content_production:  42,
};

// Base net margin median by agency size
const NET_MARGIN_BASE: Record<AgencySize, number> = {
  micro: 18,
  small: 14,
  mid:   10,
  large:  7,
};

// Base revenue growth median by size × year
const REVENUE_GROWTH_BASE: Record<AgencySize, Record<number, number>> = {
  micro: { 2022: 28, 2023: 18, 2024: 22, 2025: 20, 2026: 18 },
  small: { 2022: 20, 2023: 14, 2024: 17, 2025: 15, 2026: 14 },
  mid:   { 2022: 15, 2023: 10, 2024: 13, 2025: 11, 2026: 10 },
  large: { 2022: 10, 2023:  7, 2024:  9, 2025:  8, 2026:  7 },
};

// Regional adjustment (additive, pp)
const REGION_ADJUST: Record<Region, number> = {
  north_america:      4,
  europe:             0,
  apac:               2,
  latam:             -3,
  middle_east_africa:-2,
};

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function seedRow(size: AgencySize, region: Region, type: ServiceType, year: number) {
  const adj = REGION_ADJUST[region];

  const rgMedian   = round1(REVENUE_GROWTH_BASE[size][year]);
  const rgP25      = round1(rgMedian - 8);
  const rgP75      = round1(rgMedian + 10);

  const gmMedian   = round1(GROSS_MARGIN_BASE[type] + adj);
  const gmP25      = round1(gmMedian - 8);
  const gmP75      = round1(gmMedian + 8);

  const nmMedian   = round1(NET_MARGIN_BASE[size] + adj * 0.5);
  const nmP25      = round1(nmMedian - 5);
  const nmP75      = round1(nmMedian + 5);

  return {
    id: `seed-${size}-${region}-${type}-${year}`,
    agencySize: size,
    region,
    serviceType: type,
    periodYear: year,
    revenueGrowthP25: rgP25,
    revenueGrowthMedian: rgMedian,
    revenueGrowthP75: rgP75,
    grossMarginP25: gmP25,
    grossMarginMedian: gmMedian,
    grossMarginP75: gmP75,
    netMarginP25: nmP25,
    netMarginMedian: nmMedian,
    netMarginP75: nmP75,
  };
}

async function seed() {
  const rows = [];
  for (const size of AGENCY_SIZES) {
    for (const region of REGIONS) {
      for (const type of SERVICE_TYPES) {
        for (const year of YEARS) {
          rows.push(seedRow(size, region, type, year));
        }
      }
    }
  }

  await db.insert(benchmarkSeeds)
    .values(rows)
    .onConflictDoUpdate({
      target: [benchmarkSeeds.agencySize, benchmarkSeeds.region, benchmarkSeeds.serviceType, benchmarkSeeds.periodYear],
      set: {
        revenueGrowthP25: sql`excluded.revenue_growth_p25`,
        revenueGrowthMedian: sql`excluded.revenue_growth_median`,
        revenueGrowthP75: sql`excluded.revenue_growth_p75`,
        grossMarginP25: sql`excluded.gross_margin_p25`,
        grossMarginMedian: sql`excluded.gross_margin_median`,
        grossMarginP75: sql`excluded.gross_margin_p75`,
        netMarginP25: sql`excluded.net_margin_p25`,
        netMarginMedian: sql`excluded.net_margin_median`,
        netMarginP75: sql`excluded.net_margin_p75`,
      },
    });

  console.log(`Seeded ${rows.length} benchmark rows.`);
  process.exit(0);
}

import { sql } from "drizzle-orm";
seed().catch((err) => { console.error(err); process.exit(1); });
