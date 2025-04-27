"use client";

import { useState, useEffect } from "react";
import { FormValues } from "@/components/subscribers/FormBuilder";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function FormPreviewPage() {
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load form data from session storage on component mount
    const loadFormPreview = () => {
      try {
        const storedData = sessionStorage.getItem("formPreview");
        if (storedData) {
          setFormData(JSON.parse(storedData));
          toast({
            title: "Preview loaded",
            description: "Form preview loaded successfully",
          });
        } else {
          setError("No form data found for preview");
          toast({
            title: "Error",
            description: "No form data found for preview",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error loading form preview:", error);
        setError("Failed to load form preview");
        toast({
          title: "Error",
          description: "Failed to load form preview",
          variant: "destructive",
        });
      }
    };

    loadFormPreview();
  }, [toast]);

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Preview</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Link href="/dashboard/subscribers/forms" passHref>
            <Button>
              <MoveLeft className="mr-2 h-4 w-4" />
              Back to Forms
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{formData.name} - Preview</h1>
            <p className="text-sm text-muted-foreground">
              This is a preview of how your subscription form will appear to visitors.
            </p>
          </div>
          <Link href="/dashboard/subscribers/forms" passHref>
            <Button variant="outline">
              <MoveLeft className="mr-2 h-4 w-4" />
              Exit Preview
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">Form Preview</h2>
            <div className="border p-6 rounded-lg bg-gray-50">
              {/* Mock EmbeddableForm component that uses the form config directly */}
              <MockEmbeddableForm formConfig={formData} />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Form Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{formData.name}</p>
                </div>
                {formData.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p>{formData.description}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fields</h3>
                  <p>{formData.fields.length} field(s)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submit Button</h3>
                  <p>{formData.settings.submitButtonText}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Double Opt-in</h3>
                  <p>{formData.settings.doubleOptIn ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium mb-4">Design Preview</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: formData.style.primaryColor }}
                  ></div>
                  <span className="text-sm">Primary Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: formData.style.backgroundColor }}
                  ></div>
                  <span className="text-sm">Background Color</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Font Family</h3>
                  <p style={{ fontFamily: formData.style.fontFamily }}>
                    {formData.style.fontFamily.split(",")[0]}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Button Style</h3>
                  <p className="capitalize">{formData.style.buttonStyle}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mock version of the EmbeddableForm component that works with direct form config
function MockEmbeddableForm({ formConfig }: { formConfig: FormValues }) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (id: string, value: string | boolean) => {
    // #ts-expect-error - TypeScript doesn't understand the type of formData
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      toast({
        title: "Form submitted",
        description: "Test form submission was successful",
      });
    }, 1000);
  };

  // Generate CSS variables for styling
  const getCustomStyles = () => {
    const { primaryColor, backgroundColor, textColor, fontFamily, borderRadius, buttonStyle } =
      formConfig.style;

    return {
      "--lf-primary-color": primaryColor,
      "--lf-bg-color": backgroundColor,
      "--lf-text-color": textColor,
      "--lf-font-family": fontFamily,
      "--lf-border-radius": `${borderRadius}px`,
      "--lf-button-style": buttonStyle,
    } as React.CSSProperties;
  };

  if (showSuccess) {
    return (
      <div className="lf-success-message" style={getCustomStyles()}>
        <div className="lf-success-icon">✓</div>
        <p>{formConfig.settings.successMessage}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowSuccess(false)}>
          Reset Preview
        </Button>
      </div>
    );
  }

  return (
    <div className="letterflow-form-container" style={getCustomStyles()}>
      <form onSubmit={handleSubmit} className="lf-form">
        {formConfig.name && <h3 className="lf-form-title">{formConfig.name}</h3>}

        {/* Render form fields based on configuration */}
        {formConfig.fields.map((field) => (
          <div key={field.id} className="lf-form-field">
            {field.type !== "checkbox" && (
              <label htmlFor={field.id} className="lf-label">
                {field.label} {field.required && <span className="lf-required">*</span>}
              </label>
            )}

            {field.type === "text" || field.type === "email" || field.type === "number" ? (
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className="lf-input"
                // @ts-expect-error - formData is compatible with EditorBlock
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                className="lf-select"
                // @ts-expect-error - formData is compatible with EditorBlock
                value={formData[field.id] || ""}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <div className="lf-checkbox-wrapper">
                <input
                  id={field.id}
                  type="checkbox"
                  className="lf-checkbox"
                  checked={!!formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  required={field.required}
                />
                <label htmlFor={field.id} className="lf-checkbox-label">
                  {field.label} {field.required && <span className="lf-required">*</span>}
                </label>
              </div>
            ) : null}
          </div>
        ))}

        {/* Submit button */}
        <button
          type="submit"
          className={`lf-submit-button lf-button-${formConfig.style.buttonStyle}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : formConfig.settings.submitButtonText}
        </button>
      </form>

      {/* Base styles for the form */}
      <style jsx>{`
        .letterflow-form-container {
          --lf-primary-color: #3b82f6;
          --lf-bg-color: #ffffff;
          --lf-text-color: #000000;
          --lf-font-family:
            "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          --lf-border-radius: 4px;

          font-family: var(--lf-font-family);
          max-width: 100%;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem;
          background-color: var(--lf-bg-color);
          color: var(--lf-text-color);
          border-radius: var(--lf-border-radius);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .lf-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .lf-form-title {
          margin: 0 0 1rem;
          font-size: 1.25rem;
          font-weight: 600;
          text-align: center;
        }

        .lf-form-field {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .lf-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .lf-input,
        .lf-select {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: var(--lf-border-radius);
          font-size: 0.875rem;
          transition: border-color 0.15s ease;
        }

        .lf-input:focus,
        .lf-select:focus {
          outline: none;
          border-color: var(--lf-primary-color);
          box-shadow: 0 0 0 1px var(--lf-primary-color);
        }

        .lf-checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .lf-checkbox {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .lf-checkbox-label {
          font-size: 0.875rem;
          cursor: pointer;
        }

        .lf-required {
          color: #ef4444;
        }

        .lf-submit-button {
          cursor: pointer;
          padding: 0.5rem 1rem;
          font-weight: 500;
          border-radius: var(--lf-border-radius);
          transition: all 0.15s ease;
          margin-top: 0.5rem;
        }

        .lf-button-filled {
          background-color: var(--lf-primary-color);
          color: white;
          border: none;
        }

        .lf-button-filled:hover {
          opacity: 0.9;
        }

        .lf-button-outline {
          background-color: transparent;
          color: var(--lf-primary-color);
          border: 1px solid var(--lf-primary-color);
        }

        .lf-button-outline:hover {
          background-color: var(--lf-primary-color);
          color: white;
        }

        .lf-button-minimal {
          background-color: transparent;
          color: var(--lf-primary-color);
          border: none;
        }

        .lf-button-minimal:hover {
          text-decoration: underline;
        }

        .lf-success-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background-color: var(--lf-bg-color);
          border-radius: var(--lf-border-radius);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .lf-success-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background-color: #10b981;
          color: white;
          border-radius: 50%;
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
      `}</style>
    </div>
  );
}
