"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PlusCircle,
  Search,
  Mail,
  Filter,
  Loader2,
  LayoutTemplate,
  AlertTriangle, // Changed from AlertCircle for consistency with other error states
  Newspaper, // Using Newspaper for generic newsletter icon
  Sparkles, // For announcement or featured
  FileText, // For blank canvas
  ListChecks, // For digest
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, // Added SelectValue
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using CardHeader, CardTitle for structure
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is your toast library
import { useRouter } from "next/navigation";
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

// Define the Newsletter type
interface Newsletter {
  id: string;
  name: string;
  subject?: string;
  previewText?: string;
  status: "draft" | "published" | "archived" | string; // More specific status
  createdAt: Date; // Store as Date object
  updatedAt: Date; // Store as Date object
}

export default function NewslettersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all"); // Default to all
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(true); // True initially to show main skeleton
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false); // For subsequent fetches (e.g., search, filter)

  const fetchNewslettersCallback = useCallback(
    async (search: string = searchQuery, status: string = statusFilter) => {
      // Don't set setIsLoading to true here, only isFetching for subsequent loads
      if (!isLoading && newsletters.length === 0)
        setIsLoading(true); // if initial load failed, retry shows skeleton
      else setIsFetching(true);

      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (status && status !== "all") params.append("status", status);

        const response = await fetch(`/api/newsletters?${params.toString()}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch newsletters");
        }

        const data = await response.json();
        const formattedData = data.map((nl: any) => ({
          ...nl,
          createdAt: new Date(nl.createdAt),
          updatedAt: new Date(nl.updatedAt),
        }));

        setNewsletters(formattedData);
        setError(null);
      } catch (err: Error | unknown) {
        console.error("Error fetching newsletters:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setError(message);
        if (newsletters.length > 0) {
          // Only toast if it's not the initial blank page error
          toast.error("Failed to refresh newsletters: " + message);
        }
      } finally {
        setIsLoading(false); // Turn off initial loading skeleton
        setIsFetching(false); // Turn off subsequent loading indicators
      }
    },
    [searchQuery, statusFilter, isLoading, newsletters.length] // Add dependencies
  );

  useEffect(() => {
    fetchNewslettersCallback(); // Initial fetch
  }, []); // Empty dependency array for initial mount

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        // Avoid fetching during initial load if useEffect runs before mount effect
        fetchNewslettersCallback(searchQuery, statusFilter);
      }
    }, 500); // Debounce

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter]);

  // Skeleton for main loading state
  if (isLoading && newsletters.length === 0) {
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
            <h1 className="text-3xl font-bold text-slate-100">Newsletters</h1>
            <p className="text-slate-400">Create and manage your email newsletters</p>
          </div>
          <Skeleton className="h-10 w-full sm:w-[190px] bg-slate-700 rounded-md" />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4"
        >
          <Skeleton className="w-full h-10 bg-slate-700 rounded-md flex-1" />
          <Skeleton className="w-full sm:w-[200px] h-10 bg-slate-700 rounded-md" />
        </motion.div>
        <motion.div
          variants={itemVariants}
          className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-slate-800 border border-slate-700/50 rounded-lg">
              <Skeleton className="h-32 w-full bg-slate-700 rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 bg-slate-700 rounded" />
                <Skeleton className="h-4 w-1/2 bg-slate-700 rounded" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-4 w-1/3 bg-slate-700 rounded" />
                  <Skeleton className="h-8 w-16 bg-slate-700 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  if (error && !isFetching && newsletters.length === 0) {
    return (
      <motion.div
        className="flex flex-col h-[60vh] items-center justify-center p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-semibold text-slate-100 mb-2">Error Loading Newsletters</h2>
        <p className="text-red-400 mb-6">{error}</p>
        <Button
          onClick={() => fetchNewslettersCallback()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-md"
          disabled={isFetching}
        >
          {isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-6 p-4 sm:p-6 md:p-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Newsletters</h1>
          <p className="text-slate-400 mt-1">Create, manage, and share your latest updates.</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-md flex items-center gap-2 w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          New Newsletter
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
            placeholder="Search newsletters by name or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2 h-10 w-full bg-slate-800 border border-slate-700 text-slate-300 placeholder:text-slate-500 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
          )}
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
                value="published"
                className="text-slate-300 data-[highlighted]:bg-slate-700 data-[highlighted]:text-slate-100 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white rounded-sm px-3 py-2 cursor-pointer"
              >
                Published
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
        {newsletters.length === 0 && !isFetching ? (
          <div className="text-center py-12 sm:py-16 border border-slate-700/50 rounded-lg bg-slate-800/70 shadow-md mt-6">
            <Newspaper className="mx-auto h-16 w-16 text-slate-500 opacity-70 mb-6" />
            <h3 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-2">
              No Newsletters Found
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery || (statusFilter && statusFilter !== "all")
                ? "Try adjusting your search or filters. No newsletters match your criteria."
                : "Let's craft your first newsletter and share your story."}
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6 rounded-md flex items-center gap-2 mx-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="h-4 w-4" />
              Create First Newsletter
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsletters.map((newsletter) => (
              <Card
                key={newsletter.id}
                className="bg-slate-800 border border-slate-700/50 rounded-lg overflow-hidden transition-all duration-300 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col"
              >
                <Link href={`/newsletter/${newsletter.id}`} className="block group">
                  <div className="h-32 bg-slate-700/80 flex items-center justify-center relative group-hover:bg-slate-700 transition-colors">
                    <Newspaper className="h-12 w-12 text-emerald-500 opacity-60 group-hover:opacity-90 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 via-transparent to-transparent"></div>
                  </div>
                </Link>
                <CardContent className="p-4 flex flex-col flex-grow">
                  <Link href={`/newsletter/${newsletter.id}`} className="group">
                    <h3
                      className="text-lg font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors truncate"
                      title={newsletter.name}
                    >
                      {newsletter.name}
                    </h3>
                  </Link>
                  {newsletter.subject && (
                    <p className="text-sm text-slate-400 mt-1 truncate" title={newsletter.subject}>
                      {newsletter.subject}
                    </p>
                  )}
                  <div className="mt-auto pt-3">
                    {" "}
                    {/* Pushes content below to bottom */}
                    <div className="text-xs text-slate-500 mb-2">
                      Updated {formatDistanceToNow(newsletter.updatedAt, { addSuffix: true })}
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full
                          ${
                            newsletter.status === "published"
                              ? "bg-green-500/20 text-green-400"
                              : newsletter.status === "draft"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-slate-600/30 text-slate-400" // Default/Archived
                          }`}
                      >
                        {newsletter.status.charAt(0).toUpperCase() + newsletter.status.slice(1)}
                      </span>
                      <Link href={`/newsletter/${newsletter.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700/70 hover:text-emerald-400 hover:border-emerald-500/50 h-8 px-3 text-xs rounded-md"
                        >
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Newsletter Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl bg-slate-800 border border-slate-700 text-slate-300 rounded-lg shadow-2xl">
          <DialogHeader className="pb-4 border-b border-slate-700/50 px-6 pt-6">
            <DialogTitle className="text-lg font-semibold text-slate-100">
              Create New Newsletter
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400 mt-1">
              Choose a starting point for your newsletter or begin with a blank canvas.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              {[
                {
                  title: "Blank Canvas",
                  desc: "Start from scratch.",
                  icon: FileText,
                  template: "blank",
                },
                {
                  title: "Basic Layout",
                  desc: "A simple, clean structure.",
                  icon: LayoutTemplate,
                  template: "basic",
                },
                {
                  title: "Announcement",
                  desc: "Highlight news or updates.",
                  icon: Sparkles,
                  template: "announcement",
                },
                {
                  title: "Weekly Digest",
                  desc: "Summarize content nicely.",
                  icon: ListChecks,
                  template: "digest",
                },
              ].map((item) => (
                <Link
                  key={item.template}
                  href={`/newsletter/create?template=${item.template}`}
                  passHref
                >
                  <div
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="group border border-slate-700 rounded-lg p-4 hover:bg-slate-700/30 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer flex flex-col h-full"
                  >
                    <div className="flex items-center justify-center h-20 mb-4 bg-slate-700/50 rounded-md group-hover:bg-slate-700 transition-colors">
                      <item.icon className="h-8 w-8 text-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h4 className="text-base font-medium text-slate-200 mb-1 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 flex-grow">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
