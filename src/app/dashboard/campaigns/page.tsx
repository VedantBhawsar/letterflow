"use client";

import { useState, useEffect, useCallback } from "react";
import { PlusCircle, Search, Filter, Loader2, AlertTriangle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, // Added SelectValue for proper display
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";
import { Campaign } from "@/lib/types";
// import { formatDistanceToNow } from "date-fns"; // Not used currently
import { CampaignsTable, CampaignsTableSkeleton } from "@/components/campaigns/campaigns-table";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

// Animation variants (consistent with Design System)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Default to "all"
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "createdAt",
    direction: "desc",
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    // Added useCallback
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      if (searchQuery) {
        params.append("search", searchQuery);
      }

      params.append("sortKey", sortConfig.key);
      params.append("sortDirection", sortConfig.direction);

      const response = await fetch(`/api/campaigns?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch campaigns");
      }

      const data = await response.json();
      setCampaigns(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load campaigns. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery, sortConfig]); // Dependencies for useCallback

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns();
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [fetchCampaigns]); // fetchCampaigns is now stable due to useCallback

  const handleCreateSuccess = (newCampaign: Campaign) => {
    // Assuming API returns the created campaign, or we optimistically update
    setCampaigns((prev) =>
      [newCampaign, ...prev].sort((a, b) => {
        // Re-apply sort or ensure the new item is placed correctly
        if (sortConfig.key === "createdAt") {
          return sortConfig.direction === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Add other sort key logic if necessary
        return 0;
      })
    );
    setIsCreateDialogOpen(false);
    // Optionally trigger a full refetch if complex sorting/filtering is involved
    // fetchCampaigns();
  };

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Render loading state
  if (isLoading && campaigns.length === 0) {
    // Show skeleton only on initial load
    return (
      <motion.div
        className="space-y-6 p-4 sm:p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Campaigns</h1>
            <p className="text-slate-400">Create and manage your email campaigns</p>
          </div>
          <Skeleton className="h-10 w-full sm:w-[180px] bg-slate-700 rounded-md" />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          <div className="relative flex-grow w-full">
            <Skeleton className="w-full h-10 bg-slate-700 rounded-md" />
          </div>
          <div className="w-full sm:w-[200px]">
            <Skeleton className="w-full h-10 bg-slate-700 rounded-md" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <CampaignsTableSkeleton />
        </motion.div>
      </motion.div>
    );
  }

  // Render error state
  if (error) {
    return (
      <motion.div
        className="flex flex-col h-[60vh] items-center justify-center p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">Oops! Something went wrong.</h2>
        <p className="text-red-400 mb-6">{error}</p>
        <Button
          onClick={fetchCampaigns} // Use fetchCampaigns to retry
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-4 sm:p-6 md:p-8" // Responsive padding
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Campaigns</h1>
          <p className="text-slate-400 mt-1">Create, manage, and track your email campaigns.</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-md flex items-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          New Campaign
        </Button>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
      >
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search campaigns by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 h-10 w-full bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-500 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
        </div>
        <div className="w-full sm:w-auto sm:min-w-[200px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-slate-800 border border-slate-700 text-slate-300 rounded-md h-10 px-3 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <SelectValue placeholder="All Statuses" />
              </div>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-slate-300 rounded-md shadow-lg">
              {/* Styled SelectItem components */}
              <SelectItem
                value="all"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                All Statuses
              </SelectItem>
              <SelectItem
                value="draft"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                Draft
              </SelectItem>
              <SelectItem
                value="scheduled"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                Scheduled
              </SelectItem>
              <SelectItem
                value="sent"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                Sent
              </SelectItem>
              <SelectItem
                value="archived"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                Archived
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {isLoading &&
          campaigns.length > 0 && ( // Show spinner overlay or small indicator when refetching
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
            </div>
          )}
        {!isLoading && campaigns.length === 0 ? (
          <div className="text-center py-12 sm:py-16 border border-slate-700/50 rounded-lg bg-slate-800/70 shadow-md mt-6">
            <Mail className="mx-auto h-16 w-16 text-slate-500 opacity-70 mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-2">
              No Campaigns Found
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || (statusFilter && statusFilter !== "all")
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Ready to reach your audience? Start by creating your first campaign."}
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-md flex items-center gap-2 mx-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Create First Campaign
            </Button>
          </div>
        ) : (
          <CampaignsTable
            campaigns={campaigns}
            onSort={handleSort}
            sortConfig={sortConfig}
            setCampaigns={setCampaigns}
            isLoading={isLoading && campaigns.length > 0}
          />
        )}
      </motion.div>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-slate-800 border border-slate-700 text-slate-300 rounded-lg shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-700/50 px-6 pt-6">
            <DialogTitle className="text-lg font-semibold text-slate-100">
              Create New Email Campaign
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-1">
              Configure your campaign details, content, and recipients.
            </DialogDescription>
          </DialogHeader>
          {/* Assuming CreateCampaignForm uses DialogFooter for actions internally */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <CreateCampaignForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
