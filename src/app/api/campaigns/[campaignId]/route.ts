// /app/api/campaigns/[campaignId]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Campaign, CampaignStats } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Adjust path if needed

const prisma = new PrismaClient();

export type CampaignWithStats = Campaign & {
  stats: CampaignStats | null;
};

export async function GET(request: Request, { params }: { params: { campaignId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId,
        // IMPORTANT: Ensure the campaign belongs to the logged-in user
        userId: userId,
      },
      include: {
        stats: true, // Include the related CampaignStats
        // Optionally include other relations if needed on the details page
        // audiences: { select: { id: true, email: true } }, // Example: Get audience info
        audiences: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.error(`Error fetching campaign ${params.campaignId}:`, error);
    // Provide a generic error message in production
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch campaign details";
    if (process.env.NODE_ENV === "development") {
      console.error(error); // Log full error in dev
    }
    return NextResponse.json({ error: "Failed to fetch campaign details" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// Optional: Add DELETE or PUT handlers here later if needed
export async function DELETE(request: Request, { params }: { params: { campaignId: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    // --- Perform deletion within a transaction ---
    const deletedCampaign = await prisma.$transaction(async (tx) => {
      // 1. Verify campaign exists and belongs to the user
      const campaignToDelete = await tx.campaign.findUnique({
        where: {
          id: campaignId,
          userId: userId,
        },
        select: { id: true }, // Select only necessary fields
      });

      if (!campaignToDelete) {
        // Throw an error inside transaction to cause rollback
        throw new Error("Campaign not found or access denied");
      }

      const subscribers = await tx.subscriber.findMany({
        where: {
          userId: userId,
          campaignIds: { has: campaignId },
        },
      });

      await tx.campaignStats.deleteMany({
        where: { campaignId: campaignId },
      });
      // If relying purely on cascade, this step can be omitted.

      // 4. Delete the campaign itself
      const deleted = await tx.campaign.delete({
        where: {
          id: campaignId,
        },
      });

      return deleted;
    });

    return NextResponse.json(
      { message: "Campaign deleted successfully", campaign: deletedCampaign },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting campaign ${params.campaignId}:`, error);

    if (error.message === "Campaign not found or access denied") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Generic error for other issues
    const errorMessage = error instanceof Error ? error.message : "Failed to delete campaign";
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
    return NextResponse.json({ error: "Failed to delete campaign" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// export async function PUT(...) { ... }
