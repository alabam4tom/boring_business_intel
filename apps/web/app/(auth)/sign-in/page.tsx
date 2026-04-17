"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "../../../lib/auth-client";

const pageStyle: React.CSSProperties = {
  maxWidth: "24rem",
  margin: "4rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  marginTop: "0.5rem",
  border: "1px solid #ccc",
  borderRadius: "0.375rem",
  fontSize: "1rem",
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  marginTop: "1rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
};

const googleButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  backgroundColor: "#fff",
  color: "#111",
  border: "1px solid #ccc",
};

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function onMagicLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");
    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/dashboard",
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message ?? "Could not send the magic link.");
      return;
    }
    setStatus("sent");
  }

  async function onGoogleSignIn() {
    setStatus("loading");
    setErrorMessage("");
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (error) {
      setStatus("error");
      setErrorMessage(error.message ?? "Google sign-in failed.");
    }
  }

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Sign in</h1>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Use a magic link or Google to access your dashboard.
      </p>

      <form onSubmit={onMagicLinkSubmit}>
        <label htmlFor="email" style={{ fontSize: "0.875rem" }}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          placeholder="you@agency.com"
          disabled={status === "loading" || status === "sent"}
        />
        <button
          type="submit"
          style={buttonStyle}
          disabled={status === "loading" || status === "sent"}
        >
          {status === "loading" ? "Sending…" : "Send magic link"}
        </button>
      </form>

      <button
        type="button"
        onClick={onGoogleSignIn}
        style={googleButtonStyle}
        disabled={status === "loading"}
      >
        Continue with Google
      </button>

      {status === "sent" && (
        <p style={{ color: "#0a7", marginTop: "1rem" }}>
          Check your inbox — we just sent you a sign-in link.
        </p>
      )}
      {status === "error" && (
        <p style={{ color: "#c00", marginTop: "1rem" }}>{errorMessage}</p>
      )}
    </main>
  );
}
