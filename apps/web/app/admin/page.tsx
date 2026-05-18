"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "56rem",
  margin: "3rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "0.5rem",
  padding: "1.5rem",
  marginTop: "1.5rem",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse" as const,
  fontSize: "0.875rem",
};

const thStyle: React.CSSProperties = {
  textAlign: "left" as const,
  padding: "0.5rem 0.75rem",
  borderBottom: "2px solid #e5e5e5",
  fontWeight: 600,
  color: "#555",
  fontSize: "0.8125rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};

const tdStyle: React.CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid #f0f0f0",
  color: "#333",
};

const btnPrimary: React.CSSProperties = {
  padding: "0.625rem 1.25rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "0.9375rem",
  cursor: "pointer",
};

const tabStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1rem",
  border: "none",
  borderBottom: active ? "2px solid #111" : "2px solid transparent",
  backgroundColor: "transparent",
  cursor: "pointer",
  fontSize: "0.9375rem",
  fontWeight: active ? 600 : 400,
  color: active ? "#111" : "#888",
});

type SyncHealth = {
  connectionSummary: { linked: number; deauthorized: number; pending_auth: number; unlinked: number };
  recentFailures: Array<{ organizationId: string; provider: string; syncFailedAt: string; lastSyncAt: string | null }>;
  segmentHealth: Array<{ agencySize: string; region: string; serviceType: string; orgCount: number; belowThreshold: boolean }>;
};

type DataQuality = {
  platformAvgScore: number;
  totalOrgs: number;
  lowScoreCount: number;
  orgs: Array<{ organizationId: string; score: number; issues: string[]; periodsAvailable: number; computedAt: string }>;
};

