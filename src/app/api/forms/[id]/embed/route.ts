import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Mock database for demo purposes - using the same mock form from the parent route
const mockForms = [
  {
    id: "mock-form-1",
    name: "Newsletter Signup Form",
    description: "Sign up for our weekly newsletter",
    fields: [
      {
        id: "email-1",
        type: "email",
        label: "Email Address",
        placeholder: "your@email.com",
        required: true,
      },
      {
        id: "name-1",
        type: "text",
        label: "Full Name",
        placeholder: "John Doe",
        required: false,
      },
    ],
    formKey: "mock-form-key-123",
    // Other properties...
  },
];

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // For demo purposes: Generate a mock form matching the requested id
    // This ensures we always have embed code regardless of the ID passed
    let formKey;

    if (id === "mock-form-1") {
      // Use the default mock form key
      formKey = mockForms[0].formKey;
    } else {
      // Generate a form key based on the ID
      formKey = `key-${id.slice(0, 8)}`;
    }

    // Generate embed codes
    const jsEmbed = `<script src="${baseUrl}/api/public/embed.js" data-form-key="${formKey}"></script>`;

    const htmlEmbed = `<iframe src="${baseUrl}/public/forms/${formKey}" width="100%" height="400" frameborder="0"></iframe>`;

    const directLink = `${baseUrl}/public/forms/${formKey}`;

    return NextResponse.json({
      jsEmbed,
      htmlEmbed,
      directLink,
    });
  } catch (error) {
    console.error("Error generating embed code:", error);
    return NextResponse.json({ error: "Failed to generate embed code" }, { status: 500 });
  }
}
