"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit, Trash2, Code, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { FormValues } from "@/components/subscribers/FormBuilder";
import { useToast } from "@/components/ui/use-toast";

type SubscriptionForm = FormValues & {
  id: string;
  status: "active" | "inactive" | "archived";
  formKey: string;
  views: number;
  submissions: number;
  conversionRate?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export default function FormDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState<SubscriptionForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchFormDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, this would fetch from an API
        const response = await fetch(`/api/forms/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load form details");
        }

        const data = await response.json();
        setForm(data);

        toast({
          title: "Form loaded",
          description: "Form details loaded successfully",
        });
      } catch (error) {
        console.error("Error fetching form details:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load form details. Please try again.";

        setError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetails();
  }, [id, toast]);

  const handlePreview = () => {
    if (form) {
      // Store form values in session storage for preview
      if (typeof window !== "undefined") {
        sessionStorage.setItem("formPreview", JSON.stringify(form));
        window.open("/dashboard/subscribers/forms/preview", "_blank");

        toast({
          title: "Preview opened",
          description: "Form preview has been opened in a new tab",
        });
      }
    }
  };

  const handleDelete = async () => {
    if (!form) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${form.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete form");
      }

      toast({
        title: "Form deleted",
        description: "Your form has been successfully deleted",
      });

      router.push("/dashboard/subscribers/forms");
    } catch (error) {
      console.error("Error deleting form:", error);
      toast({
        title: "Error",
        description: "Failed to delete form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Form</h1>
          <p className="text-muted-foreground mb-6">{error || "Form not found"}</p>
          <Link href="/dashboard/subscribers/forms" passHref>
            <Button>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Forms
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/dashboard/subscribers/forms" passHref>
            <Button variant="ghost" className="p-0 h-auto mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Forms
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">{form.name}</h1>
          {form.description && <p className="text-muted-foreground mt-1">{form.description}</p>}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Link href={`/dashboard/subscribers/forms/${id}/edit`} passHref>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Form
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={form.status === "active" ? "secondary" : "outline"}>
                    {form.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Form Fields</span>
                  <span>{form.fields.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Double Opt-in</span>
                  <span>{form.settings.doubleOptIn ? "Enabled" : "Disabled"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Created</span>
                  <span>{new Date(form.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span>{new Date(form.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {form.fields.map((field) => (
                  <div key={field.id} className="border p-4 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{field.label}</span>
                      <Badge>{field.type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {field.required ? "Required" : "Optional"}
                      {field.placeholder && ` • Placeholder: ${field.placeholder}`}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="text-2xl font-bold">{form.views}</div>
                  <div className="text-sm text-muted-foreground">Total Views</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{form.submissions}</div>
                  <div className="text-sm text-muted-foreground">Submissions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{form.conversionRate?.toFixed(1) || 0}%</div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Design Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: form.style.primaryColor }}
                  ></div>
                  <span className="text-sm">Primary Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: form.style.backgroundColor }}
                  ></div>
                  <span className="text-sm">Background Color</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Font</span>
                  <span>{form.style.fontFamily.split(",")[0]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Button Style</span>
                  <span className="capitalize">{form.style.buttonStyle}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this form?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your form and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner className="mr-2" size="sm" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
