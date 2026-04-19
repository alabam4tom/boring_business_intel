"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "52rem",
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  border: "1px solid #ccc",
  borderRadius: "0.375rem",
  fontSize: "0.9375rem",
  boxSizing: "border-box",
};

const btnPrimary: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "0.9375rem",
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  padding: "0.6rem 1.25rem",
  border: "1px solid #ccc",
  borderRadius: "0.375rem",
  background: "none",
  cursor: "pointer",
  fontSize: "0.9375rem",
};

type Org = { id: string; name: string; agencySize: string; region: string; serviceType: string; role: string };
type KpiSubmission = { id: string; periodYear: number; revenueGrowth: number | null; grossMargin: number | null; netMargin: number | null; submittedAt: string };

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i);

function pct(v: number | null) {
  return v === null ? "—" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<KpiSubmission[]>([]);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [year, setYear] = useState(String(CURRENT_YEAR - 1));
  const [revenueGrowth, setRevenueGrowth] = useState("");
  const [grossMargin, setGrossMargin] = useState("");
  const [netMargin, setNetMargin] = useState("");
  const [formStatus, setFormStatus] = useState<"idle" | "loading" | "error">("idle");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) { router.replace("/sign-in"); return; }

    Promise.all([
      fetch(`${API}/api/v1/organizations/mine`, { credentials: "include" }).then(r => {
        if (r.status === 404) { router.replace("/onboarding"); return null; }
        return r.json();
      }),
      fetch(`${API}/api/v1/kpi-submissions`, { credentials: "include" }).then(r => r.json()),
    ]).then(([orgData, kpiData]) => {
      if (orgData) setOrg(orgData.data);
      if (kpiData?.data) setSubmissions(kpiData.data);
    }).finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function onSubmitKpi(e: FormEvent) {
    e.preventDefault();
    setFormStatus("loading");
    setFormError("");

    const body = {
      periodYear: parseInt(year, 10),
      revenueGrowth: revenueGrowth !== "" ? parseFloat(revenueGrowth) : null,
      grossMargin: grossMargin !== "" ? parseFloat(grossMargin) : null,
      netMargin: netMargin !== "" ? parseFloat(netMargin) : null,
    };

    const res = await fetch(`${API}/api/v1/kpi-submissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setFormStatus("error");
      setFormError(data.error?.message ?? "Something went wrong.");
      return;
    }

    const { data } = await res.json();
    setSubmissions(prev => [data, ...prev].sort((a, b) => b.periodYear - a.periodYear));
    setShowForm(false);
    setRevenueGrowth(""); setGrossMargin(""); setNetMargin("");
    setFormStatus("idle");
  }

  const submittedYears = new Set(submissions.map(s => s.periodYear));

  if (isPending || loading) {
    return <main style={pageStyle}><p style={{ color: "#888" }}>Loading…</p></main>;
  }
  if (!org) return null;

  return (
    <main style={pageStyle}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{org.name}</h1>
          <p style={{ color: "#666", margin: "0.25rem 0 0", fontSize: "0.875rem" }}>{session?.user?.email}</p>
        </div>
        <button onClick={() => authClient.signOut().then(() => router.push("/sign-in"))} style={btnGhost}>
          Sign out
        </button>
      </div>

      {/* KPI section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.125rem", margin: 0 }}>KPI submissions</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={btnPrimary}>+ Add year</button>
        )}
      </div>

      {/* Submission form */}
      {showForm && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 1rem", fontSize: "1rem" }}>New submission</h3>
          <form onSubmit={onSubmitKpi}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "1rem", alignItems: "end" }}>
              <div>
                <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.25rem" }}>Year</label>
                <select value={year} onChange={e => setYear(e.target.value)} style={inputStyle} disabled={formStatus === "loading"}>
                  {YEARS.filter(y => !submittedYears.has(y)).map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.25rem" }}>Revenue growth (%)</label>
                <input type="number" step="0.1" value={revenueGrowth} onChange={e => setRevenueGrowth(e.target.value)} style={inputStyle} placeholder="e.g. 12.5" disabled={formStatus === "loading"} />
              </div>
              <div>
                <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.25rem" }}>Gross margin (%)</label>
                <input type="number" step="0.1" value={grossMargin} onChange={e => setGrossMargin(e.target.value)} style={inputStyle} placeholder="e.g. 45.0" disabled={formStatus === "loading"} />
              </div>
              <div>
                <label style={{ fontSize: "0.8125rem", display: "block", marginBottom: "0.25rem" }}>Net margin (%)</label>
                <input type="number" step="0.1" value={netMargin} onChange={e => setNetMargin(e.target.value)} style={inputStyle} placeholder="e.g. 8.2" disabled={formStatus === "loading"} />
              </div>
            </div>
            {formError && <p style={{ color: "#c00", fontSize: "0.875rem", margin: "0.75rem 0 0" }}>{formError}</p>}
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <button type="submit" style={btnPrimary} disabled={formStatus === "loading"}>
                {formStatus === "loading" ? "Saving…" : "Save"}
              </button>
              <button type="button" style={btnGhost} onClick={() => { setShowForm(false); setFormError(""); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submissions table */}
      {submissions.length === 0 && !showForm ? (
        <div style={{ ...cardStyle, color: "#888", textAlign: "center" }}>
          <p style={{ margin: 0 }}>No data yet. Add your first year to unlock benchmarks.</p>
        </div>
      ) : submissions.length > 0 && (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
                <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600 }}>Year</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Revenue growth</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Gross margin</th>
                <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>Net margin</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "0.75rem 1rem", fontWeight: 500 }}>{s.periodYear}</td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: s.revenueGrowth === null ? "#bbb" : s.revenueGrowth >= 0 ? "#0a7" : "#c00" }}>{pct(s.revenueGrowth)}</td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: s.grossMargin === null ? "#bbb" : "#333" }}>{pct(s.grossMargin)}</td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "right", color: s.netMargin === null ? "#bbb" : s.netMargin >= 0 ? "#0a7" : "#c00" }}>{pct(s.netMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
