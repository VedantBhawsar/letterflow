import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to update newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const body = await req.json();
    const { name, elements, subject, previewText, status } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ message: "Newsletter name is required" }, { status: 400 });
    }

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { message: "Newsletter elements are required and must be an array" },
        { status: 400 }
      );
    }

    // Check if newsletter exists and belongs to the user
    const existingNewsletter = await prisma.newsletter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNewsletter) {
      return NextResponse.json(
        {
          message: "Newsletter not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    // Update the newsletter in the database
    const updatedNewsletter = await prisma.newsletter.update({
      where: {
        id,
      },
      data: {
        name,
        elements: elements, // Store as JSON
        subject: subject || "",
        previewText: previewText || "",
        status: status || "draft", // Default to draft if not provided
        updatedAt: new Date(),
      },
    });

    console.log("Newsletter updated:", updatedNewsletter);

    return NextResponse.json(updatedNewsletter);
  } catch (error) {
    console.error("Error updating newsletter:", error);
    return NextResponse.json(
      { message: "Failed to update newsletter", error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to view newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Get the newsletter
    const newsletter = await prisma.newsletter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!newsletter) {
      return NextResponse.json({ message: "Newsletter not found" }, { status: 404 });
    }

    console.log("Newsletter retrieved:", newsletter);

    return NextResponse.json(newsletter);
  } catch (error) {
    console.error("Error fetching newsletter:", error);
    return NextResponse.json(
      { message: "Failed to fetch newsletter", error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized: Please sign in to delete newsletters" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;

    // Check if newsletter exists and belongs to the user
    const existingNewsletter = await prisma.newsletter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingNewsletter) {
      return NextResponse.json(
        {
          message: "Newsletter not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Delete the newsletter
    await prisma.newsletter.delete({
      where: {
        id,
      },
    });

    console.log("Newsletter deleted:", id);

    return NextResponse.json({ message: "Newsletter deleted successfully" });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return NextResponse.json(
      { message: "Failed to delete newsletter", error: String(error) },
      { status: 500 }
    );
  }
}