type Outlier = {
  id: string;
  organizationId: string;
  periodYear: number;
  revenueGrowth: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  isOutlier: boolean;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function truncate(s: string, n = 16): string {
  return s.length > n ? `…${s.slice(-n)}` : s;
}

function fmt(v: number | null): string {
  return v != null ? `${v.toFixed(1)}%` : "—";
}

export default function AdminPage() {
  const [secret, setSecret] = useState<string>("");
  const [inputSecret, setInputSecret] = useState("");
  const [tab, setTab] = useState<"sync-health" | "data-quality">("sync-health");

  // Sync health state
  const [syncData, setSyncData] = useState<SyncHealth | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Data quality state
  const [dqData, setDqData] = useState<DataQuality | null>(null);
  const [outliers, setOutliers] = useState<Outlier[]>([]);
  const [dqLoading, setDqLoading] = useState(false);
  const [dqError, setDqError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminSecret") ?? "";
    setSecret(stored);
  }, []);

  useEffect(() => {
    if (!secret) return;
    fetchSyncHealth(secret);
  }, [secret]);

  useEffect(() => {
    if (tab !== "data-quality" || !secret) return;
    fetchDataQuality(secret);
  }, [tab, secret]);

  async function authedFetch(url: string, s: string, options?: RequestInit) {
    const res = await fetch(url, { ...options, headers: { ...options?.headers, Authorization: `Bearer ${s}` } });
    if (res.status === 401) {
      sessionStorage.removeItem("adminSecret");
      setSecret("");
      throw new Error("Invalid admin secret.");
    }
    if (res.status === 503) throw new Error("ADMIN_SECRET not configured on server.");
    if (!res.ok) throw new Error("Unexpected server error.");
    return res.json();
  }

  async function fetchSyncHealth(s: string) {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const json = await authedFetch(`${API}/api/v1/admin/sync-health`, s);
      setSyncData(json.data);
    } catch (e: unknown) {
      setSyncError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setSyncLoading(false);
    }
  }

  async function fetchDataQuality(s: string) {
    setDqLoading(true);
    setDqError(null);
    try {
      const [dq, outs] = await Promise.all([
        authedFetch(`${API}/api/v1/admin/data-quality`, s),
        authedFetch(`${API}/api/v1/admin/outliers`, s),
      ]);
      setDqData(dq.data);
      setOutliers(outs.data);
    } catch (e: unknown) {
      setDqError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setDqLoading(false);
    }
  }

  async function handleToggleOutlier(id: string, isOutlier: boolean) {
    try {
      await authedFetch(`${API}/api/v1/admin/kpi-submissions/${id}/outlier`, secret, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOutlier }),
      });
      setOutliers((prev) => prev.map((o) => o.id === id ? { ...o, isOutlier } : o));
    } catch (e: unknown) {
      setDqError(e instanceof Error ? e.message : "Failed to update outlier flag.");
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("adminSecret", inputSecret);
    setSecret(inputSecret);
  }

  function handleLogout() {
    sessionStorage.removeItem("adminSecret");
    setSecret("");
    setSyncData(null);
    setDqData(null);
    setOutliers([]);
    setInputSecret("");
  }

  if (!secret) {
    return (
      <main style={pageStyle}>
        <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Platform Admin</h1>
        <p style={{ color: "#666", margin: "0 0 1.5rem", fontSize: "0.9375rem" }}>Enter the admin secret to access the dashboard.</p>
        <form onSubmit={handleLogin} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
          <input
            type="password"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            placeholder="Admin secret"
            style={{ padding: "0.625rem 0.75rem", border: "1px solid #e5e5e5", borderRadius: "0.375rem", fontSize: "0.9375rem", width: "18rem" }}
          />
          <button type="submit" disabled={!inputSecret} style={inputSecret ? btnPrimary : { ...btnPrimary, backgroundColor: "#999", cursor: "not-allowed" }}>
            Access dashboard
          </button>
        </form>
        {syncError && <p style={{ marginTop: "0.75rem", color: "#dc2626", fontSize: "0.875rem" }}>{syncError}</p>}
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Platform Admin</h1>
        <button onClick={handleLogout} style={{ padding: "0.5rem 1rem", border: "1px solid #e5e5e5", borderRadius: "0.375rem", backgroundColor: "#fff", color: "#333", fontSize: "0.875rem", cursor: "pointer" }}>
          Sign out
        </button>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e5e5", gap: "0.25rem", marginBottom: "0.5rem" }}>
        <button style={tabStyle(tab === "sync-health")} onClick={() => setTab("sync-health")}>Sync Health</button>
        <button style={tabStyle(tab === "data-quality")} onClick={() => setTab("data-quality")}>Data Quality</button>
      </div>

      {/* ── Sync Health tab ── */}
      {tab === "sync-health" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button onClick={() => fetchSyncHealth(secret)} disabled={syncLoading} style={{ ...btnPrimary, backgroundColor: syncLoading ? "#999" : "#111", cursor: syncLoading ? "not-allowed" : "pointer" }}>
              {syncLoading ? "Loading…" : "Refresh"}
            </button>
          </div>
          {syncError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>{syncError}</p>}

          {syncData && (
            <>
              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>Codat connections</p>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" as const }}>
                  {(["linked", "deauthorized", "pending_auth", "unlinked"] as const).map((status) => (
                    <div key={status}>
                      <p style={{ margin: "0 0 0.25rem", fontSize: "0.8125rem", color: "#888", textTransform: "capitalize" as const }}>
                        {status.replace("_", " ")}
                      </p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: status === "deauthorized" ? "#b91c1c" : "#111" }}>
                        {syncData.connectionSummary[status]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>
                  Recent sync failures <span style={{ fontWeight: 400, color: "#888", fontSize: "0.875rem" }}>({syncData.recentFailures.length})</span>
                </p>
                {syncData.recentFailures.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No recent failures.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead><tr>
                      <th style={thStyle}>Org ID</th>
                      <th style={thStyle}>Provider</th>
                      <th style={thStyle}>Failed at</th>
                      <th style={thStyle}>Last success</th>
                    </tr></thead>
                    <tbody>
                      {syncData.recentFailures.map((f, i) => (
                        <tr key={i}>
                          <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.8125rem" }}>{truncate(f.organizationId)}</td>
                          <td style={tdStyle}>{f.provider}</td>
                          <td style={{ ...tdStyle, color: "#b91c1c" }}>{formatDate(f.syncFailedAt)}</td>
                          <td style={{ ...tdStyle, color: "#888" }}>{f.lastSyncAt ? formatDate(f.lastSyncAt) : "Never"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>
                  Segment health <span style={{ fontWeight: 400, color: "#888", fontSize: "0.875rem" }}>({syncData.segmentHealth.length} segments, threshold: 30)</span>
                </p>
                {syncData.segmentHealth.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No segments with data yet.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead><tr>
                      <th style={thStyle}>Agency size</th>
                      <th style={thStyle}>Region</th>
                      <th style={thStyle}>Service type</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Orgs</th>
                      <th style={thStyle}>Status</th>
                    </tr></thead>
                    <tbody>
                      {syncData.segmentHealth.map((s, i) => (
                        <tr key={i} style={{ background: s.belowThreshold ? "#fffbeb" : "transparent" }}>
                          <td style={tdStyle}>{s.agencySize}</td>
                          <td style={tdStyle}>{s.region}</td>
                          <td style={tdStyle}>{s.serviceType}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const, fontWeight: 600 }}>{s.orgCount}</td>
                          <td style={tdStyle}>
                            {s.belowThreshold
                              ? <span style={{ color: "#b45309", fontSize: "0.8125rem" }}>⚠ Below threshold</span>
                              : <span style={{ color: "#15803d", fontSize: "0.8125rem" }}>✓ OK</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* ── Data Quality tab ── */}
      {tab === "data-quality" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button onClick={() => fetchDataQuality(secret)} disabled={dqLoading} style={{ ...btnPrimary, backgroundColor: dqLoading ? "#999" : "#111", cursor: dqLoading ? "not-allowed" : "pointer" }}>
              {dqLoading ? "Loading…" : "Refresh"}
            </button>
          </div>
          {dqError && <p style={{ color: "#dc2626", fontSize: "0.875rem", marginTop: "0.5rem" }}>{dqError}</p>}

          {dqData && (
            <>
              {/* Summary */}
              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>Platform data quality</p>
                <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" as const }}>
                  {[
                    { label: "Avg score", value: `${dqData.platformAvgScore}/100`, color: dqData.platformAvgScore < 80 ? "#b91c1c" : "#111" },
                    { label: "Total orgs", value: dqData.totalOrgs, color: "#111" },
                    { label: "Low score (<80)", value: dqData.lowScoreCount, color: dqData.lowScoreCount > 0 ? "#b45309" : "#111" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p style={{ margin: "0 0 0.25rem", fontSize: "0.8125rem", color: "#888" }}>{stat.label}</p>
                      <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Orgs by score */}
              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>Organizations by data quality</p>
                {dqData.orgs.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No data yet.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead><tr>
                      <th style={thStyle}>Org ID</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Score</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Periods</th>
                      <th style={thStyle}>Issues</th>
                      <th style={thStyle}>Computed</th>
                    </tr></thead>
                    <tbody>
                      {dqData.orgs.map((o, i) => (
                        <tr key={i} style={{ background: o.score < 80 ? "#fffbeb" : "transparent" }}>
                          <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.8125rem" }}>{truncate(o.organizationId)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const, fontWeight: 600, color: o.score < 80 ? "#b91c1c" : "#15803d" }}>{o.score}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const }}>{o.periodsAvailable}</td>
                          <td style={{ ...tdStyle, color: "#888", fontSize: "0.8125rem" }}>{o.issues.length > 0 ? o.issues.join(", ") : "—"}</td>
                          <td style={{ ...tdStyle, color: "#888", fontSize: "0.8125rem" }}>{formatDate(o.computedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Outliers */}
              <div style={cardStyle}>
                <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>
                  Outlier submissions <span style={{ fontWeight: 400, color: "#888", fontSize: "0.875rem" }}>({outliers.length})</span>
                </p>
                {outliers.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No outlier submissions flagged.</p>
                ) : (
                  <table style={tableStyle}>
                    <thead><tr>
                      <th style={thStyle}>Submission ID</th>
                      <th style={thStyle}>Org ID</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Year</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Rev growth</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Gross margin</th>
                      <th style={{ ...thStyle, textAlign: "right" as const }}>Net margin</th>
                      <th style={thStyle}>Action</th>
                    </tr></thead>
                    <tbody>
                      {outliers.map((o) => (
                        <tr key={o.id}>
                          <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.8125rem" }}>{truncate(o.id)}</td>
                          <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.8125rem" }}>{truncate(o.organizationId)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const }}>{o.periodYear}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const }}>{fmt(o.revenueGrowth)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const }}>{fmt(o.grossMargin)}</td>
                          <td style={{ ...tdStyle, textAlign: "right" as const }}>{fmt(o.netMargin)}</td>
                          <td style={tdStyle}>
                            <button
                              onClick={() => handleToggleOutlier(o.id, !o.isOutlier)}
                              style={{
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.8125rem",
                                cursor: "pointer",
                                border: "1px solid #e5e5e5",
                                borderRadius: "0.25rem",
                                backgroundColor: o.isOutlier ? "#fef2f2" : "#f0fdf4",
                                color: o.isOutlier ? "#b91c1c" : "#15803d",
                              }}
                            >
                              {o.isOutlier ? "Unflag" : "Flag"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}
