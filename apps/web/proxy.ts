import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up",
  "/api/auth",
  "/about",
  "/privacy",
  "/terms",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  try {
    const res = await fetch(`${apiUrl}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });
    const session = await res.json();

    if (!session?.user) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
