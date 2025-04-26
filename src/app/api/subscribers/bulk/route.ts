import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Bulk import subscribers
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { subscribers } = await req.json();

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return NextResponse.json({ error: "Invalid subscribers data" }, { status: 400 });
    }

    // Process subscribers in batches to avoid overloading the database
    const batchSize = 100;
    const results = {
      imported: 0,
      skipped: 0,
      failed: 0,
    };

    // Process in batches
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      const batchPromises = batch.map(async (sub) => {
        if (!sub.email) {
          results.skipped++;
          return { status: "skipped", reason: "Missing email" };
        }

        try {
          // Check if subscriber already exists
          const existingSubscriber = await prisma.subscriber.findFirst({
            where: {
              userId,
              email: sub.email,
            },
          });

          if (existingSubscriber) {
            results.skipped++;
            return { status: "skipped", reason: "Email already exists" };
          }

          // Create new subscriber
          await prisma.subscriber.create({
            data: {
              userId,
              email: sub.email,
              firstName: sub.firstName || null,
              lastName: sub.lastName || null,
              status: sub.status || "active",
              tags: sub.tags || [],
              metadata: sub.metadata || {},
            },
          });

          results.imported++;
          return { status: "success" };
        } catch (error) {
          results.failed++;
          return { status: "failed", reason: "Database error" };
        }
      });

      await Promise.all(batchPromises);
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing subscribers:", error);
    return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 });
  }
}

// Export all subscribers
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const tag = searchParams.get("tag");

    const subscribers = await prisma.subscriber.findMany({
      where: {
        userId: userId,
        ...(status ? { status } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    return NextResponse.json({ error: "Failed to export subscribers" }, { status: 500 });
  }
}
