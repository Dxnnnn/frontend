import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    if (searchParams.get("audience")) params.set("audience", searchParams.get("audience")!);
    if (searchParams.get("section")) params.set("section", searchParams.get("section")!);
    if (searchParams.get("active_only")) params.set("active_only", searchParams.get("active_only")!);

    const url = `${BACKEND}/api/survey-questions${params.toString() ? `?${params}` : ""}`;
    // GET questions is public — no auth header needed, but include if present
    const headers = await getAuthHeaders();
    const res = await fetch(url, { cache: "no-store", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend server." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/survey-questions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend server." }, { status: 500 });
  }
}
