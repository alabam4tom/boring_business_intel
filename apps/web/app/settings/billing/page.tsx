"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "40rem",
  margin: "4rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  marginTop: "1.5rem",
};

const btnPrimary: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: "#999",
  cursor: "not-allowed",
};

const btnGhost: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  border: "1px solid #e5e5e5",
  borderRadius: "0.375rem",
  backgroundColor: "#fff",
  color: "#333",
  fontSize: "1rem",
  cursor: "pointer",
};

type BillingData = {
  tier: "free" | "pro" | "enterprise";
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  hasSubscription: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BillingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    fetch(`${API}/api/v1/billing`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d?.data) setBilling(d.data); })
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function handleUpgrade() {
    setRedirecting(true);
    const res = await fetch(`${API}/api/v1/billing/checkout`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    } else {
      setRedirecting(false);
    }
  }

  async function handlePortal() {
    setRedirecting(true);
    const res = await fetch(`${API}/api/v1/billing/portal`, {
      method: "POST",
      credentials: "include",
    });
    if (res.ok) {
      const { data } = await res.json();
      window.location.href = data.portalUrl;
    } else {
      setRedirecting(false);
    }
  }

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#888" }}>Loading…</p>
      </main>
    );
  }

  const isPro = billing?.tier === "pro";
  const isCanceling = billing?.subscriptionStatus === "cancelled";

  return (
    <main style={pageStyle}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/dashboard" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Back to dashboard
        </a>
      </div>

      <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Billing</h1>
      <p style={{ color: "#666", margin: "0 0 0.25rem", fontSize: "0.9375rem" }}>
        Manage your plan and subscription.
      </p>

      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ margin: "0 0 0.25rem", fontSize: "0.8125rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Current plan
            </p>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              {isPro ? "Pro" : "Free"}
            </p>
          </div>

          {isPro && (
            <span style={{
              padding: "0.25rem 0.625rem",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              background: isCanceling ? "#fffbeb" : "#f0fdf4",
              border: `1px solid ${isCanceling ? "#fde68a" : "#bbf7d0"}`,
              color: isCanceling ? "#b45309" : "#15803d",
            }}>
              {isCanceling ? "Canceling" : "Active"}
            </span>
          )}
        </div>

        {isPro && isCanceling && billing?.currentPeriodEnd && (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#b45309" }}>
            Pro access ends on {formatDate(billing.currentPeriodEnd)}.
          </p>
        )}

        {isPro && !isCanceling && billing?.currentPeriodEnd && (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#666" }}>
            Next billing date: {formatDate(billing.currentPeriodEnd)}.
          </p>
        )}

        {!isPro && (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#666" }}>
            Upgrade to Pro to unlock real anonymous peer benchmarks and advanced segmentation.
          </p>
        )}

        <div style={{ marginTop: "1.25rem" }}>
          {isPro ? (
            <button
              onClick={handlePortal}
              disabled={redirecting}
              style={redirecting ? btnDisabled : btnGhost}
            >
              {redirecting ? "Redirecting…" : "Manage billing →"}
            </button>
          ) : (
            <button
              onClick={handleUpgrade}
              disabled={redirecting}
              style={redirecting ? btnDisabled : btnPrimary}
            >
              {redirecting ? "Redirecting…" : "Upgrade to Pro →"}
            </button>
          )}
        </div>
      </div>

      {!isPro && (
        <div style={{ ...cardStyle, background: "#fafafa" }}>
          <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.9375rem" }}>What's included in Pro</p>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", fontSize: "0.875rem", color: "#555", lineHeight: 1.8 }}>
            <li>Real anonymous peer benchmarks (once your segment reaches 30 agencies)</li>
            <li>Advanced segmentation by region, service type &amp; team size</li>
            <li>Priority support</li>
          </ul>
          <p style={{ margin: "1rem 0 0", fontSize: "0.8125rem", color: "#888" }}>$79 / month</p>
        </div>
      )}
    </main>
  );
}
