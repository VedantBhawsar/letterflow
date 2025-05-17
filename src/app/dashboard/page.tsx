"use client";

import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Mail,
  MousePointer,
  Users,
  ArrowUpRight,
  Search,
  ChevronDown,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
// Define Avatar component since it doesn't exist
const Avatar = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    <div
      className={`rounded-full overflow-hidden bg-slate-800 border border-slate-700/50 ${className || ""}`}
    >
      {children}
    </div>
  );
};

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// --- Main Dashboard Page Component ---
export default function DashboardPage() {
  const { data: session } = useSession();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme = "dark" } = useTheme();
  const router = useRouter();

  // Dummy data for the UI design
  const mockChartData = [
    { day: "Mon", Revenue: 4200, Forecast: 6000 },
    { day: "Tue", Revenue: 3800, Forecast: 5500 },
    { day: "Wed", Revenue: 5000, Forecast: 5000 },
    { day: "Thu", Revenue: 8500, Forecast: 6500 },
    { day: "Fri", Revenue: 7300, Forecast: 7000 },
    { day: "Sat", Revenue: 9100, Forecast: 7500 },
    { day: "Sun", Revenue: 10500, Forecast: 8000 },
  ];

  const mockPopularNewsletters = [
    { id: 1, name: "Weekly Updates", orders: 2651, revenue: 41.28 },
    { id: 2, name: "Product News", orders: 1894, revenue: 43.19 },
    { id: 3, name: "Monthly Digest", orders: 1567, revenue: 46.14 },
    { id: 4, name: "Feature Spotlight", orders: 1203, revenue: 41.23 },
  ];

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

    // Comment this out in production if you have a real API endpoint
    // For now, set mock data after a delay to simulate API call
    setTimeout(() => {
      setAnalyticsData({
        totalSubscribers: 15235,
        avgOpenRate: 35.4,
        avgClickRate: 8.6,
        avgUnsubscribeRate: 0.8,
        topPerformingCampaigns: [
          { id: "1", name: "Weekly Updates", openRate: 42.1, clickRate: 12.3 },
          { id: "2", name: "Product News", openRate: 38.7, clickRate: 10.5 },
          { id: "3", name: "Monthly Digest", openRate: 45.2, clickRate: 15.8 },
        ],
        topSources: [
          { name: "Direct", count: 523 },
          { name: "Referral", count: 352 },
          { name: "Social", count: 286 },
        ],
        subscriberGrowthData: Array.from({ length: 30 }, (_, i) => ({
          date: `2023-07-${i + 1}`,
          count: 12000 + Math.floor(Math.random() * 5000),
        })),
        engagementOverTimeData: Array.from({ length: 30 }, (_, i) => ({
          date: `2023-07-${i + 1}`,
          opens: 30 + Math.floor(Math.random() * 20),
          clicks: 5 + Math.floor(Math.random() * 10),
        })),
      });
      setLoading(false);
    }, 1000);

    // Uncomment this for production
    // fetchAnalytics();
  }, [session]);

  // --- Recharts Theming Colors ---
  const axisStrokeColor = "#64748B"; // slate-500
  const gridStrokeColor = "#334155"; // slate-700
  const linePrimaryColor = "#10B981"; // emerald-500
  const areaGradientStart = "rgba(16, 185, 129, 0.2)"; // emerald-500 with opacity
  const areaGradientEnd = "rgba(16, 185, 129, 0)";

  // --- Loading State ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col space-y-2 mb-6">
          <Skeleton className="h-8 w-48 mb-1 bg-slate-800" />
          <Skeleton className="h-4 w-64 bg-slate-800" />
        </div>
        {/* Metrics Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="p-4 bg-slate-800 border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-8 w-8 rounded-md bg-slate-700" />
                <Skeleton className="h-4 w-14 rounded-md bg-slate-700" />
              </div>
              <div>
                <Skeleton className="h-4 w-3/4 rounded-md mb-2 bg-slate-700" />
                <Skeleton className="h-6 w-1/2 rounded-md bg-slate-700" />
              </div>
            </Card>
          ))}
        </div>
        {/* Lower Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          <Card className="p-4 bg-slate-800 border border-slate-700/50">
            <Skeleton className="h-6 w-40 rounded-md mb-4 bg-slate-700" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md border border-slate-700 p-3"
                >
                  <div className="space-y-1.5 w-3/4">
                    <Skeleton className="h-5 w-3/4 rounded-md bg-slate-700" />
                    <Skeleton className="h-4 w-1/2 rounded-md bg-slate-700" />
                  </div>
                  <Skeleton className="h-4 w-1/4 max-w-[80px] rounded-md bg-slate-700" />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-4 bg-slate-800 border border-slate-700/50">
            <Skeleton className="h-6 w-40 rounded-md mb-4 bg-slate-700" />
            <Skeleton className="h-[200px] w-full rounded-md bg-slate-700" />
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
          <h2 className="text-2xl font-bold text-red-500 mb-3">Unable to Load Dashboard</h2>
          <p className="text-slate-400 mb-6 max-w-[500px]">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="mr-2 border-slate-700 hover:bg-slate-800 hover:text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-300">Overview</h1>
          <p className="text-slate-400">
            Monitor your newsletter performance and subscriber growth
          </p>
        </motion.div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] md:w-[260px] pl-8 bg-slate-800 border-slate-700 focus:border-emerald-500/50 focus:ring focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="relative border-slate-700 bg-slate-800 hover:bg-slate-700"
            >
              <Bell className="h-4 w-4 text-slate-300" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">
                3
              </span>
            </Button>

            <Avatar className="h-8 w-8">
              {session?.user?.name && (
                <div className="flex h-full w-full items-center justify-center bg-emerald-500/10 text-sm font-medium text-emerald-500">
                  {session.user.name.charAt(0)}
                </div>
              )}
            </Avatar>
          </div>
        </div>
      </div>

      {/* Tabs for Time Periods */}
      <div className="flex justify-between items-center">
        <Tabs defaultValue="today" className="w-full">
          <div className="flex justify-between items-center">
            <TabsList className="bg-slate-800 border border-slate-700">
              <TabsTrigger
                value="today"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-500"
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="week"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-500"
              >
                This Week
              </TabsTrigger>
              <TabsTrigger
                value="month"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-500"
              >
                This Month
              </TabsTrigger>
              <TabsTrigger
                value="year"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-500"
              >
                This Year
              </TabsTrigger>
            </TabsList>
          </div>

          {/* All content goes in first tab since we're just showing UI */}
          <TabsContent value="today" className="mt-4 space-y-6">
            {/* Metrics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <motion.div variants={itemVariants}>
                <Card className="p-4 h-full bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-md bg-emerald-900/30 p-2">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="flex items-center text-sm font-medium text-emerald-400">
                      <span>+2.6%</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-0.5">Active Subscribers</p>
                    <h2 className="text-2xl font-bold text-slate-300">
                      {analyticsData?.totalSubscribers.toLocaleString()}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Compared to 14,825 last week</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-4 h-full bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-md bg-blue-900/30 p-2">
                      <Mail className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex items-center text-sm font-medium text-blue-400">
                      <span>+3.2%</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-0.5">Avg. Open Rate</p>
                    <h2 className="text-2xl font-bold text-slate-300">
                      {analyticsData?.avgOpenRate.toFixed(1)}%
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Compared to 32.5% last week</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-4 h-full bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-md bg-violet-900/30 p-2">
                      <MousePointer className="h-5 w-5 text-violet-400" />
                    </div>
                    <div className="flex items-center text-sm font-medium text-violet-400">
                      <span>+1.9%</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-0.5">Total Newsletters</p>
                    <h2 className="text-2xl font-bold text-slate-300">36</h2>
                    <p className="text-xs text-slate-500 mt-1">Compared to 32 last week</p>
                  </div>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-4 h-full bg-slate-800 border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="rounded-md bg-amber-900/30 p-2">
                      <TrendingUp className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex items-center text-sm font-medium text-amber-400">
                      <span>+4.5%</span>
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-0.5">Net Sales</p>
                    <h2 className="text-2xl font-bold text-slate-300">$9,584</h2>
                    <p className="text-xs text-slate-500 mt-1">Compared to $9,210 last week</p>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Sales Analytics */}
            <motion.div variants={itemVariants} className="pb-4">
              <Card className="p-5 bg-slate-800 border border-slate-700/50 shadow-lg shadow-emerald-900/5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-300">Sales Analytics</h3>
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className="bg-slate-900 text-emerald-400 border-emerald-500/20 hover:bg-slate-900 px-2 flex gap-1 items-center"
                    >
                      <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
                      Revenue: $4,235
                    </Badge>
                    <Badge
                      variant="outline"
                      className="bg-slate-900 text-blue-400 border-blue-500/20 hover:bg-slate-900 px-2 flex gap-1 items-center"
                    >
                      <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      Forecast: $12,374
                    </Badge>
                  </div>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={gridStrokeColor}
                        vertical={false}
                      />
                      <XAxis dataKey="day" stroke={axisStrokeColor} tickLine={false} />
                      <YAxis stroke={axisStrokeColor} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1E293B", // slate-800
                          borderColor: "#334155", // slate-700
                          color: "#CBD5E1", // slate-300
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Revenue"
                        stroke="#10b981"
                        strokeWidth={2}
                        fill="url(#colorRevenue)"
                        activeDot={{ r: 6 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Forecast"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#colorForecast)"
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Most Popular Items */}
            <motion.div variants={itemVariants}>
              <Card className="p-5 bg-slate-800 border border-slate-700/50 shadow-lg shadow-emerald-900/5">
                <h3 className="text-lg font-semibold text-slate-300">Most Popular Newsletters</h3>
                <div className="space-y-3">
                  {mockPopularNewsletters.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: item.id * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-md border border-slate-700 hover:border-emerald-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/30">
                          <Mail className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-300">{item.name}</p>
                          <p className="text-sm text-slate-400">
                            {item.orders} Subscribers • ${item.revenue} earned
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/30"
                      >
                        View
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link href="/dashboard/newsletters">
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white hover:border-emerald-500/30"
                    >
                      View All Newsletters
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* Top Campaigns */}
            <motion.div variants={itemVariants}>
              <Card className="p-5 bg-slate-800 border border-slate-700/50 shadow-lg shadow-emerald-900/5">
                <h3 className="text-lg font-semibold text-slate-300">Top Performing Campaigns</h3>
                <div className="flex flex-wrap gap-2">
                  {analyticsData?.topPerformingCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center gap-2 p-2 rounded-md border border-slate-700 hover:border-emerald-500/30 transition-colors"
                    >
                      <Avatar className="h-10 w-10">
                        <div className="flex h-full w-full items-center justify-center bg-emerald-900/30 text-emerald-400">
                          {campaign.name.charAt(0)}
                        </div>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-300">{campaign.name}</p>
                        <p className="text-xs text-slate-400">
                          Open: {campaign.openRate}% • Click: {campaign.clickRate}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
