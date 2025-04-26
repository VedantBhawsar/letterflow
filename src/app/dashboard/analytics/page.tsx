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
  AlertTriangle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"; // Ensure recharts is installed: npm install recharts
import { useTheme } from "next-themes"; // Ensure next-themes is installed and setup
import axios from "axios";

// --- Interface matches the *updated* API response ---
interface AnalyticsData {
  totalSubscribers: number; // Represents ACTIVE subscribers based on API logic
  avgOpenRate: number;
  avgClickRate: number;
  avgUnsubscribeRate: number;
  topPerformingCampaigns: {
    id: string;
    name: string;
    openRate: number;
    clickRate: number;
    // Add mock trend client-side for display
    trend: "up" | "down";
  }[];
  topSources: {
    name: string;
    count: number;
  }[];
  subscriberGrowthData: { date: string; count: number }[]; // Expected from API now
}

// --- Metric Card Component ---
interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down"; // Note: Trend here is static/visual for now
  icon: React.ReactNode;
}
function MetricCard({ title, value, trend, icon }: MetricCardProps) {
  // Determine icon color based on metric type (simple example)
  const isPositiveMetric = !title.toLowerCase().includes("unsubscribe");
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-primary/10 p-2">
          <div className="text-primary">{icon}</div>
        </div>
        <div
          className={`flex items-center text-sm ${isPositiveMetric ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
        >
          {isPositiveMetric ? (
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

// --- Recharts Custom Tooltip ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-1 gap-1">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
            <span className="font-bold text-muted-foreground">{label}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Active Subscribers
            </span>
            <span className="font-bold" style={{ color: payload[0].stroke }}>
              {payload[0].value.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// --- Main Analytics Page Component ---
export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use a more specific type for the state, allowing null initially
  const [analyticsData, setAnalyticsData] = useState<
    | (Omit<AnalyticsData, "topPerformingCampaigns"> & {
        topPerformingCampaigns: Omit<AnalyticsData["topPerformingCampaigns"][number], "trend">[];
      })
    | null
  >(null);
  const [displayCampaigns, setDisplayCampaigns] = useState<AnalyticsData["topPerformingCampaigns"]>(
    []
  );

  const { theme = "light" } = useTheme() ?? {};

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      setAnalyticsData(null); // Clear previous data
      setDisplayCampaigns([]);
      try {
        const {
          data,
        }: {
          data: Omit<AnalyticsData, "topPerformingCampaigns"> & {
            topPerformingCampaigns: Omit<
              AnalyticsData["topPerformingCampaigns"][number],
              "trend"
            >[];
          };
        } = await axios.get("/api/analytics");
        // Backend now returns the correct structure, including subscriberGrowthData
        setAnalyticsData(data);

        // Add mock trend for display purposes *after* fetching
        const campaignsWithMockTrend = data.topPerformingCampaigns.map((c, i) => ({
          ...c,
          trend: i % 2 === 0 ? "up" : ("down" as "up" | "down"), // Simple alternating trend
        }));
        setDisplayCampaigns(campaignsWithMockTrend);
      } catch (e) {
        console.error("Failed to fetch analytics:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []); // Fetch on mount

  // --- Recharts Theming ---
  const axisStrokeColor =
    theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))";
  const gridStrokeColor = theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))";
  const linePrimaryColor = theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))";

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {" "}
        {/* Add padding */}
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-28 rounded-md" />
          </div>
        </div>
        {/* Tabs Skeleton */}
        <div className="w-full max-w-md mb-6">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        {/* Metrics Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-6 w-1/2 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
        {/* Charts/Lists Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-40 mb-4 rounded-md" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-48 mb-4 rounded-md" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <Skeleton className="h-6 w-52 mb-4 rounded-md" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>
          <Card className="p-6">
            <Skeleton className="h-6 w-44 mb-4 rounded-md" />
            <Skeleton className="h-[300px] w-full rounded-md" />
          </Card>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Failed to Load Analytics</h1>
        <p className="text-muted-foreground max-w-md">
          Could not fetch analytics data. Please check your connection or try again later.
        </p>
        <p className="text-sm text-destructive mt-2">Error: {error}</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
          Retry
        </Button>
      </div>
    );
  }

  // --- Render Data State (Ensure data exists) ---
  if (!analyticsData) {
    // This case should ideally only happen briefly or if fetch fails silently
    return <div className="text-center p-10">No analytics data available.</div>;
  }

  // Calculate total for source percentage (using active subscribers)
  const totalSourceCount = analyticsData.topSources.reduce((sum, source) => sum + source.count, 0);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {" "}
      {/* Add padding */}
      {/* --- Header --- */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        {" "}
        {/* Allow wrapping */}
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your newsletter performance</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {" "}
          {/* Prevent buttons shrinking too much */}
          <Button variant="outline" size="sm">
            {" "}
            {/* Use smaller buttons */}
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      {/* --- Tabs --- */}
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
          {/* --- Key Metrics --- */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Active Subscribers"
              value={analyticsData.totalSubscribers.toLocaleString()}
              trend="up"
              icon={<Users className="h-4 w-4" />}
            />
            <MetricCard
              title="Average Open Rate"
              value={`${analyticsData.avgOpenRate.toFixed(1)}%`}
              trend="up"
              icon={<Mail className="h-4 w-4" />}
            />
            <MetricCard
              title="Average Click Rate"
              value={`${analyticsData.avgClickRate.toFixed(1)}%`}
              trend="up"
              icon={<MousePointer className="h-4 w-4" />}
            />
            <MetricCard
              title="Unsubscribe Rate"
              value={`${analyticsData.avgUnsubscribeRate.toFixed(1)}%`}
              trend="down"
              icon={<Users className="h-4 w-4" />}
            />
          </div>

          {/* --- Row 1: Engagement & Top Campaigns --- */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Engagement Graph Placeholder */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Engagement Over Time</h3>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
                <p className="text-muted-foreground text-sm">
                  Engagement chart visualization
                  <br />
                  (Placeholder - Requires separate data source)
                </p>
              </div>
            </Card>
            {/* Top Performing Campaigns List */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Top Performing Campaigns</h3>
              <div className="space-y-4">
                {displayCampaigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No campaign data available yet.
                  </p>
                ) : (
                  displayCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between border-b pb-3 last:border-none"
                    >
                      <div className="overflow-hidden mr-2">
                        {" "}
                        {/* Prevent long names pushing icon */}
                        <p className="font-medium truncate" title={campaign.name}>
                          {campaign.name}
                        </p>
                        <div className="flex text-sm text-muted-foreground gap-3 mt-1">
                          <span>Opens: {campaign.openRate.toFixed(1)}%</span>
                          <span>Clicks: {campaign.clickRate.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center flex-shrink-0 ${campaign.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                      >
                        {campaign.trend === "up" ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* --- Row 2: Growth & Sources --- */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* --- Subscriber Growth Chart (Inline Implementation) --- */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Active Subscriber Growth (Last 30 Days)</h3>
              <div className="h-[300px] w-full">
                {" "}
                {/* Container with defined height */}
                {analyticsData.subscriberGrowthData &&
                analyticsData.subscriberGrowthData.length > 1 ? ( // Need at least 2 points to draw a line
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={analyticsData.subscriberGrowthData}
                      margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
                    >
                      {" "}
                      {/* Adjust left margin */}
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
                      />{" "}
                      {/* Slightly move labels down */}
                      <YAxis
                        stroke={axisStrokeColor}
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                        allowDecimals={false}
                        width={40}
                      />{" "}
                      {/* Reserve space for Y labels */}
                      <Tooltip
                        cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.1 }}
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: "none" }}
                      />{" "}
                      {/* Style tooltip hover */}
                      <Line
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
                  <div className="flex h-full items-center justify-center text-center">
                    <p className="text-muted-foreground text-sm">
                      {analyticsData.subscriberGrowthData &&
                      analyticsData.subscriberGrowthData.length <= 1
                        ? "Not enough data points to show growth trend."
                        : "No subscriber growth data available."}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Top Sources List */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Top Subscriber Sources</h3>
              <div className="space-y-4">
                {analyticsData.topSources.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No subscriber source data available.
                  </p>
                ) : (
                  analyticsData.topSources.map((source, index) => {
                    const percentage =
                      totalSourceCount > 0
                        ? Math.max(0.1, (source.count / totalSourceCount) * 100)
                        : 0;
                    return (
                      <div key={index} className="space-y-1.5">
                        {" "}
                        {/* Adjust spacing */}
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate mr-2" title={source.name}>
                            {source.name}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0">
                            {source.count.toLocaleString()} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          />{" "}
                          {/* Add rounded to inner bar */}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- Other Tabs Content (Placeholders) --- */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
              <p className="text-muted-foreground">
                Detailed campaign analytics table coming soon.
              </p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="subscribers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Subscriber Metrics</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
              <p className="text-muted-foreground">
                Detailed subscriber engagement data coming soon.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
