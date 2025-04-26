import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FormSettings } from "@/lib/types";

// Email validation schema
const emailSchema = z.string().email({
  message: "Please enter a valid email address",
});

export async function POST(req: NextRequest, { params }: { params: { formKey: string } }) {
  try {
    const formKey = params.formKey;
    const formData = await req.json();
    const referrer = req.headers.get("referer") || "direct";

    // Get the form configuration
    const form = await prisma.subscriptionForm.findUnique({
      where: { formKey },
      include: { user: true },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Parse the form fields and settings
    const fields = form.fields as any[];
    const settings = form.settings as FormSettings;
    const traffic = form.traffic as Record<string, number> | null;

    // Check for honeypot field (spam protection)
    if (settings.honeypotEnabled && formData._honeypot) {
      // Silently accept the submission but don't process it
      return NextResponse.json({ success: true });
    }

    // Basic validation - ensure required fields exist
    for (const field of fields) {
      if (field.required && !formData[field.id]) {
        return NextResponse.json({ error: `Field ${field.label} is required` }, { status: 400 });
      }

      // Additional validation for email fields
      if (field.type === "email" && formData[field.id]) {
        try {
          emailSchema.parse(formData[field.id]);
        } catch (error) {
          return NextResponse.json(
            { error: `Invalid email address for field ${field.label}` },
            { status: 400 }
          );
        }
      }
    }

    // Find email field value
    const emailField = fields.find((field) => field.type === "email");

    if (!emailField || !formData[emailField.id]) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }

    const email = formData[emailField.id];

    // Extract first name and last name if available
    const firstNameField = fields.find((field) => field.label.toLowerCase().includes("first name"));
    const lastNameField = fields.find((field) => field.label.toLowerCase().includes("last name"));

    const firstName = firstNameField ? formData[firstNameField.id] : null;
    const lastName = lastNameField ? formData[lastNameField.id] : null;

    // Prepare additional metadata from other fields
    const metadata: Record<string, any> = {};

    for (const field of fields) {
      if (
        field.type !== "email" &&
        !field.label.toLowerCase().includes("first name") &&
        !field.label.toLowerCase().includes("last name") &&
        formData[field.id]
      ) {
        metadata[field.label] = formData[field.id];
      }
    }

    // Check if subscriber already exists
    const existingSubscriber = await prisma.subscriber.findFirst({
      where: {
        userId: form.userId,
        email,
      },
    });

    // Create or update subscriber
    let subscriber;

    if (existingSubscriber) {
      // Update existing subscriber with new metadata
      subscriber = await prisma.subscriber.update({
        where: { id: existingSubscriber.id },
        data: {
          firstName: firstName || existingSubscriber.firstName,
          lastName: lastName || existingSubscriber.lastName,
          metadata: {
            ...((existingSubscriber.metadata as Record<string, any>) || {}),
            ...metadata,
          },
        },
      });
    } else {
      // Create new subscriber
      subscriber = await prisma.subscriber.create({
        data: {
          userId: form.userId,
          email,
          firstName,
          lastName,
          status: settings.doubleOptIn ? "unconfirmed" : "active",
          tags: ["form-submission"],
          metadata,
        },
      });

      // If double opt-in is enabled, send confirmation email
      if (settings.doubleOptIn) {
        // TODO: Implement email sending logic for double opt-in
        // This would typically involve creating a confirmation token
        // and sending an email with a confirmation link
      }
    }

    // Update form statistics with traffic data
    const updatedTraffic = { ...(traffic || {}) };
    updatedTraffic[referrer] = (updatedTraffic[referrer] || 0) + 1;

    await prisma.subscriptionForm.update({
      where: { id: form.id },
      data: {
        submissions: { increment: 1 },
        traffic: updatedTraffic,
      },
    });

    // Return success response with redirect URL if configured
    const response: any = { success: true };

    if (settings.redirectUrl) {
      response.redirectUrl = settings.redirectUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error processing form submission:", error);
    return NextResponse.json({ error: "Failed to process form submission" }, { status: 500 });
  }
}
