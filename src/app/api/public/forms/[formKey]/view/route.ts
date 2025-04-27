import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Batch processing for views
interface ViewRecord {
  formKey: string;
  referrer: string;
  timestamp: number;
  userAgent?: string;
}

// Queue for batching view records
const viewQueue: ViewRecord[] = [];
const BATCH_SIZE = 10; // Process in batches of 10
let processingTimeout: NodeJS.Timeout | null = null;
const PROCESSING_INTERVAL = 30 * 1000; // Process every 30 seconds

/**
 * POST handler for recording form views
 * Uses batch processing to minimize database writes
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ formKey: string }> }) {
  const { formKey } = await params;
  let referrer = "direct";
  let userAgent: string | undefined;

  // Try to get referrer and user agent from request
  try {
    referrer = req.headers.get("referer") || "direct";
    userAgent = req.headers.get("user-agent") || undefined;

    // Attempt to parse body if provided
    const body = await req.json().catch(() => ({}));
    if (body.referrer) {
      referrer = body.referrer;
    }
  } catch (e) {
    // Silent fail - just use defaults
  }

  // Add to queue
  viewQueue.push({
    formKey,
    referrer,
    timestamp: Date.now(),
    userAgent,
  });

  // Schedule processing if not already scheduled
  if (!processingTimeout) {
    processingTimeout = setTimeout(processViewQueue, PROCESSING_INTERVAL);
  }

  // Process immediately if batch size reached
  if (viewQueue.length >= BATCH_SIZE) {
    clearTimeout(processingTimeout!);
    processingTimeout = null;
    processViewQueue();
  }

  // Always return success immediately
  return NextResponse.json({ success: true });
}

/**
 * Process the view queue in batches
 */
async function processViewQueue() {
  if (viewQueue.length === 0) {
    processingTimeout = null;
    return;
  }

  // Take items from the queue
  const batch = viewQueue.splice(0, BATCH_SIZE);

  try {
    // Group views by formKey
    const viewsByForm: Record<string, { count: number; traffic: Record<string, number> }> = {};

    batch.forEach((view) => {
      if (!viewsByForm[view.formKey]) {
        viewsByForm[view.formKey] = { count: 0, traffic: {} };
      }

      viewsByForm[view.formKey].count++;

      // Track traffic source
      const source = view.referrer;
      viewsByForm[view.formKey].traffic[source] =
        (viewsByForm[view.formKey].traffic[source] || 0) + 1;
    });

    // Update forms in parallel
    const updates = Object.entries(viewsByForm).map(async ([formKey, data]) => {
      try {
        // First get the current form to update traffic data
        const form = await prisma.subscriptionForm.findUnique({
          where: { formKey },
          select: { id: true, traffic: true },
        });

        if (!form) return;

        // Merge traffic data
        const currentTraffic = (form.traffic as Record<string, number>) || {};
        const newTraffic = { ...currentTraffic };

        Object.entries(data.traffic).forEach(([source, count]) => {
          newTraffic[source] = (newTraffic[source] || 0) + count;
        });

        // Update the form
        await prisma.subscriptionForm.update({
          where: { id: form.id },
          data: {
            views: { increment: data.count },
            traffic: newTraffic,
          },
        });
      } catch (error) {
        console.error(`Error updating view count for form ${formKey}:`, error);
      }
    });

    await Promise.all(updates);
  } catch (error) {
    console.error("Error processing view queue:", error);
  }

  // Schedule next batch if there are more items
  if (viewQueue.length > 0) {
    processingTimeout = setTimeout(processViewQueue, PROCESSING_INTERVAL);
  } else {
    processingTimeout = null;
  }
}

// Ensure queue is processed on server shutdown
if (typeof process !== "undefined") {
  ["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, () => {
      if (viewQueue.length > 0) {
        processViewQueue();
      }
    });
  });
}
