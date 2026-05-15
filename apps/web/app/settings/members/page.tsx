"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../../lib/auth-client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const pageStyle: React.CSSProperties = {
  maxWidth: "48rem",
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
  padding: "0.625rem 1.25rem",
  border: "none",
  borderRadius: "0.375rem",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "0.9375rem",
  cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  padding: "0.375rem 0.75rem",
  border: "1px solid #fca5a5",
  borderRadius: "0.375rem",
  backgroundColor: "#fff",
  color: "#dc2626",
  fontSize: "0.8125rem",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  padding: "0.625rem 0.875rem",
  border: "1px solid #e5e5e5",
  borderRadius: "0.375rem",
  fontSize: "0.9375rem",
  width: "18rem",
  marginRight: "0.75rem",
};

const selectStyle: React.CSSProperties = {
  padding: "0.375rem 0.5rem",
  border: "1px solid #e5e5e5",
  borderRadius: "0.375rem",
  fontSize: "0.875rem",
  cursor: "pointer",
};

type Member = {
  id: string;
  userId: string;
  role: "owner" | "admin" | "viewer";
  joinedAt: string;
  name: string;
  email: string;
};

function roleBadge(role: string) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    owner: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    admin: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    viewer: { bg: "#fafafa", color: "#555", border: "#e5e5e5" },
  };
  const style = colors[role] ?? { bg: "#fafafa", color: "#555", border: "#e5e5e5" };
  return (
    <span style={{
      padding: "0.2rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
      textTransform: "capitalize",
    }}>
      {role}
    </span>
  );
}

export default function MembersPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [myMembership, setMyMembership] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inviteMessage, setInviteMessage] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }
    fetch(`${API}/api/v1/members`, { credentials: "include" })
      .then((r) => r.json())
      .then((body) => {
        if (body?.data) {
          const list = body.data as Member[];
          setMembers(list);
          const mine = list.find((m) => m.userId === session.user.id) ?? null;
          setMyMembership(mine);
        }
      })
      .finally(() => setLoading(false));
  }, [session, isPending, router]);

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setInviteStatus("loading");
    setInviteMessage("");

    const res = await fetch(`${API}/api/v1/members/invite`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });

    if (res.ok) {
      setInviteStatus("success");
      setInviteMessage(`Invitation sent to ${inviteEmail}.`);
      setInviteEmail("");
    } else {
      const body = await res.json().catch(() => null);
      const msg = body?.error?.message ?? "Could not send invitation.";
      setInviteStatus("error");
      setInviteMessage(msg);
    }
  }

  async function handleRoleChange(memberId: string, newRole: "admin" | "viewer") {
    setActionError(null);
    const res = await fetch(`${API}/api/v1/members/${memberId}/role`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((m) => m.id === memberId ? { ...m, role: newRole } : m));
    } else {
      const body = await res.json().catch(() => null);
      setActionError(body?.error?.message ?? "Could not update role.");
    }
  }

  async function handleRemove(memberId: string) {
    setActionError(null);
    const res = await fetch(`${API}/api/v1/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } else {
      const body = await res.json().catch(() => null);
      setActionError(body?.error?.message ?? "Could not remove member.");
    }
  }

  if (isPending || loading) {
    return (
      <main style={pageStyle}>
        <p style={{ color: "#888" }}>Loading…</p>
      </main>
    );
  }

  const myRole = myMembership?.role ?? "viewer";
  const canInvite = myRole === "owner" || myRole === "admin";
  const canManage = myRole === "owner";

  return (
    <main style={pageStyle}>
      <div style={{ marginBottom: "1.5rem" }}>
        <a href="/dashboard" style={{ color: "#666", fontSize: "0.875rem", textDecoration: "none" }}>
          ← Back to dashboard
        </a>
      </div>

      <h1 style={{ fontSize: "1.5rem", margin: "0 0 0.5rem" }}>Team members</h1>
      <p style={{ color: "#666", margin: 0, fontSize: "0.9375rem" }}>
        Manage who has access to your organization's benchmarks.
      </p>

      {canInvite && (
        <div style={cardStyle}>
          <p style={{ margin: "0 0 1rem", fontWeight: 600 }}>Invite a member</p>
          <form onSubmit={handleInvite} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <input
              type="email"
              required
              placeholder="colleague@agency.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={inputStyle}
              disabled={inviteStatus === "loading"}
            />
            <button type="submit" style={btnPrimary} disabled={inviteStatus === "loading"}>
              {inviteStatus === "loading" ? "Sending…" : "Send invite"}
            </button>
          </form>
          {inviteMessage && (
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.875rem", color: inviteStatus === "error" ? "#c00" : "#15803d" }}>
              {inviteMessage}
            </p>
          )}
        </div>
      )}

      {actionError && (
        <p style={{ marginTop: "1rem", fontSize: "0.875rem", color: "#c00" }}>{actionError}</p>
      )}

      <div style={cardStyle}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e5e5e5" }}>
              <th style={{ textAlign: "left", padding: "0.5rem 0", fontSize: "0.8125rem", color: "#888", fontWeight: 500 }}>Name</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0", fontSize: "0.8125rem", color: "#888", fontWeight: 500 }}>Email</th>
              <th style={{ textAlign: "left", padding: "0.5rem 0", fontSize: "0.8125rem", color: "#888", fontWeight: 500 }}>Role</th>
              {canManage && <th style={{ textAlign: "right", padding: "0.5rem 0", fontSize: "0.8125rem", color: "#888", fontWeight: 500 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isMe = member.userId === session?.user?.id;
              const isOwner = member.role === "owner";
              return (
                <tr key={member.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "0.875rem 0", fontSize: "0.9375rem" }}>
                    {member.name}
                    {isMe && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "#888" }}>(you)</span>}
                  </td>
                  <td style={{ padding: "0.875rem 0", fontSize: "0.875rem", color: "#555" }}>{member.email}</td>
                  <td style={{ padding: "0.875rem 0" }}>
                    {canManage && !isMe && !isOwner ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as "admin" | "viewer")}
                        style={selectStyle}
                      >
                        <option value="admin">Admin</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      roleBadge(member.role)
                    )}
                  </td>
                  {canManage && (
                    <td style={{ padding: "0.875rem 0", textAlign: "right" }}>
                      {!isMe && !isOwner && (
                        <button
                          onClick={() => handleRemove(member.id)}
                          style={btnDanger}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
