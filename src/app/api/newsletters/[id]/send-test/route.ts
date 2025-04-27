import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { Prisma, Newsletter } from "@prisma/client"; // Import Prisma types

// Correct type for route handler parameters
type RouteContext = {
  params: { id: string };
};

// Define expected input structure for the POST request body
interface SendTestEmailInput {
  testEmail?: string | null; // Make optional for better validation checks
  subject?: string | null;
  previewText?: string | null;
}

// --- Reusable Element Types & Type Guard ---
interface HeadingElement {
  type: "heading";
  content?: string | null;
}
interface ParagraphElement {
  type: "paragraph";
  content?: string | null;
}
interface ImageElement {
  type: "image";
  src?: string | null;
  alt?: string | null;
}
interface ButtonElement {
  type: "button";
  url?: string | null;
  text?: string | null;
}
type NewsletterElement = HeadingElement | ParagraphElement | ImageElement | ButtonElement;

function isNewsletterElement(obj: unknown): obj is NewsletterElement {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const element = obj as Record<string, unknown>;
  if (typeof element.type !== "string") {
    return false;
  }
  switch (element.type) {
    case "heading":
    case "paragraph":
    case "image":
    case "button":
      return true;
    default:
      // Optionally log unknown types if needed during development/debugging
      // console.warn(`isNewsletterElement: Unknown element type encountered: ${element.type}`);
      return false;
  }
}

// --- Type guard for Nodemailer errors ---
interface NodemailerError extends Error {
  code?: string;
  command?: string;
  responseCode?: number;
  response?: string;
}
function isNodemailerError(error: unknown): error is NodemailerError {
  return error instanceof Error && ("code" in error || "responseCode" in error);
}

