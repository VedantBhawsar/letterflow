import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { nanoid } from "nanoid";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    // First check if database is accessible
    try {
      await prisma.$connect();
    } catch (connectionError) {
      console.error("Database connection failed:", connectionError);
      throw connectionError;
    }

    const forms = await prisma.subscriptionForm.findMany({
      where: {
        userId: userId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching subscription forms:", error);

    // Add detailed error information for troubleshooting
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error({
      message: "Detailed error when fetching forms",
      errorMessage,
      errorStack,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        error: "Failed to fetch subscription forms",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting from database:", disconnectError);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: "Form name is required" }, { status: 400 });
    }

    if (!data.fields || !Array.isArray(data.fields) || data.fields.length === 0) {
      return NextResponse.json({ error: "At least one form field is required" }, { status: 400 });
    }

    // Generate a unique formKey for embedding and direct access
    const formKey = nanoid(10);

    const form = await prisma.subscriptionForm.create({
      data: {
        userId,
        name: data.name,
        description: data.description || "",
        fields: data.fields,
        settings: data.settings || {
          submitButtonText: "Subscribe",
          successMessage: "Thank you for subscribing!",
          doubleOptIn: false,
          honeypotEnabled: true,
          recaptchaEnabled: false,
        },
        style: data.style || {
          primaryColor: "#3b82f6",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          fontFamily: "Inter, sans-serif",
          borderRadius: "4",
          buttonStyle: "filled",
        },
        status: "active",
        formKey,
        views: 0,
        submissions: 0,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating subscription form:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Failed to create subscription form",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
