import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

const generateApiKey = () => {
  return uuidv4();
};

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
    });
    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json({ message: "Error fetching API keys" }, { status: 500 });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const newApiKey = await prisma.apiKey.create({
      data: {
        userId: session.user.id,
        key: generateApiKey(),
      },
    });
    return NextResponse.json(newApiKey, { status: 201 });
  } catch (error) {
    console.error("Error generating API key:", error);
    return NextResponse.json({ message: "Error generating API key" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const apiKeyId = searchParams.get("id");

  if (!apiKeyId) {
    return NextResponse.json({ message: "API key ID is required" }, { status: 400 });
  }

  try {
    // Ensure the API key belongs to the authenticated user before deleting
    const apiKeyToDelete = await prisma.apiKey.findUnique({
      where: {
        id: apiKeyId,
      },
    });

    if (!apiKeyToDelete || apiKeyToDelete.userId !== session.user.id) {
      return NextResponse.json({ message: "API key not found or unauthorized" }, { status: 404 });
    }

    await prisma.apiKey.delete({
      where: {
        id: apiKeyId,
      },
    });

    return NextResponse.json({ message: "API key revoked successfully" });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ message: "Error revoking API key" }, { status: 500 });
  }
}
