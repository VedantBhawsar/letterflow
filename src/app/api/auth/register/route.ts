import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, name, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Check if username is taken
    const existingUserByUsername = await prisma.user.findFirst({
      where: { username },
      select: { id: true },
    });

    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        username,
        name,
        email,
        password: hashedPassword,
      },
    });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 });
  }
}
