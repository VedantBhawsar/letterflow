"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const fadeInVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

const staggerListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

// Define the structure of a Segment
interface Segment {
  id: string;
  name: string;
  description?: string | null;
  rules: unknown[];
  subscribers?: unknown[];
}

interface SegmentListProps {
  refreshKey?: number;
}

export function SegmentList({ refreshKey = 0 }: SegmentListProps) {
  const router = useRouter();
  const { toast } = useToast();
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

      const data = (await response.json()) as Segment[];
      setSegments(data);
    } catch (error) {
      console.error("Error fetching segments:", error);
      toast({
        title: "Error",
        description: `Failed to load segments. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
      setSegments([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSegments();
  }, [refreshKey, fetchSegments]);

  const handleDelete = async (segmentId: string) => {
    // Optimistically remove the segment from UI for better UX
    const originalSegments = [...segments];
    setSegments((prevSegments) => prevSegments.filter((seg) => seg.id !== segmentId));

    try {
      const response = await fetch(`/api/subscribers/segments/${segmentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // If delete failed, revert the optimistic update
        setSegments(originalSegments);
        throw new Error(`Failed to delete segment: ${response.statusText}`);
      }

      toast({
        title: "Success",
        description: "Segment deleted successfully",
      });
    } catch (error) {
      setSegments(originalSegments);
      console.error("Error deleting segment:", error);
      toast({
        title: "Error",
        description: `Failed to delete segment. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
    }
  };

  const filteredSegments = segments.filter(
    (segment) =>
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.description && segment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={fadeInVariants}>
      {loading ? (
        <div className="flex items-center justify-center h-[300px]">
          <div className="text-slate-400 flex flex-col items-center">
            <div className="h-8 w-8 border-t-2 border-emerald-500/40 border-r-2 border-r-transparent rounded-full animate-spin mb-3"></div>
            <span>Loading segments...</span>
          </div>
        </div>
      ) : filteredSegments.length === 0 ? (
        <motion.div
          variants={fadeInVariants}
          className="flex flex-col items-center justify-center h-[300px] rounded-lg border border-slate-700/50 border-dashed p-8 bg-slate-900/20"
        >
          <Tag className="h-12 w-12 text-slate-500 mb-4" strokeWidth={1.5} />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {searchTerm ? "No segments found" : "No segments created yet"}
          </h3>
          <p className="text-sm text-slate-400 mb-6 max-w-md text-center">
            {searchTerm
              ? "Your search did not match any segments."
              : "Segments help you organize your subscribers based on specific criteria like tags, location, or activity."}
          </p>
          {!searchTerm && (
            <Button
              onClick={() => router.push("/dashboard/subscribers/segments/new")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Segment
            </Button>
          )}
        </motion.div>
      ) : (
        <AnimatePresence>
          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            variants={staggerListVariants}
          >
            {filteredSegments.map((segment) => (
              <motion.div
                key={segment.id}
                variants={fadeInVariants}
                layout
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="bg-slate-800 border-slate-700/50 hover:border-emerald-500/30 transition-colors shadow-lg shadow-slate-950/10 h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg truncate text-slate-300" title={segment.name}>
                          {segment.name}
                        </CardTitle>
                        {segment.description && (
                          <CardDescription
                            className="line-clamp-2 text-xs sm:text-sm text-slate-400"
                            title={segment.description}
                          >
                            {segment.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 flex-shrink-0 text-slate-400 hover:text-slate-300 hover:bg-slate-700 focus:ring-1 focus:ring-slate-700"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Segment Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-slate-800 border-slate-700 text-slate-300 shadow-xl shadow-slate-950/20"
                        >
                          <DropdownMenuLabel className="text-slate-300">Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-slate-700/50" />
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/subscribers/segments/${segment.id}`)
                            }
                            className="text-slate-300 focus:bg-slate-700 focus:text-slate-200 cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 mr-2 text-slate-400" />
                            Edit Segment
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-400 focus:bg-red-900/30 focus:text-red-400 cursor-pointer"
                            onClick={() => handleDelete(segment.id)}
                          >
                            <Trash className="h-4 w-4 mr-2 text-red-400" />
                            Delete Segment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 text-sm flex-grow">
                    <div className="flex items-center mb-2">
                      <span className="w-20 flex-shrink-0 font-medium text-slate-300">
                        Criteria:
                      </span>
                      <span className="text-slate-400">
                        {Array.isArray(segment.rules)
                          ? `${segment.rules.length} rule${segment.rules.length !== 1 ? "s" : ""}`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 flex-shrink-0 font-medium text-slate-300">
                        Subscribers:
                      </span>
                      <Badge
                        variant="secondary"
                        className="font-mono bg-slate-700 text-emerald-400 hover:bg-slate-700/80"
                      >
                        {Array.isArray(segment.subscribers) ? segment.subscribers.length : 0}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
