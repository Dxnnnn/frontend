import { cookies } from "next/headers";

/**
 * Returns the Authorization header object for backend API calls.
 * Reads the JWT stored in the httpOnly `eval_token` cookie.
 * Use this in every Next.js API route that proxies to the Express backend.
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("eval_token")?.value;
  if (!token) return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}
