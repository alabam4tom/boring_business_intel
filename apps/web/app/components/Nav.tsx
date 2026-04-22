"use client";

import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          aria-label="BoringBusinessIntel home"
          style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-0.03em", color: "#111827" }}
        >
          BBI
        </Link>

        {/* Desktop links */}
        <div className="nav-desktop" aria-label="Site links">
          <a href="#how-it-works" style={{ fontSize: 14, color: "#4b5563" }}>How it works</a>
          <a href="#features" style={{ fontSize: 14, color: "#4b5563" }}>Features</a>
          <a href="#pricing" style={{ fontSize: 14, color: "#4b5563" }}>Pricing</a>
          <a href="#faq" style={{ fontSize: 14, color: "#4b5563" }}>FAQ</a>
          <Link href="/sign-in" style={{ fontSize: 14, color: "#4b5563" }}>Sign in</Link>
          <Link
            href="/sign-up"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              background: "#7c3aed",
              padding: "8px 18px",
              borderRadius: 8,
            }}
          >
            Get started
          </Link>
        </div>

        {/* Hamburger button — mobile only */}
        <button
          className="nav-hamburger"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111827",
              borderRadius: 2,
              transition: "transform 0.2s, opacity 0.2s",
              transform: open ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111827",
              borderRadius: 2,
              opacity: open ? 0 : 1,
              transition: "opacity 0.2s",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "#111827",
              borderRadius: 2,
              transition: "transform 0.2s, opacity 0.2s",
              transform: open ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div
          className="nav-mobile-menu"
          style={{
            borderTop: "1px solid #e5e7eb",
            background: "#fff",
            padding: "16px 24px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {[
            { href: "#how-it-works", label: "How it works", internal: false },
            { href: "#features", label: "Features", internal: false },
            { href: "#pricing", label: "Pricing", internal: false },
            { href: "#faq", label: "FAQ", internal: false },
            { href: "/sign-in", label: "Sign in", internal: true },
          ].map(({ href, label, internal }) =>
            internal ? (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 16,
                  color: "#374151",
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {label}
              </Link>
            ) : (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontSize: 16,
                  color: "#374151",
                  padding: "10px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                {label}
              </a>
            )
          )}
          <Link
            href="/sign-up"
            onClick={() => setOpen(false)}
            style={{
              marginTop: 12,
              display: "block",
              textAlign: "center",
              background: "#7c3aed",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "13px 24px",
              borderRadius: 8,
            }}
          >
            Get started free
          </Link>
        </div>
      )}
    </nav>
  );
}
