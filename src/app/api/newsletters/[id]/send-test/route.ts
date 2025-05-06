import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Assuming prisma client is exported as 'prisma'
import nodemailer from "nodemailer";
import { Newsletter } from "@prisma/client"; // Import Prisma types

// Define expected input structure for the POST request body
interface SendTestEmailInput {
  testEmail?: string | null;
  subject?: string | null;
  previewText?: string | null;
  elements?: NewsletterElement[];
}

// --- Reusable Element Types & Type Guard ---
interface HeadingElement {
  id?: string;
  type: "heading";
  content?: string | null;
  style?: Record<string, string | number>; // Added style
}
interface ParagraphElement {
  // Renamed from 'paragraph' to 'text' to match frontend
  id?: string;
  type: "text";
  content?: string | null;
  style?: Record<string, string | number>; // Added style
}
// ADDED PASSAGE ELEMENT TYPE
interface PassageElement {
  id?: string;
  type: "passage";
  content?: string | null;
  style?: Record<string, string | number>; // Added style
}
interface ImageElement {
  id?: string;
  type: "image";
  src?: string | null;
  alt?: string | null;
  style?: Record<string, string | number>; // Added style
}
interface ButtonElement {
  id?: string;
  type: "button";
  url?: string | null;
  content?: string | null; // Renamed 'text' to 'content' to match frontend
  style?: Record<string, string | number>; // Added style
}
// ADDED OTHER ELEMENT TYPES TO MATCH FRONTEND (assuming they exist)
interface DividerElement {
  id?: string;
  type: "divider";
  style?: Record<string, string | number>;
}
interface SpacerElement {
  id?: string;
  type: "spacer";
  height?: string; // or number
  style?: Record<string, string | number>;
}
interface SocialElement {
  id?: string;
  type: "social";
  socialLinks?: { platform: string; url: string }[];
  style?: Record<string, string | number>;
}
interface CodeElement {
  id?: string;
  type: "code";
  content?: string | null;
  style?: Record<string, string | number>;
}
interface ColumnsElement {
  id?: string;
  type: "columns";
  columns?: NewsletterElement[][]; // Array of arrays of elements
  style?: Record<string, string | number>;
}

type NewsletterElement =
  | HeadingElement
  | ParagraphElement // Renamed to TextElement if you prefer
  | PassageElement // <-- ADDED
  | ImageElement
  | ButtonElement
  | DividerElement
  | SpacerElement
  | SocialElement
  | CodeElement
  | ColumnsElement;

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
// The { params: Promise<{ id: string }> } was unusual.
// Next.js dynamic route params are typically passed as the second arg directly.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // Directly access id

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to send test emails" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    let body: SendTestEmailInput;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("Error parsing POST request body:", parseError);
      return NextResponse.json(
        { message: "Invalid request: Could not parse JSON body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const testEmail = body.testEmail?.trim();
    if (!testEmail) {
      return NextResponse.json({ message: "Test email address is required" }, { status: 400 });
    }

    // Basic email validation
    if (!testEmail.includes("@") || !testEmail.includes(".")) {
      return NextResponse.json({ message: "Invalid email address format" }, { status: 400 });
    }

    // Fetch newsletter from database if elements not provided
    let elements = body.elements;
    let newsletter: Newsletter | null = null;
    let subject = body.subject;

    if (!elements || elements.length === 0) {
      try {
        newsletter = await prisma.newsletter.findUnique({
          where: { id },
        });

        if (!newsletter) {
          return NextResponse.json(
            { message: `Newsletter with ID ${id} not found` },
            { status: 404 }
          );
        }

        // Check ownership
        if (newsletter.userId !== userId) {
          return NextResponse.json(
            { message: "You do not have permission to access this newsletter" },
            { status: 403 }
          );
        }

        // Parse elements from database
        try {
          elements = newsletter.elements as unknown as NewsletterElement[];
          if (!subject) {
            subject = newsletter.subject;
          }
        } catch (parseError) {
          console.error("Error parsing newsletter elements:", parseError);
          return NextResponse.json({ message: "Invalid newsletter data format" }, { status: 500 });
        }
      } catch (dbError) {
        console.error("Database error fetching newsletter:", dbError);
        return NextResponse.json({ message: "Error retrieving newsletter data" }, { status: 500 });
      }
    }

    // Validate elements
    if (!elements || !Array.isArray(elements) || elements.length === 0) {
      return NextResponse.json({ message: "Newsletter has no content elements" }, { status: 400 });
    }

    // Prepare subject line
    subject = subject?.trim() || "Test Newsletter";

    // Prepare preview text (important for email clients)
    const previewText =
      typeof body.previewText === "string"
        ? body.previewText.trim()
        : `Preview: ${subject.substring(0, 100)}`;

    // Generate HTML content
    const htmlContent = generateHTMLFromElements(elements, subject, previewText);

    // Configure email transport
    // For production, you'd use a real SMTP service
    // For testing/development, you might use a service like Ethereal or Mailtrap
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
      port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER || "",
        pass: process.env.EMAIL_SERVER_PASSWORD || "",
      },
    });

    try {
      // Send the email
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || "newsletter@example.com",
        to: testEmail,
        subject: subject,
        text: `This is a test email for the newsletter: ${subject}\n\nPreview text: ${previewText}\n\nNote: This is a plain text fallback. Please view in an HTML-compatible email client.`,
        html: htmlContent,
      });

      console.log("Test email sent:", info.messageId);

      return NextResponse.json(
        {
          message: `Test email sent to ${testEmail}`,
          messageId: info.messageId,
        },
        { status: 200 }
      );
    } catch (emailError) {
      console.error("Error sending test email:", emailError);

      // More detailed error for SMTP issues
      if (isNodemailerError(emailError)) {
        let errorMessage = "Failed to send test email";

        if (emailError.code === "ECONNREFUSED") {
          errorMessage = "Could not connect to email server. Please check your SMTP settings.";
        } else if (emailError.responseCode === 535) {
          errorMessage = "Email authentication failed. Please check your credentials.";
        } else if (emailError.message) {
          errorMessage = emailError.message;
        }

        return NextResponse.json({ message: errorMessage }, { status: 500 });
      }

      return NextResponse.json({ message: "Failed to send test email" }, { status: 500 });
    }
  } catch (error) {
    console.error("Unexpected error in send-test API route:", error);
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 });
  }
}

