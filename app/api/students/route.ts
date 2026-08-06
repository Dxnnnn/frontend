import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/students`, { cache: "no-store", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to connect to backend server." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/students`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to connect to backend server." },
      { status: 500 },
    );
  }
}
