import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

// Correct type for route handler parameters
type Params = { id: string };

export async function POST(req: Request, context: { params: Params }) {
  try {
    const id = context.params.id;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to publish newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Check if newsletter exists and belongs to the user
    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!newsletter) {
      return NextResponse.json(
        {
          message: "Newsletter not found or you don't have permission to access it",
        },
        { status: 404 }
      );
    }

    // Check if newsletter status is already published
    if (newsletter.status !== "published") {
      // Update newsletter status to published
      await prisma.newsletter.update({
        where: { id },
        data: { status: "published" },
      });
    }

    // Get all subscribers
    const subscribers = await prisma.subscriber.findMany({
      where: {
        userId,
        status: "active", // Only send to active subscribers
      },
      select: {
        email: true,
        id: true,
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { message: "No active subscribers found to send the newsletter to" },
        { status: 400 }
      );
    }

    // Create HTML content from newsletter elements
    const htmlContent = generateHTMLFromElements(newsletter.elements);

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || "smtp.example.com",
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER || "",
        pass: process.env.EMAIL_SERVER_PASSWORD || "",
      },
    });

    // For each subscriber, send the newsletter
    const sentEmails = [];
    const failedEmails = [];

    for (const subscriber of subscribers) {
      try {
        // Setup email data
        const mailOptions = {
          from: process.env.EMAIL_FROM || "noreply@letterflow.app",
          to: subscriber.email,
          subject: newsletter.subject || "Newsletter from Letterflow",
          text: newsletter.previewText || "Here's your newsletter", // Plain text version
          html: htmlContent, // HTML version
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        sentEmails.push(subscriber.email);
      } catch (error) {
        console.error(`Error sending to ${subscriber.email}:`, error);
        failedEmails.push(subscriber.email);
      }
    }

    // Extract subscriber IDs for the campaign
    const subscriberIds = subscribers.map((sub) => sub.id);

    // Create a campaign record to track this send
    const campaign = await prisma.campaign.create({
      data: {
        name: `Campaign for ${newsletter.name}`,
        subject: newsletter.subject || "Newsletter from Letterflow",
        content: JSON.stringify(newsletter.elements),
        status: "sent",
        sentAt: new Date(),
        userId,
        audienceIds: subscriberIds,
      },
    });

    // Create campaign stats
    await prisma.campaignStats.create({
      data: {
        campaignId: campaign.id,
        sent: sentEmails.length,
        delivered: sentEmails.length, // Assuming all sent were delivered
      },
    });

    // Return the results
    return NextResponse.json({
      message: "Newsletter published and sent to subscribers",
      campaignId: campaign.id,
      totalSubscribers: subscribers.length,
      sentCount: sentEmails.length,
      failedCount: failedEmails.length,
    });
  } catch (error) {
    console.error("Error publishing newsletter:", error);
    return NextResponse.json(
      { message: "Failed to publish newsletter", error: String(error) },
      { status: 500 }
    );
  }
}

// Helper function to generate HTML from newsletter elements
function generateHTMLFromElements(elements: any): string {
  // This is a placeholder implementation
  // You would typically transform the elements into proper HTML here
  // For now, we'll create a simple representation

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Newsletter</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
  `;

  // Basic content processing - this should be enhanced based on your actual element structure
  try {
    if (Array.isArray(elements)) {
      elements.forEach((element) => {
        if (element.type === "heading") {
          html += `<h2 style="color: #333;">${element.content || ""}</h2>`;
        } else if (element.type === "paragraph") {
          html += `<p style="color: #555; line-height: 1.5;">${element.content || ""}</p>`;
        } else if (element.type === "image" && element.src) {
          html += `<img src="${element.src}" alt="${element.alt || ""}" style="max-width: 100%; height: auto; margin: 10px 0;" />`;
        } else if (element.type === "button" && element.url) {
          html += `<a href="${element.url}" style="display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #0070f3; color: white; text-decoration: none; border-radius: 4px;">${element.text || "Click Here"}</a>`;
        }
      });
    } else if (typeof elements === "object") {
      html += `<div>${JSON.stringify(elements)}</div>`;
    }
  } catch (err) {
    console.error("Error generating HTML:", err);
    html += `<p>There was an error generating the newsletter content.</p>`;
  }

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}
