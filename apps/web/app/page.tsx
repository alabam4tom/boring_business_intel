import Link from "next/link";
import type { Metadata } from "next";
import { Nav } from "./components/Nav";

export const metadata: Metadata = {
  title: "Financial Benchmarks for Digital Agencies — BoringBusinessIntel",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL ?? "https://boringbusinessintel.com",
  },
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://boringbusinessintel.com";

// ─── Content ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    n: "01",
    title: "Create your agency profile",
    desc: "Set your agency's size, region, and service type once. This defines your exact peer group for all benchmarks.",
  },
  {
    n: "02",
    title: "Submit your annual KPIs",
    desc: "Enter revenue growth, gross margin, and net margin for each year you want to benchmark. Takes under 2 minutes.",
  },
  {
    n: "03",
    title: "See your percentile ranking",
    desc: "Instantly compare yourself against your peer group across all three metrics and all submitted years.",
  },
];

const FEATURES = [
  {
    icon: "🎯",
    title: "Segment-matched peers",
    desc: "Size, region, and service type combined. Your benchmarks come from agencies that look like yours — not generic averages that blur every distinction.",
  },
  {
    icon: "🔒",
    title: "K-anonymity privacy",
    desc: "Your numbers are never exposed individually. Benchmarks require at least 30 agencies in your segment, making re-identification impossible.",
  },
  {
    icon: "📊",
    title: "Three core metrics",
    desc: "Revenue growth, gross margin, and net margin. The three numbers every agency owner watches — tracked from 2022 to today.",
  },
  {
    icon: "📈",
    title: "Percentile rankings",
    desc: "Know instantly whether you are in the top 25%, above median, or below median — not just a number but a position in your market.",
  },
  {
    icon: "🕐",
    title: "Historical trends",
    desc: "Submit multiple years and watch your percentile ranking shift over time. Accountability built into the product.",
  },
  {
    icon: "⚡",
    title: "No friction onboarding",
    desc: "No sales call, no demo, no setup call. Create a profile, submit your KPIs, see your benchmarks. Under 5 minutes.",
  },
];

const FREE_FEATURES = [
  "Submit KPIs for any year",
  "Industry-average seed benchmarks",
  "All 3 KPI metrics",
  "Historical data from 2022",
  "Free forever",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Real anonymous peer benchmarks",
  "Requires 30+ agencies in your segment",
  "Live percentile rankings (P25 / Median / P75)",
  "Updated as new agencies submit",
];

const FAQS = [
  {
    q: "Is my financial data anonymous?",
    a: "Yes. Individual submissions are never shared or revealed. Benchmarks only appear once at least 30 agencies in your exact segment have submitted data — a principle called k-anonymity. You only ever see aggregated percentile ranges, never individual figures.",
  },
  {
    q: "What KPIs does BoringBusinessIntel benchmark?",
    a: "Three metrics: revenue growth (year-over-year), gross margin (%), and net margin (%). These cover top-line momentum, unit economics, and bottom-line health — the numbers that actually run a digital agency.",
  },
  {
    q: "How is my peer segment defined?",
    a: "Your segment is the intersection of three dimensions: agency size (solo, small, mid, large), region (US, EU, UK, APAC, Latin America), and service type (SEO, paid media, web development, design, branding, full-service). Only agencies matching all three criteria count as your peers.",
  },
  {
    q: "What if there are not enough agencies in my segment yet?",
    a: "You always see benchmarks immediately. Until 30 real peers exist in your segment, we display industry-average seed benchmarks based on published research. Once your peer group crosses the threshold, Pro users unlock the real peer data automatically.",
  },
  {
    q: "What is included in the free plan?",
    a: "On the free plan you can submit your KPIs for any year and see industry-average benchmarks for your segment. It is free forever — no credit card required.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. Contact us at any time and we will delete your submission within 48 hours.",
  },
];

