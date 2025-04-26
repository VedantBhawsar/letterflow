// /app/api/analytics/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { startOfDay, subDays, format, eachDayOfInterval, endOfDay, parseISO } from "date-fns"; // Ensure date-fns is installed

const prisma = new PrismaClient();

// Structure for subscriber growth
interface SubscriberGrowthPoint {
  date: string;
  count: number;
}

// Structure for engagement over time
interface EngagementPoint {
  date: string; // e.g., "MMM dd"
  opens: number;
  clicks: number;
}

// --- Update the main AnalyticsData interface ---
interface AnalyticsData {
  totalSubscribers: number;
  avgOpenRate: number;
  avgClickRate: number;
  avgUnsubscribeRate: number;
  topPerformingCampaigns: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
  }[];
  topSources: {
    name: string;
    count: number;
  }[];
  subscriberGrowthData: SubscriberGrowthPoint[];
  engagementOverTimeData: EngagementPoint[]; // <--- Added this
}

// Helper to generate date range
function getDateRange(startDate: Date, endDate: Date): Date[] {
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Time Period (e.g., last 30 days)
    const endDate = endOfDay(new Date());
    const startDate = startOfDay(subDays(endDate, 29));

    // --- Fetch Data ---

    // Basic counts and stats (as before)
    const totalActiveSubscribers = await prisma.subscriber.count({
      where: { userId, status: "active" },
    });
    const totalSubscribersAllStatus = await prisma.subscriber.count({ where: { userId } });
    const unsubscribedCount = await prisma.subscriber.count({
      where: { userId, status: "unsubscribed" },
    });
    const campaignStatsList = await prisma.campaignStats.findMany({
      where: { campaign: { userId } }, // Basic filter by user
      select: {
        sent: true,
        opened: true,
        clicked: true,
        campaign: { select: { id: true, name: true, sentAt: true } }, // Select campaign's sentAt
      },
    });

    // Top Sources (as before)
    const sourcesData = await prisma.subscriber.groupBy({
      by: ["source"],
      where: { userId: userId, source: { not: null }, status: "active" },
      _count: { source: true },
      orderBy: { _count: { source: "desc" } },
      take: 5,
    });

    // Active Subscriber History for Growth Chart (as before)
    const activeSubscribersHistory = await prisma.subscriber.findMany({
      where: { userId: userId, createdAt: { lte: endDate }, status: "active" },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // --- Calculate Metrics & Prepare Data Structures ---

    // Avg Rates & Top Campaigns (as before)
    let totalSent = 0,
      totalOpened = 0,
      totalClicked = 0;
    campaignStatsList.forEach((stat) => {
      totalSent += stat.sent;
      totalOpened += stat.opened;
      totalClicked += stat.clicked;
    });
    const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const avgClickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const avgUnsubscribeRate =
      totalSubscribersAllStatus > 0 ? (unsubscribedCount / totalSubscribersAllStatus) * 100 : 0;
    const campaignsWithRates = campaignStatsList
      .map((stat) => ({
        id: stat.campaign.id,
        name: stat.campaign.name,
        openRate: stat.sent > 0 ? (stat.opened / stat.sent) * 100 : 0,
        clickRate: stat.sent > 0 ? (stat.clicked / stat.sent) * 100 : 0,
      }))
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 3);

    // Format Top Sources (as before)
    const topSources = sourcesData
      .filter((s) => s.source)
      .map((s) => ({ name: s.source ?? "Unknown", count: s._count.source }));

    // Calculate Subscriber Growth Data (as before)
    const dateRange = getDateRange(startDate, endDate);
    const growthData: SubscriberGrowthPoint[] = dateRange.map((date) => {
      const dayEnd = endOfDay(date);
      const count = activeSubscribersHistory.filter((sub) => sub.createdAt <= dayEnd).length;
      return { date: format(date, "MMM dd"), count: count };
    });

    // --- Calculate Engagement Over Time Data ---
    const dailyEngagement: { [key: string]: { opens: number; clicks: number } } = {};

    // 1. Aggregate stats by day based on campaign's sentAt date
    campaignStatsList.forEach((stat) => {
      // Ensure sentAt is valid and within our date range
      if (stat.campaign.sentAt) {
        try {
          const sentDate = startOfDay(parseISO(stat.campaign.sentAt.toISOString())); // Ensure it's a Date object and get start of day
          if (sentDate >= startDate && sentDate <= endDate) {
            const dateKey = format(sentDate, "yyyy-MM-dd"); // Use ISO-like format for reliable keys
            if (!dailyEngagement[dateKey]) {
              dailyEngagement[dateKey] = { opens: 0, clicks: 0 };
            }
            dailyEngagement[dateKey].opens += stat.opened;
            dailyEngagement[dateKey].clicks += stat.clicked;
          }
        } catch (e) {
          // Ignore if sentAt is invalid date
          console.warn(
            `Invalid sentAt date encountered for campaign ID ${stat.campaign.id}: ${stat.campaign.sentAt}`
          );
        }
      }
    });

    // 2. Create the final array, ensuring all days in the range are present
    const engagementOverTimeData: EngagementPoint[] = dateRange.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
      const engagement = dailyEngagement[dateKey] || { opens: 0, clicks: 0 }; // Get data or default to zero
      return {
        date: format(date, "MMM dd"), // User-friendly format for the chart label
        opens: engagement.opens,
        clicks: engagement.clicks,
      };
    });

    // --- Prepare Final Response ---
    const analyticsData: AnalyticsData = {
      totalSubscribers: totalActiveSubscribers,
      avgOpenRate,
      avgClickRate,
      avgUnsubscribeRate,
      topPerformingCampaigns: campaignsWithRates,
      topSources,
      subscriberGrowthData: growthData,
      engagementOverTimeData: engagementOverTimeData, // Include engagement data
    };

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics data";
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
