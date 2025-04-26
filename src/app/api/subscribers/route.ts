import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

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
    const search = searchParams.get("search");
    const segmentId = searchParams.get("segmentId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Prisma.SubscriberWhereInput = {
      userId: userId,
      ...(status ? { status } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(segmentId ? { segmentIds: { has: segmentId } } : {}),
    };

    // Add search condition
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        { firstName: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
        { lastName: { contains: search, mode: "insensitive" as Prisma.QueryMode } },
      ];
    }

    // Get total count for pagination
    const total = await prisma.subscriber.count({ where });

    // Get subscribers with pagination
    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      subscribers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
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
    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: {
        userId,
        email: data.email,
      },
    });

    if (existingSubscriber) {
      return NextResponse.json(
        { error: "Subscriber with this email already exists" },
        { status: 400 }
      );
    }

    const subscriber = await prisma.subscriber.create({
      data: {
        userId,
        email: data.email,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        status: data.status || "active",
        tags: data.tags || [],
        customFields: data.customFields || {},
        campaignIds: data.campaignIds || [],
        segmentIds: data.segmentIds || [],
      },
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error("Error creating subscriber:", error);
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}
