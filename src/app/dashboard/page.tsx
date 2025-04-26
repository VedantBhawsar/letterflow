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
  List, // Icon for top campaigns
  // NOTE: If lucide-react exports a 'Line' icon and you need it elsewhere,
  // you might need to import it as 'LucideLine' for clarity.
  // Example: import { Line as LucideLine } from "lucide-react";
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line as RechartsLine, // <--- RENAMED IMPORT HERE
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button"; // Added Button import for error state

// --- Define AnalyticsData interface (matches API response) ---
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
  subscriberGrowthData: { date: string; count: number }[];
  engagementOverTimeData: {
    date: string;
    opens: number;
    clicks: number;
  }[];
}

// --- Metric Card Component ---
interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  change?: string; // Make change optional
}
function MetricCard({ title, value, trend, icon, change }: MetricCardProps) {
  const isPositiveMetric = !title.toLowerCase().includes("unsubscribe");
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="rounded-md bg-primary/10 p-2">
          <div className="text-primary">{icon}</div>
        </div>
        {change && (
          <div
            className={`flex items-center text-xs font-medium ${isPositiveMetric ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            <span>{change}</span>
            {trend === "up" ? (
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="ml-1 h-3.5 w-3.5" />
            )}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-0.5">{title}</p>
        <h2 className="text-2xl font-bold">{value}</h2>
      </div>
    </Card>
  );
}

// --- Tooltip for Subscriber Growth Chart ---
const SubscriberGrowthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Subscribers</span>
            <span className="font-bold" style={{ color: payload[0].stroke }}>
              {" "}
              {/* Use stroke color passed by Recharts */}
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme = "light" } = useTheme() ?? {}; // Default theme

  useEffect(() => {
    async function fetchAnalytics() {
      if (!session?.user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            `Failed to fetch analytics data: ${response.status} ${errorData.error || response.statusText}`
          );
        }
        const data: AnalyticsData = await response.json();
        setAnalyticsData(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err instanceof Error ? err.message : "Failed to load analytics data.");
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [session]);

  // --- Define metrics ---
  const metrics: MetricCardProps[] = analyticsData
    ? [
        {
          title: "Active Subscribers",
          value: analyticsData.totalSubscribers.toLocaleString(),
          change: "+5.1%",
          trend: "up",
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: "Average Open Rate",
          value: `${analyticsData.avgOpenRate.toFixed(1)}%`,
          change: "+3.2%",
          trend: "up",
          icon: <Mail className="h-4 w-4" />,
        },
        {
          title: "Average Click Rate",
          value: `${analyticsData.avgClickRate.toFixed(1)}%`,
          change: "+1.2%",
          trend: "up",
          icon: <MousePointer className="h-4 w-4" />,
        },
        {
          title: "Top Campaigns",
          value: analyticsData.topPerformingCampaigns.length.toString(),
          trend: "up",
          icon: <List className="h-4 w-4" />,
        }, // No change prop
      ]
    : []; // Empty if no data

  // --- Recharts Theming Colors ---
  const axisStrokeColor =
    theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))";
  const gridStrokeColor = theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))";
  const linePrimaryColor = theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))";

  // --- Loading State ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col space-y-2 mb-6">
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        {/* Metrics Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-14 rounded-md" />
              </div>
              <div>
                <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
                <Skeleton className="h-6 w-1/2 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
        {/* Lower Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          <Card className="p-4">
            <Skeleton className="h-6 w-40 rounded-md mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="space-y-1.5 w-3/4">
                    <Skeleton className="h-5 w-3/4 rounded-md" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-1/4 max-w-[80px] rounded-md" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <Skeleton className="h-6 w-40 rounded-md mb-4" />
            <Skeleton className="h-[200px] w-full rounded-md" />
          </Card>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // --- Data Display State ---
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || "User"}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {analyticsData && metrics.length > 0
          ? metrics.map((metric, index) => <MetricCard key={index} {...metric} />)
          : // Render placeholders if metrics array is empty after loading
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="p-4 opacity-50">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-4 w-14 rounded-md" />
                </div>
                <div>
                  <Skeleton className="h-4 w-3/4 rounded-md mb-2" />
                  <Skeleton className="h-6 w-1/2 rounded-md" />
                </div>
              </Card>
            ))}
      </div>

      {/* Lower Row: Campaigns & Growth */}
      <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
        {/* Top Performing Campaigns Card */}
        <Card className="p-4">
          <h3 className="text-lg font-medium ">Top Performing Campaigns</h3>
          <div className="mt-4 space-y-3">
            {analyticsData && analyticsData.topPerformingCampaigns.length > 0 ? (
              analyticsData.topPerformingCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between rounded-md border p-3 text-sm"
                >
                  <div className="overflow-hidden mr-2">
                    <p className="font-medium truncate" title={campaign.name}>
                      {campaign.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{`Open: ${campaign.openRate.toFixed(1)}% | Click: ${campaign.clickRate.toFixed(1)}%`}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground text-center px-4">
                No campaign data available yet.
              </div>
            )}
          </div>
        </Card>

        {/* Subscriber Growth Card with Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-medium">Subscriber Growth (Last 30 Days)</h3>
          {/* Container with specific height for ResponsiveContainer */}
          <div className="mt-4 h-[218px] w-full">
            {analyticsData &&
            analyticsData.subscriberGrowthData &&
            analyticsData.subscriberGrowthData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analyticsData.subscriberGrowthData}
                  margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridStrokeColor}
                    strokeOpacity={0.5}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={axisStrokeColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    dy={5}
                  />
                  <YAxis
                    stroke={axisStrokeColor}
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.toLocaleString()}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip
                    content={<SubscriberGrowthTooltip />}
                    cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.1 }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  {/* --- USE THE RENAMED COMPONENT HERE --- */}
                  <RechartsLine
                    type="monotone"
                    dataKey="count"
                    stroke={linePrimaryColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0, fill: linePrimaryColor }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              // Show appropriate placeholder if no/insufficient data
              <div className="flex h-full w-full items-center justify-center border rounded-md bg-muted/10 text-center px-4">
                <p className="text-muted-foreground text-sm">
                  {analyticsData &&
                  analyticsData.subscriberGrowthData &&
                  analyticsData.subscriberGrowthData.length <= 1
                    ? "Not enough data points to show growth trend."
                    : "No subscriber growth data available yet."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
