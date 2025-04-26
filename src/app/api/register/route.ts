// app/api/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import * as z from "zod";

// Define Zod schema for backend validation (mirroring frontend but without terms)
const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid input",
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 } // Conflict
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, // Store the hashed password
      },
    });

    // Don't return the password hash in the response
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      { user: userWithoutPassword, message: "User created successfully" },
      { status: 201 } // Created
    );
  } catch (error) {
    console.error("Registration Error:", error);
    // Generic error message for security
    return NextResponse.json({ message: "An internal server error occurred" }, { status: 500 });
  }
}
