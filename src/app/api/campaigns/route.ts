import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Campaign } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");
  const sortKey = searchParams.get("sortKey") || "createdAt";
  const sortDirection = searchParams.get("sortDirection") || "desc";

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let campaigns = await prisma.campaign.findMany({
      where: {
        userId: userId,
      },
      include: {
        stats: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Apply filters
    if (status) {
      campaigns = campaigns.filter((campaign) => campaign.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      campaigns = campaigns.filter(
        (campaign) =>
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.subject.toLowerCase().includes(searchLower)
      );
    }

    if (fromDate) {
      const fromDateTime = new Date(fromDate).getTime();
      campaigns = campaigns.filter((campaign) => {
        const campaignDate = new Date(campaign.createdAt).getTime();
        return campaignDate >= fromDateTime;
      });
    }

    if (toDate) {
      const toDateTime = new Date(toDate).getTime();
      campaigns = campaigns.filter((campaign) => {
        const campaignDate = new Date(campaign.createdAt).getTime();
        return campaignDate <= toDateTime;
      });
    }

    // Apply sorting
    campaigns.sort((a: any, b: any) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 });
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
    if (!data.name || !data.subject) {
      return NextResponse.json({ error: "Name and subject are required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.create({
      data: {
        userId,
        name: data.name,
        subject: data.subject,
        content: data.content || "",
        status: data.status || "draft",
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        audienceIds: data.audienceIds || [],
      },
    });

    // Create empty stats for this campaign
    await prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
  }
}

// Mock function - replace with actual database query
async function fetchCampaignsFromDatabase(): Promise<Campaign[]> {
  // This is just a mock implementation
  return [
    {
      id: "1",
      userId: "user1",
      name: "Welcome Email",
      subject: "Welcome to our platform!",
      content: "Welcome to our platform! We're excited to have you here.",
      status: "sent",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      sentAt: new Date("2024-01-02"),
      audienceIds: ["1", "2"],
      stats: {
        id: "1",
        campaignId: "1",
        sent: 100,
        delivered: 95,
        opened: 80,
        clicked: 40,
        bounced: 5,
        complaints: 0,
        unsubscribed: 2,
        createdAt: new Date("2024-01-02"),
        updatedAt: new Date("2024-01-02"),
      },
    },
    // Add more mock data as needed
  ];
}
