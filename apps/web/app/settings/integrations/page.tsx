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

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  marginTop: "1rem",
  padding: "1rem",
  background: "#f9f9f9",
  borderRadius: "0.375rem",
  border: "1px solid #e5e5e5",
};

type IntegrationStatus = "none" | "pending_auth" | "linked" | "deauthorized" | "unlinked";

type ProviderStatus = {
  status: IntegrationStatus;
  linkedAt: string | null;
  lastSyncAt: string | null;
};

type IntegrationsData = {
  quickbooks_online: ProviderStatus;
  xero: ProviderStatus;
};

const emptyProvider: ProviderStatus = { status: "none", linkedAt: null, lastSyncAt: null };

function isActive(s: IntegrationStatus) {
  return s === "linked" || s === "pending_auth";
}

function ConsentForm({
  providerLabel,
  connectEndpoint,
  disabled,
  disabledReason,
}: {
  providerLabel: string;
  connectEndpoint: string;
  disabled: boolean;
  disabledReason?: string;
}) {
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  async function handleConnect() {
    if (!consentAccepted || disabled) return;
    setConnecting(true);
    setError("");

    try {
      const res = await fetch(`${API}${connectEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consentAccepted: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error?.message ?? "Something went wrong. Please try again.");
        setConnecting(false);
        return;
      }

      const { data } = await res.json();
      if (!data?.linkUrl) {
        setError("Connection failed: no redirect URL received. Please try again.");
        setConnecting(false);
        return;
      }
      window.location.href = data.linkUrl;
    } catch {
      setError("Network error. Please try again.");
      setConnecting(false);
    }
  }

  if (disabled && disabledReason) {
    return (
      <p style={{ margin: "1rem 0 0", fontSize: "0.875rem", color: "#888", fontStyle: "italic" }}>
        {disabledReason}
      </p>
    );
  }

  return (
    <div>
      <div style={{ fontSize: "0.9375rem", color: "#333", lineHeight: 1.6 }}>
        <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>What data will be accessed:</p>
        <ul style={{ margin: "0 0 1rem", paddingLeft: "1.25rem" }}>
          <li>Profit &amp; Loss statement for the last 24 months</li>
          <li>Revenue, cost of goods sold, and expense categories</li>
        </ul>
        <p style={{ margin: "0 0 0.75rem", fontWeight: 600 }}>What will NOT be accessed:</p>
        <ul style={{ margin: "0 0 0.75rem", paddingLeft: "1.25rem" }}>
          <li>Bank account details or balances</li>
          <li>Individual invoices, customer names, or vendor names</li>
          <li>Tax records or payroll details</li>
        </ul>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#555", fontStyle: "italic" }}>
          Your raw P&amp;L data is processed to extract KPIs and then permanently discarded. Only anonymized metrics are stored for benchmarking.
        </p>
      </div>

      <div style={checkboxRowStyle}>
        <input
          id={`consent-${providerLabel}`}
          type="checkbox"
          checked={consentAccepted}
          onChange={(e) => setConsentAccepted(e.target.checked)}
          style={{ marginTop: "2px", flexShrink: 0, width: "1rem", height: "1rem", cursor: "pointer" }}
        />
        <label htmlFor={`consent-${providerLabel}`} style={{ fontSize: "0.9375rem", cursor: "pointer", lineHeight: 1.5 }}>
          I consent to BoringBusinessIntel accessing my Profit &amp; Loss data via Codat to compute benchmarks, as described above.
        </label>
      </div>

      {error && (
        <p style={{ color: "#c00", fontSize: "0.875rem", margin: "0.75rem 0 0" }}>{error}</p>
      )}

      <button
        onClick={handleConnect}
        disabled={!consentAccepted || connecting}
        style={{ marginTop: "1.25rem", ...(!consentAccepted || connecting ? btnDisabled : btnPrimary) }}
      >
        {connecting ? "Connecting…" : `Connect ${providerLabel} →`}
      </button>
    </div>
  );
}

function ProviderCard({
  label,
  status,
  linkedAt,
  lastSyncAt,
  connectEndpoint,
  hasOtherActive,
}: {
  label: string;
  status: IntegrationStatus;
  linkedAt: string | null;
  lastSyncAt: string | null;
  connectEndpoint: string;
  hasOtherActive: boolean;
}) {
  return (
    <div style={cardStyle}>
      <h2 style={{ fontSize: "1.125rem", margin: "0 0 0.75rem" }}>{label}</h2>

      {status === "linked" && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.375rem", borderColor: "#bbf7d0", background: "#f0fdf4", border: "1px solid #bbf7d0", marginBottom: "0.5rem" }}>
          <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "#15803d", fontSize: "0.9375rem" }}>
            ✓ Connected
          </p>
          {linkedAt && (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
              Connected on {new Date(linkedAt).toLocaleDateString()}
            </p>
          )}
          {lastSyncAt && (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem", color: "#666" }}>
              Last synced: {new Date(lastSyncAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {status === "pending_auth" && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.375rem", border: "1px solid #fed7aa", background: "#fff7ed", marginBottom: "0.75rem" }}>
          <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "#c2410c", fontSize: "0.9375rem" }}>
            ⏳ Authorization pending
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
            Complete the authorization in the Codat window. If the window closed, you can try connecting again.
          </p>
        </div>
      )}

      {(status === "deauthorized" || status === "unlinked") && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: "0.375rem", border: "1px solid #fecaca", background: "#fef2f2", marginBottom: "0.75rem" }}>
          <p style={{ margin: "0 0 0.25rem", fontWeight: 600, color: "#b91c1c", fontSize: "0.9375rem" }}>
            {status === "deauthorized" ? "⚠ Connection revoked" : "○ Connection disconnected"}
          </p>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#666" }}>
            {status === "deauthorized"
              ? "Access was revoked. Please reconnect to resume data syncing."
              : "Connection was disconnected. Reconnect below to resume syncing."}
          </p>
        </div>
      )}

      {status !== "linked" && (
        <ConsentForm
          providerLabel={label}
          connectEndpoint={connectEndpoint}
          disabled={hasOtherActive}
          disabledReason={
            hasOtherActive
              ? "Disconnect your current integration before connecting a different accounting software."
              : undefined
          }
        />
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [integrations, setIntegrations] = useState<IntegrationsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    fetch(`${API}/api/v1/integrations`, { credentials: "include" })
      .then((r) => r.json())
      .then((res) => setIntegrations(res.data))
      .catch(() =>
        setIntegrations({
          quickbooks_online: emptyProvider,
          xero: emptyProvider,
        })
      )
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#888" }}>Loading…</p>
      </main>
    );
  }

  const qbo = integrations?.quickbooks_online ?? emptyProvider;
  const xero = integrations?.xero ?? emptyProvider;
  const qboActive = isActive(qbo.status);
  const xeroActive = isActive(xero.status);

  return (
    <main style={pageStyle}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/dashboard" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Back to dashboard
        </a>
      </div>

      <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Accounting integrations</h1>
      <p style={{ color: "#666", margin: "0 0 0.25rem", fontSize: "0.9375rem" }}>
        Connect your accounting software to unlock peer benchmarks.
      </p>
      <p style={{ color: "#888", margin: "0 0 1.5rem", fontSize: "0.875rem" }}>
        Only one accounting software can be connected at a time.
      </p>

      <ProviderCard
        label="QuickBooks Online"
        status={qbo.status}
        linkedAt={qbo.linkedAt}
        lastSyncAt={qbo.lastSyncAt}
        connectEndpoint="/api/v1/integrations/quickbooks/connect"
        hasOtherActive={xeroActive}
      />

      <ProviderCard
        label="Xero"
        status={xero.status}
        linkedAt={xero.linkedAt}
        lastSyncAt={xero.lastSyncAt}
        connectEndpoint="/api/v1/integrations/xero/connect"
        hasOtherActive={qboActive}
      />
    </main>
  );
}
