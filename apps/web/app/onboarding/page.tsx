"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "32rem",
  margin: "4rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  marginBottom: "0.25rem",
  marginTop: "1rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #ccc",
  borderRadius: "0.375rem",
  fontSize: "1rem",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  marginTop: "1.5rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};

const buttonDisabledStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#999",
  cursor: "not-allowed",
};

const providerCardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "0.5rem",
  padding: "1.25rem",
  marginTop: "1rem",
};

const checkboxRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.75rem",
  marginTop: "0.75rem",
  padding: "0.75rem",
  background: "#f9f9f9",
  borderRadius: "0.375rem",
  border: "1px solid #e5e5e5",
};

const AGENCY_SIZES = [
  { value: "micro", label: "Micro (1–5 people)" },
  { value: "small", label: "Small (6–20 people)" },
  { value: "mid", label: "Mid (21–100 people)" },
  { value: "large", label: "Large (100+ people)" },
];

const REGIONS = [
  { value: "north_america", label: "North America" },
  { value: "europe", label: "Europe" },
  { value: "apac", label: "Asia-Pacific" },
  { value: "latam", label: "Latin America" },
  { value: "middle_east_africa", label: "Middle East & Africa" },
];

const SERVICE_TYPES = [
  { value: "full_service", label: "Full service" },
  { value: "creative_branding", label: "Creative & branding" },
  { value: "digital_marketing", label: "Digital marketing" },
  { value: "web_development", label: "Web development" },
  { value: "pr_communications", label: "PR & communications" },
  { value: "content_production", label: "Content production" },
];

const STEPS = ["Agency setup", "Connect accounting", "View benchmarks"];

