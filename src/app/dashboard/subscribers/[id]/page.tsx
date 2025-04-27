"use client";

import { useState, useEffect, useCallback } from "react"; // Import useCallback
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Info } from "lucide-react"; // Added Info icon
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { SubscriberForm } from "@/components/subscribers/subscriber-form"; // Assuming this component exists and handles its own props correctly
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose for explicit cancel
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert

// --- Define Subscriber Types ---
interface Subscriber {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "active" | "unsubscribed" | "bounced" | string; // Specific statuses + string fallback
  tags: string[] | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

// Data type for updates, omitting read-only fields
type UpdateSubscriberData = Partial<Omit<Subscriber, "id" | "createdAt" | "updatedAt">>;

// Type for parameters from the router
type PageParams = {
  id?: string; // ID might be undefined initially or on error
};

// --- Component ---
export default function SubscriberDetailPage() {
  // Use typed params
  const params = useParams() as PageParams; // Assert type if confident, or check undefined
  const router = useRouter();
  const { toast } = useToast();
  // Use the specific Subscriber type for state
  const [subscriber, setSubscriber] = useState<Subscriber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // State for fetch error message
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State for update submission
  const [isDeleting, setIsDeleting] = useState(false); // State for delete operation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const subscriberId = params.id; // Extract ID for dependency array

  const fetchSubscriber = useCallback(async () => {
    // Guard against fetching without an ID
    if (!subscriberId) {
      setError("Subscriber ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors
    try {
      const response = await fetch(`/api/subscribers/${subscriberId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Subscriber not found.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Failed to fetch subscriber (status ${response.status})`
        );
      }

      // Expect the API to return data matching the Subscriber interface
      const data: Subscriber = await response.json();
      setSubscriber(data);
    } catch (fetchError: unknown) {
      // Catch as unknown
      console.error("Error fetching subscriber:", fetchError);
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "An unknown error occurred while fetching.";
      setError(errorMessage); // Set error message for display
      setSubscriber(null); // Ensure subscriber is null on error
      toast({
        title: "Error Loading Subscriber",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    // Include subscriberId and toast in dependencies
  }, [subscriberId, toast]);

  useEffect(() => {
    fetchSubscriber();
  }, [fetchSubscriber]); // Depend on the memoized fetch function

  // Handle updates, expecting data of type UpdateSubscriberData
  const handleUpdate = async (data: UpdateSubscriberData) => {
    if (!subscriberId) return; // Guard clause

    setIsSubmitting(true); // Set submitting state
    try {
      const response = await fetch(`/api/subscribers/${subscriberId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // Send validated data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Failed to update subscriber (status ${response.status})`
        );
      }

      // Expect the updated subscriber object back
      const updatedSubscriber: Subscriber = await response.json();
      setSubscriber(updatedSubscriber); // Update local state
      setIsEditing(false); // Exit editing mode

      toast({
        title: "Update Successful",
        description: "Subscriber details have been updated.",
      });
    } catch (updateError: unknown) {
      // Catch as unknown
      console.error("Error updating subscriber:", updateError);
      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : "An unknown error occurred during update.";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleDelete = async () => {
    if (!subscriberId) return; // Guard clause

    setIsDeleting(true); // Indicate deletion is in progress
    try {
      const response = await fetch(`/api/subscribers/${subscriberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        // Handle 404 (already deleted) gracefully?
        if (response.status === 404) {
          toast({ title: "Not Found", description: "Subscriber was already deleted." });
          router.push("/dashboard/subscribers");
          return;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData?.message || `Failed to delete subscriber (status ${response.status})`
        );
      }

      toast({
        title: "Deletion Successful",
        description: "Subscriber has been permanently deleted.",
      });
      setIsDeleteDialogOpen(false); // Close dialog
      router.push("/dashboard/subscribers"); // Redirect after successful deletion
    } catch (deleteError: unknown) {
      // Catch as unknown
      console.error("Error deleting subscriber:", deleteError);
      const errorMessage =
        deleteError instanceof Error
          ? deleteError.message
          : "An unknown error occurred during deletion.";
      toast({
        title: "Deletion Failed",
        description: errorMessage,
        variant: "destructive",
      });
      setIsDeleteDialogOpen(false); // Close dialog even on error
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  // --- Render Loading State ---
  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" /> {/* Skeleton for title */}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              {" "}
              <Skeleton className="h-6 w-40 mb-2" /> <Skeleton className="h-4 w-full" />{" "}
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter>
              {" "}
              <Skeleton className="h-10 w-24 ml-auto" />{" "}
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              {" "}
              <Skeleton className="h-6 w-32 mb-2" /> <Skeleton className="h-4 w-full" />{" "}
            </CardHeader>
            <CardContent>
              {" "}
              <Skeleton className="h-24 w-full" />{" "}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Render Error State ---
  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subscribers">
              {" "}
              <ArrowLeft className="h-4 w-4" />{" "}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-destructive">Error</h1>
        </div>
        <Alert variant="destructive">
          <Info className="h-4 w-4" /> {/* Use Info or AlertTriangle */}
          <AlertTitle>Could Not Load Subscriber</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" onClick={fetchSubscriber}>
          Retry Fetch
        </Button>
      </div>
    );
  }

  // --- Render Not Found State (Specific Case) ---
  if (!subscriber) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/subscribers">
              {" "}
              <ArrowLeft className="h-4 w-4" />{" "}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Subscriber Not Found</h1>
        </div>
        <p className="text-muted-foreground">
          The requested subscriber does not exist or could not be loaded.
        </p>
      </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" className="h-8 w-8" asChild>
            <Link href="/dashboard/subscribers" aria-label="Back to subscribers list">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Subscriber Details</h1>
        </div>
        {/* Show Delete button only when not editing */}
        {!isEditing && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Details / Edit Form */}
        <div className="lg:col-span-2">
          <Card>
            {isEditing ? (
              <>
                <CardHeader>
                  <CardTitle>Edit Subscriber</CardTitle>
                  <CardDescription>Update the subscriber&apos;s information.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Pass typed initial data and handlers */}
                  <SubscriberForm
                    // Ensure SubscriberForm accepts this type or adapt as needed
                    initialData={{
                      email: subscriber.email,
                      firstName: subscriber.firstName ?? "", // Default null to empty string for form
                      lastName: subscriber.lastName ?? "", // Default null to empty string for form
                      // @ts-expect-error - subscriber is compatible with SubscriberForm
                      status: subscriber.status,
                      // Ensure tags are always an array for the form
                      tags: Array.isArray(subscriber.tags) ? subscriber.tags : [],
                    }}
                    // @ts-expect-error - subscriber is compatible with SubscriberForm
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                    isSubmitting={isSubmitting} // Pass submitting state to form if it uses it
                  />
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader>
                  {/* Removed Description - details are below */}
                  <CardTitle className="flex items-center justify-between">
                    <span>Subscriber Information</span>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      {/* Use Edit icon */}
                      <Save className="mr-1.5 h-4 w-4" /> Edit
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    {" "}
                    {/* Definition list */}
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-muted-foreground">Email</dt>
                      <dd className="mt-1">{subscriber.email}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">First Name</dt>
                      <dd className="mt-1">
                        {subscriber.firstName || (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Last Name</dt>
                      <dd className="mt-1">
                        {subscriber.lastName || (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Status</dt>
                      <dd className="mt-1">
                        {/* Status Badge */}
                        <Badge
                          variant={
                            // Use variant for better semantic styling
                            subscriber.status === "active"
                              ? "outline"
                              : subscriber.status === "unsubscribed"
                                ? "outline"
                                : subscriber.status === "bounced"
                                  ? "destructive"
                                  : "secondary" // Default/unknown status style
                          }
                          className="capitalize" // Capitalize first letter
                        >
                          {subscriber.status}
                        </Badge>
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-muted-foreground">Added On</dt>
                      <dd className="mt-1">
                        {new Date(subscriber.createdAt).toLocaleDateString(undefined, {
                          // Use user's locale
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-muted-foreground">Tags</dt>
                      <dd className="mt-1 flex flex-wrap gap-1">
                        {/* Check if tags is an array and has items */}
                        {Array.isArray(subscriber.tags) && subscriber.tags.length > 0 ? (
                          subscriber.tags.map(
                            (
                              tag: string // Type is inferred as string
                            ) => (
                              <Badge key={tag} variant="secondary">
                                {" "}
                                {/* Secondary variant */}
                                {tag}
                              </Badge>
                            )
                          )
                        ) : (
                          <span className="text-muted-foreground italic">No tags</span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
                {/* Footer removed as Edit button is now in header */}
                {/* <CardFooter className="flex justify-end"></CardFooter> */}
              </>
            )}
          </Card>
        </div>

        {/* Right Column: Activity (Placeholder) */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent engagement and events.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-md">
                <p>Activity data coming soon!</p>
                {/* Example: <p>Opened: Campaign X (Yesterday)</p> */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete the subscriber{" "}
              <strong className="font-medium">{subscriber.email}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            {/* explicit close button is sometimes clearer */}
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {
                isDeleting && (
                  <Skeleton className="h-4 w-4 mr-2 rounded-full animate-spin" />
                ) /* Use Skeleton for spinner effect */
              }
              {isDeleting ? "Deleting..." : "Yes, Delete Subscriber"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
