import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    if (searchParams.get("faculty_id")) params.set("faculty_id", searchParams.get("faculty_id")!);
    if (searchParams.get("semester")) params.set("semester", searchParams.get("semester")!);
    if (searchParams.get("student_id")) params.set("student_id", searchParams.get("student_id")!);
    if (searchParams.get("source")) params.set("source", searchParams.get("source")!);

    const url = `${BACKEND}/api/evaluations${params.toString() ? `?${params}` : ""}`;
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
    const res = await fetch(`${BACKEND}/api/evaluations`, {
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
