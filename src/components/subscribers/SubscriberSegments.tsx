import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusSegment = {
  status: string;
  count: number;
};

type TagSegment = {
  tag: string;
  count: number;
};

type RecentActivity = {
  newSubscribersLast30Days: number;
};

type SubscriberSegmentsProps = {
  className?: string;
};

export function SubscriberSegments({ className }: SubscriberSegmentsProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSegments, setStatusSegments] = useState<StatusSegment[]>([]);
  const [tagSegments, setTagSegments] = useState<TagSegment[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        setLoading(true);
        const res = await fetch("/api/subscribers/segments");

        if (!res.ok) {
          throw new Error("Failed to fetch subscriber segments");
        }

        const data = await res.json();
        setStatusSegments(data.statusSegments || []);
        setTagSegments(data.tagSegments || []);
        setRecentActivity(data.recentActivity || null);
        setError(null);
      } catch (error) {
        console.error("Error fetching subscriber segments:", error);
        setError("Failed to load subscriber segments");
      } finally {
        setLoading(false);
      }
    }

    fetchSegments();
  }, []);

  const totalSubscribers = statusSegments.reduce((sum, segment) => sum + segment.count, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "unsubscribed":
        return "bg-yellow-100 text-yellow-800";
      case "bounced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Subscriber Insights</CardTitle>
        <CardDescription>Subscriber metrics and segmentation</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Total and recent subscribers */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
                    <h3 className="text-2xl font-bold">{totalSubscribers}</h3>
                  </div>
                </div>
              </div>

              {recentActivity && (
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <div className="flex items-center">
                    <div className="bg-green-50 p-2 rounded-full mr-3">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">New in Last 30 Days</p>
                      <h3 className="text-2xl font-bold">
                        {recentActivity.newSubscribersLast30Days}
                      </h3>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status segments */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">By Status</h4>
              <div className="space-y-2">
                {statusSegments.map((segment: any) => (
                  <div
                    key={segment.status}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border"
                  >
                    <div className="flex items-center">
                      <Badge className={getStatusColor(segment.status)}>{segment.status}</Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {segment.count}
                      <span className="text-gray-500 ml-1">
                        ({Math.round((segment.count / totalSubscribers) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tag segments */}
            {tagSegments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Popular Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tagSegments.slice(0, 10).map((segment: any) => (
                    <Badge key={segment.tag} variant="outline" className="px-2 py-1">
                      {segment.tag}{" "}
                      <span className="ml-1 text-xs text-gray-500">({segment.count})</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
