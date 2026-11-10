import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * PATCH /api/subjects/assign-teacher-by-name
 * Assigns a faculty member to ALL subject rows matching a given name.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/subjects/assign-teacher-by-name`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend." }, { status: 500 });
  }
}
