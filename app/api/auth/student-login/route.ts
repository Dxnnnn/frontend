import { NextResponse } from "next/server";
import type { UserRole } from "@/lib/types/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function POST(request: Request) {
  let body: { student_id?: string; password?: string };

  try {
    body = (await request.json()) as { student_id?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const student_id = body.student_id?.trim() ?? "";
  const password = body.password ?? "";

  if (!student_id || !password) {
    return NextResponse.json(
      { error: "Student ID and password are required." },
      { status: 400 },
    );
  }

  try {
    const backendRes = await fetch(`${BACKEND}/api/students/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id, password }),
    });

    const data = (await backendRes.json()) as {
      success?: boolean;
      message?: string;
      token?: string;
      user?: {
        id: number;
        username: string;
        full_name: string;
        email: string;
        student_level: string;
        grade: string | null;
        year_level: string | null;
        strand: string | null;
        course: string | null;
        role: string;
      };
    };

    if (!backendRes.ok || !data.user) {
      return NextResponse.json(
        { error: data.message ?? "Invalid Student ID or password." },
        { status: backendRes.status },
      );
    }

    const user = {
      id: String(data.user.id),
      username: data.user.username,
      name: data.user.full_name,
      role: (data.user.role ?? "user") as UserRole,
    };

    const response = NextResponse.json({ user });

    response.cookies.set("eval_session", JSON.stringify(user), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    // Store JWT for proxying to backend
    if (data.token) {
      response.cookies.set("eval_token", data.token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 8,
      });
    }

    // Non-httpOnly cookie for client-side access (student info display only)
    response.cookies.set("eval_user_info", JSON.stringify({
      id: user.id,
      username: user.username,
      name: user.name,
      student_level: data.user.student_level ?? null,
      grade: data.user.grade ?? null,
      strand: data.user.strand ?? null,
      year_level: data.user.year_level ?? null,
      course: data.user.course ?? null,
    }), {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to backend server. Make sure it is running on port 5000." },
      { status: 500 },
    );
  }
}