const PROBLEMS = [
  {
    q: '"Is my gross margin healthy?"',
    a: "Industry averages lump every kind of agency together. A solo SEO consultant and a 50-person full-service shop do not belong in the same benchmark.",
  },
  {
    q: '"Am I growing fast enough?"',
    a: "Growth depends on your starting point, market, and service mix. Comparing against the wrong peers is worse than having no data at all.",
  },
  {
    q: '"How do I make pricing decisions?"',
    a: "Setting rates without knowing where your margins land versus peers means leaving money on the table — or burning out your team.",
  },
];

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "BoringBusinessIntel",
        url: APP_URL,
        description:
          "Anonymous financial benchmarking for digital agencies. Compare revenue growth, gross margin, and net margin against peer agencies in your exact segment.",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: [
          {
            "@type": "Offer",
            name: "Free",
            price: "0",
            priceCurrency: "EUR",
            description: "Submit KPIs and see industry-average benchmarks",
          },
          {
            "@type": "Offer",
            name: "Pro",
            price: "49",
            priceCurrency: "EUR",
            description:
              "Real anonymous peer benchmarks with live percentile rankings",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
    ],
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />

      <div
        style={{
          fontFamily: "var(--font-geist-sans, system-ui), sans-serif",
          color: "#111827",
          lineHeight: 1.6,
        }}
      >
        {/* ── NAV ──────────────────────────────────────────────────────── */}
        <Nav />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          aria-labelledby="hero-heading"
          style={{
            padding: "104px 24px 88px",
            textAlign: "center",
            maxWidth: 840,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: "#f5f3ff",
              color: "#7c3aed",
              fontSize: 12,
              fontWeight: 700,
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 32,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Anonymous · Private · K-Anonymity Guaranteed
          </div>
          <h1
            id="hero-heading"
            style={{
              fontSize: "clamp(38px, 6vw, 62px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              marginBottom: 28,
              color: "#111827",
            }}
          >
            Benchmark your agency&apos;s finances.{" "}
            <span style={{ color: "#7c3aed" }}>Anonymously.</span>
          </h1>
          <p
            style={{
              fontSize: 20,
              color: "#4b5563",
              maxWidth: 640,
              margin: "0 auto 44px",
              lineHeight: 1.75,
            }}
          >
            Submit your revenue growth, gross margin, and net margin. Instantly
            see where you rank against 30+ agencies in your exact segment —
            same size, region, and service type.
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/sign-up"
              style={{
                display: "inline-block",
                background: "#7c3aed",
                color: "#fff",
                fontWeight: 700,
                fontSize: 16,
                padding: "15px 36px",
                borderRadius: 10,
              }}
            >
              Start for free
            </Link>
            <Link
              href="/sign-in"
              style={{
                display: "inline-block",
                background: "#f3f4f6",
                color: "#111827",
                fontWeight: 600,
                fontSize: 16,
                padding: "15px 36px",
                borderRadius: 10,
              }}
            >
              Sign in
            </Link>
          </div>
          <p style={{ marginTop: 24, fontSize: 14, color: "#9ca3af" }}>
            No credit card required · No sales call · Takes 3 minutes
          </p>
        </section>

        {/* ── METRICS BAR ──────────────────────────────────────────────── */}
        <div
          style={{
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              maxWidth: 1000,
              margin: "0 auto",
              padding: "40px 24px",
              display: "flex",
              justifyContent: "center",
              gap: 56,
              flexWrap: "wrap",
              textAlign: "center",
            }}
          >
            {[
              {
                value: "30+",
                label: "Peer agencies for real benchmarks",
              },
              { value: "3", label: "Key financial KPIs tracked" },
              { value: "6", label: "Service type categories" },
              { value: "5", label: "Regions covered globally" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 800,
                    color: "#7c3aed",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    marginTop: 8,
                    maxWidth: 160,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROBLEM ──────────────────────────────────────────────────── */}
        <section
          aria-labelledby="problem-heading"
          style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              id="problem-heading"
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "#111827",
              }}
            >
              Running an agency without benchmarks is a guess
            </h2>
            <p
              style={{
                fontSize: 18,
                color: "#6b7280",
                marginTop: 16,
                maxWidth: 560,
                margin: "16px auto 0",
              }}
            >
              Most agency owners have no external reference. Industry surveys
              are too broad, too slow, and never cut by your exact segment.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {PROBLEMS.map(({ q, a }) => (
              <article
                key={q}
                style={{
                  flex: "1 1 280px",
                  maxWidth: 340,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: "32px 28px",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 14,
                    color: "#111827",
                    fontStyle: "italic",
                  }}
                >
                  {q}
                </p>
                <p
                  style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.75 }}
                >
                  {a}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
        <section
          id="how-it-works"
          aria-labelledby="how-heading"
          style={{
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
            padding: "96px 24px",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2
                id="how-heading"
                style={{
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Up and running in 3 minutes
              </h2>
              <p style={{ fontSize: 18, color: "#6b7280", marginTop: 16 }}>
                No setup. No integrations. Just enter your numbers.
              </p>
            </div>
            <ol
              style={{
                display: "flex",
                gap: 40,
                flexWrap: "wrap",
                justifyContent: "center",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {STEPS.map((step) => (
                <li
                  key={step.n}
                  style={{
                    flex: "1 1 260px",
                    maxWidth: 320,
                    display: "flex",
                    flexDirection: "column",
                    gap: 18,
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: "#ede9fe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 15,
                      color: "#7c3aed",
                      flexShrink: 0,
                    }}
                  >
                    {step.n}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontWeight: 700,
                        fontSize: 19,
                        color: "#111827",
                        margin: "0 0 10px",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 15,
                        color: "#6b7280",
                        lineHeight: 1.75,
                        margin: 0,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────── */}
        <section
          id="features"
          aria-labelledby="features-heading"
          style={{ padding: "96px 24px", maxWidth: 1100, margin: "0 auto" }}
        >
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2
              id="features-heading"
              style={{
                fontSize: "clamp(26px, 4vw, 40px)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              What you get
            </h2>
          </div>
          <ul
            style={{
              display: "flex",
              gap: 24,
              flexWrap: "wrap",
              justifyContent: "center",
              listStyle: "none",
              margin: 0,
              padding: 0,
            }}
          >
            {FEATURES.map((f) => (
              <li
                key={f.title}
                style={{
                  flex: "1 1 280px",
                  maxWidth: 340,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  padding: "28px 28px 32px",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{ fontSize: 28, marginBottom: 16 }}
                >
                  {f.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    marginBottom: 10,
                    color: "#111827",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    color: "#6b7280",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {f.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────── */}
        <section
          id="pricing"
          aria-labelledby="pricing-heading"
          style={{
            background: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
            padding: "96px 24px",
          }}
        >
          <div style={{ maxWidth: 820, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <h2
                id="pricing-heading"
                style={{
                  fontSize: "clamp(26px, 4vw, 40px)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                }}
              >
                Simple pricing
              </h2>
              <p style={{ fontSize: 18, color: "#6b7280", marginTop: 16 }}>
                Start free. Upgrade when you want the real peer data.
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Free tier */}
              <article
                aria-label="Free plan"
                style={{
                  flex: "1 1 300px",
                  maxWidth: 370,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  padding: 36,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  Free
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    marginBottom: 6,
                  }}
                >
                  €0
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#9ca3af",
                    marginBottom: 28,
                  }}
                >
                  Forever free. No credit card needed.
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 13,
                  }}
                >
                  {FREE_FEATURES.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 15,
                      }}
                    >
                      <span
                        style={{
                          color: "#10b981",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: "#374151" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#f3f4f6",
                    color: "#111827",
                    fontWeight: 600,
                    padding: "13px 24px",
                    borderRadius: 8,
                    fontSize: 15,
                  }}
                >
                  Get started
                </Link>
              </article>

              {/* Pro tier */}
              <article
                aria-label="Pro plan"
                style={{
                  flex: "1 1 300px",
                  maxWidth: 370,
                  background: "#7c3aed",
                  borderRadius: 16,
                  padding: 36,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    right: 18,
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 20,
                    letterSpacing: "0.06em",
                  }}
                >
                  POPULAR
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#c4b5fd",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  Pro
                </div>
                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    marginBottom: 6,
                    color: "#fff",
                  }}
                >
                  €49
                  <span style={{ fontSize: 18, fontWeight: 400 }}>/year</span>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "#c4b5fd",
                    marginBottom: 28,
                  }}
                >
                  Cancel anytime.
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 13,
                  }}
                >
                  {PRO_FEATURES.map((item) => (
                    <li
                      key={item}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        fontSize: 15,
                      }}
                    >
                      <span
                        style={{
                          color: "#a7f3d0",
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ color: "#ede9fe" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "#fff",
                    color: "#7c3aed",
                    fontWeight: 700,
                    padding: "13px 24px",
                    borderRadius: 8,
                    fontSize: 15,
                  }}
                >
                  Start free, then upgrade
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          style={{ padding: "96px 24px", maxWidth: 780, margin: "0 auto" }}
        >
          <h2
            id="faq-heading"
            style={{
              fontSize: "clamp(26px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              textAlign: "center",
              marginBottom: 60,
            }}
          >
            Frequently asked questions
          </h2>
          <div>
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                style={{
                  borderBottom:
                    i < FAQS.length - 1 ? "1px solid #e5e7eb" : "none",
                }}
              >
                <details className="faq-item">
                  <summary style={{ padding: "22px 0" }}>
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: 17,
                        color: "#111827",
                      }}
                    >
                      {faq.q}
                    </span>
                  </summary>
                  <p
                    style={{
                      paddingBottom: 22,
                      fontSize: 15,
                      color: "#6b7280",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </details>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────── */}
        <section
          aria-labelledby="cta-heading"
          style={{
            background: "#111827",
            padding: "104px 24px",
            textAlign: "center",
          }}
        >
          <h2
            id="cta-heading"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Start benchmarking in 3 minutes
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#9ca3af",
              maxWidth: 480,
              margin: "0 auto 44px",
              lineHeight: 1.7,
            }}
          >
            No sales call. No onboarding call. Submit your KPIs, see where you
            stand.
          </p>
          <Link
            href="/sign-up"
            style={{
              display: "inline-block",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              padding: "17px 44px",
              borderRadius: 10,
            }}
          >
            Get started free
          </Link>
          <p style={{ marginTop: 22, fontSize: 14, color: "#4b5563" }}>
            Takes 3 minutes · No credit card required
          </p>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────── */}
        <footer
          role="contentinfo"
          style={{
            background: "#0d0d12",
            padding: "60px 24px 36px",
            color: "#9ca3af",
          }}
        >
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 48,
                marginBottom: 52,
              }}
            >
              <div style={{ maxWidth: 300 }}>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: 18,
                    color: "#fff",
                    marginBottom: 14,
                    letterSpacing: "-0.03em",
                  }}
                >
                  BoringBusinessIntel
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75 }}>
                  Anonymous financial benchmarking for digital agencies. Know
                  where you stand. Keep your data private.
                </p>
              </div>
              <div
                style={{ display: "flex", gap: 64, flexWrap: "wrap" }}
              >
                <nav aria-label="Product links">
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#e5e7eb",
                      marginBottom: 18,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Product
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <li>
                      <a
                        href="#how-it-works"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        How it works
                      </a>
                    </li>
                    <li>
                      <a
                        href="#features"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        Features
                      </a>
                    </li>
                    <li>
                      <a
                        href="#pricing"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a
                        href="#faq"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        FAQ
                      </a>
                    </li>
                  </ul>
                </nav>
                <nav aria-label="Account links">
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#e5e7eb",
                      marginBottom: 18,
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Account
                  </div>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <li>
                      <Link
                        href="/sign-up"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        Sign up
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sign-in"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard"
                        style={{ fontSize: 14, color: "#9ca3af" }}
                      >
                        Dashboard
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
            <div
              style={{
                borderTop: "1px solid #1f2937",
                paddingTop: 28,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 16,
                fontSize: 13,
              }}
            >
              <p>
                © {new Date().getFullYear()} BoringBusinessIntel. All rights
                reserved.
              </p>
              <div style={{ display: "flex", gap: 24 }}>
                <a href="/privacy" style={{ color: "#6b7280" }}>
                  Privacy Policy
                </a>
                <a href="/terms" style={{ color: "#6b7280" }}>
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
