/**
 * Cloudinary Setup Script
 *
 * This script provides guidance for setting up Cloudinary for the Letterflow application.
 * Run this with: node scripts/setup-cloudinary.js
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                 LETTERFLOW CLOUDINARY SETUP                  ║
╚══════════════════════════════════════════════════════════════╝

This script will guide you through setting up Cloudinary for image uploads.

STEP 1: Create a Cloudinary account at https://cloudinary.com if you don't have one

STEP 2: Get your Cloud Name from your Cloudinary dashboard

STEP 3: Create an Upload Preset:
  - Go to Settings > Upload
  - Scroll to Upload presets and click "Add upload preset"
  - Set "Upload preset name" to "letterflow_preset" (or your choice)
  - Important: Set Signing Mode to "Unsigned"
  - Make sure "Allow unsigned uploads" is checked
  - Save the preset
`);

// Prompt for the cloud name
rl.question("\nEnter your Cloudinary Cloud Name: ", (cloudName) => {
  if (!cloudName) {
    console.error("Error: A cloud name is required.");
    rl.close();
    return;
  }

  rl.question(
    "Enter your Cloudinary Upload Preset name (default: letterflow_preset): ",
    (presetName) => {
      const uploadPreset = presetName || "letterflow_preset";

      // Update .env.local file
      const envPath = path.join(process.cwd(), ".env.local");
      let envContent = "";

      try {
        if (fs.existsSync(envPath)) {
          envContent = fs.readFileSync(envPath, "utf8");
        }
      } catch (err) {
        console.log("No existing .env.local file found. Creating a new one.");
      }

      // Replace or add the Cloudinary values
      const cloudNameRegex = /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=.*/;
      const uploadPresetRegex = /NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=.*/;

      if (cloudNameRegex.test(envContent)) {
        envContent = envContent.replace(
          cloudNameRegex,
          `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=${cloudName}`;
      }

      if (uploadPresetRegex.test(envContent)) {
        envContent = envContent.replace(
          uploadPresetRegex,
          `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${uploadPreset}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=${uploadPreset}`;
      }

      // Write to .env.local
      fs.writeFileSync(envPath, envContent.trim() + "\n");

      console.log(`
✅ Configuration saved to .env.local

To use in your code:
- Use the preset name "${uploadPreset}" in your CldUploadWidget components
- Make sure your preset is configured for unsigned uploads in Cloudinary

If you encounter any issues:
1. Check if your preset is properly configured for unsigned uploads
2. Verify your cloud name is correct
3. Try creating a new preset specifically for this application

For more details, refer to README.md
    `);

      rl.close();
    }
  );
});
