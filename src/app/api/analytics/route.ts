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

    // Get total subscribers count
    const totalSubscribers = await prisma.subscriber.count({
      where: { userId },
    });

    // Get active subscribers count
    const activeSubscribers = await prisma.subscriber.count({
      where: {
        userId,
        status: "active",
      },
    });

    // Get campaigns statistics
    const campaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { stats: true },
    });

    // Calculate average open rate, click rate, etc.
    let totalOpens = 0;
    let totalClicks = 0;
    let totalSent = 0;

    campaigns.forEach((campaign) => {
      if (campaign.stats) {
        totalOpens += campaign.stats.opened;
        totalClicks += campaign.stats.clicked;
        totalSent += campaign.stats.sent;
      }
    });

    const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
    const avgClickRate = totalOpens > 0 ? (totalClicks / totalOpens) * 100 : 0;

    // Get recent campaigns
    const recentCampaigns = await prisma.campaign.findMany({
      where: { userId },
      include: { stats: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Get growth data (subscribers over time)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const subscriberGrowth = await prisma.subscriber.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      overview: {
        totalSubscribers,
        activeSubscribers,
        campaignsCount: campaigns.length,
        avgOpenRate,
        avgClickRate,
      },
      recentCampaigns,
      subscriberGrowth: subscriberGrowth.map((day) => ({
        date: day.createdAt,
        count: day._count.id,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
