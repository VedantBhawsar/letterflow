"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
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

// Define the structure of a Segment
interface Segment {
  id: string;
  name: string;
  description?: string | null; // Description can be optional or null
  rules: unknown[]; // We know it's an array, but not the specifics of rules yet
  subscribers?: unknown[]; // We know it might be an array, but not the specifics
}

interface SegmentListProps {
  refreshKey?: number;
}

export function SegmentList({ refreshKey = 0 }: SegmentListProps) {
  const router = useRouter();
  const { toast } = useToast();
  // Use the Segment type for the state
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch segments from API - wrapped in useCallback for stable reference
  const fetchSegments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subscribers/segments");

      if (!response.ok) {
        throw new Error(`Failed to fetch segments: ${response.statusText}`);
      }

      // Assume the API returns data matching Segment[]
      // Use type assertion 'as' if confident in the API response shape
      const data = (await response.json()) as Segment[];
      setSegments(data);
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast({
        title: "Error",
        description: `Failed to load segments. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
      setSegments([]); // Clear segments on error
    } finally {
      setLoading(false);
    }
  }, [toast]); // Add toast as dependency for useCallback

  useEffect(() => {
    fetchSegments();
    // Add fetchSegments to dependency array as per exhaustive-deps rule
  }, [refreshKey, fetchSegments]);

  const handleDelete = async (segmentId: string) => {
    // Optimistically remove the segment from UI for better UX
    const originalSegments = [...segments];
    setSegments((prevSegments) => prevSegments.filter((seg: any) => seg.id !== segmentId));

    try {
      const response = await fetch(`/api/subscribers/segments/${segmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If delete failed, revert the optimistic update
        setSegments(originalSegments);
        throw new Error(`Failed to delete segment: ${response.statusText}`);
      }

      // No need to call fetchSegments again if delete was successful
      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    } catch (error) {
      // Ensure segments are reverted if not already done
      setSegments(originalSegments);
      console.error("Error deleting segment:", error);
      toast({
        title: "Error",
        description: `Failed to delete segment. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
    }
  };

  // Type is inferred correctly from the state 'segments'
  const filteredSegments = segments.filter(
    (segment: any) =>
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description && segment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 sm:gap-6">
        <div className="flex-grow">
          {" "}
          {/* Allow input to grow */}
          <Input
            placeholder="Search segments by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Button
          onClick={() => router.push("/dashboard/subscribers/segments/new")}
          className="flex-shrink-0" /* Prevent button from shrinking too much */
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Create Segment</span>{" "}
          {/* Hide text on smaller screens */}
          <span className="sm:hidden">New</span> {/* Show shorter text */}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading segments...</div>
      ) : filteredSegments.length === 0 ? (
        <Card className="mt-6">
          {" "}
          {/* Add margin top */}
          <CardContent className="flex flex-col items-center justify-center pt-10 pb-10 text-center">
            {" "}
            {/* Adjust padding */}
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {" "}
              {/* Increase heading size */}
              {searchTerm ? "No segments found" : "No segments created yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs sm:max-w-md">
              {" "}
              {/* Adjust margin and width */}
              {searchTerm
                ? `Your search for "${searchTerm}" did not match any segments.`
                : "Segments help you organize your subscribers based on specific criteria like tags, location, or activity."}
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
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {" "}
          {/* Adjust grid cols */}
          {/* Type is inferred correctly from filteredSegments */}
          {filteredSegments.map((segment: any) => (
            <Card key={segment.id} className="flex flex-col">
              {" "}
              {/* Use flex-col for consistent height potentially */}
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  {" "}
                  {/* Add gap */}
                  <div className="space-y-1 flex-1 min-w-0">
                    {" "}
                    {/* Allow text to wrap */}
                    <CardTitle className="text-lg truncate" title={segment.name}>
                      {" "}
                      {/* Add truncate and title */}
                      {segment.name}
                    </CardTitle>
                    {segment.description && (
                      <CardDescription
                        className="line-clamp-2 text-xs sm:text-sm"
                        title={segment.description}
                      >
                        {" "}
                        {/* Add title */}
                        {segment.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Segment Actions</span> {/* Accessibility */}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push(`/dashboard/subscribers/segments/${segment.id}`)}
                        className="cursor-pointer" // Add cursor pointer
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Segment
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" // Style focus and add pointer
                        onClick={() => handleDelete(segment.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete Segment
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              {/* Move Content below Header */}
              <CardContent className="pt-2 text-sm flex-grow">
                {" "}
                {/* Allow content to grow */}
                {/* Using Array.isArray guards against non-array values */}
                <div className="flex items-center mb-1">
                  <span className="w-20 flex-shrink-0 font-medium">Criteria:</span>{" "}
                  {/* Fixed width label */}
                  <span className="text-muted-foreground">
                    {Array.isArray(segment.rules)
                      ? `${segment.rules.length} rule${segment.rules.length !== 1 ? "s" : ""}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-20 flex-shrink-0 font-medium">Subscribers:</span>{" "}
                  {/* Fixed width label */}
                  {/* Use optional chaining and nullish coalescing */}
                  <Badge variant="secondary" className="font-mono">
                    {" "}
                    {/* Style badge */}
                    {/* Check if subscribers is an array before accessing length */}
                    {Array.isArray(segment.subscribers) ? segment.subscribers.length : 0}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
