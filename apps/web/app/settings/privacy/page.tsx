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

const dangerCardStyle: React.CSSProperties = {
  ...cardStyle,
  borderColor: "#fca5a5",
  background: "#fff5f5",
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

const btnDanger: React.CSSProperties = {
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#dc2626",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};

const btnDisabled: React.CSSProperties = {
  ...btnDanger,
  backgroundColor: "#999",
  cursor: "not-allowed",
};

type Provider = {
  provider: string;
  status: string;
  lastSyncAt: string | null;
};

type DataSummary = {
  connectedProviders: Provider[];
  kpiData: {
    periodsAvailable: number;
    years: number[];
    oldestPeriod: number | null;
    newestPeriod: number | null;
  };
  dataQuality: { score: number | null; computedAt: string | null };
  categories: string[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function PrivacyPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    fetch(`${API}/api/v1/privacy/data-summary`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (d?.data) setSummary(d.data); })
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function handleDeleteRequest() {
    if (confirmInput !== "DELETE") return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/privacy/delete-account`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        router.replace("/?deleted=true");
      } else {
        const d = await res.json().catch(() => ({}));
        setError(d?.error?.message ?? "Request failed. Please try again.");
        setSubmitting(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#888" }}>Loading…</p>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/dashboard" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Back to dashboard
        </a>
      </div>

      <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Privacy &amp; Data</h1>
      <p style={{ color: "#666", margin: "0 0 0.25rem", fontSize: "0.9375rem" }}>
        Review what data we access and manage your account.
      </p>

      {/* Connected providers */}
      <div style={cardStyle}>
        <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.9375rem" }}>Connected accounting software</p>
        {(summary?.connectedProviders?.length ?? 0) === 0 ? (
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No accounting software connected.</p>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
            {summary?.connectedProviders.map((p, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: i < (summary.connectedProviders.length - 1) ? "1px solid #f0f0f0" : "none", fontSize: "0.875rem" }}>
                <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{p.provider}</span>
                <span style={{ color: "#888" }}>
                  {p.status} {p.lastSyncAt ? `· Last sync ${formatDate(p.lastSyncAt)}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* KPI data */}
      <div style={cardStyle}>
        <p style={{ margin: "0 0 0.75rem", fontWeight: 600, fontSize: "0.9375rem" }}>Financial data synced</p>
        {(summary?.kpiData?.periodsAvailable ?? 0) === 0 ? (
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No financial data synced yet.</p>
        ) : (
          <div style={{ fontSize: "0.875rem", color: "#555" }}>
            <p style={{ margin: "0 0 0.25rem" }}>
              <strong>{summary?.kpiData.periodsAvailable}</strong> fiscal {summary?.kpiData.periodsAvailable === 1 ? "year" : "years"} synced
              {summary?.kpiData.oldestPeriod && summary?.kpiData.newestPeriod && (
                <> ({summary.kpiData.oldestPeriod} – {summary.kpiData.newestPeriod})</>
              )}
            </p>
            <p style={{ margin: "0.75rem 0 0.25rem", fontWeight: 500, color: "#333" }}>P&amp;L categories accessed:</p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8 }}>
              {summary?.categories.map((cat) => (
                <li key={cat}>{cat}</li>
              ))}
            </ul>
          </div>
        )}
        {summary?.dataQuality.score !== null && summary?.dataQuality.score !== undefined && (
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: "#888" }}>
            Data quality score: <strong style={{ color: "#333" }}>{summary.dataQuality.score}/100</strong>
            {summary.dataQuality.computedAt && <> · computed {formatDate(summary.dataQuality.computedAt)}</>}
          </p>
        )}
      </div>

      {/* Deletion section */}
      <div style={dangerCardStyle}>
        <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.9375rem", color: "#b91c1c" }}>Delete your account</p>
        <p style={{ margin: "0 0 1rem", fontSize: "0.875rem", color: "#555" }}>
          This action is permanent and cannot be undone. All your data will be deleted — including your organization, connected providers, financial data, and account information.
        </p>

        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)} style={btnPrimary}>
            Request data deletion
          </button>
        ) : (
          <div>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#555" }}>
              Your account <strong>{session?.user.email}</strong> and all associated data will be permanently deleted.
              Type <strong>DELETE</strong> to confirm.
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type DELETE"
              style={{
                display: "block",
                width: "100%",
                padding: "0.625rem 0.75rem",
                border: "1px solid #e5e5e5",
                borderRadius: "0.375rem",
                fontSize: "0.9375rem",
                marginBottom: "0.75rem",
                boxSizing: "border-box",
              }}
            />
            {error && (
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#dc2626" }}>{error}</p>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={handleDeleteRequest}
                disabled={confirmInput !== "DELETE" || submitting}
                style={confirmInput !== "DELETE" || submitting ? btnDisabled : btnDanger}
              >
                {submitting ? "Deleting…" : "Permanently delete my account"}
              </button>
              <button
                onClick={() => { setShowConfirm(false); setConfirmInput(""); setError(null); }}
                style={{ padding: "0.75rem 1.5rem", border: "1px solid #e5e5e5", borderRadius: "0.375rem", backgroundColor: "#fff", color: "#333", fontSize: "1rem", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
