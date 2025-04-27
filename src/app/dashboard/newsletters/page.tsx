"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Mail,
  Filter,
  Loader2,
  LayoutTemplate,
  AlertCircle,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the Newsletter type
interface Newsletter {
  id: string;
  name: string;
  subject?: string;
  previewText?: string;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export default function NewslettersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch newsletters with search and filter
  const fetchNewsletters = async (search: string = "", status: string = "") => {
    try {
      setIsSearching(true);

      // Build query params
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (status && status !== "all") params.append("status", status);

      // Make API request
      const response = await fetch(`/api/newsletters?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch newsletters");
      }

      // Parse response as Newsletter[]
      const data = await response.json();

      // Convert date strings to Date objects
      // @ts-expect-error - data is compatible with Newsletter[]
      const formattedData = data.map((newsletter) => ({
        ...newsletter,
        createdAt: new Date(newsletter.createdAt),
        updatedAt: new Date(newsletter.updatedAt),
      }));

      setNewsletters(formattedData);
      setError(null);
    } catch (err: Error | unknown) {
      console.error("Error fetching newsletters:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch newsletters");
      toast.error("Failed to fetch newsletters");
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchNewsletters();
  }, []);

  // Handle search and filter changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNewsletters(searchQuery, statusFilter);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Skeletons for loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Newsletters</h1>
            <p className="text-muted-foreground">Create and manage your email newsletters</p>
          </div>
          <div className="w-[140px] h-10">
            <Skeleton className="h-10 w-52 mb-1" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Skeleton className="w-full h-10" />
          </div>
          <div className="w-[180px]">
            <Skeleton className="w-full h-10" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !isSearching && newsletters.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive opacity-70" />
          <h3 className="mt-4 text-lg font-semibold">Error loading newsletters</h3>
          <p className="text-destructive">{error}</p>
          <Button onClick={() => fetchNewsletters()} className="mt-4">
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
          <h1 className="text-3xl font-bold">Newsletters</h1>
          <p className="text-muted-foreground">Create and manage your email newsletters</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Newsletter
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search newsletters..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
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
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center p-8 border rounded-md bg-muted/20">
          <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No newsletters found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filter to find what you're looking for."
              : "Get started by creating your first newsletter."}
          </p>
          <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Newsletter
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {newsletters.map((newsletter) => (
            <Card
              key={newsletter.id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary/60" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-lg font-medium">{newsletter.name}</h3>
                {newsletter.subject && (
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    Subject: {newsletter.subject}
                  </p>
                )}
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last updated{" "}
                      {formatDistanceToNow(new Date(newsletter.updatedAt), {
                        addSuffix: true,
                      })}
                    </p>
                    <div className="mt-1 text-xs font-medium">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          newsletter?.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                        }`}
                      >
                        {newsletter?.status.charAt(0).toUpperCase() + newsletter?.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/newsletter/${newsletter.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Newsletter Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Newsletter</DialogTitle>
            <DialogDescription>
              Choose a template or start from scratch to create your newsletter.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="text-sm font-medium mb-2">Choose a starting point:</div>

            <div className="grid gap-4 md:grid-cols-2">
              <Link href="/newsletter/create?template=blank">
                <div
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-20 mb-4 bg-gray-100 rounded-md dark:bg-gray-800">
                    <Mail className="h-8 w-8 text-primary/60" />
                  </div>
                  <h4 className="text-base font-medium mb-1">Blank Canvas</h4>
                  <p className="text-sm text-muted-foreground">
                    Start from scratch with a blank template
                  </p>
                </div>
              </Link>

              <Link href="/newsletter/create?template=basic">
                <div
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-20 mb-4 bg-gray-100 rounded-md dark:bg-gray-800">
                    <LayoutTemplate className="h-8 w-8 text-primary/60" />
                  </div>
                  <h4 className="text-base font-medium mb-1">Basic Newsletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Start with our basic newsletter template
                  </p>
                </div>
              </Link>

              <Link href="/newsletter/create?template=announcement">
                <div
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-20 mb-4 bg-gray-100 rounded-md dark:bg-gray-800">
                    <PlusCircle className="h-8 w-8 text-primary/60" />
                  </div>
                  <h4 className="text-base font-medium mb-1">Announcement</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for product or feature announcements
                  </p>
                </div>
              </Link>

              <Link href="/newsletter/create?template=digest">
                <div
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center h-20 mb-4 bg-gray-100 rounded-md dark:bg-gray-800">
                    <Filter className="h-8 w-8 text-primary/60" />
                  </div>
                  <h4 className="text-base font-medium mb-1">Weekly Digest</h4>
                  <p className="text-sm text-muted-foreground">
                    Perfect for summarizing content or updates
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
