"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; // Although Link is imported, it's not used. Consider removing it.
import { useRouter } from "next/navigation";
import { Edit, Trash2, Plus, QrCode, Code, LineChart, Eye, Copy } from "lucide-react"; // QrCode not used
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
  DialogClose, // DialogClose not used
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle } from "lucide-react"; // Import AlertTriangle for error display

// --- Types remain the same ---
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
// --- End Types ---

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
  const [isOnline, setIsOnline] = useState(true); // Assume online initially
  const router = useRouter();
  const { toast } = useToast();

  // Check if browser is online
  useEffect(() => {
    // Set initial online status only after component mounts
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      if (!isOnline) {
        // Only trigger if status changes to online
        setIsOnline(true);
        toast({
          title: "You&apos;re back online", // JS String - no escaping needed
          description: "Refreshing your forms...",
        });
        fetchForms(); // Fetch forms when coming back online
      }
    };

    const handleOffline = () => {
      if (isOnline) {
        // Only trigger if status changes to offline
        setIsOnline(false);
        toast({
          title: "You&apos;re offline", // JS String - no escaping needed
          description: "Please check your connection. Some features might be unavailable.",
          variant: "destructive",
        });
        setError("You&apos;re currently offline. Check your internet connection."); // Set error state when offline
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast, isOnline]); // Add isOnline to dependency array

  // Fetch forms on component mount or when online status changes to true
  useEffect(() => {
    if (isOnline) {
      fetchForms();
    }
  }, [isOnline]); // Re-fetch when isOnline becomes true

  const fetchForms = async () => {
    // Clear previous error when attempting fetch
    setError(null);

    // Don&apos;t proceed if offline, let the offline handler manage the message
    if (!navigator.onLine) {
      setIsOnline(false);
      setError(
        "You&apos;re currently offline. Please check your internet connection and try again."
      ); // JS String - no escaping needed
      setIsLoading(false); // Ensure loading stops if fetch is skipped
      return;
    }

    setIsLoading(true);
    setIsMockData(false);

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
          title: "Demo Mode Active", // Changed title for clarity
          description:
            "Showing sample data. The database might be unavailable or this is a demo environment.", // Updated description
          variant: "default", // Use default variant for info
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
          stack: error.stack, // Be mindful of logging stack traces in production
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add a retry function (removed exponential backoff for simplicity here)
  const retryFetch = () => {
    toast({
      title: "Retrying...",
      description: "Attempting to reconnect and fetch forms.",
    });
    fetchForms();
  };

  const generateEmbedCode = async (formId: string) => {
    setEmbedCode(null); // Clear previous code while generating
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
        title: "Embed Code Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Code copied to clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast({
          title: "Copy Failed",
          description: "Could not copy code to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleDelete = async (formId: string) => {
    setIsDeleting(formId);

    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      });

      // Handle cases where the form is already gone (404) or deletion is successful
      if (response.ok || response.status === 404) {
        // Update the forms list immediately
        setForms((prevForms) => prevForms.filter((form: any) => form.id !== formId));

        toast({
          title: "Success",
          description:
            response.status === 404
              ? "Form was already removed or does not exist."
              : "Subscription form deleted successfully.",
        });
      } else {
        // Handle other errors (like 500, 403, etc.)
        const errorData = await response.json().catch(() => null);
        const statusText = response.statusText || "Unknown error";
        const errorMessage =
          errorData?.error || `Server responded with ${response.status}: ${statusText}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete the form";

      toast({
        title: "Deletion Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(null);
      setShowDeleteDialog(false); // Ensure dialog closes regardless of outcome
      setSelectedForm(null); // Clear selected form
    }
  };

  const confirmDelete = (form: SubscriptionForm) => {
    setSelectedForm(form);
    setShowDeleteDialog(true);
  };

  const calculateConversionRate = (form: SubscriptionForm) => {
    if (!form.views || form.views <= 0) return "0.0"; // Return string for consistency
    // Ensure submissions is not negative or undefined
    const submissions = Math.max(0, form.submissions || 0);
    return ((submissions / form.views) * 100).toFixed(1);
  };

  const renderEmptyState = () => (
    <Card className="text-center mt-6 border-dashed">
      <CardContent className="pt-10 pb-10 flex flex-col items-center">
        <div className="rounded-full bg-primary/10 p-4 mb-6 inline-block">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl font-semibold mb-2">
          Create Your First Subscription Form
        </CardTitle>
        <CardDescription className="mb-6 max-w-sm mx-auto text-muted-foreground">
          Design a form to collect subscribers and easily embed it on your website or share a direct
          link.
        </CardDescription>
        <Button size="lg" onClick={() => router.push("/dashboard/subscribers/forms/new")}>
          <Plus className="h-5 w-5 mr-2" />
          Create New Form
        </Button>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" /> <span className="ml-3 text-muted-foreground">Loading Forms...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6 border-destructive bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" /> Error Loading Forms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-destructive">{error}</p>
          <div className="flex space-x-3">
            <Button variant="destructive" onClick={retryFetch}>
              Try Again
            </Button>
          </div>
          <div className="pt-4 border-t border-destructive/20">
            <h4 className="text-sm font-medium mb-2 text-foreground">Troubleshooting Tips</h4>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>Ensure you are connected to the internet.</li>
              <li>Verify your login session hasn&apos;t expired.</li> {/* Fixed: ' -> ' */}
              <li>Try refreshing the page (Ctrl/Cmd + R).</li>
              <li>If the problem persists, contact support or check server status.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Combine check for empty state and mock data display logic
  const showEmptyState = forms.length === 0 && !isLoading && !error;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Subscription Forms</h1>
          <p className="text-muted-foreground">Manage forms to capture new subscribers.</p>
        </div>
        <div className="flex items-center gap-2">
          {isMockData && (
            <Badge variant="outline" className="border-yellow-400 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" /> Demo Mode
            </Badge>
          )}
          <Button onClick={() => router.push("/dashboard/subscribers/forms/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {isMockData &&
        !showEmptyState && ( // Only show warning if not already in empty state
          <div
            className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-md mb-4"
            role="alert"
          >
            <p className="font-bold">Demo Mode Active</p>
            <p className="text-sm">
              {/* Fixed: You're -> You're */}
              <strong>Note:</strong> You&apos;re viewing demo data. Editing, deleting, and embedding
              might not work as expected.
            </p>
          </div>
        )}

      {showEmptyState ? (
        renderEmptyState()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {forms.map((form: any) => (
            <Card key={form.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <CardTitle className="truncate text-lg" title={form.name}>
                      <Link
                        href={`/dashboard/subscribers/forms/${form.id}`}
                        className="hover:underline"
                      >
                        {form.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {form.fields?.length ?? 0} fields • Created {/* Use nullish coalescing */}
                      {new Date(form.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant={form.status === "active" ? "secondary" : "outline"}>
                    {" "}
                    {/* Use success variant */}
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}{" "}
                    {/* Capitalize status */}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                {/* Stats Section */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Views</p>
                    <p className="text-lg font-semibold">{form.views?.toLocaleString() ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Subs</p>
                    <p className="text-lg font-semibold">
                      {form.submissions?.toLocaleString() ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Conv.</p>
                    <p className="text-lg font-semibold">{calculateConversionRate(form)}%</p>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-wrap gap-2 justify-start pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}`)}
                    disabled={isMockData}
                    aria-label={`View details for ${form.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}/edit`)}
                    disabled={isMockData}
                    aria-label={`Edit form ${form.name}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {/* Embed Dialog Trigger */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedForm(form);
                          generateEmbedCode(form.id); // Generate code when dialog opens
                        }}
                        disabled={isMockData}
                        aria-label={`Get embed code for ${form.name}`}
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    {/* Embed Dialog Content - Remains inside the map loop, tied to trigger */}
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Embed Form: {selectedForm?.name}</DialogTitle>{" "}
                        {/* Dialog needs selectedForm state */}
                        <DialogDescription>
                          Add this form to your website using one of the methods below.
                        </DialogDescription>
                      </DialogHeader>
                      {embedCode ? (
                        <Tabs defaultValue="js" className="pt-4">
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="js">JavaScript</TabsTrigger>
                            <TabsTrigger value="html">HTML (iframe)</TabsTrigger>
                            <TabsTrigger value="link">Direct Link</TabsTrigger>
                          </TabsList>
                          <TabsContent value="js" className="mt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Paste this script tag just before the closing {"</body>"} tag. The
                              form will render where the script is placed.
                            </p>
                            <div className="relative group">
                              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono">
                                {embedCode.jsEmbed}
                              </pre>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(embedCode.jsEmbed)}
                                aria-label="Copy JavaScript embed code"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="html" className="mt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Use this iframe code to embed the form anywhere, controlling its size
                              via the `style` attribute.
                            </p>
                            <div className="relative group">
                              <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs font-mono">
                                {embedCode.htmlEmbed}
                              </pre>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyToClipboard(embedCode.htmlEmbed)}
                                aria-label="Copy HTML iframe embed code"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                          <TabsContent value="link" className="mt-4 space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Share this direct link to a page hosting only this form.
                            </p>
                            <div className="flex items-center space-x-2">
                              <Input
                                value={embedCode.directLink}
                                readOnly
                                className="flex-1 font-mono text-xs"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => copyToClipboard(embedCode.directLink)}
                                aria-label="Copy direct link"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <div className="flex justify-center items-center h-40">
                          <Spinner />{" "}
                          <span className="ml-2 text-muted-foreground">
                            Generating embed code...
                          </span>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>{" "}
                  {/* End Embed Dialog */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/dashboard/subscribers/forms/${form.id}/analytics`)}
                    disabled={isMockData}
                    aria-label={`View analytics for ${form.name}`}
                  >
                    <LineChart className="h-4 w-4" />
                  </Button>
                  {/* Moved Delete Button to end and used AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isMockData || isDeleting === form.id}
                        aria-label={`Delete form ${form.name}`}
                      >
                        {isDeleting === form.id ? (
                          <Spinner size="sm" className="h-4 w-4" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you absolutely sure you want to delete the form &quot;{form.name}
                          &quot;? This action cannot be undone and all associated submissions will
                          be lost.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(form.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isDeleting === form.id ? <Spinner size="sm" className="mr-2" /> : null}
                          Delete Form
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Note: The original Delete Confirmation Dialog outside the map is removed as it's complex to manage state for.
          Each card now has its own AlertDialog trigger and content tied to the specific form. */}
    </div>
  );
}
