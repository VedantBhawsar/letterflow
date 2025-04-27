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
    const { id: subscriberId } = await params;

    const subscriber = await prisma.subscriber.findUnique({
      where: {
        id: subscriberId,
      },
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (subscriber.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error("Error fetching subscriber:", error);
    return NextResponse.json({ error: "Failed to fetch subscriber" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: subscriberId } = await params;
    const data = await req.json();

    // Check if subscriber exists and belongs to this user
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: {
        id: subscriberId,
      },
    });

    if (!existingSubscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (existingSubscriber.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Validate required fields
    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if the new email is already used by another subscriber
    if (data.email !== existingSubscriber.email) {
      const emailExists = await prisma.subscriber.findFirst({
        where: {
          userId,
          email: data.email,
          id: { not: subscriberId },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Another subscriber with this email already exists" },
          { status: 400 }
        );
      }
    }

    // Update the subscriber
    const updatedSubscriber = await prisma.subscriber.update({
      where: {
        id: subscriberId,
      },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        status: data.status,
        tags: data.tags || [],
        ...(data.status === "unsubscribed"
          ? { unsubscribedAt: new Date() }
          : data.status === "active"
            ? { unsubscribedAt: null }
            : {}),
      },
    });

    return NextResponse.json(updatedSubscriber);
  } catch (error) {
    console.error("Error updating subscriber:", error);
    return NextResponse.json({ error: "Failed to update subscriber" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: subscriberId } = await params;

    // Check if subscriber exists and belongs to this user
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: {
        id: subscriberId,
      },
    });

    if (!existingSubscriber) {
      return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
    }

    if (existingSubscriber.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the subscriber
    await prisma.subscriber.delete({
      where: {
        id: subscriberId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json({ error: "Failed to delete subscriber" }, { status: 500 });
  }
}
