import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma), // Use the Prisma Adapter
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.error("No user found with email:", credentials.email);
          return null; // User not found
        }

        // Check if the user signed up using credentials (has a password)
        if (!user.password) {
          console.error("User signed up with OAuth, no password set.");
          // Optionally, you could prompt them to use their OAuth provider
          // or implement a password reset flow that sets a password.
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password // Compare with the hashed password from the DB
        );

        if (!isValidPassword) {
          console.error("Invalid password for user:", credentials.email);
          return null; // Password doesn't match
        }

        console.log("Credentials valid for user:", user.email);
        // Return user object that NextAuth expects (must include id)
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/", // Redirect to home page after sign out
    error: "/login", // Redirect to login page on error (e.g., OAuth errors)
    newUser: "/register", // Prisma adapter handles new OAuth users automatically
    // Verification page for email provider (if you add one later)
    // verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Add the secret
  callbacks: {
    // Include user ID in the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Persist the user id from the authorize function or OAuth profile
      }
      return token;
    },
    // Include user ID in the session object
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // Add the id from the token to the session
      }
      return session;
    },
  },
  // Optional: Add debug messages in development
  debug: process.env.NODE_ENV === "development",
};
