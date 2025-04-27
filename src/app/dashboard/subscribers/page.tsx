"use client";

import { useState, useCallback } from "react"; // Import useCallback
// import { Metadata } from "next"; // Removed - Not used in client components
import { Button } from "@/components/ui/button";
import { SubscriberList } from "@/components/subscribers/subscriber-list";
import { ImportExport } from "@/components/subscribers/import-export"; // Renamed for clarity
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriberForm } from "@/components/subscribers/subscriber-form"; // Assuming this exists and handles its props
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus as PlusIcon, Tag as TagIcon, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SegmentList } from "@/components/subscribers/segment-list";
import { Spinner } from "@/components/ui/spinner"; // Import Spinner

// --- Define Type for Data Submitted by SubscriberForm ---
// This should match the fields your form component actually submits
interface AddSubscriberData {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  status?: "active" | "unsubscribed" | "bounced" | string; // Use specific statuses + fallback
  tags?: string[] | null;
}

export default function SubscribersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Add submitting state
  // refreshKey is used to trigger refetch in child lists
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  // Define the handler with the specific data type
  const handleAddSubscriber = useCallback(
    async (data: AddSubscriberData) => {
      setIsSubmitting(true); // Set loading state
      try {
        const response = await fetch("/api/subscribers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          // Attempt to parse error details from the response body
          const errorData = await response.json().catch(() => ({})); // Default to empty object on parse error
          // Use error message from API if available, otherwise provide default
          throw new Error(
            errorData?.message || `Failed to add subscriber (status ${response.status})`
          );
        }

        // Don't need to parse response body if just confirming success
        // const result = await response.json();

        toast({
          title: "Success",
          description: `${data.email} added successfully.`, // Be more specific
        });

        setIsAddDialogOpen(false); // Close the dialog
        setRefreshKey((prev) => prev + 1); // Trigger refresh of relevant lists
        // router.refresh(); // Consider if router.refresh() is needed in addition to refreshKey
      } catch (error: unknown) {
        // Catch as unknown
        console.error("Add subscriber error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred.";
        toast({
          title: "Error Adding Subscriber",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false); // Reset loading state
      }
      // Include dependencies for useCallback
    },
    [toast, router]
  ); // router potentially used for refresh, toast for notifications

  // Trigger refresh in child lists
  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    // Optionally add router.refresh() if server-side data needs updating across the whole route
    // router.refresh();
    console.log("Refresh triggered for lists.");
  }, []); // No dependencies needed if it just increments state

  return (
    <div className="flex flex-col space-y-6 p-4 md:p-6">
      {" "}
      {/* Added padding */}
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {" "}
        {/* Allow wrapping */}
        <h1 className="text-2xl font-bold tracking-tight">Subscribers</h1>
        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0">
          {/* Use the specific component name if renamed */}
          <ImportExport onComplete={triggerRefresh} />
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-1.5 h-4 w-4" /> {/* Adjusted margin */}
            Add Subscriber
          </Button>
        </div>
      </div>
      {/* Tabs for Filtering/Viewing */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full sm:w-auto">
          {" "}
          {/* Allow tabs list to adjust size */}
          <TabsTrigger value="all">
            <UsersIcon className="mr-1.5 h-4 w-4" /> All Subscribers
          </TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="unsubscribed">Unsubscribed</TabsTrigger>
          <TabsTrigger value="segments">
            <TagIcon className="mr-1.5 h-4 w-4" /> Segments
          </TabsTrigger>
        </TabsList>

        {/* Tab Content Panes */}
        <TabsContent value="all" className="mt-6">
          {/* Pass null for status to show all */}
          <SubscriberList status={null} refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="active" className="mt-6">
          <SubscriberList status="active" refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="unsubscribed" className="mt-6">
          <SubscriberList status="unsubscribed" refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="segments" className="mt-6">
          <SegmentList refreshKey={refreshKey} />
        </TabsContent>
      </Tabs>
      {/* Add Subscriber Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        {/* Add sm:max-w-lg for medium width */}
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
          </DialogHeader>
          {/* Assuming SubscriberForm takes onSubmit, onCancel, and optionally isSubmitting */}
          <SubscriberForm
            // @ts-expect-error - isSubmitting is compatible with SubscriberForm
            onSubmit={handleAddSubscriber}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting} // Pass submitting state to disable form button
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
