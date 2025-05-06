import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { Newsletter, NewsletterStatus } from "@prisma/client"; // Import Newsletter type if available

// --- Define Types for Newsletter Elements ---

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

// Union of all possible element types
type NewsletterElement = HeadingElement | ParagraphElement | ImageElement | ButtonElement;

// --- End Element Types ---

// Correct type for route handler parameters
type RouteContext = {
  params: Promise<{ id: string }>;
};

// Type guard to check if an object is a valid NewsletterElement structure
function isNewsletterElement(obj: unknown): obj is NewsletterElement {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const element = obj as Record<string, unknown>; // Temporary assertion to check properties
  if (typeof element.type !== "string") {
    return false; // 'type' property is mandatory and must be a string
  }
  // Check if the type is one of the known element types
  switch (element.type) {
    case "heading":
    case "paragraph":
    case "image":
    case "button":
      return true;
    default:
      console.warn(`Unknown newsletter element type encountered: ${element.type}`);
      return false;
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      // More specific check
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to publish newsletters" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Fetch the newsletter, assuming 'elements' field is Json type in Prisma schema
    // Prisma returns 'JsonValue', which can be any valid JSON type (string, number, boolean, null, object, array)
    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!newsletter) {
      return NextResponse.json(
        { message: "Newsletter not found or you don't have permission to access it" },
        { status: 404 }
      );
    }

    // Ensure newsletter.elements is handled safely, expecting NewsletterElement[]
    if (newsletter.status !== NewsletterStatus.PUBLISHED) {
      await prisma.newsletter.update({
        where: { id },
        data: { status: NewsletterStatus.PUBLISHED, publishedAt: new Date() }, // Record publish time
      });
      console.log(`Newsletter ${id} status updated to published.`);
    } else {
      console.log(`Newsletter ${id} is already published.`);
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        userId,
        status: "active", // Only active subscribers
      },
      select: { email: true, id: true },
    });

    if (subscribers.length === 0) {
      console.log(`No active subscribers found for user ${userId} to send newsletter ${id}.`);
      // Maybe update the newsletter status back to draft or indicate no one was sent to?
      // Or just inform the user.
      await prisma.newsletter.update({
        where: { id },
        // Optionally add a note or keep as published
        data: { lastAttemptedSend: new Date() },
      });
      return NextResponse.json(
        {
          message:
            "Newsletter marked as published, but no active subscribers were found to send it to.",
        },
        { status: 200 } // Use 200 OK as the action was technically successful (publishing)
      );
    }

    // --- Generate HTML content safely ---
    // Pass the 'elements' field (which is likely Prisma.JsonValue) to the typed function
    const htmlContent = generateHTMLFromElements(newsletter.elements);

    // --- Nodemailer setup ---
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST, // Remove defaults, rely on env
      port: Number(process.env.EMAIL_SERVER_PORT) || 587, // Default port is common
      secure: process.env.EMAIL_SERVER_PORT === "465", // Often port 465 uses secure
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // Add connection timeout if needed
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify transporter connection (optional but good practice)
    try {
      await transporter.verify();
      console.log("Email transporter verified successfully.");
    } catch (verifyError) {
      console.error("Email transporter verification failed:", verifyError);
      return NextResponse.json(
        {
          message: "Email server configuration error. Could not verify connection.",
          details: String(verifyError),
        },
        { status: 500 }
      );
    }

    // --- Send emails ---
    const sendPromises: Promise<{ email: string; success: boolean; error?: Error }>[] = [];

    for (const subscriber of subscribers) {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "Your Newsletter"}" <${process.env.EMAIL_FROM || "noreply@example.com"}>`,
        to: subscriber.email,
        subject: newsletter.subject || `Newsletter: ${newsletter.name}`, // More specific default subject
        text: newsletter.previewText || `View the latest update: ${newsletter.name}`, // Fallback plain text
        html: htmlContent,
        // Add List-Unsubscribe header for good practice
        headers: {
          "List-Unsubscribe": `<mailto:${process.env.EMAIL_FROM}?subject=unsubscribe>, <${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&id=${subscriber.id}>`, // Example URLs
        },
      };

      // Add sendMail promise to the array
      sendPromises.push(
        transporter
          .sendMail(mailOptions)
          .then(() => ({ email: subscriber.email, success: true }))
          .catch((error: Error) => {
            console.error(`Failed to send email to ${subscriber.email}:`, error.message);
            return { email: subscriber.email, success: false, error };
          })
      );
    }

    // Wait for all emails to be sent (or fail)
    const results = await Promise.all(sendPromises);
    const sentEmails = results.filter((r: any) => r.success).map((r: any) => r.email);
    const failedEmails = results.filter((r: any) => !r.success).map((r: any) => r.email);

    console.log(
      `Attempted to send newsletter ${id} to ${subscribers.length} subscribers. Success: ${sentEmails.length}, Failed: ${failedEmails.length}.`
    );

    // --- Create Campaign and Stats ---
    // Only create if at least one email was attempted (subscribers > 0)
    const subscriberIds = subscribers.map((sub: any) => sub.id); // Correct: use the initially fetched subscribers

    const campaign = await prisma.campaign.create({
      data: {
        name: `Send: ${newsletter.name}`, // Shorter name example
        subject: newsletter.subject || `Newsletter: ${newsletter.name}`,
        content: JSON.stringify(newsletter.elements), // Store original elements data
        status: "sent",
        sentAt: new Date(),
        userId,
        // Link the newsletter this campaign originated from (if schema allows)
        // newsletterId: newsletter.id,
        audienceIds: subscriberIds, // IDs of subscribers targeted
      },
    });

    await prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
        sent: sentEmails.length, // Actual number sent successfully
        delivered: sentEmails.length, // Assume delivery for now, real tracking is complex
        // Initialize other stats to 0
        opened: 0,
        clicked: 0,
        bounced: 0,
        complaints: 0,
        unsubscribed: 0,
      },
    });

    return NextResponse.json({
      message: `Newsletter published. Attempted sending to ${subscribers.length} subscribers.`,
      campaignId: campaign.id,
      totalSubscribers: subscribers.length,
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
      // Optionally include failed email addresses for debugging (consider privacy)
      // failedEmails: failedEmails,
    });
  } catch (error: unknown) {
    // Catch as unknown
    console.error("Fatal error publishing newsletter:", error);
    let errorMessage = "An unexpected error occurred while publishing the newsletter";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // Log raw error for debugging
    // console.error("Raw Error Object:", error);
    return NextResponse.json(
      { message: "Failed to publish newsletter", error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Generates basic HTML content from an array of newsletter elements.
 *
 * @param elementsData - The elements data, expected to be an array of NewsletterElement objects (or Prisma.JsonValue).
 * @returns An HTML string representing the newsletter content.
 */
function generateHTMLFromElements(elementsData: unknown): string {
  // --- Basic Email Styling (Inline recommended for compatibility) ---
  const styles = {
    body: "margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;",
    container:
      "max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border: 1px solid #dddddd;",
    heading: "color: #333333; margin-top: 0;",
    paragraph: "color: #555555; line-height: 1.6;",
    image: "max-width: 100%; height: auto; margin: 15px 0; display: block;", // display: block removes extra space below image
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
      <title>Your Newsletter</title>
    </head>
    <body style="${styles.body}">
      <div style="${styles.container}">
  `;

  // --- Safely process elements ---
  // Check if elementsData is actually an array before iterating
  if (!Array.isArray(elementsData)) {
    console.error("Newsletter elements data is not an array:", elementsData);
    html += `<div style="${styles.error}">Error: Invalid newsletter content format. Unable to display content.</div>`;
  } else {
    // Iterate over the array, validating each element
    elementsData.forEach((element: unknown, index: number) => {
      // Use the type guard to ensure the element has the expected structure
      if (!isNewsletterElement(element)) {
        console.warn(`Skipping invalid element structure at index ${index}:`, element);
        // Optionally render a placeholder or error message for this element
        // html += `<p style="${styles.error}">Invalid element at position ${index + 1}</p>`;
        return; // Skip to the next element
      }

      // --- Render based on type (TypeScript knows the shape inside each case) ---
      try {
        switch (element.type) {
          case "heading":
            html += `<h2 style="${styles.heading}">${element.content ?? ""}</h2>`;
            break;
          case "paragraph":
            html += `<p style="${styles.paragraph}">${element.content ?? ""}</p>`;
            break;
          case "image":
            if (element.src) {
              // Basic check for potentially harmful protocols (though server-side fetch/validation is better)
              if (
                element.src.toLowerCase().startsWith("http:") ||
                element.src.toLowerCase().startsWith("https:")
              ) {
                html += `<img src="${element.src}" alt="${element.alt ?? ""}" style="${styles.image}" />`;
              } else {
                console.warn(
                  `Skipping image with invalid src protocol at index ${index}: ${element.src}`
                );
              }
            } else {
              console.warn(`Image element at index ${index} is missing 'src'.`);
            }
            break;
          case "button":
            if (element.url) {
              // Basic check for potentially harmful protocols
              if (
                element.url.toLowerCase().startsWith("http:") ||
                element.url.toLowerCase().startsWith("https:")
              ) {
                html += `<a href="${element.url}" target="_blank" style="${styles.button}">${element.text ?? "Click Here"}</a>`;
              } else {
                console.warn(
                  `Skipping button with invalid URL protocol at index ${index}: ${element.url}`
                );
              }
            } else {
              console.warn(`Button element at index ${index} is missing 'url'.`);
            }
            break;
          // No default needed because isNewsletterElement already filtered types
        }
      } catch (renderError) {
        console.error(`Error rendering element at index ${index}:`, renderError);
        html += `<p style="${styles.error}">Error rendering element ${index + 1}</p>`;
      }
    });
  }

  // --- Add Footer ---
  html += `
        <div style="${styles.footer}">
          You received this email because you subscribed to our newsletter.
          <br />
          <a href="${process.env.APP_URL}/unsubscribe" target="_blank" style="color: #0070f3;">Unsubscribe</a> |
          <a href="${process.env.APP_URL}/preferences" target="_blank" style="color: #0070f3;">Manage Preferences</a>
          ${process.env.COMPANY_ADDRESS ? `<br />${process.env.COMPANY_ADDRESS}` : ""}
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
}
