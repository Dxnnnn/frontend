import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/semesters/active`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend server." }, { status: 500 });
  }
}
