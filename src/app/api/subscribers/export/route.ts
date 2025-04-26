import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stringify } from "csv-stringify/sync";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const searchParams = req.nextUrl.searchParams;
    const segmentId = searchParams.get("segmentId");
    const format = searchParams.get("format") || "csv";

    // Build query conditions
    const where = {
      userId,
      ...(segmentId ? { segmentIds: { has: segmentId } } : {}),
    };

    // Get all subscribers matching the criteria
    const subscribers = await prisma.subscriber.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data for export
    const exportData = subscribers.map((subscriber) => ({
      email: subscriber.email,
      firstName: subscriber.firstName || "",
      lastName: subscriber.lastName || "",
      status: subscriber.status,
      tags: Array.isArray(subscriber.tags) ? subscriber.tags.join(", ") : "",
      createdAt: subscriber.createdAt.toISOString(),
    }));

    // Convert to CSV
    const csv = stringify(exportData, {
      header: true,
      columns: ["email", "firstName", "lastName", "status", "tags", "createdAt"],
    });

    // Create response with appropriate headers
    const response = new NextResponse(csv);

    response.headers.set("Content-Type", "text/csv");
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="subscribers_export_${new Date().toISOString().split("T")[0]}.csv"`
    );

    return response;
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    return NextResponse.json({ error: "Failed to export subscribers" }, { status: 500 });
  }
}
