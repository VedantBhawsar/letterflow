import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client"; // Import Prisma namespace

// --- Define the specific type for the cached form data ---
// This type mirrors the 'select' statement in the Prisma query
type CachedFormData = Prisma.SubscriptionFormGetPayload<{
  select: {
    id: true;
    name: true;
    description: true;
    fields: true; // Assuming 'fields' is typed as Json in your Prisma schema
    settings: true; // Assuming 'settings' is typed as Json
    style: true; // Assuming 'style' is typed as Json
    status: true; // Assuming 'status' is a String or specific Enum type
  };
}>;

// --- Define the Cache Entry interface with the specific data type ---
interface CacheEntry {
  data: CachedFormData; // Use the specific type instead of any
  expiresAt: number;
}

// In-memory cache using the specific CacheEntry type
const formCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper type guard for Prisma errors (optional but recommended)
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

/**
 * GET handler for retrieving form configuration
 * This endpoint serves the form configuration for embedded forms with caching
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { formKey: string } } // Standard App Router context type
) {
  const formKey = params.formKey;

  // Basic validation for formKey if needed
  if (!formKey || typeof formKey !== "string") {
    return NextResponse.json({ error: "Invalid form key provided" }, { status: 400 });
  }

  try {
    // Check cache first
    const cachedEntry = formCache[formKey]; // Rename variable for clarity
    const now = Date.now();

    if (cachedEntry && cachedEntry.expiresAt > now) {
      console.log(`Cache hit for formKey: ${formKey}`);
      // Type safety: cachedEntry.data is already CachedFormData
      return NextResponse.json(cachedEntry.data, {
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes browser caching
          "X-Cache-Status": "HIT", // Optional: Custom header for debugging cache status
        },
      });
    }
    console.log(`Cache miss or expired for formKey: ${formKey}`);

    // Query the database if not in cache or expired
    // Prisma infers the return type based on 'select', matching CachedFormData | null
    const form = await prisma.subscriptionForm.findUnique({
      where: { formKey },
      select: {
        // This structure must match the select in CachedFormData definition
        id: true,
        name: true,
        description: true,
        fields: true,
        settings: true,
        style: true,
        status: true,
      },
    });

    // Check if form exists and is active
    if (!form || form.status !== "active") {
      return NextResponse.json(
        { error: "Form not found or is currently inactive" },
        { status: 404 }
      );
    }

    // Store in cache - TypeScript knows 'form' is not null here and matches CachedFormData
    formCache[formKey] = {
      data: form, // Assign the correctly typed 'form'
      expiresAt: now + CACHE_TTL,
    };
    console.log(`Cached form data for formKey: ${formKey}`);

    // Clean up old cache entries periodically (simple example)
    // In a real app, use a more robust cache eviction strategy or a dedicated cache store (like Redis)
    cleanupExpiredCacheEntries();

    // Return the fetched form data
    return NextResponse.json(form, {
      headers: {
        "Cache-Control": "public, max-age=300",
        "X-Cache-Status": "MISS", // Optional: Custom header
      },
    });
  } catch (error: unknown) {
    // Catch as unknown
    console.error(`Error fetching form configuration for key ${formKey}:`, error);
    let errorMessage = "Failed to load form configuration";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      console.error(`Prisma Error (${error.code}): ${error.message}`);
      errorMessage = "Database error occurred while loading form configuration.";
      // Handle specific Prisma errors if needed (e.g., P2021 Table does not exist)
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

/**
 * Cache invalidation helper - called when forms are updated/deleted
 */
export function invalidateFormCache(formKey: string) {
  if (formKey && typeof formKey === "string") {
    if (formCache[formKey]) {
      delete formCache[formKey];
      console.log(`Invalidated cache for formKey: ${formKey}`);
      return true; // Indicate success
    }
    console.log(`Cache entry not found for invalidation: ${formKey}`);
    return false; // Indicate entry wasn't found
  }
  console.warn("Attempted to invalidate cache with invalid formKey:", formKey);
  return false; // Indicate failure due to invalid key
}

/**
 * Simple helper to clean up expired cache entries.
 * NOTE: This is basic; consider more robust strategies for production.
 */
function cleanupExpiredCacheEntries() {
  const now = Date.now();
  let cleanedCount = 0;
  for (const key in formCache) {
    if (formCache[key]?.expiresAt <= now) {
      delete formCache[key];
      cleanedCount++;
    }
  }
  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired cache entries.`);
  }
}
