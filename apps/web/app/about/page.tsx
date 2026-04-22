import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why we built BoringBusinessIntel — the story behind anonymous financial benchmarking for digital agencies.",
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div
      style={{
        fontFamily: "var(--font-geist-sans, system-ui), sans-serif",
        color: "#111827",
        lineHeight: 1.7,
      }}
    >
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid #e5e7eb",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.03em", color: "#111827" }}
        >
          BBI
        </Link>
        <Link href="/" style={{ fontSize: 14, color: "#6b7280" }}>
          ← Back to home
        </Link>
      </nav>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* Hero */}
        <div style={{ marginBottom: 64 }}>
          <div
            style={{
              display: "inline-block",
              background: "#f5f3ff",
              color: "#7c3aed",
              fontSize: 12,
              fontWeight: 700,
              padding: "4px 14px",
              borderRadius: 20,
              marginBottom: 24,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Our Story
          </div>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.15,
              marginBottom: 24,
            }}
          >
            We built the tool we wished existed when running an agency.
          </h1>
          <p style={{ fontSize: 18, color: "#4b5563", lineHeight: 1.75 }}>
            Every agency owner we know has the same problem: they have no idea if their numbers are
            good. Not because they don&apos;t care — but because there&apos;s genuinely nowhere to
            look. Industry surveys are 18 months old. Benchmarking reports cost $5,000. And asking
            peers feels awkward.
          </p>
        </div>

        {/* Problem */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            The problem with existing benchmarks
          </h2>
          <p style={{ fontSize: 15, color: "#374151", marginBottom: 16 }}>
            The biggest players in agency benchmarking — IBISWorld, Plimsoll, industry federation
            reports — all share the same flaw: they&apos;re built for macro-level analysis, not for
            a 10-person SEO agency in Lyon trying to figure out if their 38% gross margin is
            competitive.
          </p>
          <p style={{ fontSize: 15, color: "#374151" }}>
            They aggregate across thousands of companies of wildly different sizes, regions, and
            service mixes. The result is a number that&apos;s technically accurate and practically
            useless. You can&apos;t price your services, negotiate supplier contracts, or plan
            headcount based on an industry average that includes your firm and a 500-person
            multinational.
          </p>
        </section>

        {/* Solution */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            What BoringBusinessIntel does differently
          </h2>
          <p style={{ fontSize: 15, color: "#374151", marginBottom: 16 }}>
            BBI only benchmarks you against agencies that look like yours. Same size bracket. Same
            region. Same service type. The peer group is small by design — and that&apos;s the
            point.
          </p>
          <div
            style={{
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: "24px 28px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                fontSize: 15,
                color: "#111827",
                fontStyle: "italic",
                margin: 0,
                lineHeight: 1.75,
              }}
            >
              &quot;Your revenue growth is in the 72nd percentile. Your gross margin is in the 45th
              percentile. Agencies your size in your region average 22 percentage points higher
              gross margin.&quot;
            </p>
          </div>
          <p style={{ fontSize: 15, color: "#374151" }}>
            That&apos;s the kind of sentence that changes how you run your business. Not a PDF
            chart. Not a general average. A number that means something, compared against people who
            are actually your peers.
          </p>
        </section>

        {/* Give to Get */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            The &quot;Give to Get&quot; model
          </h2>
          <p style={{ fontSize: 15, color: "#374151", marginBottom: 16 }}>
            BBI works because of a simple exchange: you share your anonymized KPIs, and in return
            you get access to the aggregated benchmarks from everyone else who did the same. The
            more agencies that participate, the more accurate and granular the benchmarks become.
          </p>
          <p style={{ fontSize: 15, color: "#374151" }}>
            This is the same model that made Glassdoor work for salaries. Applied to business
            financials.
          </p>
        </section>

        {/* Privacy / Methodology */}
        <section style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.02em" }}>
            How we protect your data
          </h2>
          <p style={{ fontSize: 15, color: "#374151", marginBottom: 20 }}>
            We take privacy seriously — not just legally, but because the whole product depends on
            it. If agencies don&apos;t trust the platform, they won&apos;t share data. If they
            don&apos;t share data, benchmarks don&apos;t exist.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              {
                title: "K-anonymity threshold",
                desc: "Benchmarks only appear when at least 30 agencies in your exact segment have submitted data. Below that threshold, we show industry averages. Your data never appears in a group small enough to identify you.",
              },
              {
                title: "Normalized metrics only",
                desc: "We store ratios and percentages — not raw revenue figures or P&L line items. Even in the event of a breach, no absolute financial figures are exposed.",
              },
              {
                title: "Encryption at rest and in transit",
                desc: "All financial data is encrypted with AES-256 at rest and TLS 1.3 in transit. OAuth tokens (for accounting integrations) are stored in an isolated encrypted vault.",
              },
              {
                title: "Right to erasure",
                desc: "Delete your account and all your data is purged within 30 days. No questions asked.",
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: "flex",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#7c3aed",
                    marginTop: 7,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: "#111827", margin: "0 0 4px" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: 15, color: "#6b7280", margin: 0, lineHeight: 1.7 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            background: "#111827",
            borderRadius: 16,
            padding: "40px 36px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Ready to see where you stand?
          </h2>
          <p style={{ fontSize: 15, color: "#9ca3af", marginBottom: 28 }}>
            Takes 3 minutes. No credit card required.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: "inline-block",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 32px",
              borderRadius: 8,
            }}
          >
            Get started free
          </Link>
        </section>
      </main>
    </div>
  );
}
