"use client";

import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import CloudinaryProvider from "@/components/providers/cloudinary-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <CloudinaryProvider>{children}</CloudinaryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
