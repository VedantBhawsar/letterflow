"use client";

import { useState } from "react";
import { FormBuilder, FormValues } from "@/components/subscribers/FormBuilder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { formTemplates } from "@/lib/form-templates";

export default function NewFormPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<FormValues | null>(null);
  const [step, setStep] = useState<"select" | "customize">("select");

  const handleSelectTemplate = (template: FormValues) => {
    setSelectedTemplate(template);
    setStep("customize");
  };

  const handleFormSubmit = async (values: FormValues) => {
    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to create form");
      }

      const form = await response.json();
      router.push(`/dashboard/subscribers/forms/${form.id}`);
    } catch (error) {
      console.error("Error saving form:", error);
      throw error;
    }
  };

  const handlePreview = (values: FormValues) => {
    // Store form values in session storage for preview
    if (typeof window !== "undefined") {
      sessionStorage.setItem("formPreview", JSON.stringify(values));
      window.open("/dashboard/subscribers/forms/preview", "_blank");
    }
  };

  const handleGenerateCode = (values: FormValues) => {
    // Not implemented directly here, would require the form ID
    console.log("Generate code for:", values);
    alert("Please save the form first to generate embed code.");
  };

  // Step 1: Template Selection
  if (step === "select") {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/dashboard/subscribers/forms" passHref>
            <Button variant="ghost" className="p-0 h-auto">
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to Forms
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">Create Subscription Form</h1>
          <p className="text-muted-foreground mt-1">
            Start with a template or create your form from scratch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Blank template */}
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed"
            onClick={() => handleSelectTemplate(formTemplates.basic)}
          >
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary text-xl font-bold">+</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Blank Form</h3>
              <p className="text-sm text-muted-foreground">
                Start with a simple form and customize it
              </p>
            </CardContent>
          </Card>

          {/* Template cards */}
          {Object.entries(formTemplates).map(([key, template]: any) => (
            <Card
              key={key}
              className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="h-3" style={{ backgroundColor: template.style.primaryColor }}></div>
              <CardContent className="p-6">
                <div
                  className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white"
                  style={{ backgroundColor: template.style.primaryColor }}
                >
                  {template.name.charAt(0)}
                </div>
                <h3 className="text-lg font-medium mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <div className="text-xs text-muted-foreground">
                  {template.fields.length} field{template.fields.length !== 1 ? "s" : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Form Customization
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" className="p-0 h-auto" onClick={() => setStep("select")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Templates
        </Button>
        <h1 className="text-3xl font-bold mt-2">Customize Your Form</h1>
        <p className="text-muted-foreground mt-1">
          Customize your form fields, settings, and design.
        </p>
      </div>

      <FormBuilder
        initialValues={selectedTemplate || undefined}
        onSubmit={handleFormSubmit}
        onPreview={handlePreview}
        onGenerateCode={handleGenerateCode}
      />
    </div>
  );
}
