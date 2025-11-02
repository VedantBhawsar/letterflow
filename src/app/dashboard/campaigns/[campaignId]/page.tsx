"use client";
import Link from "next/link";

import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Eye,
  MousePointer,
  AlertTriangle,
  Calendar,
  TrendingDown,
  XCircle,
  Send,
  Clock,
  BarChart3,
} from "lucide-react";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Campaign } from "@/lib/types";
import { getStatusBadgeColor } from "@/lib/subscriber-utils";

// --- Helper function to fetch data ---
// We fetch directly server-side. API route handles authentication/ownership.

// --- Skeleton Component for Loading State ---
function CampaignDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back Button Skeleton */}
      <Skeleton className="h-10 w-24 rounded-md" />

      {/* Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-3/4 max-w-md mb-2" />
              <Skeleton className="h-4 w-1/2 max-w-xs" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <Skeleton className="h-4 w-40" />
          </div>
          <div>
            <Skeleton className="h-4 w-48" />
          </div>
          <div>
            <Skeleton className="h-4 w-44" />
          </div>
          <div>
            <Skeleton className="h-4 w-36" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Card Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-28" />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_: any, index: any) => (
            <div key={index} className="p-4 border rounded-lg">
              <Skeleton className="h-6 w-6 mb-2 rounded-md" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Content Card Skeleton */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// --- Main Page Component ---
export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = React.use(params);
  const {
    data: campaign,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["campaign-detail"],
    queryFn: async () => {
      const { data } = await axios.get(`/api/campaigns/${campaignId}`);
      console.log(data);
      if (data) return data;
      else return undefined;
    },
  });

  console.log(campaign);

  if (isLoading) {
    return <CampaignDetailsSkeleton />;
  }
  // Handle General Fetch Errors
  if (isError) {
    return (
      <div className="container mx-auto p-6 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold text-destructive">Error Loading Campaign</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
          </Link>
        </Button>
      </div>
    );
  }

  // If campaign data exists (TS knows campaign is not null here)
  const { name, subject, status, content, createdAt, sentAt, scheduledAt, stats }: Campaign =
    campaign;

  const safeRate = (numerator: number | undefined, denominator: number | undefined): number => {
    const num = numerator ?? 0;
    const den = denominator ?? 0;
    if (den === 0) return 0;
    return (num / den) * 100;
  };

  const openRate = safeRate(stats?.opened, stats?.sent);
  const clickRateBasedOnOpens = safeRate(stats?.clicked, stats?.opened); // CTR based on opens
  const clickRateBasedOnSent = safeRate(stats?.clicked, stats?.sent); // Click rate based on sent

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Link>
      </Button>

      {/* Campaign Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl break-words">{name}</CardTitle>
              <CardDescription className="mt-1 break-words">{subject}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`text-xs font-semibold capitalize ${getStatusBadgeColor(status)}`}
            >
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 flex-shrink-0" /> Created:{" "}
            {format(new Date(createdAt), "PPP p")}
          </div>
          {status === "sent" && sentAt && (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 flex-shrink-0 text-green-600" /> Sent:{" "}
              {format(new Date(sentAt), "PPP p")} (
              {formatDistanceToNow(new Date(sentAt), { addSuffix: true })})
            </div>
          )}
          {status === "scheduled" && scheduledAt && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 flex-shrink-0 text-blue-600" /> Scheduled:{" "}
              {format(new Date(scheduledAt), "PPP p")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Section */}
      {status === "sent" && stats ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5" /> Campaign Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {" "}
            {/* Adjust columns for more stats */}
            <StatCard
              icon={<Send className="h-5 w-5 text-blue-600" />}
              title="Sent"
              value={stats.sent?.toLocaleString() ?? "0"}
            />
            {/* Optional: Delivered stat if available */}
            {/* <StatCard icon={<CheckCircle className="h-5 w-5 text-green-600"/>} title="Delivered" value={stats.delivered?.toLocaleString() ?? 'N/A'} /> */}
            <StatCard
              icon={<Eye className="h-5 w-5 text-sky-600" />}
              title="Opens"
              value={stats.opened?.toLocaleString() ?? "0"}
              rate={openRate}
              rateLabel="Open Rate"
            />
            <StatCard
              icon={<MousePointer className="h-5 w-5 text-indigo-600" />}
              title="Clicks"
              value={stats.clicked?.toLocaleString() ?? "0"}
              rate={clickRateBasedOnOpens}
              rateLabel="CTR (Opens)"
            />
            <StatCard
              icon={<TrendingDown className="h-5 w-5 text-orange-600" />}
              title="Unsubscribes"
              value={stats.unsubscribed?.toLocaleString() ?? "0"}
            />
            <StatCard
              icon={<XCircle className="h-5 w-5 text-red-600" />}
              title="Bounces"
              value={stats.bounced?.toLocaleString() ?? "0"}
            />
            {/* Optional: Complaints stat */}
            {/* <StatCard icon={<AlertCircle className="h-5 w-5 text-yellow-600"/>} title="Complaints" value={stats.complaints?.toLocaleString() ?? '0'} /> */}
          </CardContent>
        </Card>
      ) : (
        status !== "draft" && (
          <Card>
            <CardHeader>
              <CardDescription className="text-center">
                Statistics will be available after the campaign is sent.
              </CardDescription>
            </CardHeader>
          </Card>
        )
      )}

      {/* Content Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Email Content Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* SECURITY WARNING: Rendering raw HTML is risky. Use a sanitizer or iframe. */}
          {/* Option 1: Plain text div (Safest for non-HTML) */}
          {/* <div className="prose dark:prose-invert max-w-none p-4 border rounded-md max-h-96 overflow-y-auto bg-muted/30">
                       <pre className="whitespace-pre-wrap break-words">{content}</pre>
                    </div> */}

          {/* Option 2: Placeholder indicating preview */}
          <div className="p-4 border rounded-md min-h-[100px] flex items-center justify-center bg-muted/20 text-muted-foreground">
            Content Preview Area (Rendering actual HTML requires careful handling or iframe)
          </div>

          {/* Option 3: iframe (better for HTML, ensure source is trustworthy/sandboxed) */}
          {/* <iframe
                         srcDoc={content} // Use srcDoc for direct HTML string
                         title="Campaign Content Preview"
                         className="w-full h-96 border rounded-md"
                         sandbox="allow-scripts" // Be restrictive with sandbox attributes
                    /> */}
        </CardContent>
      </Card>
    </div>
  );
}

// --- Helper Stat Card Component ---
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  rate?: number;
  rateLabel?: string;
}
function StatCard({ icon, title, value, rate, rateLabel }: StatCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-background hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {rate !== undefined && rateLabel && (
        <p className="text-xs text-muted-foreground mt-0.5">
          {rate.toFixed(1)}% <span className="font-medium">{rateLabel}</span>
        </p>
      )}
    </div>
  );
}
