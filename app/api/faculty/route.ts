import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

// GET is public — students/school heads fetch faculty for the evaluation form
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get("semester");
    const department = searchParams.get("department");

    let backendUrl = `${BACKEND}/api/faculty`;
    const params = new URLSearchParams();
    if (semester) params.set("semester", semester);
    if (params.toString()) backendUrl += `?${params}`;

    // If department filter requested, use by-department endpoint
    if (department) {
      backendUrl = `${BACKEND}/api/faculty/by-department/${encodeURIComponent(department)}`;
      if (semester) backendUrl += `?semester=${encodeURIComponent(semester)}`;
    }

    const res = await fetch(backendUrl, { cache: "no-store" });
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
    const res = await fetch(`${BACKEND}/api/faculty`, {
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
