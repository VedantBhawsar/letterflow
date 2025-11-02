import * as z from "zod";

/**
 * Shared Zod schema for subscription form builder
 * Used by both FormBuilder and EmbeddableForm components
 */
export const formSchema = z.object({
  name: z.string().min(1, { message: "Form name is required" }),
  description: z.string().optional(),
  fields: z
    .array(
      z.object({
        id: z.string(), // Unique ID for each field (for keys and dnd)
        type: z.enum(["text", "email", "number", "checkbox", "select"]),
        label: z.string().min(1, { message: "Field label is required" }),
        placeholder: z.string().optional(),
        required: z.boolean(),
        options: z.array(z.string()).optional(), // Array of strings for 'select' options
      })
    )
    .min(1, { message: "At least one field is required" }),
  settings: z.object({
    submitButtonText: z.string().min(1, "Submit text cannot be empty").default("Subscribe"),
    successMessage: z.string().min(1).default("Thank you for subscribing!"),
    doubleOptIn: z.boolean().default(false),
    redirectUrl: z.string().url("Invalid URL format").optional().or(z.literal("")),
    honeypotEnabled: z.boolean().default(true),
    recaptchaEnabled: z.boolean().default(false),
    recaptchaSiteKey: z.string().optional(),
  }),
  style: z.object({
    primaryColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
      .default("#3b82f6"),
    backgroundColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
      .default("#ffffff"),
    textColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color")
      .default("#000000"),
    fontFamily: z.string().default("Inter, sans-serif"),
    borderRadius: z.string().default("4"), // Storing radius as string for selection mapping
    buttonStyle: z.enum(["filled", "outline", "minimal"]).default("filled"),
  }),
});

export type FormValues = z.infer<typeof formSchema>;

/**
 * Common field types for form builder
 */
export const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "checkbox", label: "Checkbox" },
  { value: "select", label: "Dropdown" },
] as const;

/**
 * Common font family options
 */
export const FONT_FAMILIES = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Verdana, sans-serif", label: "Verdana" },
] as const;

/**
 * Common border radius options
 */
export const BORDER_RADIUS_OPTIONS = [
  { value: "0", label: "None" },
  { value: "2", label: "Small" },
  { value: "4", label: "Medium" },
  { value: "8", label: "Large" },
  { value: "16", label: "Extra Large" },
] as const;
