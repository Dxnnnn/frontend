import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();

    // Forward all query params to the backend
    for (const [key, value] of searchParams.entries()) {
      params.set(key, value);
    }

    const url = `${BACKEND}/api/faculty/for-student${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Unable to connect to backend server." },
      { status: 500 }
    );
  }
}
