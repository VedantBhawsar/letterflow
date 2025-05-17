import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@prisma/client"; // Import Prisma namespace and types

// --- Define Consistent Types & Schemas ---

// Schema for validating individual form fields retrieved from DB JSON
const formFieldSchema = z
  .object({
    id: z.string(),
    type: z.enum(["text", "email", "number", "checkbox", "select"]).catch("text"), // Default unknown types to 'text'
    label: z.string(),
    required: z.boolean().nullish(), // Allow null/undefined
  })
  .passthrough(); // Allow other fields not strictly defined here

// Schema for validating form settings retrieved from DB JSON
const formSettingsSchema = z
  .object({
    honeypotEnabled: z.boolean().default(false),
    doubleOptIn: z.boolean().default(false),
    redirectUrl: z.string().nullish(), // Allow null/undefined
  })
  .passthrough(); // Allow other settings

// Schema for validating incoming form data payload
// Dynamic keys, so use record with basic checks
const formDataSchema = z.record(z.unknown());

// Type for the response payload
interface SubmissionResponse {
  success: boolean;
  redirectUrl?: string | null;
  error?: string;
}

// Type for the form object fetched from Prisma, including user relation
type FormWithUser = Prisma.SubscriptionFormGetPayload<{
  include: { user: true };
}>;

// Helper type guard for Prisma errors
function isPrismaErrorWithCode(error: unknown): error is { code: string; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  );
}

// Email validation schema using Zod
const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

