import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ department: string }> },
) {
  try {
    const { department } = await params;
    const encoded = encodeURIComponent(department);
    const res = await fetch(`${BACKEND}/api/faculty/by-department/${encoded}`, {
      cache: "no-store",
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
