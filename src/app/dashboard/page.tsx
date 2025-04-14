"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Mail,
  MousePointer,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AnalyticsResponse } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const response = await fetch("/api/analytics");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalytics(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchAnalytics();
    }
  }, [session]);

  // Define metrics based on real data
  const metrics = analytics
    ? [
        {
          title: "Total Subscribers",
          value: analytics.overview.totalSubscribers.toLocaleString(),
          change: `${
            analytics.overview.totalSubscribers > 0 ? "+" : ""
          }${Math.round(
            (analytics.overview.activeSubscribers /
              analytics.overview.totalSubscribers) *
              100
          )}%`,
          trend: "up",
          icon: <Users />,
        },
        {
          title: "Average Open Rate",
          value: `${analytics.overview.avgOpenRate.toFixed(1)}%`,
          change: "+3.2%", // This would need real historical data to calculate
          trend: "up",
          icon: <Mail />,
        },
        {
          title: "Click-through Rate",
          value: `${analytics.overview.avgClickRate.toFixed(1)}%`,
          change: "+1.2%", // This would need real historical data to calculate
          trend: "up",
          icon: <MousePointer />,
        },
        {
          title: "Campaigns",
          value: analytics.overview.campaignsCount.toString(),
          change: "", // This would need real historical data to calculate
          trend: "up",
          icon: <TrendingUp />,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-primary px-4 py-2 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "Guest"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analytics &&
          metrics.map((metric, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="rounded-md bg-primary/10 p-2">
                  <div className="text-primary">{metric.icon}</div>
                </div>
                {metric.change && (
                  <div
                    className={`flex items-center text-sm ${
                      metric.trend === "up"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    <span>{metric.change}</span>
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="ml-1 h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="ml-1 h-4 w-4" />
                    )}
                  </div>
                )}
              </div>
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <h2 className="text-2xl font-bold">{metric.value}</h2>
              </div>
            </Card>
          ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="text-lg font-medium">Recent Campaigns</h3>
          <div className="mt-4 space-y-2">
            {analytics && analytics.recentCampaigns.length > 0 ? (
              analytics.recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.sentAt
                        ? `Sent ${formatDistanceToNow(
                            new Date(campaign.sentAt),
                            { addSuffix: true }
                          )}`
                        : campaign.status === "scheduled"
                        ? `Scheduled for ${new Date(
                            campaign.scheduledAt!
                          ).toLocaleDateString()}`
                        : `Status: ${campaign.status}`}
                    </p>
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    {campaign.stats && campaign.stats.sent > 0
                      ? `${(
                          (campaign.stats.opened / campaign.stats.sent) *
                          100
                        ).toFixed(1)}% opened`
                      : "Not sent yet"}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No campaigns yet. Create your first campaign!
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium">Subscriber Growth</h3>
          <div className="mt-4 h-[200px] flex items-center justify-center border rounded-md bg-muted/20">
            {analytics && analytics.subscriberGrowth.length > 0 ? (
              <div className="w-full h-full p-2">
                {/* We would add a proper chart library here like Recharts */}
                <p className="text-center p-8">
                  Growth chart will be implemented with Recharts library
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No subscriber data available yet
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
