"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal as DotsHorizontalIcon, Search as SearchIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const itemVariants = {
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

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

interface Subscriber {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status: string;
  tags: string[];
  createdAt: string;
}

interface SubscriberListProps {
  status: string | null;
  segmentId?: string;
  refreshKey?: number;
  searchQuery?: string;
  emptyStateMessage?: React.ReactNode;
}

export function SubscriberList({
  status,
  segmentId,
  refreshKey = 0,
  searchQuery = "",
  emptyStateMessage,
}: SubscriberListProps) {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (segmentId) params.append("segmentId", segmentId);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage.toString());
      params.append("limit", "10");

      const response = await fetch(`/api/subscribers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscribers");
      }

      const data = await response.json();
      setSubscribers(data.subscribers);
      setTotalPages(data.pagination.pages);
      setTotalSubscribers(data.pagination.total);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [status, segmentId, currentPage, refreshKey]);

  useEffect(() => {
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(fetchSubscribers, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubscribers();
  };

  const handleEdit = (subscriber: Subscriber) => {
    router.push(`/dashboard/subscribers/${subscriber.id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/40">
            Active
          </Badge>
        );
      case "unsubscribed":
        return (
          <Badge
            variant="outline"
            className="border-slate-700 text-slate-400 hover:border-slate-600"
          >
            Unsubscribed
          </Badge>
        );
      case "bounced":
        return (
          <Badge variant="destructive" className="bg-red-900/30 text-red-400 hover:bg-red-900/40">
            Bounced
          </Badge>
        );
      case "complained":
        return (
          <Badge className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/40">Complained</Badge>
        );
      default:
        return <Badge className="bg-slate-800 text-slate-300 hover:bg-slate-700">{status}</Badge>;
    }
  };

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={itemVariants}>
      {loading ? (
        <LoadingTable />
      ) : subscribers.length === 0 ? (
        emptyStateMessage ? (
          <motion.div variants={itemVariants}>{emptyStateMessage}</motion.div>
        ) : (
          <motion.div
            className="flex flex-col items-center justify-center h-[300px] rounded-lg border border-slate-700/50 border-dashed p-8 bg-slate-900/20"
            variants={itemVariants}
          >
            <h3 className="text-xl font-semibold text-slate-300">No subscribers found</h3>
            <p className="text-sm text-slate-400 mt-2 text-center max-w-md">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                fetchSubscribers();
              }}
              className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-slate-200"
            >
              Clear filters
            </Button>
          </motion.div>
        )
      ) : (
        <AnimatePresence mode="wait">
          <motion.div variants={itemVariants}>
            <div className="rounded-md border border-slate-700/50 overflow-hidden shadow-lg shadow-slate-950/10">
              <Table className="w-full">
                <TableHeader className="bg-slate-800/60">
                  <TableRow className="hover:bg-slate-800 border-slate-700/50">
                    <TableHead className="text-slate-300 font-medium">Email</TableHead>
                    <TableHead className="text-slate-300 font-medium">Name</TableHead>
                    <TableHead className="text-slate-300 font-medium">Status</TableHead>
                    <TableHead className="text-slate-300 font-medium">Tags</TableHead>
                    <TableHead className="text-slate-300 font-medium">Date Added</TableHead>
                    <TableHead className="w-[50px] text-slate-300 font-medium"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.map((subscriber: any) => (
                    <TableRow
                      key={subscriber.id}
                      className="hover:bg-slate-800/50 border-slate-700/30 group transition-colors"
                    >
                      <TableCell className="font-medium text-slate-300">
                        {subscriber.email}
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {subscriber.firstName || subscriber.lastName
                          ? `${subscriber.firstName || ""} ${subscriber.lastName || ""}`
                          : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(subscriber.status)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {subscriber.tags.slice(0, 3).map((tag: any, i: any) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-slate-700 text-slate-400 hover:border-slate-600"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {subscriber.tags.length > 3 && (
                            <Badge
                              variant="outline"
                              className="border-slate-700 text-slate-400 hover:border-slate-600"
                            >
                              +{subscriber.tags.length - 3}
                            </Badge>
                          )}
                          {subscriber.tags.length === 0 && (
                            <span className="text-slate-500">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300 hover:bg-slate-800 opacity-70 group-hover:opacity-100 transition-opacity focus:ring-1 focus:ring-slate-700"
                            >
                              <DotsHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-slate-800 border-slate-700 text-slate-300 shadow-xl shadow-slate-950/20"
                          >
                            <DropdownMenuLabel className="text-slate-300">
                              Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-700/50" />
                            <DropdownMenuItem
                              onClick={() => handleEdit(subscriber)}
                              className="text-slate-300 focus:bg-slate-700 focus:text-slate-200 cursor-pointer"
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-200 cursor-pointer">
                              View Activity
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-700/50" />
                            <DropdownMenuItem className="text-red-400 focus:bg-red-900/30 focus:text-red-400 cursor-pointer">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {totalPages > 1 && (
        <motion.div className="mt-4" variants={itemVariants}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </motion.div>
      )}
    </motion.div>
  );
}

function LoadingTable() {
  return (
    <motion.div className="space-y-2" variants={listVariants} initial="hidden" animate="visible">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center space-x-4 p-4 border border-slate-700/30 rounded-md bg-slate-800/20"
          variants={itemVariants}
        >
          <Skeleton className="h-6 w-full max-w-[180px] bg-slate-700/50" />
          <Skeleton className="h-6 w-full max-w-[120px] bg-slate-700/50" />
          <Skeleton className="h-6 w-full max-w-[90px] bg-slate-700/50" />
          <Skeleton className="h-6 w-full max-w-[100px] bg-slate-700/50" />
        </motion.div>
      ))}
    </motion.div>
  );
}
