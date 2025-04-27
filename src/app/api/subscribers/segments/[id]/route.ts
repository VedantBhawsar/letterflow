import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: segmentId } = await params;

    const segment = await prisma.segment.findUnique({
      where: {
        id: segmentId,
      },
      include: {
        subscribers: true,
      },
    });

    if (!segment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    if (segment.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(segment);
  } catch (error) {
    console.error("Error fetching segment:", error);
    return NextResponse.json({ error: "Failed to fetch segment" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: segmentId } = await params;
    const data = await req.json();

    // Check if segment exists and belongs to this user
    const existingSegment = await prisma.segment.findUnique({
      where: {
        id: segmentId,
      },
    });

    if (!existingSegment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    if (existingSegment.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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

    // Update the segment
    const updatedSegment = await prisma.segment.update({
      where: {
        id: segmentId,
      },
      data: {
        name: data.name,
        description: data.description || null,
        rules: data.rules,
      },
    });

    // Update subscriber relationships if provided
    if (data.subscriberIds && Array.isArray(data.subscriberIds)) {
      // Get current subscribers
      const currentSubscribers = await prisma.subscriber.findMany({
        where: {
          segmentIds: {
            has: segmentId,
          },
          userId,
        },
        select: {
          id: true,
        },
      });

      const currentSubscriberIds = currentSubscribers.map((s) => s.id);

      // Subscribers to add
      const subscribersToAdd = data.subscriberIds.filter(
        (id: string) => !currentSubscriberIds.includes(id)
      );

      // Subscribers to remove
      const subscribersToRemove = currentSubscriberIds.filter(
        (id) => !data.subscriberIds.includes(id)
      );

      // Add new subscribers to segment
      if (subscribersToAdd.length > 0) {
        await Promise.all(
          subscribersToAdd.map((id: string) =>
            prisma.subscriber.update({
              where: { id },
              data: {
                segmentIds: {
                  push: segmentId,
                },
              },
            })
          )
        );
      }

      // Remove subscribers from segment
      if (subscribersToRemove.length > 0) {
        await Promise.all(
          subscribersToRemove.map((id) =>
            prisma.subscriber.update({
              where: { id },
              data: {
                // @ts-expect-error - segmentIds is compatible with Subscriber
                segmentIds: {
                  set: prisma.subscriber
                    .findUnique({
                      where: { id },
                      select: { segmentIds: true },
                    })
                    .then((data) => data?.segmentIds.filter((sid) => sid !== segmentId) || []),
                },
              },
            })
          )
        );
      }
    }

    return NextResponse.json(updatedSegment);
  } catch (error) {
    console.error("Error updating segment:", error);
    return NextResponse.json({ error: "Failed to update segment" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: segmentId } = await params;

    // Check if segment exists and belongs to this user
    const existingSegment = await prisma.segment.findUnique({
      where: {
        id: segmentId,
      },
    });

    if (!existingSegment) {
      return NextResponse.json({ error: "Segment not found" }, { status: 404 });
    }

    if (existingSegment.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all subscribers in this segment
    const subscribers = await prisma.subscriber.findMany({
      where: {
        segmentIds: {
          has: segmentId,
        },
        userId,
      },
    });

    // Remove segment from all subscribers' segmentIds
    if (subscribers.length > 0) {
      await Promise.all(
        subscribers.map((subscriber) =>
          prisma.subscriber.update({
            where: { id: subscriber.id },
            data: {
              segmentIds: {
                set: subscriber.segmentIds.filter((id) => id !== segmentId),
              },
            },
          })
        )
      );
    }

    // Delete the segment
    await prisma.segment.delete({
      where: {
        id: segmentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting segment:", error);
    return NextResponse.json({ error: "Failed to delete segment" }, { status: 500 });
  }
}
