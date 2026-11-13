import { NextResponse } from "next/server";

export async function GET() {
  const backendUrl = process.env.BACKEND_URL ?? "NOT SET";
  // Test if the backend is reachable
  let backendStatus = "untested";
  try {
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test", password: "test" }),
      signal: AbortSignal.timeout(5000),
    });
    backendStatus = `reachable — HTTP ${res.status}`;
  } catch (err) {
    backendStatus = `unreachable — ${err instanceof Error ? err.message : String(err)}`;
  }

  return NextResponse.json({
    BACKEND_URL: backendUrl,
    backendStatus,
    NODE_ENV: process.env.NODE_ENV,
  });
}
