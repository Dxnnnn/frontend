import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

/**
 * GET /api/admins/me/permissions
 * Returns the current logged-in admin's own permissions from the DB (live, not from cookie).
 * Used by PermissionGate so permission changes take effect without re-login.
 */
export async function GET() {
  try {
    // Read the admin's own ID from the session cookie (server-side)
    const cookieStore = await cookies();
    const sessionRaw = cookieStore.get("eval_session")?.value;

    if (!sessionRaw) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const session = JSON.parse(sessionRaw) as { id?: string; adminRole?: string };

    // Super Admin has all permissions — return a full grant map
    if (session.adminRole === "Super Admin") {
      return NextResponse.json({ success: true, permissions: null, isSuperAdmin: true });
    }

    if (!session.id) {
      return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
    }

    // Fetch from backend using the stored JWT
    const headers = await getAuthHeaders();
    const res = await fetch(`${BACKEND}/api/admins/${session.id}/permissions`, {
      cache: "no-store",
      headers,
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to backend." }, { status: 500 });
  }
}
