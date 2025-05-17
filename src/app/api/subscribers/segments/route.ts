import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// Get subscriber segments (count by different criteria)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search");

    // Build query conditions
    const where: Prisma.SegmentWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        { description: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
      ];
    }

    // Get all segments
    const segments = await prisma.segment.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return NextResponse.json({ error: "Failed to fetch segments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Segment name is required" }, { status: 400 });
    }

    if (!data.rules || !Array.isArray(data.rules)) {
      return NextResponse.json(
        { error: "Segment rules are required and must be an array" },
        { status: 400 }
      );
    }

    // Create the segment
    const segment = await prisma.segment.create({
      data: {
        userId,
        name: data.name,
        description: data.description || null,
        rules: data.rules,
        subscriberIds: [],
      },
    });

    // If subscribers were provided, update them to include this segment
    if (data.subscriberIds && data.subscriberIds.length > 0) {
      await Promise.all(
        data.subscriberIds.map(async (subscriberId: string) => {
          // Get the current subscriber
          const subscriber = await prisma.subscriber.findUnique({
            where: { id: subscriberId },
            select: { segmentIds: true },
          });

          if (subscriber) {
            // Update with the new segmentIds array
            const updatedSegmentIds = [...(subscriber.segmentIds || []), segment.id];

            return prisma.subscriber.update({
              where: { id: subscriberId },
              data: {
                segmentIds: {
                  set: updatedSegmentIds,
                },
              },
            });
          }
        })
      );
    }

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error creating segment:", error);
    return NextResponse.json({ error: "Failed to create segment" }, { status: 500 });
  }
}
