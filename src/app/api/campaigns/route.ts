import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client"; // Import Prisma type utilities

// Define the type for Campaign including its stats, using Prisma's utility
type CampaignWithStats = Prisma.CampaignGetPayload<{
  include: { stats: true };
}>;

// Type for the values we expect to compare from CampaignWithStats fields
type ComparableValue = string | number | Date | boolean | null | undefined;

// Helper function for robust comparison - using unknown for type safety
// Or more specific union type 'ComparableValue'
function compareValues(a: ComparableValue, b: ComparableValue): number {
  // Handle nulls/undefined consistently (e.g., nulls/undefined last)
  if (a == null && b == null) return 0;
  if (a == null) return 1; // a is null/undefined, b is not -> a comes after b
  if (b == null) return -1; // b is null/undefined, a is not -> b comes after a

  // Handle dates
  if (a instanceof Date && b instanceof Date) {
    const timeA = a.getTime();
    const timeB = b.getTime();
    return timeA - timeB; // Simpler: timeA > timeB ? 1 : timeA < timeB ? -1 : 0;
  }

  // Handle numbers
  if (typeof a === "number" && typeof b === "number") {
    return a - b; // Standard number comparison
  }

  // Handle strings (case-insensitive comparison)
  if (typeof a === "string" && typeof b === "string") {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  }

  // Handle booleans (e.g., true > false)
  if (typeof a === "boolean" && typeof b === "boolean") {
    return a === b ? 0 : a ? 1 : -1; // true comes after false
  }

  // Fallback for potentially unhandled types or mismatched types if logic reaches here
  // This part is less likely with strongly typed inputs but acts as a safeguard.
  console.warn(
    `compareValues encountered potentially unhandled types: typeof a = ${typeof a}, typeof b = ${typeof b}`
  );
  try {
    // Attempt a generic comparison, but this is unreliable for mixed types
    if (String(a) > String(b)) return 1;
    if (String(a) < String(b)) return -1;
    return 0;
  } catch {
    console.error("Failed to compare values generically.");
    return 0; // Cannot compare
  }
}

