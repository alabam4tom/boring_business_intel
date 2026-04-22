import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BoringBusinessIntel — Financial Benchmarks for Digital Agencies";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111827",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              background: "#7c3aed",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              padding: "6px 16px",
              borderRadius: 20,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Anonymous · Peer-Verified
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: 28,
          }}
        >
          Financial Benchmarks
          <br />
          <span style={{ color: "#a78bfa" }}>for Digital Agencies.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "#9ca3af",
            lineHeight: 1.5,
            maxWidth: 720,
            marginBottom: 56,
          }}
        >
          Compare your revenue growth, gross margin, and net margin
          against 30+ peer agencies in your exact segment.
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48 }}>
          {[
            { value: "P25 / Median / P75", label: "Percentile rankings" },
            { value: "30+ peers", label: "K-anonymity threshold" },
            { value: "3 KPIs", label: "Revenue · Gross · Net" },
          ].map(({ value, label }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{ fontSize: 22, fontWeight: 800, color: "#7c3aed", letterSpacing: "-0.02em" }}
              >
                {value}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 96,
            fontSize: 18,
            fontWeight: 700,
            color: "#374151",
            letterSpacing: "-0.02em",
          }}
        >
          boringbusinessintel.com
        </div>
      </div>
    ),
    { ...size }
  );
}
