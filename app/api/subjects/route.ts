import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    if (searchParams.get("department")) params.set("department", searchParams.get("department")!);
    if (searchParams.get("course")) params.set("course", searchParams.get("course")!);
    if (searchParams.get("year_level")) params.set("year_level", searchParams.get("year_level")!);
    if (searchParams.get("grade")) params.set("grade", searchParams.get("grade")!);
    if (searchParams.get("strand")) params.set("strand", searchParams.get("strand")!);
    const url = `${BACKEND}/api/subjects${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/subjects`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend." }, { status: 500 });
  }
}