// Helper type guard to check for Prisma errors with a 'code' property
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const rawSortKey = searchParams.get("sortKey");
  const rawSortDirection = searchParams.get("sortDirection");

  // Define allowed sortable keys (must be direct properties of Campaign for Prisma orderBy)
  // If sorting by stats fields is needed, the approach needs modification (e.g., sorting in JS after fetch or using aggregate queries if possible)
  const allowedSortKeys: (keyof CampaignWithStats)[] = [
    "id",
    "name",
    "subject",
    "status",
    "createdAt",
    "updatedAt",
    "scheduledAt",
    "sentAt",
    "userId",
    // Note: You generally wouldn't sort directly by 'stats' object itself, but by its fields (e.g., 'stats.sent') which Prisma orderBy might not support directly here.
  ];
  const sortKey: keyof CampaignWithStats =
    rawSortKey && allowedSortKeys.includes(rawSortKey as keyof CampaignWithStats)
      ? (rawSortKey as keyof CampaignWithStats)
      : "createdAt";

  const sortDirection: "asc" | "desc" = rawSortDirection === "asc" ? "asc" : "desc";

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const whereClause: Prisma.CampaignWhereInput = {
      userId: userId,
      ...(status && { status: status }), // Only add status if it exists
      createdAt: {
        gte: fromDate ? new Date(fromDate) : undefined,
        lte: toDate ? new Date(toDate) : undefined,
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Prisma query with type safety inferred
    const campaigns: CampaignWithStats[] = await prisma.campaign.findMany({
      where: whereClause,
      include: {
        stats: true,
      },
      orderBy: {
        [sortKey]: sortDirection,
      },
    });

    // --- Optional JS Sorting (if Prisma can't handle a specific sort) ---
    // Example: Sorting by calculated conversion rate (requires fetching stats first)
    /*
    if (sortKey === 'calculatedConversionRate') { // Hypothetical sort key
       campaigns.sort((a, b) => {
         const rateA = (a.stats?.views ?? 0) > 0 ? (a.stats.submissions / a.stats.views) : 0;
         const rateB = (b.stats?.views ?? 0) > 0 ? (b.stats.submissions / b.stats.views) : 0;
         const comparisonResult = compareValues(rateA, rateB);
         return sortDirection === 'asc' ? comparisonResult : -comparisonResult;
       });
    }
    */

    return NextResponse.json(campaigns);
  } catch (error: unknown) {
    // Catch error as unknown for type safety
    console.error("Error fetching campaigns:", error);
    let errorMessage = "Failed to fetch campaigns";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error("Prisma Error:", error.code, error.message);
      errorMessage = "Database error occurred while fetching campaigns.";
      // Could potentially set different status codes based on Prisma error code
      if (error.code === "P2021") {
        // Table does not exist (example)
        errorMessage = "Required database table not found.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message; // Use general error message
      if (errorMessage.includes("authentication required")) {
        // Example check
        statusCode = 401;
        errorMessage = "Authentication failed.";
      }
    }
    // Log the raw error for deeper investigation if needed
    // console.error("Raw Error Object:", error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

// Define expected input structure more explicitly (subset of Campaign)
// Useful for validation or if using a library like Zod
interface CreateCampaignInput {
  name: string;
  subject: string;
  content?: string | null;
  status?: string | null; // Ideally use Prisma enum type if defined
  scheduledAt?: string | Date | null;
  audienceIds?: string[] | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // --- Type Safe Body Parsing (Example with type assertion, prefer Zod/validation) ---
    let inputData: CreateCampaignInput;
    try {
      inputData = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }

    // Basic validation (consider a library like Zod for complex validation)
    if (!inputData.name || typeof inputData.name !== "string" || inputData.name.trim() === "") {
      return NextResponse.json(
        { error: "Campaign name is required and cannot be empty" },
        { status: 400 }
      );
    }
    if (
      !inputData.subject ||
      typeof inputData.subject !== "string" ||
      inputData.subject.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Campaign subject is required and cannot be empty" },
        { status: 400 }
      );
    }
    if (inputData.audienceIds && !Array.isArray(inputData.audienceIds)) {
      return NextResponse.json(
        { error: "audienceIds must be an array of strings" },
        { status: 400 }
      );
    }
    // Validate status if your schema uses an enum
    // const allowedStatuses = ["draft", "scheduled", "sending", "sent", "archived"];
    // if (inputData.status && !allowedStatuses.includes(inputData.status)) {
    //    return NextResponse.json({ error: `Invalid status value. Allowed: ${allowedStatuses.join(', ')}` }, { status: 400 });
    // }

    let scheduledAtDate: Date | null = null;
    if (inputData.scheduledAt) {
      try {
        const parsedDate = new Date(inputData.scheduledAt);
        // Check if the parsed date is valid
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid date format");
        }
        scheduledAtDate = parsedDate;
      } catch (dateError) {
        console.warn("Invalid scheduledAt date format received:", inputData.scheduledAt);
        return NextResponse.json(
          {
            error:
              "Invalid format for scheduledAt date. Please use ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ssZ).",
          },
          { status: 400 }
        );
      }
    }

    // Use Prisma create, type safety is handled by Prisma Client based on your schema
    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: inputData.name.trim(), // Trim whitespace
        subject: inputData.subject.trim(),
        content: inputData.content ?? "",
        status: inputData.status ?? "draft", // Default status
        scheduledAt: scheduledAtDate,
        audienceIds: inputData.audienceIds ?? [],
      },
    });

    // Create corresponding CampaignStats entry
    await prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
        // Prisma will use defaults (like 0) for numerical fields here
      },
    });

    // Fetch the complete campaign with stats to return
    const newCampaignWithStats = await prisma.campaign.findUniqueOrThrow({
      // Use OrThrow for confidence
      where: { id: campaign.id },
      include: { stats: true },
    });

    return NextResponse.json(newCampaignWithStats, { status: 201 });
  } catch (error: unknown) {
    // Catch error as unknown
    console.error("Error creating campaign:", error);
    let errorMessage = "Failed to create campaign";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error("Prisma Error:", error.code, error.message);
      // Handle specific Prisma errors like unique constraints
      if (error.code === "P2002") {
        errorMessage =
          "A campaign with similar identifying information (e.g., name or key) might already exist.";
        statusCode = 409; // Conflict status code
      } else {
        errorMessage = "Database error occurred during campaign creation.";
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Could check for specific error messages if needed
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
