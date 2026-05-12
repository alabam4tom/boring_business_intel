import { AppError } from "@repo/shared/errors";

const CODAT_BASE = "https://api.codat.io";

export type CodatPnlLineItem = {
  accountId: string;
  name: string;
  value: number;
};

export type CodatPnlSection = {
  name: string;
  value: number;
  items: CodatPnlLineItem[];
};

export type CodatPnlReport = {
  fromDate: string;
  toDate: string;
  income: CodatPnlSection;
  costOfSales: CodatPnlSection;
  grossProfit: number;
  expenses: CodatPnlSection;
  netProfit: number;
};

export type CodatPnlResponse = {
  currency: string;
  reports: CodatPnlReport[];
};
export const QBO_PLATFORM_KEY = "qhyg";
export const XERO_PLATFORM_KEY = "gror";

function codatHeaders(): Record<string, string> {
  const apiKey = process.env.CODAT_API_KEY;
  if (!apiKey) throw new AppError("CODAT_NOT_CONFIGURED", "Codat API key not configured", 503);
  const encoded = Buffer.from(`${apiKey}:`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export async function createCodatCompany(name: string): Promise<string> {
  const res = await fetch(`${CODAT_BASE}/companies`, {
    method: "POST",
    headers: codatHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AppError("CODAT_ERROR", `Failed to create Codat company: ${res.status}`, 502, { detail: body });
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function createCodatConnection(
  codatCompanyId: string,
  platformKey: string = QBO_PLATFORM_KEY
): Promise<{ connectionId: string; linkUrl: string }> {
  const res = await fetch(`${CODAT_BASE}/companies/${codatCompanyId}/connections`, {
    method: "POST",
    headers: codatHeaders(),
    body: JSON.stringify({ platformKey }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new AppError("CODAT_ERROR", `Failed to create Codat connection: ${res.status}`, 502, { detail: body });
  }
  const data = (await res.json()) as { id: string; linkUrl: string };
  return { connectionId: data.id, linkUrl: data.linkUrl };
}

export async function fetchCodatPnl(codatCompanyId: string): Promise<CodatPnlResponse> {
  const url = `${CODAT_BASE}/companies/${codatCompanyId}/data/financials/profitAndLoss?periodLength=1&periodsToCompare=24`;
  const res = await fetch(url, { headers: codatHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new AppError("CODAT_ERROR", `Failed to fetch P&L: ${res.status}`, 502, { detail: body });
  }
  return res.json() as Promise<CodatPnlResponse>;
}

export type CodatConnectionStatus = "Linked" | "Deauthorized" | "PendingAuth" | "Unlinked";

export async function getConnectionStatus(
  codatCompanyId: string,
  codatConnectionId: string
): Promise<CodatConnectionStatus> {
  const url = `${CODAT_BASE}/companies/${codatCompanyId}/connections/${codatConnectionId}`;
  const res = await fetch(url, { headers: codatHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new AppError("CODAT_ERROR", `Failed to get connection status: ${res.status}`, 502, { detail: body });
  }
  const data = (await res.json()) as { status: CodatConnectionStatus };
  return data.status;
}

export async function deleteCodatConnection(
  codatCompanyId: string,
  codatConnectionId: string
): Promise<void> {
  const res = await fetch(`${CODAT_BASE}/companies/${codatCompanyId}/connections/${codatConnectionId}`, {
    method: "DELETE",
    headers: codatHeaders(),
  });
  if (!res.ok && res.status !== 404) {
    throw new AppError("CODAT_ERROR", `Failed to delete Codat connection: ${res.status}`, 502);
  }
}