// --- Reusable Helper function for HTML Generation ---
function generateHTMLFromElements(
  elementsData: NewsletterElement[], // Expect validated array
  emailSubject: string,
  emailPreviewText: string
): string {
  // Inline styles for better email client compatibility
  // These should match or be derived from your frontend rendering styles
  function applyStyles(el: NewsletterElement): string {
    // Convert style object to inline CSS string
    if (!el.style) return "";
    return Object.entries(el.style)
      .map(([key, value]) => {
        // Convert camelCase to kebab-case for CSS
        const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
        return `${cssKey}: ${value}`;
      })
      .join("; ");
  }

  let elementsHtml = "";
  elementsData.forEach((element, index) => {
    try {
      const elStyle = applyStyles(element);
      switch (element.type) {
        case "heading":
          elementsHtml += `<h2 style="${elStyle}">${(element as HeadingElement).content || ""}</h2>`;
          break;
        case "text":
          elementsHtml += `<p style="${elStyle}">${(element as ParagraphElement).content || ""}</p>`;
          break;
        case "passage":
          elementsHtml += `<div style="${elStyle}">${(element as PassageElement).content || ""}</div>`;
          break;
        case "image":
          elementsHtml += `<img src="${(element as ImageElement).src || ""}" alt="${(element as ImageElement).alt || ""}" style="${elStyle}" />`;
          break;
        case "button":
          elementsHtml += `<div style="text-align: center; margin: 20px 0;">
                               <a href="${(element as ButtonElement).url || "#"}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; ${elStyle}">
                                 ${(element as ButtonElement).content || "Click Here"}
                               </a>
                              </div>`;
          break;
        case "divider":
          elementsHtml += `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0; ${elStyle}" />`;
          break;
        case "spacer":
          elementsHtml += `<div style="height: ${(element as SpacerElement).height || "20px"}; font-size: 1px; line-height: 1px; ${elStyle}"> </div>`;
          break;
        case "social":
          let socialHtml = '<div style="text-align: center; margin: 20px 0; ' + elStyle + '">';
          ((element as SocialElement).socialLinks || []).forEach((link) => {
            // Simple text links for now, images would be better
            socialHtml += `<a href="${link.url}" target="_blank" style="display: inline-block; margin: 0 8px; text-decoration: none; color: #2563eb; font-size: 14px;">${link.platform}</a>`;
          });
          socialHtml += "</div>";
          elementsHtml += socialHtml;
          break;
        case "code":
          // Directly inject HTML. Be careful with this.
          // The user-provided style should ideally be on the outer wrapper if possible,
          // or merged intelligently if the code itself has a root element.
          elementsHtml += `<div style="${elStyle}">${(element as CodeElement).content || ""}</div>`;
          break;
        case "columns":
          let columnsTable = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; ${elStyle}"><tbody><tr>`;
          const numCols = (element as ColumnsElement).columns?.length || 1;
          ((element as ColumnsElement).columns || []).forEach((column, colIdx) => {
            const gapSize = ((element as ColumnsElement).style?.gap as string) || "10px";
            const gapValue = parseInt(gapSize.replace("px", "")) / 2;
            columnsTable += `<td width="${100 / numCols}%" valign="top" style="padding: 0 ${gapValue}px;">`;
            // Recursively generate HTML for elements within this column
            columnsTable += generateHTMLFromElements(column, "", ""); // Subject/preview not needed for inner elements
            columnsTable += `</td>`;
          });
          columnsTable += `</tr></tbody></table>`;
          elementsHtml += columnsTable;
          break;
        default:
          // This should not be reached if isNewsletterElement is comprehensive
          console.warn(
            `generateHTMLFromElements: Unhandled element type: ${(element as any).type}`
          );
      }
    } catch (renderError) {
      console.error(
        `Error rendering element at index ${index} (type: ${element.type}):`,
        renderError
      );
      elementsHtml += `<p style="color: red; border: 1px solid red; padding: 10px; margin: 10px 0;">Error rendering element ${index + 1}</p>`;
    }
  });

  // Basic HTML email wrapper
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailSubject}</title>
      <style>
        body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; background-color: #f4f4f4; }
        .email-container { max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd; font-family: Arial, sans-serif; }
        .preview-text { display: none; font-size: 1px; color: #ffffff; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; }
        .test-banner { padding: 10px; background-color: #fffbe6; border-bottom: 1px solid #ffe58f; text-align: center; font-size: 14px; color: #ad8b00; }
        .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #eeeeee; font-size: 12px; color: #888888; text-align: center; }
      </style>
    </head>
    <body>
      <div class="preview-text">${emailPreviewText}</div>
      <div class="test-banner">This is a test preview email.</div>
      <div class="email-container">
        ${elementsHtml}
        <div class="footer">
          This is a test email generated for preview purposes. Your company name, address, unsubscribe link, etc., would normally appear here.
        </div>
      </div>
    </body>
    </html>
  `;
}
