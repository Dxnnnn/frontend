import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };

  // Clear session cookie
  response.cookies.set("eval_session", "", cookieOpts);

  // Clear JWT token cookie
  response.cookies.set("eval_token", "", cookieOpts);

  // Clear client-visible user info cookie
  response.cookies.set("eval_user_info", "", {
    ...cookieOpts,
    httpOnly: false,
  });

  return response;
}
