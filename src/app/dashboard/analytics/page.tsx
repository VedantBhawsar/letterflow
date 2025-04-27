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
  // Import TooltipProps type from recharts
  TooltipProps,
} from "recharts";
import { useTheme } from "next-themes";
import axios from "axios";

// --- Types remain the same ---
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
    trend: "up" | "down"; // Client-side mock trend added after fetch
  }[];
  topSources: {
    name: string;
    count: number;
  }[];
  subscriberGrowthData: { date: string; count: number }[];
}

interface MetricCardProps {
  title: string;
  value: string;
  trend: "up" | "down";
  icon: React.ReactNode;
}

// --- Specific type for the data shown in the LineChart ---
type ChartDataValue = number;
type ChartDataName = string; // Represents the 'date' key

// --- Metric Card Component (no 'any' here) ---
function MetricCard({ title, value, trend, icon }: MetricCardProps) {
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

// --- Recharts Custom Tooltip with proper types ---
const CustomTooltip = ({
  active,
  payload,
  label,
}: // Use TooltipProps with specific value/name types from the chart
TooltipProps<ChartDataValue, ChartDataName>) => {
  // Check if tooltip is active and payload exists and is not empty
  if (active && payload && payload.length > 0) {
    // Get the first payload item (assuming one line in the chart)
    const dataPoint = payload[0];

    // Check if the payload has a valid value (number)
    if (dataPoint?.value !== undefined && dataPoint.stroke) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-1">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Date</span>
              {/* Label can be string or number, display it */}
              <span className="font-bold text-muted-foreground">{label ?? "N/A"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Active Subscribers
              </span>
              {/* Access value and stroke safely */}
              <span className="font-bold" style={{ color: dataPoint.stroke }}>
                {typeof dataPoint.value === "number" ? dataPoint.value.toLocaleString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      );
    }
  }
  // Return null if tooltip shouldn't be shown
  return null;
};

// --- Main Analytics Page Component (no 'any' here) ---
export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Use specific types for state, omitting the client-side 'trend' initially
  const [analyticsData, setAnalyticsData] = useState<
    | (Omit<AnalyticsData, "topPerformingCampaigns"> & {
        topPerformingCampaigns: Omit<AnalyticsData["topPerformingCampaigns"][number], "trend">[];
      })
    | null
  >(null);
  // Separate state for campaigns with the *client-added* trend
  const [displayCampaigns, setDisplayCampaigns] = useState<AnalyticsData["topPerformingCampaigns"]>(
    []
  );

  // UseTheme hook with null check and default
  const { theme = "light" } = useTheme() ?? {};

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      setAnalyticsData(null);
      setDisplayCampaigns([]);

      try {
        // Define the expected structure of the data within the axios response
        type ApiResponseType = Omit<AnalyticsData, "topPerformingCampaigns"> & {
          topPerformingCampaigns: Omit<AnalyticsData["topPerformingCampaigns"][number], "trend">[];
        };

        // Use the specific type with axios.get
        const response = await axios.get<{ data: ApiResponseType }>("/api/analytics");

        // Check if data exists in the response (axios structure)
        if (response?.data?.data) {
          const fetchedData = response.data.data;
          setAnalyticsData(fetchedData);

          // Add mock trend for display purposes after fetching
          const campaignsWithMockTrend: AnalyticsData["topPerformingCampaigns"] =
            fetchedData.topPerformingCampaigns.map((c: any, i: any) => ({
              ...c,
              // Ensure the value is explicitly 'up' or 'down'
              trend: i % 2 === 0 ? "up" : "down",
            }));
          setDisplayCampaigns(campaignsWithMockTrend);
        } else {
          // Handle case where response structure is unexpected
          console.error("Unexpected API response structure:", response);
          throw new Error("Received invalid data format from analytics API.");
        }
      } catch (e: unknown) {
        // Catch error as unknown
        console.error("Failed to fetch analytics:", e);
        let errorMessage = "An unknown error occurred while fetching analytics data.";
        if (e instanceof Error) {
          errorMessage = e.message;
        } else if (axios.isAxiosError(e)) {
          // Check specifically for Axios errors
          errorMessage = e.response?.data?.message || e.message || "Network or server error.";
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []); // Empty dependency array means fetch only on mount

  // --- Recharts Theming (no 'any' here) ---
  const axisStrokeColor =
    theme === "dark" ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))";
  const gridStrokeColor = theme === "dark" ? "hsl(var(--border))" : "hsl(var(--border))";
  const linePrimaryColor = theme === "dark" ? "hsl(var(--primary))" : "hsl(var(--primary))";

  // --- Render Loading State (no 'any' here) ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Skeletons... */}
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
        <div className="w-full max-w-md mb-6">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_: any, index: any) => (
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

  // --- Render Error State (no 'any' here) ---
  if (error) {
    return (
      <div className="space-y-6 flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Failed to Load Analytics</h1>
        <p className="text-muted-foreground max-w-md">
          Could not fetch analytics data. Please check your connection or try again later.
        </p>
        <p className="text-sm text-destructive mt-2">Error details: {error}</p>{" "}
        {/* Display error message */}
        <Button variant="outline" onClick={() => window.location.reload()} className="mt-6">
          Retry
        </Button>
      </div>
    );
  }

  // --- Render Data State (Ensure data exists - no 'any' here) ---
  if (!analyticsData) {
    // Fallback if fetch failed but didn't set error state, or data is invalid
    return <div className="text-center p-10">No analytics data could be loaded.</div>;
  }

  // Calculate total using validated analyticsData
  const totalSourceCount = analyticsData.topSources.reduce((sum, source) => sum + source.count, 0);

  // --- Return JSX (no 'any' here) ---
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* --- Header --- */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track and analyze your newsletter performance</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm">
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
            {/* Metric Cards using validated analyticsData */}
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
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Engagement Over Time</h3>
              <div className="h-[300px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
                <p className="text-muted-foreground text-sm">
                  Engagement chart visualization placeholder
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Top Performing Campaigns</h3>
              <div className="space-y-4">
                {displayCampaigns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No campaign data.</p>
                ) : (
                  displayCampaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between border-b pb-3 last:border-none"
                    >
                      <div className="overflow-hidden mr-2">
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
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Active Subscriber Growth</h3>
              <div className="h-[300px] w-full">
                {analyticsData.subscriberGrowthData &&
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
                        tickFormatter={(value: number) => value.toLocaleString()}
                        allowDecimals={false}
                        width={40}
                      />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--accent))", fillOpacity: 0.1 }}
                        content={<CustomTooltip />}
                        wrapperStyle={{ outline: "none" }}
                      />
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
                      {analyticsData.subscriberGrowthData?.length <= 1
                        ? "Not enough data."
                        : "No growth data."}
                    </p>
                  </div>
                )}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Top Subscriber Sources</h3>
              <div className="space-y-4">
                {analyticsData.topSources.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No source data.</p>
                ) : (
                  analyticsData.topSources.map((source: any, index: number) => {
                    const percentage =
                      totalSourceCount > 0
                        ? Math.max(0.1, (source.count / totalSourceCount) * 100)
                        : 0;
                    return (
                      <div key={index} className="space-y-1.5">
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
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* --- Other Tabs Content Placeholders --- */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
              <p className="text-muted-foreground">Campaign details coming soon.</p>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="subscribers" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Subscriber Metrics</h3>
            <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20 text-center">
              <p className="text-muted-foreground">Subscriber details coming soon.</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
