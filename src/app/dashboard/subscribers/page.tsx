"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SubscriberList } from "@/components/subscribers/subscriber-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriberForm } from "@/components/subscribers/subscriber-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Tag,
  Users,
  Search,
  ArrowUpToLine,
  ArrowDownToLine,
  FolderArchive,
} from "lucide-react"; // Added FolderArchive for empty state
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SegmentList } from "@/components/subscribers/segment-list";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07, // Slightly faster stagger
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 }, // Slightly less y travel
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }, // Slightly faster, easeOut
  },
};

interface AddSubscriberData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status?: "active" | "unsubscribed" | "bounced" | "complained" | string;
  tags?: string[] | null;
}

interface SubscriberListProps {
  status: string;
  segmentId?: string;
  refreshKey?: number;
  searchQuery?: string;
  emptyStateMessage?: React.ReactNode;
}

export default function SubscribersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false); // Example for Import
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false); // Example for Export
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleAddSubscriber = useCallback(
    async (data: unknown) => {
      setIsSubmitting(true);
      try {
        const subscriberData = data as AddSubscriberData;
        const response = await fetch("/api/subscribers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscriberData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData?.message || `Failed to add subscriber (status ${response.status})`
          );
        }

        toast({
          title: "Success",
          description: `${subscriberData.email} added successfully.`,
          variant: "default", // or success if you have one
        });

        setIsAddDialogOpen(false);
        setRefreshKey((prev) => prev + 1);
      } catch (error: unknown) {
        console.error("Add subscriber error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
          title: "Error Adding Subscriber",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast] // Removed router as it wasn't used in this callback
  );

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    toast({ title: "Refreshed", description: "Subscriber lists have been updated." });
    console.log("Refresh triggered for lists.");
  }, [toast]);

  // Dummy handlers for import/export dialogs
  const handleImport = () => {
    // Logic for import
    toast({ title: "Import Success (Placeholder)", description: "Subscribers imported." });
    setIsImportDialogOpen(false);
    triggerRefresh();
  };

  const handleExport = () => {
    // Logic for export
    toast({
      title: "Export Started (Placeholder)",
      description: "Subscriber export is processing.",
    });
    setIsExportDialogOpen(false);
  };

  return (
    <motion.div
      className="space-y-8 p-4 sm:p-6 md:p-8" // Responsive padding
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        variants={itemVariants}
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-white">Subscribers</h1>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-10 px-4 rounded-md flex items-center gap-2"
            onClick={() => setIsImportDialogOpen(true)} // Changed from triggerRefresh
          >
            <ArrowUpToLine className="h-4 w-4 text-slate-400" />
            Import
          </Button>

          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-10 px-4 rounded-md flex items-center gap-2"
            onClick={() => setIsExportDialogOpen(true)} // Changed from triggerRefresh
          >
            <ArrowDownToLine className="h-4 w-4 text-slate-400" />
            Export
          </Button>

          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-md flex items-center gap-2" // Ensure rounded-md for consistency
          >
            <Plus className="h-4 w-4" />
            Add Subscriber
          </Button>
        </div>
      </motion.div>

      {/* Tabs Navigation */}
      <motion.div variants={itemVariants}>
        <div className="rounded-lg bg-slate-800 border border-slate-700/50 shadow-lg">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex w-full bg-slate-800 p-1 h-auto rounded-t-lg border-b border-slate-700/50 overflow-x-auto">
              <TabsTrigger
                value="all"
                className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-white data-[state=active]:bg-slate-700/50 data-[state=active]:text-emerald-400 rounded-md data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Users className="h-4 w-4" />
                <span>All</span>
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-white data-[state=active]:bg-slate-700/50 data-[state=active]:text-emerald-400 rounded-md data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <span>Active</span>
              </TabsTrigger>
              <TabsTrigger
                value="unsubscribed"
                className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-white data-[state=active]:bg-slate-700/50 data-[state=active]:text-emerald-400 rounded-md data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <span>Unsubscribed</span>
              </TabsTrigger>
              <TabsTrigger
                value="segments"
                className="flex-1 px-3 py-2.5 text-sm font-medium text-slate-200 hover:text-white data-[state=active]:bg-slate-700/50 data-[state=active]:text-emerald-400 rounded-md data-[state=active]:shadow-sm flex items-center justify-center gap-2"
              >
                <Tag className="h-4 w-4" />
                <span>Segments</span>
              </TabsTrigger>
            </TabsList>

            {/* Search Bar & Refresh */}
            <div className="p-4 border-b border-slate-700/50 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-grow w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search subscribers by email or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 h-10 w-full bg-slate-900/70 border border-slate-700 text-white placeholder:text-slate-400 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={triggerRefresh}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50 w-full sm:w-auto"
              >
                Refresh List
              </Button>
            </div>

            {/* Tab Content Panes */}
            <TabsContent value="all" className="p-4 sm:p-6 min-h-[300px]">
              {/* Example of better empty state, assuming SubscriberList handles its own empty state */}
              <SubscriberList
                status="all"
                searchQuery={searchQuery}
                refreshKey={refreshKey}
                emptyStateMessage={
                  <div className="text-center py-10">
                    <FolderArchive className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No Subscribers Yet</h2>
                    <p className="text-sm text-slate-300 mb-4">
                      Add your first subscriber or import a list to get started.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Subscriber
                    </Button>
                  </div>
                }
              />
            </TabsContent>
            <TabsContent value="active" className="p-4 sm:p-6 min-h-[300px]">
              <SubscriberList status="active" searchQuery={searchQuery} refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="unsubscribed" className="p-4 sm:p-6 min-h-[300px]">
              <SubscriberList
                status="unsubscribed"
                searchQuery={searchQuery}
                refreshKey={refreshKey}
              />
            </TabsContent>
            <TabsContent value="segments" className="p-4 sm:p-6 min-h-[300px]">
              <SegmentList refreshKey={refreshKey} />{" "}
              {/* Assuming SegmentList handles search internally or props */}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>

      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-800 border border-slate-700 text-white rounded-lg shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-white font-semibold text-lg">
              Add New Subscriber
            </DialogTitle>
          </DialogHeader>
          <SubscriberForm
            onSubmit={handleAddSubscriber}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Placeholder Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-800 border border-slate-700 text-white rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold text-lg">
              Import Subscribers
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-300">
            {/* Actual import form/component would go here */}
            <p>Import functionality placeholder. You can upload a CSV file here.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsImportDialogOpen(false)}
                className="text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Start Import
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Placeholder Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-800 border border-slate-700 text-white rounded-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold text-lg">
              Export Subscribers
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-300">
            {/* Actual export options would go here */}
            <p>Configure your export options below.</p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsExportDialogOpen(false)}
                className="text-slate-300 hover:bg-slate-700 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Confirm Export
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
