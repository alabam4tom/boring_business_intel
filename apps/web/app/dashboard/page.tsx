"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "../../lib/auth-client";

const pageStyle: React.CSSProperties = {
  maxWidth: "48rem",
  margin: "4rem auto",
  padding: "2rem",
  fontFamily: "system-ui, sans-serif",
};

type Org = { id: string; name: string; agencySize: string; region: string; serviceType: string; role: string };

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [org, setOrg] = useState<Org | null>(null);
  const [orgLoading, setOrgLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    fetch(`${apiUrl}/api/v1/organizations/mine`, { credentials: "include" })
      .then((res) => {
        if (res.status === 404) {
          router.replace("/onboarding");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrg(data.data);
      })
      .finally(() => setOrgLoading(false));
  }, [session, isPending, router]);

  if (isPending || orgLoading) {
    return <main style={pageStyle}><p style={{ color: "#888" }}>Loading…</p></main>;
  }

  if (!org) return null;

  return (
    <main style={pageStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>{org.name}</h1>
          <p style={{ color: "#666", margin: "0.25rem 0 0" }}>{session?.user?.email}</p>
        </div>
        <button
          onClick={() => authClient.signOut().then(() => router.push("/sign-in"))}
          style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", borderRadius: "0.375rem", background: "none", cursor: "pointer" }}
        >
          Sign out
        </button>
      </div>

      <p style={{ color: "#888" }}>Dashboard coming soon.</p>
    </main>
  );
}
