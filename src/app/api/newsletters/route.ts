import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to view newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get search params from the URL
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Build where conditions for prisma query
    const whereConditions: any = { userId };

    // Add search filter if provided
    if (search) {
      whereConditions.name = {
        contains: search,
        mode: "insensitive", // Case insensitive search
      };
    }

    // Add status filter if provided and not 'all'
    if (status && status !== "all") {
      whereConditions.status = status;
    }

    // Fetch newsletters with filters applied
    const newsletters = await prisma.newsletter.findMany({
      where: whereConditions,
      orderBy: {
        updatedAt: "desc", // Most recently updated first
      },
    });

    return NextResponse.json(newsletters);
  } catch (error) {
    console.error("Error fetching newsletters:", error);
    return NextResponse.json(
      { message: "Failed to fetch newsletters", error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to create newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await req.json();
    const { name, elements, subject, previewText, status } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { message: "Newsletter name is required" },
        { status: 400 }
      );
    }

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { message: "Newsletter elements are required and must be an array" },
        { status: 400 }
      );
    }

    // Create the newsletter in the database
    const newsletter = await prisma.newsletter.create({
      data: {
        name,
        elements: elements as any, // Store as JSON
        subject: subject || "",
        previewText: previewText || "",
        status: status || "draft", // Default to draft if not provided
        userId,
      },
    });

    console.log("Newsletter created:", newsletter);

    return NextResponse.json(newsletter, { status: 201 });
  } catch (error) {
    console.error("Error creating newsletter:", error);
    return NextResponse.json(
      { message: "Failed to create newsletter", error: String(error) },
      { status: 500 }
    );
  }
}
