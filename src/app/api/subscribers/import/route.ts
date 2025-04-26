import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { parse } from "papaparse";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const fileType = file.name.split(".").pop()?.toLowerCase();
    if (!["csv", "xlsx", "xls"].includes(fileType || "")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a CSV or Excel file" },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();

    // Parse CSV
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json({ error: "Error parsing file", details: errors }, { status: 400 });
    }

    // Validate structure (at minimum must have email)
    if (!data.length || !data[0].email) {
      return NextResponse.json(
        { error: "Invalid file structure. File must contain an 'email' column" },
        { status: 400 }
      );
    }

    // Process subscribers
    const results = {
      total: data.length,
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    // Get existing subscribers to avoid duplicates
    const existingEmails = await prisma.subscriber.findMany({
      where: { userId },
      select: { email: true },
    });
    const existingEmailSet = new Set(existingEmails.map((s) => s.email.toLowerCase()));

    // Process in batches for better performance
    const batchSize = 100;
    const batches = [];

    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const validSubscribers = batch
        .filter((row) => row.email && !existingEmailSet.has(row.email.toLowerCase()))
        .map((row) => ({
          userId,
          email: row.email,
          firstName: row.firstName || row.first_name || null,
          lastName: row.lastName || row.last_name || null,
          status: row.status || "active",
          tags: row.tags ? row.tags.split(",").map((tag: string) => tag.trim()) : [],
          // Add any other fields from your schema
        }));

      if (validSubscribers.length > 0) {
        const created = await prisma.subscriber.createMany({
          data: validSubscribers,
          skipDuplicates: true,
        });

        results.created += created.count;
      }

      results.skipped += batch.length - validSubscribers.length;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing subscribers:", error);
    return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 });
  }
}
