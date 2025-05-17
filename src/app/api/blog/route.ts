import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET handler to fetch all blogs
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Get query parameters
    const url = new URL(req.url);
    const featured = url.searchParams.get("featured");
    const category = url.searchParams.get("category");
    const tag = url.searchParams.get("tag");
    const search = url.searchParams.get("search");

    // Build filter conditions
    let whereClause: any = {};

    // Filter by featured status if specified
    if (featured === "true") {
      whereClause.featured = true;
    }

    // Filter by category if specified
    if (category) {
      whereClause.categories = {
        has: category,
      };
    }

    // Filter by tag if specified
    if (tag) {
      whereClause.tags = {
        has: tag,
      };
    }

    // Search in title or description if search term provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch blogs from database
    const blogs = await prisma.blog.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

// POST handler to create a new blog
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;

    // Parse request body
    const {
      title,
      description,
      content,
      image,
      readTime,
      slug,
      gradient,
      categories,
      tags,
      featured,
    } = await req.json();

    // Validate required fields
    if (!title || !description || !content || !slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      return NextResponse.json({ error: "A blog with this slug already exists" }, { status: 409 });
    }

    // Create new blog in database
    const newBlog = await prisma.blog.create({
      data: {
        title,
        description,
        content,
        image: image || null,
        readTime: readTime || null,
        slug,
        gradient: gradient || "from-blue-600/20 to-purple-500/20",
        categories: categories || [],
        tags: tags || [],
        featured: featured || false,
        userId,
      },
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