function ProgressStepper({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "2rem" }}>
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem" }}>
              <div style={{
                width: "1.5rem",
                height: "1.5rem",
                borderRadius: "9999px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 600,
                background: done ? "#111" : active ? "#333" : "#e5e5e5",
                color: done || active ? "#fff" : "#999",
                border: active ? "2px solid #111" : "none",
                flexShrink: 0,
              }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.6875rem", color: active ? "#111" : done ? "#555" : "#999", whiteSpace: "nowrap" }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: "1px", background: done ? "#111" : "#e5e5e5", margin: "0 0.5rem", marginBottom: "1rem" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProviderCard({
  id,
  label,
  providerParam,
  connecting,
  onConnect,
  error,
}: {
  id: string;
  label: string;
  providerParam: "quickbooks" | "xero";
  connecting: string | null;
  onConnect: (providerParam: "quickbooks" | "xero", consent: boolean) => void;
  error: string;
}) {
  const [consent, setConsent] = useState(false);
  const isConnecting = connecting === providerParam;
  const isBlocked = connecting !== null && !isConnecting;

  return (
    <div style={providerCardStyle}>
      <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "1rem" }}>{label}</p>
      <div style={checkboxRowStyle}>
        <input
          id={`consent-${id}`}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={isBlocked || isConnecting}
          style={{ marginTop: "2px", flexShrink: 0, width: "1rem", height: "1rem", cursor: "pointer" }}
        />
        <label htmlFor={`consent-${id}`} style={{ fontSize: "0.875rem", cursor: "pointer", lineHeight: 1.5, color: "#444" }}>
          I consent to BoringBusinessIntel accessing my Profit &amp; Loss data via Codat to compute benchmarks.
        </label>
      </div>
      {error && isConnecting && (
        <p style={{ color: "#c00", fontSize: "0.875rem", margin: "0.5rem 0 0" }}>{error}</p>
      )}
      <button
        onClick={() => onConnect(providerParam, consent)}
        disabled={!consent || isConnecting || isBlocked}
        style={{
          ...(!consent || isConnecting || isBlocked ? buttonDisabledStyle : buttonStyle),
          marginTop: "0.75rem",
          fontSize: "0.9375rem",
        }}
      >
        {isConnecting ? "Connecting…" : `Connect ${label} →`}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<"org" | "connect">("org");

  // Step 1 — org form
  const [name, setName] = useState("");
  const [agencySize, setAgencySize] = useState("small");
  const [region, setRegion] = useState("north_america");
  const [serviceType, setServiceType] = useState("full_service");
  const [orgStatus, setOrgStatus] = useState<"idle" | "loading" | "error">("idle");
  const [orgError, setOrgError] = useState("");

  // Step 2 — connect
  const [connecting, setConnecting] = useState<"quickbooks" | "xero" | null>(null);
  const [connectError, setConnectError] = useState("");

  async function onSubmitOrg(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrgStatus("loading");
    setOrgError("");

    try {
      const res = await fetch(`${API}/api/v1/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, agencySize, region, serviceType }),
      });

      if (!res.ok) {
        const data = await res.json();
        setOrgStatus("error");
        setOrgError(data.error?.message ?? "Something went wrong.");
        return;
      }

      setOrgStatus("idle");
      setStep("connect");
    } catch {
      setOrgStatus("error");
      setOrgError("Network error. Please try again.");
    }
  }

  async function handleConnect(providerParam: "quickbooks" | "xero", consent: boolean) {
    if (!consent || connecting) return;
    setConnecting(providerParam);
    setConnectError("");

    try {
      const res = await fetch(`${API}/api/v1/integrations/${providerParam}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ consentAccepted: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        setConnectError(data.error?.message ?? "Something went wrong. Please try again.");
        setConnecting(null);
        return;
      }

      const { data } = await res.json();
      if (!data?.linkUrl) {
        setConnectError("Connection failed: no redirect URL received. Please try again.");
        setConnecting(null);
        return;
      }
      window.location.href = data.linkUrl;
    } catch {
      setConnectError("Network error. Please try again.");
      setConnecting(null);
    }
  }

  const currentStepIndex = step === "org" ? 0 : 1;

  return (
    <main style={pageStyle}>
      <ProgressStepper current={currentStepIndex} />

      {step === "org" && (
        <>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Set up your agency</h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Tell us a bit about your agency so we can benchmark you with peers.
          </p>

          <form onSubmit={onSubmitOrg}>
            <label htmlFor="name" style={labelStyle}>Agency name</label>
            <input
              id="name"
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              placeholder="Acme Agency"
              disabled={orgStatus === "loading"}
            />

            <label htmlFor="agencySize" style={labelStyle}>Size</label>
            <select
              id="agencySize"
              value={agencySize}
              onChange={(e) => setAgencySize(e.target.value)}
              style={inputStyle}
              disabled={orgStatus === "loading"}
            >
              {AGENCY_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <label htmlFor="region" style={labelStyle}>Region</label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={inputStyle}
              disabled={orgStatus === "loading"}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            <label htmlFor="serviceType" style={labelStyle}>Primary service</label>
            <select
              id="serviceType"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={inputStyle}
              disabled={orgStatus === "loading"}
            >
              {SERVICE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button
              type="submit"
              style={orgStatus === "loading" ? buttonDisabledStyle : buttonStyle}
              disabled={orgStatus === "loading"}
            >
              {orgStatus === "loading" ? "Creating…" : "Continue →"}
            </button>
          </form>

          {orgStatus === "error" && (
            <p style={{ color: "#c00", marginTop: "1rem" }}>{orgError}</p>
          )}
        </>
      )}

      {step === "connect" && (
        <>
          <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Connect your accounting software</h1>
          <p style={{ color: "#666", marginBottom: "1.5rem" }}>
            Connect QuickBooks Online or Xero to auto-import your P&amp;L and unlock peer benchmarks.
          </p>

          <ProviderCard
            id="qbo"
            label="QuickBooks Online"
            providerParam="quickbooks"
            connecting={connecting}
            onConnect={handleConnect}
            error={connectError}
          />

          <ProviderCard
            id="xero"
            label="Xero"
            providerParam="xero"
            connecting={connecting}
            onConnect={handleConnect}
            error={connectError}
          />

          <p style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              onClick={() => router.push("/dashboard")}
              style={{ background: "none", border: "none", color: "#888", fontSize: "0.875rem", cursor: "pointer", textDecoration: "underline" }}
            >
              Skip for now — go to dashboard
            </button>
          </p>
        </>
      )}
    </main>
  );
}
