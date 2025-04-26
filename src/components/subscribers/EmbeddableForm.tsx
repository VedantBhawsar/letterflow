import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { FormField, FormStyle, FormSettings } from "@/lib/types";

// Dynamic form validation schema
const createValidationSchema = (fields: FormField[]) => {
  const schemaFields: Record<string, any> = {};

  fields.forEach((field) => {
    let validator: any;

    switch (field.type) {
      case "email":
        validator = z.string().email({ message: "Please enter a valid email address" });
        break;
      case "number":
        validator = z.string().refine((val) => !isNaN(Number(val)), {
          message: "Please enter a valid number",
        });
        break;
      case "checkbox":
        validator = z.boolean().optional();
        break;
      case "select":
        validator = z.string().min(1, { message: "Please select an option" });
        break;
      default:
        validator = z.string();
    }

    if (field.required) {
      if (field.type !== "checkbox") {
        validator = validator.min(1, { message: `${field.label} is required` });
      } else {
        validator = z.boolean().refine((val) => val === true, {
          message: `${field.label} is required`,
        });
      }
    } else {
      if (field.type !== "checkbox") {
        validator = validator.optional();
      }
    }

    schemaFields[field.id] = validator;
  });

  // Add honeypot field
  schemaFields["_honeypot"] = z.string().optional();

  return z.object(schemaFields);
};

interface EmbeddableFormProps {
  apiUrl: string;
  formKey: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function EmbeddableForm({ apiUrl, formKey, onSuccess, onError }: EmbeddableFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formConfig, setFormConfig] = useState<{
    fields: FormField[];
    settings: FormSettings;
    style: FormStyle;
    name: string;
  } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch form configuration
  useEffect(() => {
    const fetchFormConfig = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/public/forms/${formKey}`);
        if (!response.ok) {
          throw new Error("Failed to load form configuration");
        }
        const data = await response.json();
        setFormConfig(data);
      } catch (error) {
        setFormError("Could not load the subscription form. Please try again later.");
        console.error("Error loading form:", error);
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormConfig();
  }, [apiUrl, formKey, onError]);

  // Create form with dynamic validation
  const form = useForm({
    resolver: formConfig?.fields
      ? zodResolver(createValidationSchema(formConfig.fields))
      : undefined,
    defaultValues: formConfig?.fields?.reduce(
      (acc, field) => {
        acc[field.id] = field.type === "checkbox" ? false : "";
        return acc;
      },
      {} as Record<string, any>
    ),
  });

  // Reset form when configuration changes
  useEffect(() => {
    if (formConfig?.fields) {
      const defaultValues = formConfig.fields.reduce(
        (acc, field) => {
          acc[field.id] = field.type === "checkbox" ? false : "";
          return acc;
        },
        {} as Record<string, any>
      );

      // Add honeypot field
      defaultValues["_honeypot"] = "";

      form.reset(defaultValues);
    }
  }, [formConfig, form]);

  const onSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch(`${apiUrl}/api/public/forms/${formKey}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Form submission failed");
      }

      // Show success message
      setShowSuccess(true);

      // Call success callback
      if (onSuccess) onSuccess(result);

      // Redirect if configured
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } catch (error: any) {
      setFormError(error.message || "An error occurred during submission");
      if (onError) onError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate CSS variables for styling
  const getCustomStyles = () => {
    if (!formConfig?.style) return {};

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

  if (isLoading) {
    return (
      <div className="lf-loading">
        <div className="lf-spinner"></div>
        <p>Loading form...</p>
      </div>
    );
  }

  if (formError && !formConfig) {
    return <div className="lf-error">{formError}</div>;
  }

  if (!formConfig) {
    return <div className="lf-error">Form configuration not available.</div>;
  }

  if (showSuccess) {
    return (
      <div className="lf-success-message" style={getCustomStyles()}>
        <div className="lf-success-icon">✓</div>
        <p>{formConfig.settings.successMessage}</p>
      </div>
    );
  }

  return (
    <div className="letterflow-form-container" style={getCustomStyles()}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="lf-form">
        {formConfig.name && <h3 className="lf-form-title">{formConfig.name}</h3>}

        {formError && <div className="lf-form-error">{formError}</div>}

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
                className={`lf-input ${form.formState.errors[field.id] ? "lf-input-error" : ""}`}
                {...form.register(field.id)}
              />
            ) : field.type === "select" ? (
              <select
                id={field.id}
                className={`lf-select ${form.formState.errors[field.id] ? "lf-input-error" : ""}`}
                {...form.register(field.id)}
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
                  {...form.register(field.id)}
                />
                <label htmlFor={field.id} className="lf-checkbox-label">
                  {field.label} {field.required && <span className="lf-required">*</span>}
                </label>
              </div>
            ) : null}

            {form.formState.errors[field.id] && (
              <span className="lf-error-message">
                {form.formState.errors[field.id]?.message as string}
              </span>
            )}
          </div>
        ))}

        {/* Honeypot field for spam protection */}
        {formConfig.settings.honeypotEnabled && (
          <div className="lf-honeypot">
            <input
              type="text"
              {...form.register("_honeypot")}
              tabIndex={-1}
              aria-hidden="true"
              autoComplete="off"
            />
          </div>
        )}

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

        .lf-input-error {
          border-color: #ef4444;
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

        .lf-error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .lf-form-error {
          background-color: #fee2e2;
          color: #ef4444;
          padding: 0.75rem;
          border-radius: var(--lf-border-radius);
          font-size: 0.875rem;
          margin-bottom: 1rem;
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

        .lf-honeypot {
          position: absolute;
          left: -9999px;
          top: -9999px;
          z-index: -1;
          opacity: 0;
          height: 0;
          width: 0;
          overflow: hidden;
        }

        .lf-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          gap: 1rem;
          color: var(--lf-text-color);
        }

        .lf-spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--lf-primary-color);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
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

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (min-width: 640px) {
          .letterflow-form-container {
            max-width: 28rem;
            padding: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
