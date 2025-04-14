"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Mail,
  MousePointer,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for analytics
const topPerformingCampaigns = [
  {
    id: 1,
    name: "Product Update",
    openRate: "32.1%",
    clickRate: "14.5%",
    trend: "up",
  },
  {
    id: 2,
    name: "Feature Announcement",
    openRate: "28.7%",
    clickRate: "9.6%",
    trend: "up",
  },
  {
    id: 3,
    name: "Weekly Newsletter #32",
    openRate: "26.4%",
    clickRate: "8.2%",
    trend: "down",
  },
];

const topSources = [
  { name: "Landing Page", count: 524, percentage: 38 },
  { name: "Social Media", count: 342, percentage: 25 },
  { name: "Referral", count: 285, percentage: 21 },
  { name: "Webinar", count: 142, percentage: 10 },
  { name: "Other", count: 82, percentage: 6 },
];

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, trend, icon }: MetricCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-primary/10 p-2">
          <div className="text-primary">{icon}</div>
        </div>
        <div
          className={`flex items-center text-sm ${
            trend === "up"
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          <span>{change}</span>
          {trend === "up" ? (
            <TrendingUp className="ml-1 h-4 w-4" />
          ) : (
            <TrendingDown className="ml-1 h-4 w-4" />
          )}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);

  // Simulate loading state for demonstration
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground">
              Track and analyze your newsletter performance
            </p>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        <div className="w-full max-w-md mb-6">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
              <div className="mt-3">
                <Skeleton className="h-4 w-24 rounded-md mb-2" />
                <Skeleton className="h-6 w-12 rounded-md" />
              </div>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-4" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-none"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded-md" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-5 rounded-md" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-4" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>

          <Card className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-32 rounded-md" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze your newsletter performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="overview" className="flex-1">
            Overview
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="subscribers" className="flex-1">
            Subscribers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Total Subscribers"
              value="1,370"
              change="+170"
              trend="up"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Average Open Rate"
              value="28.5%"
              change="+2.3%"
              trend="up"
              icon={<Mail className="h-4 w-4" />}
            />
            <MetricCard
              title="Average Click Rate"
              value="9.8%"
              change="+0.5%"
              trend="up"
              icon={<MousePointer className="h-4 w-4" />}
            />
            <MetricCard
              title="Unsubscribe Rate"
              value="0.8%"
              change="-0.2%"
              trend="down"
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Engagement Graph Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Engagement Over Time</h3>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Engagement chart visualization
                </p>
              </div>
            </Card>

            {/* Top Performing Campaigns */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Top Performing Campaigns
              </h3>
              <div className="space-y-4">
                {topPerformingCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between border-b pb-3 last:border-none"
                  >
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                        <span>Opens: {campaign.openRate}</span>
                        <span>Clicks: {campaign.clickRate}</span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center ${
                        campaign.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {campaign.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Growth and Sources */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subscriber Growth Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Subscriber Growth</h3>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20">
                <p className="text-muted-foreground">Subscriber growth chart</p>
              </div>
            </Card>

            {/* Top Sources */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">
                Top Subscriber Sources
              </h3>
              <div className="space-y-4">
                {topSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{source.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {source.count} subscribers ({source.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
              <p className="text-muted-foreground">
                Detailed campaign analytics coming soon
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscribers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Subscriber Metrics</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
              <p className="text-muted-foreground">
                Detailed subscriber analytics coming soon
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
