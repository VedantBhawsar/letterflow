"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { FormBuilder, FormValues } from "@/components/subscribers/FormBuilder";
import { useToast } from "@/components/ui/use-toast";

// Type extended from FormValues to include form-specific data
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

export default function EditFormPage({ params }: { params: { id: string } }) {
  // Until React.use() is fully supported, we'll continue using params.id directly
  // but add a comment to remind us to update this in the future

  // TODO: In future Next.js versions, use React.use() to unwrap params:
  // const unwrappedParams = React.use(params);
  // const id = unwrappedParams.id;

  const { id } = params;

  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchFormData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // In a real app, this would fetch from an API
        const response = await fetch(`/api/forms/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load form data");
        }

        const data: SubscriptionForm = await response.json();

        // Extract only the FormValues properties to pass to the FormBuilder
        const { name, description, fields, settings, style } = data;

        setFormData({
          name,
          description,
          fields,
          settings,
          style,
        });

        toast({
          title: "Form loaded",
          description: "Form data loaded successfully for editing",
        });
      } catch (error) {
        console.error("Error fetching form data:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Failed to load form data. Please try again.";

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

    fetchFormData();
  }, [id, toast]);

  const handleFormSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      // In a real app, this would update via an API
      const response = await fetch(`/api/forms/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to update form");
      }

      toast({
        title: "Form updated",
        description: "Your form has been successfully updated",
      });

      // Navigate back to the form details page
      router.push(`/dashboard/subscribers/forms/${id}`);
    } catch (error) {
      console.error("Error updating form:", error);
      toast({
        title: "Error",
        description: "Failed to update form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = (values: FormValues) => {
    // Store form values in session storage for preview
    if (typeof window !== "undefined") {
      sessionStorage.setItem("formPreview", JSON.stringify(values));
      window.open("/dashboard/subscribers/forms/preview", "_blank");

      toast({
        title: "Preview opened",
        description: "Form preview has been opened in a new tab",
      });
    }
  };

  const handleGenerateCode = (values: FormValues) => {
    // For generating embed code - this would normally require the form ID
    // Instead of using an alert, use a toast notification
    toast({
      title: "Action required",
      description: "Please save the form first to generate the embed code.",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !formData) {
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
      <div className="mb-6">
        <Link href={`/dashboard/subscribers/forms/${id}`} passHref>
          <Button variant="ghost" className="p-0 h-auto">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to Form Details
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Form</h1>
        <p className="text-muted-foreground mt-1">Modify your form fields, settings, and design.</p>
      </div>

      <FormBuilder
        initialValues={formData}
        onSubmit={handleFormSubmit}
        onPreview={handlePreview}
        onGenerateCode={handleGenerateCode}
      />
    </div>
  );
}
