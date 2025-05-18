# Letterflow

![Letterflow](https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1000&auto=format&fit=crop)

## Overview

Letterflow is a modern newsletter and email campaign management platform built with Next.js, Prisma, and Tailwind CSS. It empowers creators, businesses, and organizations to create, manage, and analyze their email marketing campaigns through an intuitive interface.

## Features

- **Authentication** - Secure user authentication with Next-Auth
- **Newsletter Creation** - Create beautiful, responsive newsletters with a rich text editor
- **Subscriber Management** - Import, export, and segment your subscribers
- **Campaign Analytics** - Track open rates, click-through rates, and other key metrics
- **Form Builder** - Create embedded signup forms for your website
- **Responsive Design** - Beautiful UI that works on all devices
- **Dark Mode Support** - Seamless switching between light and dark themes

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **UI Components**: Radix UI, Shadcn UI
- **State Management**: React Query
- **Form Handling**: React Hook Form, Zod
- **Analytics**: Custom analytics engine with Recharts

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or bun package manager
- PostgreSQL database

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/letterflow-landing.git
cd letterflow-landing
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set up environment variables:

Create a `.env.local` file with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/letterflow"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
SMTP_HOST="your-smtp-host"
SMTP_PORT="your-smtp-port"
SMTP_USER="your-smtp-user"
SMTP_PASSWORD="your-smtp-password"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React components
│   │   ├── campaigns/    # Campaign-related components
│   │   ├── newsletters/  # Newsletter-related components
│   │   ├── sections/     # Landing page sections
│   │   ├── subscribers/  # Subscriber management components
│   │   └── ui/           # Reusable UI components
│   └── lib/              # Utility functions and contexts
├── scripts/              # Setup and utility scripts
└── ...
```

## Development

### Commands

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run setup:cloudinary` - Set up Cloudinary configuration

## Deployment

The application is designed to be deployed on Vercel. Simply connect your GitHub repository to Vercel and deploy.

For other platforms, build the application using:

```bash
npm run build
```

Then start the server with:

```bash
npm run start
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Prisma](https://www.prisma.io/)
- [NextAuth.js](https://next-auth.js.org/)
