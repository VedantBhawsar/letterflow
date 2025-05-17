import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma, Newsletter, NewsletterStatus } from "@prisma/client"; // Import Prisma types

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

    console.log("status", status);

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
      whereConditions.status =
        status === "draft" ? NewsletterStatus.DRAFT : NewsletterStatus.PUBLISHED;
    }

    const newsletters: Newsletter[] = await prisma.newsletter.findMany({
      where: whereConditions, // Ensure whereConditions is correct type
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
// Let's assume your Prisma generated type for the status enum is `NewsletterStatus`
// If it's just a string field, you'd manually define allowed statuses.
const ALLOWED_NEWSLETTER_STATUSES = Object.values(NewsletterStatus || {}); // Fallback if enum not found

interface CreateNewsletterInput {
  name?: string | null;
  elements?: unknown[] | null; // Stays as unknown[] for initial parsing flexibility
  subject?: string | null;
  previewText?: string | null;
  status?: NewsletterStatus | string | null; // Allow string for input, then validate against enum
}

// --- POST Handler ---
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to create newsletters." },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    let body: CreateNewsletterInput;
    try {
      body = (await req.json()) as CreateNewsletterInput;
    } catch (parseError) {
      console.error("Error parsing POST request body:", parseError);
      return NextResponse.json(
        { message: "Invalid request body: Malformed JSON." },
        { status: 400 }
      );
    }

    // --- Input Validation ---
    if (!body.name || typeof body.name !== "string" || body.name.trim() === "") {
      return NextResponse.json(
        { message: "Newsletter name is required and cannot be empty." },
        { status: 400 }
      );
    }
    const name = body.name.trim();

    if (!body.elements || !Array.isArray(body.elements)) {
      // Allow empty array for elements, but it must be an array
      return NextResponse.json(
        { message: "Newsletter elements are required and must be an array (can be empty)." },
        { status: 400 }
      );
    }
    // Further validation of individual elements inside the array could be done here if necessary
    // For Prisma JSON, ensuring it's an array is the main structural validation needed at this stage.
    const elements = body.elements;

    const subject = typeof body.subject === "string" ? body.subject.trim() : null;
    const previewText = typeof body.previewText === "string" ? body.previewText.trim() : null;

    let status: NewsletterStatus = NewsletterStatus.DRAFT; // Default to DRAFT
    if (body.status && typeof body.status === "string") {
      const upperStatus = body.status.toUpperCase() as NewsletterStatus; // Attempt to cast
      if (ALLOWED_NEWSLETTER_STATUSES.includes(upperStatus)) {
        status = upperStatus;
      } else {
        return NextResponse.json(
          {
            message: `Invalid status: '${body.status}'. Allowed statuses are: ${ALLOWED_NEWSLETTER_STATUSES.join(", ")}.`,
          },
          { status: 400 }
        );
      }
    }

    // Create the newsletter with type safety
    const newsletter: Newsletter = await prisma.newsletter.create({
      data: {
        name,
        elements: elements as Prisma.JsonArray, // Cast to Prisma.JsonArray after Array.isArray check
        subject,
        previewText,
        status, // Now this is type-safe if using Prisma enum
        userId,
        // organizationId: session.user.organizationId, // If you have org-level data
      },
    });

    console.log(`Newsletter created: ${newsletter.id} by user ${userId}`);
    return NextResponse.json(newsletter, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating newsletter:", error);
    let errorMessage = "An unexpected error occurred while creating the newsletter.";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error(`Prisma Error ${error.code}: ${error.message}`, error || "");
      switch (error.code) {
        case "P2002":
          // P2002 is unique constraint violation.
          // Check error.meta.target to see which fields caused it.
          // For example, if it's on a unique index like (name, userId)
          const target = (error as { target?: string[] })?.target?.join(", ");
          errorMessage = `A newsletter with similar details (${target || "name"}) already exists. Please use a different name.`;
          statusCode = 409; // Conflict
          break;
        // Add other specific Prisma error codes as needed
        // e.g., P2003 (foreign key constraint failed)
        // e.g., P2025 (record to update/delete does not exist) - though not for create
        default:
          errorMessage = "A database error occurred. Please try again.";
          // Keep statusCode 500 or adjust if certain Prisma errors imply client issues
          break;
      }
    } else if (error instanceof Error) {
      // Generic JavaScript error
      errorMessage = error.message;
      // Potentially inspect error.name for specific JS errors if needed
    }

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}
