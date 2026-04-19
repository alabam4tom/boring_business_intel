"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "56rem",
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

const thStyle: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600, color: "#555", fontSize: "0.8125rem" };
const tdStyle: React.CSSProperties = { padding: "0.75rem 1rem", textAlign: "right", fontSize: "0.9375rem" };

type Org = { id: string; name: string; agencySize: string; region: string; serviceType: string; role: string };
type KpiSubmission = { id: string; periodYear: number; revenueGrowth: number | null; grossMargin: number | null; netMargin: number | null };
type MetricStats = { p25: number | null; median: number | null; p75: number | null };
type BenchmarkRow = {
  periodYear: number;
  peerCount: number;
  thresholdMet: boolean;
  needed: number | null;
  own: { revenueGrowth: number | null; grossMargin: number | null; netMargin: number | null };
  peers: { revenueGrowth: MetricStats; grossMargin: MetricStats; netMargin: MetricStats } | null;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => CURRENT_YEAR - i);

function pct(v: number | null | undefined) {
  if (v === null || v === undefined) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function position(own: number | null, stats: MetricStats | undefined): string {
  if (own === null || !stats?.median) return "";
  if (stats.p75 !== null && own >= stats.p75) return "Top 25%";
  if (own >= stats.median) return "Above median";
  if (stats.p25 !== null && own >= stats.p25) return "Below median";
  return "Bottom 25%";
}

function positionColor(pos: string): string {
  if (pos === "Top 25%") return "#0a7";
  if (pos === "Above median") return "#5a9";
  if (pos === "Below median") return "#c80";
  if (pos === "Bottom 25%") return "#c00";
  return "#888";
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [org, setOrg] = useState<Org | null>(null);
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<KpiSubmission[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkRow[]>([]);
  const [benchmarkYear, setBenchmarkYear] = useState<number | null>(null);
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
      fetch(`${API}/api/v1/benchmarks`, { credentials: "include" }).then(r => r.json()),
    ]).then(([orgData, kpiData, benchData]) => {
      if (orgData) setOrg(orgData.data);
      if (kpiData?.data) setSubmissions(kpiData.data);
      if (benchData?.data?.length) {
        setBenchmarks(benchData.data);
        setBenchmarkYear(benchData.data[0].periodYear);
      }
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
    const newSubs = [data, ...submissions].sort((a, b) => b.periodYear - a.periodYear);
    setSubmissions(newSubs);

    // Refresh benchmarks
    const benchData = await fetch(`${API}/api/v1/benchmarks`, { credentials: "include" }).then(r => r.json());
    if (benchData?.data?.length) {
      setBenchmarks(benchData.data);
      setBenchmarkYear(benchData.data[0].periodYear);
    }

    setShowForm(false);
    setRevenueGrowth(""); setGrossMargin(""); setNetMargin("");
    setFormStatus("idle");
  }

  const submittedYears = new Set(submissions.map(s => s.periodYear));
  const activeBenchmark = benchmarks.find(b => b.periodYear === benchmarkYear);

  if (isPending || loading) {
    return <main style={pageStyle}><p style={{ color: "#888" }}>Loading…</p></main>;
  }
  if (!org) return null;

  const metrics: { label: string; key: keyof BenchmarkRow["own"] }[] = [
    { label: "Revenue growth", key: "revenueGrowth" },
    { label: "Gross margin", key: "grossMargin" },
    { label: "Net margin", key: "netMargin" },
  ];

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

      {/* ── KPI SUBMISSIONS ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Your KPIs</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={btnPrimary}>+ Add year</button>
        )}
      </div>

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

      {submissions.length === 0 && !showForm ? (
        <div style={{ ...cardStyle, color: "#888", textAlign: "center" }}>
          <p style={{ margin: 0 }}>No data yet. Add your first year to unlock benchmarks.</p>
        </div>
      ) : submissions.length > 0 && (
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
                <th style={{ ...thStyle, textAlign: "left" }}>Year</th>
                <th style={thStyle}>Revenue growth</th>
                <th style={thStyle}>Gross margin</th>
                <th style={thStyle}>Net margin</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ ...tdStyle, textAlign: "left", fontWeight: 500 }}>{s.periodYear}</td>
                  <td style={{ ...tdStyle, color: s.revenueGrowth === null ? "#bbb" : s.revenueGrowth >= 0 ? "#0a7" : "#c00" }}>{pct(s.revenueGrowth)}</td>
                  <td style={{ ...tdStyle, color: s.grossMargin === null ? "#bbb" : "#333" }}>{pct(s.grossMargin)}</td>
                  <td style={{ ...tdStyle, color: s.netMargin === null ? "#bbb" : s.netMargin >= 0 ? "#0a7" : "#c00" }}>{pct(s.netMargin)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── BENCHMARKS ── */}
      {submissions.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2.5rem" }}>
            <h2 style={{ fontSize: "1.125rem", margin: 0 }}>Peer benchmark</h2>
            {benchmarks.length > 1 && (
              <select
                value={benchmarkYear ?? ""}
                onChange={e => setBenchmarkYear(Number(e.target.value))}
                style={{ ...inputStyle, width: "auto", padding: "0.4rem 0.75rem" }}
              >
                {benchmarks.map(b => (
                  <option key={b.periodYear} value={b.periodYear}>{b.periodYear}</option>
                ))}
              </select>
            )}
          </div>

          {benchmarks.length === 0 ? (
            <div style={{ ...cardStyle, color: "#888", textAlign: "center" }}>
              <p style={{ margin: 0 }}>No peer data available yet for your segment.</p>
            </div>
          ) : !activeBenchmark ? null : !activeBenchmark.thresholdMet ? (
            <div style={{ ...cardStyle, textAlign: "center" }}>
              <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "1.125rem" }}>
                {activeBenchmark.peerCount} / 30 peers
              </p>
              <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
                Benchmarks unlock once {activeBenchmark.needed} more {activeBenchmark.needed === 1 ? "agency" : "agencies"} in your peer group submit data.
              </p>
              <div style={{ marginTop: "1rem", background: "#f0f0f0", borderRadius: "9999px", height: "6px", overflow: "hidden" }}>
                <div style={{ width: `${Math.min((activeBenchmark.peerCount / 30) * 100, 100)}%`, background: "#111", height: "100%", borderRadius: "9999px", transition: "width 0.3s" }} />
              </div>
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9375rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e5e5e5", background: "#fafafa" }}>
                    <th style={{ ...thStyle, textAlign: "left" }}>Metric</th>
                    <th style={thStyle}>You</th>
                    <th style={thStyle}>P25</th>
                    <th style={thStyle}>Median</th>
                    <th style={thStyle}>P75</th>
                    <th style={thStyle}>Position</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map(({ label, key }) => {
                    const own = activeBenchmark.own[key];
                    const stats = activeBenchmark.peers?.[key];
                    const pos = position(own, stats);
                    return (
                      <tr key={key} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ ...tdStyle, textAlign: "left", fontWeight: 500 }}>{label}</td>
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{pct(own)}</td>
                        <td style={{ ...tdStyle, color: "#888" }}>{pct(stats?.p25)}</td>
                        <td style={{ ...tdStyle, color: "#888" }}>{pct(stats?.median)}</td>
                        <td style={{ ...tdStyle, color: "#888" }}>{pct(stats?.p75)}</td>
                        <td style={{ ...tdStyle, fontWeight: 500, color: positionColor(pos) }}>{pos || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={{ padding: "0.625rem 1rem", margin: 0, fontSize: "0.75rem", color: "#aaa", borderTop: "1px solid #f0f0f0" }}>
                Based on {activeBenchmark.peerCount} peers — same size, region & service type
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
