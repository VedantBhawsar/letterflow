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
        { message: "Unauthorized: Please sign in to send test emails" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await req.json();
    const { testEmail, subject, previewText } = body;

    // Validate required fields
    if (!testEmail) {
      return NextResponse.json({ message: "Test email address is required" }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ message: "Email subject is required" }, { status: 400 });
    }

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

    // Get the newsletter content to send in the email
    const newsletterElements = newsletter.elements;

    // Create HTML content from newsletter elements
    // This is a simplified approach - you might need to build actual HTML from the elements
    const htmlContent = generateHTMLFromElements(newsletterElements);

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

    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@letterflow.app",
      to: testEmail,
      subject: subject,
      text: previewText || "Preview of your newsletter", // Plain text version
      html: htmlContent, // HTML version
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    console.log(`Sent test email for newsletter ${id} to ${testEmail}`);

    return NextResponse.json({
      message: "Test email sent successfully",
      recipient: testEmail,
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { message: "Failed to send test email", error: String(error) },
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