// --- POST Handler ---
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to send test emails" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Safely parse request body
    let body: SendTestEmailInput;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing POST request body:", parseError);
      return NextResponse.json({ message: "Invalid request body format" }, { status: 400 });
    }

    // --- Input Validation ---
    if (
      !body.testEmail ||
      typeof body.testEmail !== "string" ||
      !/\S+@\S+\.\S+/.test(body.testEmail)
    ) {
      // Basic email format check
      return NextResponse.json(
        { message: "A valid test email address is required" },
        { status: 400 }
      );
    }
    const testEmail = body.testEmail; // Assign to new const after validation

    if (!body.subject || typeof body.subject !== "string" || body.subject.trim() === "") {
      return NextResponse.json(
        { message: "Email subject is required and cannot be empty" },
        { status: 400 }
      );
    }
    const subject = body.subject.trim(); // Assign to new const after validation

    const previewText =
      typeof body.previewText === "string" ? body.previewText : `Preview: ${subject}`; // Default preview text

    // --- Fetch Newsletter ---
    // Use findUnique for potentially better performance if `id` is unique constraint
    const newsletter = await prisma.newsletter.findUnique({
      where: { id },
    });

    if (!newsletter) {
      return NextResponse.json({ message: "Newsletter not found" }, { status: 404 });
    }

    // Verify ownership
    if (newsletter.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden: You don't have permission to access this newsletter" },
        { status: 403 }
      );
    }

    // --- Generate HTML ---
    // newsletter.elements is Prisma.JsonValue, pass it directly to the helper
    const htmlContent = generateHTMLFromElements(newsletter.elements);

    // --- Nodemailer Configuration ---
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST, // Require these env vars or throw error early
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_PORT === "465",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // --- Verify Transporter (Optional but Recommended) ---
    try {
      await transporter.verify();
      console.log("Email transporter connection verified.");
    } catch (verifyError: unknown) {
      // Catch as unknown
      console.error("Email transporter verification failed:", verifyError);
      let details = "Could not verify connection.";
      if (isNodemailerError(verifyError)) {
        details += ` (Code: ${verifyError.code ?? "N/A"}, Command: ${verifyError.command ?? "N/A"})`;
      } else if (verifyError instanceof Error) {
        details = verifyError.message;
      }
      return NextResponse.json(
        { message: "Email server configuration error.", details },
        { status: 500 }
      );
    }

    // --- Setup and Send Email ---
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || "Test Sender"}" <${process.env.EMAIL_FROM || "test@example.com"}>`,
      to: testEmail,
      subject: `[TEST] ${subject}`, // Prefix subject for clarity
      text: previewText,
      html: htmlContent,
      // Optional: Add headers to prevent auto-responses or indicate test
      headers: {
        "X-Auto-Response-Suppress": "All",
        "X-Mailer-Testing": "true",
      },
    };

    // Send the email (already wrapped in outer try...catch)
    const info = await transporter.sendMail(mailOptions);

    console.log(
      `Test email sent for newsletter ${id} to ${testEmail}. Message ID: ${info.messageId}`
    );

    return NextResponse.json({
      message: "Test email sent successfully",
      recipient: testEmail,
      messageId: info.messageId, // Return Nodemailer message ID if useful
    });
  } catch (error: unknown) {
    // Catch as unknown
    console.error("Error sending test email:", error);
    let errorMessage = "Failed to send test email";
    let statusCode = 500;

    if (isNodemailerError(error)) {
      console.error(`Nodemailer Error Code: ${error.code}, Command: ${error.command}`);
      errorMessage = `Email provider error: ${error.message}`;
      // You might want specific status codes for certain Nodemailer errors (e.g., authentication failure)
      if (error.code === "EAUTH")
        statusCode = 535; // Authentication credentials invalid (example)
      else if (error.code === "ECONNREFUSED") statusCode = 503; // Service unavailable (example)
    } else if (isPrismaErrorWithCode(error)) {
      // Use previously defined guard if needed
      console.error("Prisma Error:", error.code, error.message);
      errorMessage = "Database error occurred.";
      if (error.code === "P2025") {
        // Record not found (should be caught earlier)
        errorMessage = "Newsletter not found during operation.";
        statusCode = 404;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    // console.error("Raw Error Object:", error); // Log raw error if needed

    return NextResponse.json({ message: errorMessage }, { status: statusCode });
  }
}

// --- Reusable Helper function --- (Same implementation as before, ensure types match)
function generateHTMLFromElements(elementsData: unknown): string {
  const styles = {
    /* ... styles as before ... */
    body: "margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;",
    container:
      "max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd;",
    heading: "color: #333333; margin-top: 0;",
    paragraph: "color: #555555; line-height: 1.6;",
    image: "max-width: 100%; height: auto; margin: 15px 0; display: block;",
    button:
      "display: inline-block; padding: 12px 25px; margin: 15px 0; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold;",
    error: "color: red; font-weight: bold; border: 1px solid red; padding: 10px; margin: 10px 0;",
    footer:
      "margin-top: 20px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center;",
  };

  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Newsletter Preview</title> 
    </head>
    <body style="${styles.body}">
       <div style="padding: 10px; background-color: #fffbe6; border: 1px solid #ffe58f; text-align: center; font-size: 14px; color: #ad8b00;">This is a test preview email.</div>
      <div style="${styles.container}">
  `;

  if (!Array.isArray(elementsData)) {
    console.error("generateHTMLFromElements: Received non-array data:", elementsData);
    html += `<div style="${styles.error}">Error: Invalid newsletter content format.</div>`;
  } else {
    elementsData.forEach((element: unknown, index: number) => {
      if (!isNewsletterElement(element)) {
        console.warn(
          `generateHTMLFromElements: Skipping invalid element structure at index ${index}:`,
          element
        );
        return;
      }
      try {
        switch (element.type) {
          case "heading":
            html += `<h2 style="${styles.heading}">${element.content ?? ""}</h2>`;
            break;
          case "paragraph":
            html += `<p style="${styles.paragraph}">${element.content ?? ""}</p>`;
            break;
          case "image":
            if (
              element.src &&
              (element.src.startsWith("http:") || element.src.startsWith("https:"))
            ) {
              html += `<img src="${element.src}" alt="${element.alt ?? ""}" style="${styles.image}" />`;
            } else {
              console.warn(`Skipping image with invalid/missing src at index ${index}.`);
            }
            break;
          case "button":
            if (
              element.url &&
              (element.url.startsWith("http:") || element.url.startsWith("https:"))
            ) {
              html += `<a href="${element.url}" target="_blank" style="${styles.button}">${element.text ?? "Click Here"}</a>`;
            } else {
              console.warn(`Skipping button with invalid/missing URL at index ${index}.`);
            }
            break;
        }
      } catch (renderError) {
        console.error(`Error rendering element at index ${index}:`, renderError);
        html += `<p style="${styles.error}">Error rendering element ${index + 1}</p>`;
      }
    });
  }

  html += `
        ${/* Minimal footer for test email */ ""}
         <div style="${styles.footer}">This is a test email generated for preview purposes.</div>
      </div>
    </body>
    </html>
  `;
  return html;
}

// Helper type guard for Prisma errors (can be shared)
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
