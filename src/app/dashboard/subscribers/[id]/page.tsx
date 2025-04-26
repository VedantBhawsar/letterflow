"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SubscriberForm } from "@/components/subscribers/subscriber-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

export default function SubscriberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [subscriber, setSubscriber] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchSubscriber = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/subscribers/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch subscriber");
      }

      const data = await response.json();
      setSubscriber(data);
    } catch (error) {
      console.error("Error fetching subscriber:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriber details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriber();
  }, [params.id]);

  const handleUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/subscribers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update subscriber");
      }

      const updatedSubscriber = await response.json();
      setSubscriber(updatedSubscriber);
      setIsEditing(false);

      toast({
        title: "Success",
        description: "Subscriber updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscriber",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/subscribers/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete subscriber");
      }

      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });

      router.push("/dashboard/subscribers");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subscribers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Loading subscriber details...</h1>
        </div>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subscribers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Subscriber not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subscribers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Subscriber Details</h1>
        </div>
        <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Subscriber
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Information</CardTitle>
            <CardDescription>View and edit subscriber details</CardDescription>
          </CardHeader>

          {isEditing ? (
            <CardContent>
              <SubscriberForm
                initialData={{
                  id: subscriber.id,
                  email: subscriber.email,
                  firstName: subscriber.firstName,
                  lastName: subscriber.lastName,
                  status: subscriber.status,
                  tags: subscriber.tags,
                }}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
              />
            </CardContent>
          ) : (
            <>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className="text-sm font-medium">Email</div>
                    <div className="mt-1">{subscriber.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">First Name</div>
                    <div className="mt-1">{subscriber.firstName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Last Name</div>
                    <div className="mt-1">{subscriber.lastName || "-"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Status</div>
                    <div className="mt-1">
                      <Badge
                        className={
                          subscriber.status === "active"
                            ? "bg-green-100 text-green-800"
                            : subscriber.status === "unsubscribed"
                              ? "bg-gray-100 text-gray-800"
                              : subscriber.status === "bounced"
                                ? "bg-red-100 text-red-800"
                                : "bg-amber-100 text-amber-800"
                        }
                      >
                        {subscriber.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Date Added</div>
                    <div className="mt-1">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm font-medium">Tags</div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {subscriber.tags && subscriber.tags.length > 0
                        ? subscriber.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        : "-"}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={() => setIsEditing(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  Edit Subscriber
                </Button>
              </CardFooter>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Subscriber engagement and activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              Activity tracking will be implemented in a future update.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscriber</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
