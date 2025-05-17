import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse, ParseResult } from "papaparse"; // Import ParseResult type

// Define an interface for the expected structure of a row from the CSV
// Adjust properties based on your actual CSV columns and Subscriber schema
interface CsvRow {
  email?: string | null; // Make potentially missing fields optional or nullable
  firstName?: string | null;
  first_name?: string | null; // Allow alternative header names
  lastName?: string | null;
  last_name?: string | null;
  status?: string | null; // Initially string, will be validated against enum
  tags?: string | null; // Initially string (comma-separated), will be parsed
  // Add other potential columns from your CSV here
  [key: string]: unknown; // Allow other unspecified columns
}

// Helper to check if a value is a valid SubscriberStatus
// Create this enum in your prisma schema if you haven't already
// e.g., enum SubscriberStatus { active unconfirmed unsubscribed bounced }
const isValidStatus = (status: string | null | undefined) => {
  if (!status) return false;
  // Explicitly list valid enum values
  return ["active", "unconfirmed", "unsubscribed", "bounced"].includes(status.toLowerCase());
  // Alternatively, use the imported enum if available at runtime:
  // return Object.values(SubscriberStatus).includes(status.toLowerCase() as SubscriberStatus);
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      // Check for user.id for clarity
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file");

    // Type guard to ensure 'file' is a File object
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded or invalid format" }, { status: 400 });
    }

    // Validate file type - Restricting to CSV as only CSV parsing is implemented
    const fileName = file.name || "";
    const fileType = fileName.split(".").pop()?.toLowerCase();
    // if (!["csv", "xlsx", "xls"].includes(fileType || "")) { // Original check
    if (fileType !== "csv") {
      // Only allow CSV for now
      return NextResponse.json(
        // { error: "Invalid file type. Please upload a CSV or Excel file" }, // Original message
        { error: "Invalid file type. Please upload a CSV file" }, // Updated message
        { status: 400 }
      );
    }

    // --- Add logic here to handle Excel files if needed using a library like 'xlsx' ---
    // if (["xlsx", "xls"].includes(fileType || "")) { /* ... use xlsx library ... */ }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV - Specify the expected row type using generics
    const { data, errors, meta }: ParseResult<CsvRow> = parse(fileContent, {
      header: true, // Keys rows by header names
      skipEmptyLines: true,
      dynamicTyping: false, // Treat all values initially as strings to avoid type guessing issues
      transformHeader: (header) => header.trim().toLowerCase(), // Normalize headers
    });

    // Check for parsing errors reported by papaparse
    if (errors.length > 0) {
      console.error("Papaparse errors:", errors);
      // Provide more specific error details if possible
      const errorDetails = errors
        .map((e: any) => `Row ${e.row}: ${e.message} (${e.code})`)
        .join("; ");
      return NextResponse.json(
        { error: "Error parsing CSV file", details: errorDetails },
        { status: 400 }
      );
    }

    // Validate that data is an array and headers exist
    if (!Array.isArray(data)) {
      return NextResponse.json(
        { error: "Failed to parse CSV data into an array." },
        { status: 400 }
      );
    }
    if (!meta.fields || meta.fields.length === 0) {
      return NextResponse.json(
        { error: "CSV file appears to be empty or missing headers." },
        { status: 400 }
      );
    }

    // Validate essential header ('email')
    // meta.fields contains the actual headers found
    const lowerCaseHeaders = meta.fields.map((h: any) => h.toLowerCase());
    if (!lowerCaseHeaders.includes("email")) {
      return NextResponse.json(
        { error: "Invalid file structure. File must contain an 'email' header/column" },
        { status: 400 }
      );
    }

    if (data.length === 0) {
      return NextResponse.json(
        {
          message: "CSV file processed, but contained no data rows.",
          results: { total: 0, created: 0, skipped: 0, errors: [] },
        },
        { status: 200 }
      );
    }

    // Process subscribers
    const results = {
      total: data.length, // Total rows received from parser
      created: 0,
      updated: 0, // Optional: Add if you plan updates
      skipped_duplicate: 0,
      skipped_invalid: 0,
      row_errors: [] as { row: number; email?: string; error: string }[],
    };

    // Fetch existing subscriber emails for the user ONCE
    const existingEmails = await prisma.subscriber.findMany({
      where: { userId },
      select: { email: true },
    });
    // Use lowercase emails in the Set for case-insensitive comparison
    const existingEmailSet = new Set(existingEmails.map((s: any) => s.email.toLowerCase()));

    const subscribersToCreate = [];
    let rowIndex = 0; // Start from 0 matching parser's index basis if needed, or 1 for user-facing row number

    for (const row of data) {
      rowIndex++; // Increment for user-friendly row numbers in errors

      // --- Validate Email ---
      const rawEmail = row.email;
      if (!rawEmail || typeof rawEmail !== "string" || rawEmail.trim() === "") {
        results.skipped_invalid++;
        results.row_errors.push({
          row: rowIndex,
          email: String(rawEmail || ""),
          error: "Missing or invalid email",
        });
        continue; // Skip this row
      }
      const email = rawEmail.trim().toLowerCase(); // Normalize email

      // Simple email format check (consider a more robust library like validator.js if needed)
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        results.skipped_invalid++;
        results.row_errors.push({ row: rowIndex, email: email, error: "Invalid email format" });
        continue;
      }

      // --- Check for Duplicates ---
      if (existingEmailSet.has(email)) {
        results.skipped_duplicate++;
        // Optionally: Update existing subscriber data here if needed
        continue; // Skip creation
      }

      // --- Prepare Subscriber Data ---
      // Safely access potential name fields
      const firstName = String(row.firstName || row.first_name || "").trim() || null;
      const lastName = String(row.lastName || row.last_name || "").trim() || null;

      // Validate and parse tags
      let tags: string[] = [];
      const rawTags = row.tags;
      if (typeof rawTags === "string" && rawTags.trim() !== "") {
        tags = rawTags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter((tag: any) => tag !== ""); // Filter empty tags
      }

      // Validate status (use enum if available)
      const rawStatus = String(row.status || "active")
        .trim()
        .toLowerCase(); // Default to active if missing
      let status = "ACTIVE";

      // If status provided in CSV, validate it against the Enum
      if (row.status) {
        if (isValidStatus(rawStatus)) {
          status = rawStatus; // Cast is safe here due to isValidStatus check
        } else {
          // Handle invalid status from CSV: skip, default, or log warning
          results.skipped_invalid++;
          results.row_errors.push({
            row: rowIndex,
            email: email,
            error: `Invalid status value: '${row.status}'. Using default 'active' or skipping.`,
          });
          // Option 1: Skip row entirely
          // continue;
          // Option 2: Use default 'active' (already set) and log error
        }
      }

      // Add the prepared subscriber data to the list for bulk creation
      // Ensure this object structure matches Prisma's SubscriberCreateManyInput
      subscribersToCreate.push({
        userId,
        email, // Already normalized
        firstName,
        lastName,
        status, // Validated or default status
        tags, // Parsed tags array
        // Include other fields from your Subscriber model, taking from `row` if available
        // metadata: { importedFrom: 'csv', ...(row.metadata || {}) } // Example metadata
      });

      // --- Prevent duplicates within the SAME file ---
      // Add the newly processed email to the set to catch duplicates within the uploaded file itself
      existingEmailSet.add(email);
    } // End of row processing loop

    // --- Bulk Create Subscribers ---
    if (subscribersToCreate.length > 0) {
      try {
        const creationResult = await prisma.subscriber.createMany({
          data: subscribersToCreate,
        });
        results.created = creationResult.count;
      } catch (dbError) {
        console.error("Database error during subscriber creation:", dbError);
        // Return a partial success/error message?
        return NextResponse.json(
          {
            message: "Import process encountered a database error during creation.",
            results, // Send partial results
            error: "Database operation failed",
          },
          { status: 500 }
        );
      }
    }

    // Adjust final skipped count based on invalid vs duplicate
    results.skipped_invalid = results.skipped_invalid;
    results.skipped_duplicate = results.skipped_duplicate;
    // Maybe add a general 'skipped' field if needed:
    // results.skipped = results.skipped_duplicate + results.skipped_invalid;

    console.log("Import Results:", results);
    return NextResponse.json({ message: "Import process finished.", results });
  } catch (error) {
    console.error("Error importing subscribers:", error);
    let errorMessage = "Failed to import subscribers due to an unexpected error.";
    if (error instanceof Error) {
      errorMessage = `Failed to import subscribers: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  // No finally { prisma.$disconnect() } needed if using a shared Prisma instance
}
