"use client";

import { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Mail,
  Filter,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

// Mock data for newsletters
const mockNewsletters = [
  {
    id: "1",
    name: "Monthly Customer Newsletter",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    status: "draft",
    template: "basic",
  },
  {
    id: "2",
    name: "Product Update",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    status: "published",
    template: "announcement",
  },
  {
    id: "3",
    name: "Weekly Digest",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    status: "published",
    template: "digest",
  },
];

export default function NewslettersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newsletters, setNewsletters] = useState(mockNewsletters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate data fetching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Filter newsletters based on search and status
  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = newsletter.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      statusFilter === "all" ||
      newsletter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Newsletters</h1>
            <p className="text-muted-foreground">
              Create and manage your email newsletters
            </p>
          </div>
          <div className="w-[140px] h-10">
            <Skeleton className="h-10 w-52 mb-1" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Skeleton className="w-full h-8" />
          </div>
          <div className="w-[180px]">
            <Skeleton className="w-full h-8" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Newsletters</h1>
          <p className="text-muted-foreground">
            Create and manage your email newsletters
          </p>
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

      {filteredNewsletters.length === 0 ? (
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
          {filteredNewsletters.map((newsletter) => (
            <Card
              key={newsletter.id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
                <Mail className="h-10 w-10 text-primary/60" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium">{newsletter.name}</h3>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Last updated{" "}
                      {formatDistanceToNow(newsletter.updatedAt, {
                        addSuffix: true,
                      })}
                    </p>
                    <div className="mt-1 text-xs font-medium">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          newsletter.status === "published"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400"
                        }`}
                      >
                        {newsletter.status.charAt(0).toUpperCase() +
                          newsletter.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <Link href={`/newsletter/${newsletter.id}`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
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
            <div className="text-sm font-medium mb-2">
              Choose a starting point:
            </div>

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
                  <h4 className="text-base font-medium mb-1">
                    Basic Newsletter
                  </h4>
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
