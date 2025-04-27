// /app/api/campaigns/[campaignId]/route.ts
import { NextRequest, NextResponse } from "next/server"; // Use NextRequest for potentially more features
import { PrismaClient, Prisma } from "@prisma/client"; // Import Prisma namespace
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if needed

// Instantiate PrismaClient outside handlers (singleton pattern recommended)
const prisma = new PrismaClient();

// Define a robust type for the GET response payload using Prisma's generated types
export type CampaignWithDetails = Prisma.CampaignGetPayload<{
  include: {
    stats: true;
    audiences: { select: { id: true } }; // Match the include/select shape
  };
}>;

// --- GET Handler ---
export async function GET(
  request: NextRequest, // Using NextRequest is often preferred
  { params }: { params: Promise<{ campaignId: string }> } // Standard inline type for context obj
) {
  const par = await params;
  // campaignId is directly available via destructuring
  const campaignId = par.campaignId;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!campaignId) {
      // Should not happen if route matches, but belts and suspenders
      return NextResponse.json({ error: "Campaign ID is missing" }, { status: 400 });
    }

    const campaign: CampaignWithDetails | null = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        userId: userId, // Ensure user owns the campaign
      },
      include: {
        stats: true,
        audiences: {
          select: { id: true }, // Fetch only IDs
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error(`Error fetching campaign ${campaignId}:`, error);
    if (process.env.NODE_ENV === "development") {
      console.error(error); // Log full error in dev
    }
    return NextResponse.json({ error: "Failed to fetch campaign details" }, { status: 500 });
  }
  // finally {
  //   // Avoid disconnecting if using a shared/singleton Prisma instance
  //   // await prisma.$disconnect();
  // }
}

// --- DELETE Handler ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> } // Standard inline type for context obj
) {
  const par = await params;
  // campaignId is directly available via destructuring
  const campaignId = par.campaignId;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is missing" }, { status: 400 });
    }

    // --- Perform deletion within a transaction ---
    const deletedCampaign = await prisma.$transaction(async (tx) => {
      // 1. Verify campaign exists and belongs to the user
      const campaignToDelete = await tx.campaign.findUnique({
        where: { id: campaignId, userId: userId },
        select: { id: true },
      });

      if (!campaignToDelete) {
        throw new Error("Campaign not found or access denied"); // Causes rollback
      }

      // 2. Handle Subscribers (Optional - see previous comments)
      // await tx.subscriber.updateMany({ ... });

      // 3. Delete related CampaignStats (if not using cascade delete in schema)
      await tx.campaignStats.deleteMany({
        where: { campaignId: campaignId },
      });

      // 4. Delete the campaign itself
      const deleted = await tx.campaign.delete({
        where: { id: campaignId },
      });

      return deleted;
    });

    return NextResponse.json(
      { message: "Campaign deleted successfully", campaign: deletedCampaign },
      { status: 200 }
    );
  } catch (error: Error | unknown) {
    console.error(`Error deleting campaign ${campaignId}:`, error);
    if (error instanceof Error && error.message === "Campaign not found or access denied") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  }
  // finally {
  //   // Avoid disconnecting if using a shared/singleton Prisma instance
  //   // await prisma.$disconnect();
  // }
}

// export async function PUT(request: NextRequest, { params }: { params: { campaignId: string } }) { ... } // Use same signature
