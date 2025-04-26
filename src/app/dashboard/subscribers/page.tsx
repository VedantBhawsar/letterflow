"use client";

import { useState } from "react";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { SubscriberList } from "@/components/subscribers/subscriber-list";
import { ImportExport } from "@/components/subscribers/import-export";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SubscriberForm } from "@/components/subscribers/subscriber-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus as PlusIcon, Tag as TagIcon, Users as UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { SegmentList } from "@/components/subscribers/segment-list";

export default function SubscribersPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const handleAddSubscriber = async (data: any) => {
    try {
      const response = await fetch("/api/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add subscriber");
      }

      toast({
        title: "Success",
        description: "Subscriber added successfully",
      });

      setIsAddDialogOpen(false);
      setRefreshKey((prev) => prev + 1); // Trigger refresh of subscriber list
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add subscriber",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Subscribers</h1>
        <div className="flex space-x-2">
          <ImportExport onComplete={() => setRefreshKey((prev) => prev + 1)} />
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subscriber
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            <UsersIcon className="mr-2 h-4 w-4" />
            All Subscribers
          </TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="unsubscribed">Unsubscribed</TabsTrigger>
          <TabsTrigger value="segments">
            <TagIcon className="mr-2 h-4 w-4" />
            Segments
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-6">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Subscriber</DialogTitle>
          </DialogHeader>
          <SubscriberForm
            onSubmit={handleAddSubscriber}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
