import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// In-memory cache for form configurations
interface CacheEntry {
  data: any;
  expiresAt: number;
}

const formCache: Record<string, CacheEntry> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * GET handler for retrieving form configuration
 * This endpoint serves the form configuration for embedded forms with caching
 */
export async function GET(req: NextRequest, { params }: { params: { formKey: string } }) {
  const formKey = params.formKey;

  try {
    // Check cache first
    const cachedForm = formCache[formKey];
    const now = Date.now();

    if (cachedForm && cachedForm.expiresAt > now) {
      return NextResponse.json(cachedForm.data, {
        headers: {
          "Cache-Control": "public, max-age=300", // 5 minutes browser caching
        },
      });
    }

    // Query the database if not in cache or expired
    const form = await prisma.subscriptionForm.findUnique({
      where: { formKey },
      select: {
        id: true,
        name: true,
        description: true,
        fields: true,
        settings: true,
        style: true,
        status: true,
      },
    });

    if (!form || form.status !== "active") {
      return NextResponse.json({ error: "Form not found or inactive" }, { status: 404 });
    }

    // Store in cache
    formCache[formKey] = {
      data: form,
      expiresAt: now + CACHE_TTL,
    };

    return NextResponse.json(form, {
      headers: {
        "Cache-Control": "public, max-age=300", // 5 minutes browser caching
      },
    });
  } catch (error) {
    console.error("Error fetching form configuration:", error);
    return NextResponse.json({ error: "Failed to load form configuration" }, { status: 500 });
  }
}

/**
 * Cache invalidation helper - can be called when forms are updated
 */
export function invalidateFormCache(formKey: string) {
  delete formCache[formKey];
}
