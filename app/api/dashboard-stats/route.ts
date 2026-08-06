import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const headers = await getAuthHeaders();
    const studentsRes = await fetch(`${BACKEND}/api/students`, { cache: "no-store", headers });
    const studentsData = await studentsRes.json() as { success?: boolean; students?: unknown[] };
    const totalStudents = studentsData.students?.length ?? 0;

    return NextResponse.json({ success: true, totalStudents });
  } catch {
    return NextResponse.json({ success: false, totalStudents: 0 }, { status: 500 });
  }
}
