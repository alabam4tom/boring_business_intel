"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

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

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [agencySize, setAgencySize] = useState("small");
  const [region, setRegion] = useState("north_america");
  const [serviceType, setServiceType] = useState("full_service");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

    try {
      const res = await fetch(`${apiUrl}/api/v1/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, agencySize, region, serviceType }),
      });

      if (!res.ok) {
        const data = await res.json();
        setStatus("error");
        setErrorMessage(data.error?.message ?? "Something went wrong.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setStatus("error");
      setErrorMessage("Network error. Please try again.");
    }
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>Set up your agency</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Tell us a bit about your agency so we can benchmark you with peers.
      </p>

      <form onSubmit={onSubmit}>
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
          disabled={status === "loading"}
        />

        <label htmlFor="agencySize" style={labelStyle}>Size</label>
        <select
          id="agencySize"
          value={agencySize}
          onChange={(e) => setAgencySize(e.target.value)}
          style={inputStyle}
          disabled={status === "loading"}
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
          disabled={status === "loading"}
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
          disabled={status === "loading"}
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <button type="submit" style={buttonStyle} disabled={status === "loading"}>
          {status === "loading" ? "Creating…" : "Create agency"}
        </button>
      </form>

      {status === "error" && (
        <p style={{ color: "#c00", marginTop: "1rem" }}>{errorMessage}</p>
      )}
    </main>
  );
}
