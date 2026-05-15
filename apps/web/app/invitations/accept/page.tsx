"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { authClient } from "../../../lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "32rem",
  margin: "6rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
  textAlign: "center",
};

const cardStyle: React.CSSProperties = {
  border: "1px solid #e5e5e5",
  borderRadius: "0.5rem",
  padding: "2rem",
  marginTop: "1.5rem",
};

const btnPrimary: React.CSSProperties = {
  padding: "0.75rem 2rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "1.5rem",
};

const btnDisabled: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: "#999",
  cursor: "not-allowed",
};

type InviteInfo = {
  email: string;
  orgName: string;
  role: string;
};

function AcceptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { data: session, isPending } = authClient.useSession();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoadError("No invitation token found.");
      setLoading(false);
      return;
    }

    fetch(`${API}/api/v1/invitations/${token}`)
      .then(async (r) => {
        if (r.status === 410) {
          setLoadError("This invitation has expired. Ask your organization owner to send a new invite.");
          return;
        }
        if (!r.ok) {
          setLoadError("Invitation not found or invalid.");
          return;
        }
        const body = await r.json();
        if (body?.data) setInvite(body.data as InviteInfo);
      })
      .catch(() => setLoadError("Could not load invitation details."))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setAcceptError(null);

    const res = await fetch(`${API}/api/v1/invitations/${token}/accept`, {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      router.replace("/dashboard");
      return;
    }

    const body = await res.json().catch(() => null);
    const code = body?.error?.code ?? "";

    if (code === "EMAIL_MISMATCH") {
      setAcceptError("This invitation was sent to a different email address.");
    } else if (code === "ALREADY_IN_ORG") {
      setAcceptError("You already belong to an organization.");
    } else if (code === "INVITE_EXPIRED") {
      setAcceptError("This invitation has expired. Ask your organization owner to send a new invite.");
    } else {
      setAcceptError("Could not accept the invitation. Please try again.");
    }
    setAccepting(false);
  }

  if (loading || isPending) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#888" }}>Loading…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main style={pageStyle}>
        <div style={cardStyle}>
          <p style={{ color: "#c00", margin: 0 }}>{loadError}</p>
        </div>
      </main>
    );
  }

  if (!invite) return null;

  const isSignedIn = !!session?.user;

  return (
    <main style={pageStyle}>
      <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>You're invited!</h1>
      <p style={{ color: "#666", margin: 0 }}>
        You've been invited to join <strong>{invite.orgName}</strong> as a{" "}
        <strong style={{ textTransform: "capitalize" }}>{invite.role}</strong>.
      </p>

      <div style={cardStyle}>
        {!isSignedIn ? (
          <>
            <p style={{ margin: "0 0 1rem", color: "#444" }}>
              Sign in to accept this invitation. After signing in, return to this page to complete the process.
            </p>
            <a
              href={`/sign-in`}
              style={{ ...btnPrimary, display: "inline-block", textDecoration: "none" }}
            >
              Sign in →
            </a>
          </>
        ) : (
          <>
            <p style={{ margin: "0 0 0.5rem", color: "#444" }}>
              Signed in as <strong>{session.user.email}</strong>
            </p>
            {acceptError && (
              <p style={{ color: "#c00", margin: "0.75rem 0 0", fontSize: "0.875rem" }}>{acceptError}</p>
            )}
            <button
              onClick={handleAccept}
              disabled={accepting}
              style={accepting ? btnDisabled : btnPrimary}
            >
              {accepting ? "Accepting…" : `Join ${invite.orgName}`}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <main style={{ maxWidth: "32rem", margin: "6rem auto", padding: "2rem", fontFamily: "system-ui, sans-serif", textAlign: "center" }}>
          <p style={{ color: "#888" }}>Loading…</p>
        </main>
      }
    >
      <AcceptContent />
    </Suspense>
  );
}
