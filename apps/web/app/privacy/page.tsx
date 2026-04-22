import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How BoringBusinessIntel collects, uses, and protects your financial data. GDPR and CCPA compliant.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 22, 2026";
const CONTACT_EMAIL = "privacy@boringbusinessintel.com";

export default function PrivacyPage() {
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
        <div style={{ marginBottom: 48 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>1. Who we are</h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              BoringBusinessIntel (&quot;BBI&quot;, &quot;we&quot;, &quot;us&quot;) is a financial
              benchmarking platform for digital agencies. We operate the website at{" "}
              boringbusinessintel.com. For privacy inquiries, contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7c3aed" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              2. What data we collect
            </h2>
            <p style={{ fontSize: 15, color: "#374151", marginBottom: 12 }}>
              We collect only what is necessary to provide the benchmarking service:
            </p>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>Account data:</strong> Email address, name (if provided), authentication
                tokens.
              </li>
              <li>
                <strong>Organization data:</strong> Agency name, size bracket, region, service
                type.
              </li>
              <li>
                <strong>Financial KPIs:</strong> Revenue growth (%), gross margin (%), net margin
                (%) — submitted manually or via accounting software connection. We store normalized
                ratios, not raw P&amp;L line items.
              </li>
              <li>
                <strong>Usage data:</strong> Pages visited, features used, session duration — via
                Google Analytics 4 (anonymized IP).
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              3. How we use your data
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>To compute anonymous peer benchmarks (percentile rankings).</li>
              <li>To provide your dashboard and personalized insights.</li>
              <li>To send transactional emails (account, billing, monthly reports).</li>
              <li>To improve the platform based on usage patterns.</li>
            </ul>
            <p style={{ fontSize: 15, color: "#374151", marginTop: 12 }}>
              We do not sell your individual data. Aggregated, anonymized benchmark data may be
              shared with enterprise clients or research partners — no individual company can be
              identified from this data.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              4. Anonymization & k-anonymity
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              Benchmark results are only displayed when at least 30 agencies in the same segment
              have submitted data. This k-anonymity threshold ensures no individual company&apos;s
              data can be inferred from published benchmarks. Individual KPI submissions are never
              exposed — only aggregated percentile distributions are shared.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              5. Legal basis for processing (GDPR)
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>Contractual necessity:</strong> Processing your KPI data to deliver
                benchmark results.
              </li>
              <li>
                <strong>Legitimate interests:</strong> Platform security, fraud prevention, product
                improvement.
              </li>
              <li>
                <strong>Consent:</strong> Marketing emails (you can unsubscribe at any time).
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              6. Your rights (GDPR & CCPA)
            </h2>
            <p style={{ fontSize: 15, color: "#374151", marginBottom: 12 }}>
              Depending on your jurisdiction, you have the right to:
            </p>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>Access:</strong> Request a copy of your personal data.
              </li>
              <li>
                <strong>Rectification:</strong> Correct inaccurate data.
              </li>
              <li>
                <strong>Erasure:</strong> Request complete deletion of your account and data.
                We will purge all records within 30 days.
              </li>
              <li>
                <strong>Portability:</strong> Receive your data in a machine-readable format.
              </li>
              <li>
                <strong>Opt-out (CCPA):</strong> Opt out of any sale of personal information
                (we do not sell individual data).
              </li>
            </ul>
            <p style={{ fontSize: 15, color: "#374151", marginTop: 12 }}>
              To exercise any right, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7c3aed" }}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              7. Data retention
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              We retain your data for as long as your account is active. Upon deletion request,
              all personal data and KPI submissions are purged within 30 days. Aggregated benchmark
              data (from which no individual can be identified) may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              8. Third-party services
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>
                <strong>LemonSqueezy:</strong> Payment processing. Subject to their privacy policy.
              </li>
              <li>
                <strong>Google Analytics 4:</strong> Usage analytics with anonymized IPs.
              </li>
              <li>
                <strong>Resend / SendGrid:</strong> Transactional email delivery.
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>9. Security</h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              All financial data is encrypted at rest (AES-256) and in transit (TLS 1.3). Access is
              restricted via role-based controls. All data access events are audit-logged.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              10. Changes to this policy
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              We will notify registered users by email of material changes at least 14 days before
              they take effect. Continued use of the platform constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>11. Contact</h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              For any privacy question or data request:{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7c3aed" }}>
                {CONTACT_EMAIL}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
