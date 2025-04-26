import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cache for the embed script content to avoid reading from disk on every request
let cachedScript: string | null = null;
const CACHE_TTL = 3600000; // 1 hour in milliseconds
let lastCacheTime = 0;

/**
 * Serves the form embed script
 * This endpoint reads the actual script from the file system and serves it with appropriate caching headers
 */
export async function GET(request: NextRequest) {
  try {
    const currentTime = Date.now();

    // If cache is expired or not set, read the file
    if (!cachedScript || currentTime - lastCacheTime > CACHE_TTL) {
      const scriptPath = path.join(process.cwd(), "public", "js", "form-embed.js");
      cachedScript = fs.readFileSync(scriptPath, "utf-8");
      lastCacheTime = currentTime;
    }

    // Return the script with appropriate headers
    return new NextResponse(cachedScript, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour in browser
      },
    });
  } catch (error) {
    console.error("Error serving embed script:", error);
    return NextResponse.json({ error: "Failed to serve embed script" }, { status: 500 });
  }
}
