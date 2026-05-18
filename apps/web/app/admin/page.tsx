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

type SyncHealth = {
  connectionSummary: { linked: number; deauthorized: number; pending_auth: number; unlinked: number };
  recentFailures: Array<{ organizationId: string; provider: string; syncFailedAt: string; lastSyncAt: string | null }>;
  segmentHealth: Array<{ agencySize: string; region: string; serviceType: string; orgCount: number; belowThreshold: boolean }>;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function truncate(s: string, n = 16): string {
  return s.length > n ? `…${s.slice(-n)}` : s;
}

export default function AdminPage() {
  const [secret, setSecret] = useState<string>("");
  const [inputSecret, setInputSecret] = useState("");
  const [data, setData] = useState<SyncHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("adminSecret") ?? "";
    setSecret(stored);
  }, []);

  useEffect(() => {
    if (!secret) return;
    fetchData(secret);
  }, [secret]);

  async function fetchData(s: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/v1/admin/sync-health`, {
        headers: { Authorization: `Bearer ${s}` },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("adminSecret");
        setSecret("");
        setError("Invalid admin secret.");
        return;
      }
      if (res.status === 503) {
        setError("ADMIN_SECRET not configured on server.");
        return;
      }
      if (!res.ok) {
        setError("Unexpected error from server.");
        return;
      }
      const json = await res.json();
      setData(json.data);
    } catch {
      setError("Network error. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem("adminSecret", inputSecret);
    setSecret(inputSecret);
  }

  function handleRefresh() {
    if (secret) fetchData(secret);
  }

  function handleLogout() {
    sessionStorage.removeItem("adminSecret");
    setSecret("");
    setData(null);
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
        {error && <p style={{ marginTop: "0.75rem", color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Platform Admin</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleRefresh} disabled={loading} style={{ ...btnPrimary, backgroundColor: loading ? "#999" : "#111", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Loading…" : "Refresh"}
          </button>
          <button onClick={handleLogout} style={{ padding: "0.625rem 1.25rem", border: "1px solid #e5e5e5", borderRadius: "0.375rem", backgroundColor: "#fff", color: "#333", fontSize: "0.9375rem", cursor: "pointer" }}>
            Sign out
          </button>
        </div>
      </div>

      {error && <p style={{ marginTop: "0.75rem", color: "#dc2626", fontSize: "0.875rem" }}>{error}</p>}

      {data && (
        <>
          {/* Connection summary */}
          <div style={cardStyle}>
            <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>Codat connections</p>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" as const }}>
              {(["linked", "deauthorized", "pending_auth", "unlinked"] as const).map((status) => (
                <div key={status}>
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.8125rem", color: "#888", textTransform: "capitalize" as const }}>
                    {status.replace("_", " ")}
                  </p>
                  <p style={{ margin: 0, fontSize: "1.75rem", fontWeight: 700, color: status === "deauthorized" ? "#b91c1c" : "#111" }}>
                    {data.connectionSummary[status]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent failures */}
          <div style={cardStyle}>
            <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>
              Recent sync failures <span style={{ fontWeight: 400, color: "#888", fontSize: "0.875rem" }}>({data.recentFailures.length})</span>
            </p>
            {data.recentFailures.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No recent failures.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Org ID</th>
                    <th style={thStyle}>Provider</th>
                    <th style={thStyle}>Failed at</th>
                    <th style={thStyle}>Last success</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentFailures.map((f, i) => (
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

          {/* Segment health */}
          <div style={cardStyle}>
            <p style={{ margin: "0 0 1rem", fontWeight: 600, fontSize: "0.9375rem" }}>
              Segment health <span style={{ fontWeight: 400, color: "#888", fontSize: "0.875rem" }}>({data.segmentHealth.length} segments, threshold: {30})</span>
            </p>
            {data.segmentHealth.length === 0 ? (
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#888" }}>No segments with data yet.</p>
            ) : (
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Agency size</th>
                    <th style={thStyle}>Region</th>
                    <th style={thStyle}>Service type</th>
                    <th style={{ ...thStyle, textAlign: "right" as const }}>Orgs</th>
                    <th style={thStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.segmentHealth.map((s, i) => (
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
    </main>
  );
}
