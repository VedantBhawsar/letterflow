This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Cloudinary Setup

### Option 1: Automated Setup (Recommended)

Run our setup script which will guide you through the process:

```bash
npm run setup:cloudinary
```

### Option 2: Manual Setup

1. Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your Dashboard and copy your Cloud Name
3. Create a new upload preset specifically for unsigned uploads:
   - Go to Settings > Upload
   - Scroll down to Upload presets and click "Add upload preset"
   - Set "Upload preset name" to "letterflow_preset" (or your preferred name)
   - Set Signing Mode to "Unsigned"
   - Under "Upload Control", ensure "Allow unsigned uploads" is checked
   - Save the preset
4. Update your `.env.local` file with:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=letterflow_preset
```

### Troubleshooting Cloudinary Uploads

If you encounter the error "Upload preset must be whitelisted for unsigned uploads":

1. Go to Cloudinary dashboard > Settings > Upload
2. Find your upload preset and make sure:
   - Signing Mode is set to "Unsigned"
   - The "Allow unsigned uploads" checkbox is enabled
   - The upload preset is properly named (matching what you use in your code)
3. Save changes
4. If the problem persists, create a new upload preset specifically for unsigned uploads
5. Update the environment variable `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` with your new preset name
