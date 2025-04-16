import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    const subscribers = await prisma.subscriber.findMany({
      where: {
        userId: userId,
        ...(status ? { status } : {}),
        ...(tag ? { tags: { has: tag } } : {}),
        ...(search
          ? {
              OR: [
                { email: { contains: search, mode: "insensitive" } },
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(subscribers);
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
        metadata: data.metadata || {},
        campaignIds: data.campaignIds || [],
      },
    });

    return NextResponse.json(subscriber);
  } catch (error) {
    console.error("Error creating subscriber:", error);
    return NextResponse.json({ error: "Failed to create subscriber" }, { status: 500 });
  }
}
