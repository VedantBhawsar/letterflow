import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Newsletter } from "@prisma/client"; // Import Prisma types

// --- Helper Type Guard for Prisma Errors ---
function isPrismaErrorWithCode(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

// --- GET Handler ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // Explicitly check for user.id
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to view newsletters" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // --- Explicitly type whereConditions ---
    const whereConditions: Prisma.NewsletterWhereInput = {
      userId: userId, // Correctly type userId
    };

    if (search) {
      // Ensure name filter structure matches Prisma schema expectations
      whereConditions.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    if (status && status !== "all") {
      // Ensure status filter matches Prisma schema expectations (string or enum type)
      whereConditions.status = status;
    }

    const newsletters: Newsletter[] = await prisma.newsletter.findMany({
      where: whereConditions,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(newsletters);
  } catch (error: unknown) {
    // Catch as unknown
    console.error("Error fetching newsletters:", error);
    let errorMessage = "Failed to fetch newsletters";
    const statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error("Prisma Error:", error.code, error.message);
      errorMessage = "Database error occurred while fetching data.";
      // Adjust message/status based on specific codes if needed
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

// --- Define expected input structure for POST ---
interface CreateNewsletterInput {
  name?: string | null; // Use optional/null for better validation
  elements?: unknown[] | null; // Expect an array, will validate further
  subject?: string | null;
  previewText?: string | null;
  status?: string | null; // Use Prisma enum type if available
}

// --- POST Handler ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to create newsletters" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Safely parse request body
    let body: CreateNewsletterInput;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing POST request body:", parseError);
      return NextResponse.json({ message: "Invalid request body format" }, { status: 400 });
    }

    // --- Input Validation ---
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Newsletter name is required and cannot be empty" },
        { status: 400 }
      );
    }
    const name = body.name.trim(); // Use validated & trimmed name

    // Validate elements: must be an array (can be empty)
    if (!body.elements || !Array.isArray(body.elements)) {
      return NextResponse.json(
        { message: "Newsletter elements are required and must be an array (can be empty)" },
        { status: 400 }
      );
    }
    const elements = body.elements; // Use validated elements

    // Validate optional fields (provide defaults or null)
    const subject = typeof body.subject === "string" ? body.subject : null;
    const previewText = typeof body.previewText === "string" ? body.previewText : null;
    const status = typeof body.status === "string" ? body.status : "draft"; // Default to draft

    // Add validation for status if using Prisma enum, e.g.:
    // const allowedStatuses = Object.values(Prisma.NewsletterStatus); // If enum is NewsletterStatus
    // if (!allowedStatuses.includes(status)) {
    //   return NextResponse.json({ message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` }, { status: 400 });
    // }

    // Create the newsletter with type safety
    const newsletter: Newsletter = await prisma.newsletter.create({
      data: {
        name,
        // --- Correctly type elements for Prisma JSON field ---
        // Since 'elements' is validated as Array, cast to Prisma.JsonArray
        elements: elements as Prisma.JsonArray,
        subject,
        previewText,
        status,
        userId,
        // Prisma handles createdAt/updatedAt automatically
      },
    });

    console.log(`Newsletter created: ${newsletter.id}`);
    return NextResponse.json(newsletter, { status: 201 }); // Use 201 Created status
  } catch (error: unknown) {
    // Catch as unknown
    console.error("Error creating newsletter:", error);
    let errorMessage = "Failed to create newsletter";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error("Prisma Error:", error.code, error.message);
      // Handle specific Prisma errors, e.g., unique constraint violation
      if (error.code === "P2002") {
        // Assuming 'name' and 'userId' might form a unique constraint
        errorMessage = "A newsletter with this name might already exist.";
        statusCode = 409; // Conflict status code
      } else {
        errorMessage = "Database error occurred during creation.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
