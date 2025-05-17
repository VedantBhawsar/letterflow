import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Mock database of existing usernames (for demonstration purposes)
const mockTakenUsernames = ["admin", "test", "user", "taken", "newsletter_admin", "letterflow"];

export async function GET(request: NextRequest) {
  try {
    // Get username from query parameters
    const url = new URL(request.url);
    const username = url.searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username parameter is required" }, { status: 400 });
    }

    let isUsernameTaken = false;

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: {
            equals: username,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      isUsernameTaken = !!existingUser;
    } catch (dbError) {
      console.warn("Database query failed, falling back to mock check:", dbError);

      // Fall back to mock check if database query fails
      isUsernameTaken =
        mockTakenUsernames.includes(username.toLowerCase()) ||
        username.toLowerCase().includes("taken");
    }

    // Add artificial delay to simulate network request if necessary
    if (process.env.NODE_ENV === "development") {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Return availability status
    return NextResponse.json({
      available: !isUsernameTaken,
      username,
    });
  } catch (error) {
    console.error("Error checking username availability:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
