import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * GET /api/semesters/all
 * Public — no admin auth needed.
 * Returns ALL semesters including individual quarters (Q1, Q2, Q3, Q4).
 * Used by the school head evaluate page so they can pick any quarter.
 */
export async function GET() {
  try {
    const res = await fetch(`${BACKEND}/api/semesters/all-public`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend server." }, { status: 500 });
  }
}