// Type guard to check if a value is a plain object (for metadata/settings)
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// --- Route Handler ---
export async function POST(req: NextRequest, { params }: { params: Promise<{ formKey: string }> }) {
  try {
    const { formKey } = await params;
    if (!formKey) {
      return NextResponse.json({ error: "Form key parameter is missing" }, { status: 400 });
    }

    // --- Validate Incoming Request Body ---
    let rawFormData: unknown;
    try {
      rawFormData = await req.json();
    } catch (parseError) {
      console.error("Error parsing form submission body:", parseError);
      return NextResponse.json({ error: "Invalid request body format" }, { status: 400 });
    }
    // Validate using Zod
    const parseResult = formDataSchema.safeParse(rawFormData);
    if (!parseResult.success) {
      console.error("Form data validation failed:", parseResult.error);
      return NextResponse.json({ error: "Invalid form data structure." }, { status: 400 });
    }
    const formData = parseResult.data; // Now formData is Record<string, unknown>

    const referrer = req.headers.get("referer") || "direct";

    // --- Fetch and Validate Form Configuration ---
    const form: FormWithUser | null = await prisma.subscriptionForm.findUnique({
      where: { formKey },
      include: { user: true },
    });

    if (!form) {
      return NextResponse.json({ error: "Subscription form not found" }, { status: 404 });
    }
    if (form.status !== "active") {
      return NextResponse.json({ error: "This form is currently inactive" }, { status: 403 });
    }
    if (!form.userId || !form.user) {
      // Also check if user object exists
      // Ensure relation was loaded correctly
      console.error(`Form ${formKey} is missing associated user ID or user object.`);
      return NextResponse.json(
        { error: "Form configuration error: Missing user association." },
        { status: 500 }
      );
    }

    // --- Safely Parse/Validate JSON fields from DB ---
    // Validate form.fields (Prisma.JsonValue -> FormField[])
    let fields: z.infer<typeof formFieldSchema>[];
    try {
      // Zod schema for an array of formFieldSchema objects
      const fieldsSchema = z.array(formFieldSchema);
      const parsedFields = fieldsSchema.safeParse(form.fields);
      if (!parsedFields.success) {
        console.error("Database 'fields' validation error details:", parsedFields.error);
        throw new Error("Invalid 'fields' structure in database.");
      }
      fields = parsedFields.data;
    } catch (validationError) {
      console.error(`Validation error for fields in form ${formKey}:`, validationError);
      return NextResponse.json(
        { error: "Form configuration error: Invalid field definitions." },
        { status: 500 }
      );
    }
    if (fields.length === 0) {
      console.warn(`Form ${formKey} has no valid fields defined after parsing.`);
      // Consider if this should be an error or just a warning depending on requirements
      // Returning error for safety for now.
      return NextResponse.json(
        { error: "Form configuration error: No valid fields defined." },
        { status: 500 }
      );
    }

    // Validate form.settings (Prisma.JsonValue -> FormSettings)
    let settings: z.infer<typeof formSettingsSchema>;
    try {
      const parsedSettings = formSettingsSchema.safeParse(form.settings);
      if (!parsedSettings.success) {
        console.error("Database 'settings' validation error details:", parsedSettings.error);
        throw new Error("Invalid 'settings' structure in database.");
      }
      settings = parsedSettings.data;
    } catch (validationError) {
      console.error(`Validation error for settings in form ${formKey}:`, validationError);
      return NextResponse.json(
        { error: "Form configuration error: Invalid settings." },
        { status: 500 }
      );
    }

    // Safely handle form.traffic (Prisma.JsonValue -> Record<string, number> | null)
    const traffic: Record<string, number> = {}; // Initialize to empty object
    if (isObject(form.traffic)) {
      // Basic check: assume values are numbers. Validate further if structure is critical.
      // Filter out non-numeric values for robustness
      Object.entries(form.traffic).forEach(([key, value]) => {
        if (typeof value === "number") {
          traffic[key] = value;
        } else {
          console.warn(
            `Form ${formKey} traffic data contains non-numeric value for key '${key}':`,
            value
          );
        }
      });
    } else if (form.traffic !== null && form.traffic !== undefined) {
      // Check for undefined too
      console.warn(`Form ${formKey} has non-object traffic data:`, form.traffic);
      // Decide how to handle: ignore, error, or attempt recovery?
      // Ignoring it and starting with empty 'traffic' object is safest.
    }

    // --- Spam Protection (Honeypot) ---
    // formData values are unknown, check type before accessing
    const honeypotFieldName = "_honeypot"; // Example common name, might need configuration
    const honeypotValue = formData[honeypotFieldName];
    if (settings.honeypotEnabled && typeof honeypotValue === "string" && honeypotValue !== "") {
      console.log(`Honeypot triggered for formKey: ${formKey}`);
      // Return a success-like response to not alert the bot
      const responsePayload: SubmissionResponse = { success: true };
      if (settings.redirectUrl) {
        responsePayload.redirectUrl = settings.redirectUrl;
      }
      return NextResponse.json(responsePayload);
    }

    // --- Process Form Data based on Validated Fields ---
    let email: string | null = null;
    const metadata: Record<string, unknown> = {};
    let firstName: string | null = null;
    let lastName: string | null = null;

    for (const field of fields) {
      // Use field.id which is guaranteed to be a string by validation
      const value = formData[field.id];

      // Check required fields (value must exist and not be empty string after trimming)
      const stringValue = String(value).trim(); // Convert to string and trim for checks
      if (field.required && (value === undefined || value === null || stringValue === "")) {
        return NextResponse.json(
          { error: `Field "${field.label || field.id}" is required.` },
          { status: 400 }
        );
      }

      // Only process non-empty values further
      if (value !== undefined && value !== null && stringValue !== "") {
        if (field.type === "email") {
          if (typeof value !== "string") {
            return NextResponse.json(
              {
                error: `Expected a string for email field "${field.label || field.id}". Received type: ${typeof value}.`,
              },
              { status: 400 }
            );
          }
          const parsedEmail = emailSchema.safeParse(value);
          if (!parsedEmail.success) {
            return NextResponse.json(
              {
                error: `Invalid email format in field "${field.label || field.id}": ${parsedEmail.error.errors[0]?.message || "Invalid format"}`,
              },
              { status: 400 }
            );
          }
          email = parsedEmail.data; // Use validated email

          // Heuristic checks for first/last name - consider making this configurable if needed
        } else if (
          field.id.toLowerCase().includes("firstname") ||
          field.label.toLowerCase().includes("first name")
        ) {
          if (typeof value === "string") firstName = value.trim();
          else
            console.warn(
              `Expected string for possible first name field "${field.label || field.id}", got ${typeof value}`
            );
        } else if (
          field.id.toLowerCase().includes("lastname") ||
          field.label.toLowerCase().includes("last name")
        ) {
          if (typeof value === "string") lastName = value.trim();
          else
            console.warn(
              `Expected string for possible last name field "${field.label || field.id}", got ${typeof value}`
            );
        } else {
          // Store other valid primitive values (string, number, boolean) in metadata
          // Use field.label as key if available and meaningful, otherwise fallback to field.id
          const metadataKey = field.label && field.label.trim() !== "" ? field.label : field.id;
          if (
            typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean"
          ) {
            metadata[metadataKey] = value;
          } else {
            // Optionally serialize arrays/simple objects, or log/skip complex types
            console.warn(
              `Skipping unsupported data type for field "${metadataKey}": ${typeof value}. Value:`,
              value
            );
          }
        }
      }
    }

    // Ensure an email field was present and contained a valid email
    if (!email) {
      // Check if an email field definition actually existed
      const hasEmailField = fields.some((f) => f.type === "email");
      if (hasEmailField) {
        return NextResponse.json(
          { error: "A valid email address is required but was not provided or was invalid." },
          { status: 400 }
        );
      } else {
        console.error(
          `Form ${formKey} has no field defined with type 'email'. Cannot process submission without an email.`
        );
        return NextResponse.json(
          { error: "Form configuration error: No email field defined." },
          { status: 500 }
        );
      }
    }

    // --- Database Operations ---
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: { userId: form.userId, email }, // userId is guaranteed by earlier check
    });

    let subscriber;
    // Safely handle existing metadata (ensure it's an object)
    const existingMetadata =
      existingSubscriber?.metadata && isObject(existingSubscriber.metadata)
        ? existingSubscriber.metadata
        : {};

    // Merge strategy: Incoming data overwrites existing keys
    const mergedMetadata = { ...(existingMetadata || {}), ...metadata } as Prisma.JsonObject;

    if (existingSubscriber) {
      console.log(`Updating subscriber: ${email} for user ${form.userId}`);
      try {
        subscriber = await prisma.subscriber.update({
          where: { id: existingSubscriber.id },
          data: {
            firstName: firstName ?? existingSubscriber.firstName, // Preserve existing if new is null
            lastName: lastName ?? existingSubscriber.lastName, // Preserve existing if new is null
            metadata: mergedMetadata as Prisma.InputJsonObject, // Assert after manual merge - OK here
            status:
              settings.doubleOptIn && existingSubscriber.status !== "active"
                ? "unconfirmed"
                : existingSubscriber.status, // Optionally re-trigger opt-in if they weren't active? Or just keep current status? Keeping current is safer default.
            updatedAt: new Date(),
            // Potentially add the form tag again if they resubmit via a different form?
            // tags: { push: `form:${form.name}` } // Consider set instead of push if needed
          },
        });
      } catch (updateError) {
        console.error(`Error updating subscriber ${email}:`, updateError);
        // Handle specific errors like unique constraint violation if necessary
        if (isPrismaErrorWithCode(updateError) && updateError.code === "P2002") {
          return NextResponse.json(
            { error: "Update failed due to conflicting data." },
            { status: 409 }
          );
        }
        throw updateError; // Re-throw generic errors
      }
    } else {
      console.log(`Creating subscriber: ${email} for user ${form.userId}`);
      const subscriberStatus = settings.doubleOptIn ? "unconfirmed" : "active";
      const initialTags = ["form-submission", `form:${form.name}`]; // Example tags

      try {
        subscriber = await prisma.subscriber.create({
          data: {
            userId: form.userId, // Guaranteed non-null
            email, // Guaranteed non-null and validated
            firstName, // Can be null
            lastName, // Can be null
            status: subscriberStatus,
            tags: initialTags,
            metadata: mergedMetadata as Prisma.InputJsonObject, // Assert after manual merge - OK here
          },
        });

        // --- Trigger Post-Creation Actions ---
        if (settings.doubleOptIn) {
          console.log(
            `TODO: Send double opt-in email for ${email} (Subscriber ID: ${subscriber.id})`
          );
          // Add your email sending logic here (e.g., queueing a job, calling an email service)
          // Include subscriber ID and potentially a confirmation token
        }
      } catch (createError) {
        console.error(`Error creating subscriber ${email}:`, createError);
        // Handle specific errors like unique constraint violation (shouldn't happen due to findFirst check, but good practice)
        if (isPrismaErrorWithCode(createError) && createError.code === "P2002") {
          // This implies a race condition if findFirst didn't catch it
          console.warn(`Possible race condition creating subscriber ${email}.`);
          return NextResponse.json(
            { error: "Submission failed, possibly due to duplicate entry." },
            { status: 409 }
          );
        }
        throw createError; // Re-throw generic errors
      }
    }

    // --- Update Form Statistics (increment submissions and update traffic) ---
    // Use the 'traffic' variable initialized and potentially populated earlier
    const updatedTraffic = {
      ...traffic, // Start with potentially filtered existing traffic
      [referrer]: (traffic[referrer] ?? 0) + 1,
    };

    try {
      await prisma.subscriptionForm.update({
        where: { id: form.id },
        data: {
          submissions: { increment: 1 },
          // Prisma handles JSON conversion, ensure `updatedTraffic` is serializable
          traffic: updatedTraffic as Prisma.InputJsonObject, // Assert structure is okay
          lastSubmittedAt: new Date(),
        },
      });
    } catch (statsUpdateError) {
      console.error(`Error updating statistics for form ${formKey}:`, statsUpdateError);
      // Decide if this error is critical. Usually, the submission itself is more important.
      // Log the error but proceed to return success to the user.
    }

    // --- Prepare and Send Success Response ---
    const responsePayload: SubmissionResponse = { success: true };
    if (settings.redirectUrl) {
      // Basic validation for redirect URL (optional but recommended)
      try {
        const url = new URL(settings.redirectUrl);
        // Optionally restrict protocols (e.g., only http/https)
        if (!["http:", "https:"].includes(url.protocol)) {
          console.warn(
            `Form ${formKey} has potentially unsafe redirect URL protocol: ${settings.redirectUrl}`
          );
          // Decide: ignore, don't set, or error? For now, we allow it but log.
        }
        responsePayload.redirectUrl = settings.redirectUrl;
      } catch (urlError) {
        console.warn(
          `Form ${formKey} has an invalid redirect URL configured: ${settings.redirectUrl}`,
          urlError
        );
        // Don't include the invalid URL in the response.
      }
    }

    console.log(`Successfully processed submission for form ${formKey} from ${email}`);
    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    // --- Global Error Handling ---
    console.error("Unhandled error processing form submission:", error);
    let errorMessage = "An unexpected error occurred while processing your submission.";
    let statusCode = 500;

    if (isPrismaErrorWithCode(error)) {
      errorMessage = "A database error occurred."; // More generic for user
      // Log specific code for backend debugging
      console.error(`Prisma Error Code: ${error.code}, Message: ${error.message}`);
      if (error.code === "P2002") {
        errorMessage = "There was a conflict with existing data (e.g., duplicate entry).";
        statusCode = 409; // Conflict
      } else if (error.code.startsWith("P20")) {
        // Other Prisma client errors
        statusCode = 400; // Bad request (likely due to invalid data leading to error)
        errorMessage = "There was an issue with the data submitted or form configuration.";
      }
      // Add more specific Prisma error codes if needed
    } else if (error instanceof z.ZodError) {
      errorMessage = "Invalid data format encountered."; // Should be caught earlier, but as a fallback
      statusCode = 400;
      console.error("Zod Validation Error:", error.errors);
    } else if (error instanceof Error) {
      // Use the specific error message if it's potentially user-friendly
      // Be cautious about exposing internal details
      // errorMessage = error.message; // Use cautiously
      errorMessage = "An internal server error occurred."; // Safer default
      console.error("Generic Error:", error.message, error.stack);
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: statusCode });
  }
}
