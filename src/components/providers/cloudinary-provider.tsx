"use client";

import React, { ReactNode, useEffect } from "react";

// Default cloud name to use when environment variable is not set
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";

// Define the cloudinary configuration object
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo",
};

interface CloudinaryProviderProps {
  children: ReactNode;
}

// This component configures Cloudinary globally for the application
export default function CloudinaryProvider({ children }: CloudinaryProviderProps) {
  useEffect(() => {
    // Configure Cloudinary globally
    if (!CLOUD_NAME || CLOUD_NAME === "demo") {
      console.warn(
        "Cloudinary cloud name not properly configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in your .env.local file."
      );
    }

    window.cloudinary = {
      ...window.cloudinary,
      cloudName: CLOUD_NAME,
    };

    // Log Cloudinary configuration for debugging
    if (process.env.NODE_ENV === "development") {
      console.log("Cloudinary configured with cloud name:", CLOUD_NAME);
    }
  }, []);

  return <>{children}</>;
}

// Add this to the global Window interface
declare global {
  interface Window {
    cloudinary: any;
  }
}
