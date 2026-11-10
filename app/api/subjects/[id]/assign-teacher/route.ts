import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * PATCH /api/subjects/:id/assign-teacher
 * Assigns a faculty member to a subject (sets faculty_id + faculty_name).
 * Called by the school head Add Teacher modal after creating a faculty record.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/subjects/${id}/assign-teacher`, {
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
