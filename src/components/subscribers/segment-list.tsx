"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash, MoreHorizontal, Plus, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface SegmentListProps {
  refreshKey?: number;
}

export function SegmentList({ refreshKey = 0 }: SegmentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch segments from API
  const fetchSegments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscribers/segments");

      if (!response.ok) {
        throw new Error("Failed to fetch segments");
      }

      const data = await response.json();
      setSegments(data);
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast({
        title: "Error",
        description: "Failed to load segments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [refreshKey]);

  const handleDelete = async (segmentId: string) => {
    try {
      const response = await fetch(`/api/subscribers/segments/${segmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete segment");
      }

      fetchSegments();
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting segment:", error);
      toast({
        title: "Error",
        description: "Failed to delete segment",
        variant: "destructive",
      });
    }
  };

  const filteredSegments = segments.filter(
    (segment: any) =>
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description && segment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-6">
        <div className="w-full">
          <Input
            placeholder="Search segments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/dashboard/subscribers/segments/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>



      {loading ? (
        <div className="text-center py-6">Loading segments...</div>
      ) : filteredSegments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? "No segments found" : "No segments created yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Segments help you organize your subscribers based on specific criteria"}
            </p>
            {!searchTerm && (
              <Button onClick={() => router.push("/dashboard/subscribers/segments/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Segment
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSegments.map((segment: any) => (
            <Card key={segment.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                    {segment.description && (
                      <CardDescription className="line-clamp-2">
                        {segment.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/subscribers/segments/${segment.id}`)}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(segment.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm">
                    <span className="mr-2 font-medium">Criteria:</span>
                    <span className="text-muted-foreground">
                      {Array.isArray(segment.rules)
                        ? `${segment.rules.length} rule${segment.rules.length !== 1 ? "s" : ""}`
                        : "0 rules"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="mr-2 font-medium">Subscribers:</span>
                    <Badge variant="outline">{segment.subscribers?.length || 0}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
