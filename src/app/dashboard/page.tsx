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
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  // Sample metrics data
  const metrics = [
    {
      title: "Total Subscribers",
      value: "1,234",
      change: "+12%",
      trend: "up",
      icon: <Users />,
    },
    {
      title: "Average Open Rate",
      value: "24.8%",
      change: "+3.2%",
      trend: "up",
      icon: <Mail />,
    },
    {
      title: "Click-through Rate",
      value: "4.3%",
      change: "-0.5%",
      trend: "down",
      icon: <MousePointer />,
    },
    {
      title: "Conversion Rate",
      value: "2.8%",
      change: "+1.2%",
      trend: "up",
      icon: <TrendingUp />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "Guest"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div className="rounded-md bg-primary/10 p-2">
                <div className="text-primary">{metric.icon}</div>
              </div>
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
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Weekly Newsletter #32</p>
                <p className="text-sm text-muted-foreground">Sent 2 days ago</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                26.4% opened
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Product Update</p>
                <p className="text-sm text-muted-foreground">Sent 1 week ago</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                32.1% opened
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Feature Announcement</p>
                <p className="text-sm text-muted-foreground">
                  Sent 2 weeks ago
                </p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                28.7% opened
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-lg font-medium">Subscriber Growth</h3>
          <div className="mt-4 h-[200px] flex items-center justify-center border rounded-md bg-muted/20">
            <p className="text-muted-foreground">Chart visualization here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
