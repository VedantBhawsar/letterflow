import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const formSchema = z.object({
  name: z.string().min(1, { message: "Form name is required" }),
  description: z.string().optional(),
  fields: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["text", "email", "number", "checkbox", "select"]),
      label: z.string(),
      placeholder: z.string().optional(),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })
  ),
  settings: z.object({
    submitButtonText: z.string().default("Subscribe"),
    successMessage: z.string().default("Thank you for subscribing!"),
    doubleOptIn: z.boolean().default(false),
    redirectUrl: z.string().optional(),
    honeypotEnabled: z.boolean().default(true),
    recaptchaEnabled: z.boolean().default(false),
    recaptchaSiteKey: z.string().optional(),
  }),
  style: z.object({
    primaryColor: z.string().default("#3b82f6"),
    backgroundColor: z.string().default("#ffffff"),
    textColor: z.string().default("#000000"),
    fontFamily: z.string().default("Inter, sans-serif"),
    borderRadius: z.string().default("4"),
    buttonStyle: z.enum(["filled", "outline", "minimal"]).default("filled"),
  }),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }
    const form = await prisma.subscriptionForm.findUnique({
      where: {
        id: id,
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error retrieving form:", error);
    return NextResponse.json({ error: "Failed to retrieve form" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedForm = formSchema.parse(body);

    if (!id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    const form = await prisma.subscriptionForm.update({
      where: {
        id: id,
      },
      data: validatedForm,
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error updating form:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid form data", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to update form" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Form ID is required" }, { status: 400 });
    }

    await prisma.subscriptionForm.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json({ error: "Failed to delete form" }, { status: 500 });
  }
}
