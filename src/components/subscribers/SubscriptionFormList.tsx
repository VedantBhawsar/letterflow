"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, QrCode, Code, LineChart, Eye, Copy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// Import the types we need
type FormFieldType = "text" | "email" | "number" | "checkbox" | "select";

type FormField = {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
};

type FormSettings = {
  submitButtonText: string;
  successMessage: string;
  doubleOptIn: boolean;
  redirectUrl?: string;
  honeypotEnabled: boolean;
  recaptchaEnabled: boolean;
  recaptchaSiteKey?: string;
};

type FormStyle = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: "filled" | "outline" | "minimal";
};

type SubscriptionForm = {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  settings: FormSettings;
  style: FormStyle;
  status: "active" | "inactive" | "archived";
  formKey: string;
  views: number;
  submissions: number;
  conversionRate?: number;
  traffic?: Record<string, number>;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function SubscriptionFormList() {
  const [forms, setForms] = useState<SubscriptionForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [selectedForm, setSelectedForm] = useState<SubscriptionForm | null>(null);
  const [embedCode, setEmbedCode] = useState<{
    jsEmbed: string;
    htmlEmbed: string;
    directLink: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Check if browser is online
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Refreshing your forms...",
      });
      fetchForms();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Please check your connection",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  // Fetch forms on component mount
  useEffect(() => {
    if (isOnline) {
      fetchForms();
    }
  }, [isOnline]);

  const fetchForms = async () => {
    setIsLoading(true);
    setError(null);
    setIsMockData(false);

    if (!isOnline) {
      setError("You're currently offline. Please check your internet connection and try again.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/forms");

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const statusText = response.statusText || "Unknown error";
        const errorMessage =
          errorData?.error || `Server responded with ${response.status}: ${statusText}`;

        // Provide more helpful messages for common status codes
        if (response.status === 401 || response.status === 403) {
          throw new Error("Authentication error: Please log in again and try.");
        } else if (response.status === 404) {
          throw new Error(
            "The forms API endpoint could not be found. The service might be temporarily unavailable."
          );
        } else if (response.status >= 500) {
          throw new Error(
            "Server error: Our system is experiencing issues. Please try again later."
          );
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();

      // Check if the data returned is mock data
      if (data.length === 1 && data[0].id === "mock-form-1") {
        setIsMockData(true);
        toast({
          title: "Demo Mode",
          description: "Showing sample data. The database may be unavailable.",
        });
      }

      setForms(data);
    } catch (error) {
      console.error("Error fetching subscription forms:", error);

      // Check for network errors specifically
      if (!navigator.onLine || (error instanceof TypeError && error.message.includes("fetch"))) {
        setError(
          "Network error: Unable to connect to the server. Please check your internet connection."
        );
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load subscription forms. Please try again.";
        setError(errorMessage);
      }

      // Log more details for debugging
      if (error instanceof Error) {
        console.debug("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a retry function with exponential backoff
  const retryFetchWithDelay = (delay = 2000) => {
    toast({
      title: "Retrying...",
      description: "Attempting to reconnect to the server",
    });

    setTimeout(() => {
      fetchForms();
    }, delay);
  };

  const generateEmbedCode = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/embed`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const statusText = response.statusText || "Unknown error";
        const errorMessage =
          errorData?.error || `Server responded with ${response.status}: ${statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setEmbedCode(data);
    } catch (error) {
      console.error("Error generating embed code:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate embed code";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const handleDelete = async (formId: string) => {
    setIsDeleting(formId);

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });

      // If the form is not found (404), we'll still remove it from the UI
      // since the end goal is achieved - the form no longer exists
      if (response.status === 404) {
        // Update the forms list to remove the form anyway
        setForms(forms.filter((form) => form.id !== formId));

        toast({
          title: "Success",
          description: "Form no longer exists in the system",
        });

        return; // Exit early
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const statusText = response.statusText || "Unknown error";
        const errorMessage =
          errorData?.error || `Server responded with ${response.status}: ${statusText}`;
        throw new Error(errorMessage);
      }

      // Update the forms list
      setForms(forms.filter((form) => form.id !== formId));

      toast({
        title: "Success",
        description: "Subscription form has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete the form";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setShowDeleteDialog(false);
    }
  };

  const confirmDelete = (form: SubscriptionForm) => {
    setSelectedForm(form);
    setShowDeleteDialog(true);
  };

  const calculateConversionRate = (form: SubscriptionForm) => {
    if (!form.views || form.views === 0) return 0;
    return ((form.submissions / form.views) * 100).toFixed(1);
  };

  const renderEmptyState = () => (
    <Card className="text-center p-8">
      <CardContent className="pt-6 flex flex-col items-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl mb-2">Create Your First Form</CardTitle>
        <CardDescription className="mb-6 max-w-md mx-auto">
          Create a subscription form that you can embed on your website to collect subscribers.
        </CardDescription>
        <Button onClick={() => router.push("/dashboard/subscribers/forms/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Subscription Form
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-lg space-y-4">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-alert-triangle"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
          <h3 className="font-semibold">Error Loading Forms</h3>
        </div>
        <p>{error}</p>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchForms} className="mt-2">
            Try Again
          </Button>
          <Button variant="outline" onClick={() => retryFetchWithDelay()} className="mt-2">
            Auto Retry
          </Button>
        </div>
        <div className="bg-muted/50 p-4 rounded-md">
          <h4 className="text-sm font-medium mb-2">Troubleshooting</h4>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Check if you're connected to the internet</li>
            <li>Verify that you have permission to access forms</li>
            <li>Try refreshing the page</li>
            <li>Clear your browser cache and cookies</li>
            <li>If the problem persists, contact support</li>
          </ul>
        </div>
      </div>
    );
  }

  if (forms.length === 0 && !isMockData) {
    return renderEmptyState();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscribers</h1>
          <p className="text-muted-foreground">Manage your newsletter subscribers</p>
        </div>{" "}
        <div className="flex items-center gap-2">
          {isMockData && (
            <div className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Demo Mode
            </div>
          )}
          <Button onClick={() => router.push("/dashboard/subscribers/forms/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {isMockData && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> You're viewing demo data because the database is currently
            unavailable. Some actions like editing or deleting forms won't work in this mode.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="truncate" title={form.name}>
                    {form.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {form.fields.length} fields • Created{" "}
                    {new Date(form.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
                <Badge variant={form.status === "active" ? "default" : "outline"}>
                  {form.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Views</p>
                  <p className="text-xl font-medium">{form.views}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md">
                  <p className="text-sm text-muted-foreground">Submissions</p>
                  <p className="text-xl font-medium">{form.submissions}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-md col-span-2">
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-xl font-medium">{calculateConversionRate(form)}%</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}`)}
                  disabled={isMockData}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}/edit`)}
                  disabled={isMockData}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedForm(form);
                        generateEmbedCode(form.id);
                      }}
                      disabled={isMockData}
                    >
                      <Code className="h-4 w-4 mr-1" />
                      Embed
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Embed Form: {selectedForm?.name}</DialogTitle>
                      <DialogDescription>
                        Copy and paste this code to embed the form on your website.
                      </DialogDescription>
                    </DialogHeader>

                    {embedCode ? (
                      <Tabs defaultValue="js">
                        <TabsList className="w-full grid grid-cols-3">
                          <TabsTrigger value="js">JavaScript</TabsTrigger>
                          <TabsTrigger value="html">HTML</TabsTrigger>
                          <TabsTrigger value="link">Direct Link</TabsTrigger>
                        </TabsList>

                        <TabsContent value="js" className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Add this code right before the closing {"</body>"} tag on your website.
                            It will display your form inline where the script is placed.
                          </p>
                          <div className="relative">
                            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-xs">
                              {embedCode.jsEmbed}
                            </pre>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(embedCode.jsEmbed)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="html" className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Use this HTML iframe code to embed the form anywhere on your website.
                          </p>
                          <div className="relative">
                            <pre className="bg-muted/50 p-4 rounded-md overflow-x-auto text-xs">
                              {embedCode.htmlEmbed}
                            </pre>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => copyToClipboard(embedCode.htmlEmbed)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="link" className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Share this direct link to your form or redirect users to it from your
                            website/emails.
                          </p>
                          <div className="relative">
                            <div className="flex items-center">
                              <Input value={embedCode.directLink} readOnly className="flex-1" />
                              <Button
                                variant="outline"
                                className="ml-2"
                                onClick={() => copyToClipboard(embedCode.directLink)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="flex justify-center py-8">
                        <Spinner />
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}/analytics`)}
                  disabled={isMockData}
                >
                  <LineChart className="h-4 w-4 mr-1" />
                  Analytics
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}/preview`)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDelete(form)}
                  disabled={isMockData}
                >
                  {isDeleting === form.id ? (
                    <Spinner size="sm" className="mr-1" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subscription Form</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedForm?.name}&quot;? This action cannot
              be undone and will remove all data associated with this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedForm && handleDelete(selectedForm.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Spinner size="sm" className="mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
