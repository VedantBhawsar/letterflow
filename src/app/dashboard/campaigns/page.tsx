"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Search, Mail, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateCampaignForm } from "@/components/campaigns/create-campaign-form";
import { Campaign } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { CampaignsTable, CampaignsTableSkeleton } from "@/components/campaigns/campaigns-table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
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

  // Fetch campaigns with filters
  useEffect(() => {
    async function fetchCampaigns() {
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
          throw new Error("Failed to fetch campaigns");
        }

        const data = await response.json();
        setCampaigns(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
        setError("Failed to load campaigns. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    // Debounce the search query
    const timeoutId = setTimeout(() => {
      fetchCampaigns();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [statusFilter, searchQuery, sortConfig]);

  // Filter campaigns by search query
  const filteredCampaigns = campaigns;

  // Handle create campaign success
  const handleCreateSuccess = (campaign: Campaign) => {
    setCampaigns((prev) => [campaign, ...prev]);
    setIsCreateDialogOpen(false);
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Campaigns</h1>
            <p className="text-muted-foreground">Create and manage your email campaigns</p>
          </div>
          <div className="w-[140px] h-10">
            <Skeleton className="h-10 w-52 mb-1" />
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <div className="relative flex-1">
            <Skeleton className="w-full h-8" />
          </div>
          <div className="w-[180px]">
            <Skeleton className="w-full h-8" />
          </div>
        </div>

        <CampaignsTableSkeleton />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your email campaigns</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <span>
                  {statusFilter && statusFilter !== "all"
                    ? `Status: ${statusFilter}`
                    : "All Statuses"}
                </span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredCampaigns.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No campaigns found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter to find what you're looking for."
              : "Get started by creating your first campaign."}
          </p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      ) : (
        <CampaignsTable
          setCampaigns={setCampaigns}
          campaigns={filteredCampaigns}
          onSort={handleSort}
          sortConfig={sortConfig}
        />
      )}

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new email campaign.
            </DialogDescription>
          </DialogHeader>
          <CreateCampaignForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
