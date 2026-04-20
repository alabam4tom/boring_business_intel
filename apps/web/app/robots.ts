import type { MetadataRoute } from "next";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://boringbusinessintel.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up"],
        disallow: ["/dashboard", "/onboarding"],
      },
    ],
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
