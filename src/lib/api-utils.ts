import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Gets the current user session and validates authentication
 * @returns Object containing session and userId, or error response if unauthorized
 */
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return {
    session,
    userId: session.user.id,
  };
}

/**
 * Middleware to require authentication for API routes
 * Returns the userId if authenticated, or an error response
 * 
 * @example
 * ```ts
 * export async function GET() {
 *   const authResult = await requireAuth();
 *   if (authResult.error) return authResult.error;
 *   const { userId } = authResult;
 *   // ... rest of your code
 * }
 * ```
 */
export async function requireAuth() {
  return getAuthenticatedUser();
}
