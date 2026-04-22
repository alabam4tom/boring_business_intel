import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms governing your use of BoringBusinessIntel — financial benchmarking for digital agencies.",
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "April 22, 2026";
const CONTACT_EMAIL = "legal@boringbusinessintel.com";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Last updated: {LAST_UPDATED}</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              1. Acceptance of terms
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              By creating an account or using BoringBusinessIntel (&quot;BBI&quot;, &quot;the
              platform&quot;), you agree to these Terms of Service. If you do not agree, do not use
              the platform.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              2. Description of service
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              BBI is a financial benchmarking platform that allows digital agencies to submit
              anonymous financial KPIs (revenue growth, gross margin, net margin) and receive
              peer-benchmarked percentile rankings. The platform operates on a &quot;Give to
              Get&quot; model: users contribute their own anonymized data to receive access to
              aggregated industry benchmarks.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              3. Not financial advice
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "#374151",
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                borderRadius: 8,
                padding: "16px 20px",
              }}
            >
              <strong>Important disclaimer:</strong> BBI provides statistical benchmarks for
              informational purposes only. Nothing on this platform constitutes financial, accounting,
              investment, legal, or tax advice. Benchmarks reflect aggregated anonymous data from
              other platform users and may not be representative of your specific market, region, or
              circumstances. Always consult qualified professionals before making financial decisions.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              4. User accounts
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>You must provide accurate information when creating your account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>One organization per account. You may not create multiple accounts for the same agency.</li>
              <li>You must be at least 18 years old and authorized to act on behalf of your organization.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              5. Data submission & accuracy
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>You warrant that all financial data you submit is accurate and representative of your agency&apos;s actual performance.</li>
              <li>Intentionally submitting false or misleading data to distort benchmarks is prohibited and may result in account termination.</li>
              <li>BBI reserves the right to exclude statistical outliers from benchmark calculations to maintain data quality.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              6. Subscription & billing
            </h2>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>The free tier is available indefinitely with no credit card required.</li>
              <li>Pro subscriptions are billed annually via LemonSqueezy. Prices are shown in EUR and may vary by region.</li>
              <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
              <li>Refunds are available within 14 days of initial purchase if you have not accessed Pro-only features.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              7. Intellectual property
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              BBI owns all rights to the platform, its algorithms, and aggregated benchmark outputs.
              You retain ownership of the raw financial data you submit. By submitting data, you
              grant BBI a non-exclusive, royalty-free license to use your anonymized, aggregated
              data to compute and publish benchmarks.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              8. Prohibited use
            </h2>
            <p style={{ fontSize: 15, color: "#374151", marginBottom: 12 }}>You may not:</p>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: "#374151", display: "flex", flexDirection: "column", gap: 8 }}>
              <li>Attempt to reverse-engineer or identify individual companies from benchmark outputs.</li>
              <li>Scrape, copy, or redistribute benchmark data for commercial purposes.</li>
              <li>Use the platform for any unlawful purpose or in violation of applicable regulations.</li>
              <li>Attempt to gain unauthorized access to other users&apos; data or the platform infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              9. Limitation of liability
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              To the maximum extent permitted by law, BBI is not liable for any indirect, incidental,
              special, or consequential damages arising from your use of the platform, including
              business decisions made based on benchmark data. Our total liability is limited to the
              amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>10. Termination</h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              You may delete your account at any time. BBI may suspend or terminate accounts that
              violate these terms. Upon termination, your personal data will be purged within 30
              days in accordance with our{" "}
              <Link href="/privacy" style={{ color: "#7c3aed" }}>
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              11. Changes to terms
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              We will notify registered users by email of material changes at least 14 days before
              they take effect. Continued use constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
              12. Governing law
            </h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              These terms are governed by the laws of France. Any disputes will be subject to the
              exclusive jurisdiction of French courts.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>13. Contact</h2>
            <p style={{ fontSize: 15, color: "#374151" }}>
              For legal inquiries:{" "}
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
