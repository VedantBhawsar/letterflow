"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin, Instagram } from "lucide-react";

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
  { name: "Media", href: "/media" },
];

const productLinks = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Explore", href: "/explore" },
  { name: "Testimonials", href: "/testimonials" },
];

const locationLinks = [
  { name: "San Francisco", href: "/locations/san-francisco" },
  { name: "New York", href: "/locations/new-york" },
  { name: "London", href: "/locations/london" },
  { name: "Singapore", href: "/locations/singapore" },
];

const resourceLinks = [
  { name: "Blog", href: "/blog" },
  { name: "Help Center", href: "/help" },
  { name: "Support", href: "/support" },
  { name: "API Docs", href: "/docs" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white -z-10" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Logo and description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
                <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
                <path d="M5 7.8 3 6.6V18l2 1.2" />
                <path d="m12 10.5-5-3" />
                <path d="m17 7.5-5 3" />
                <path d="M12 13v6" />
              </svg>
              <span className="text-xl font-bold">Letterflow</span>
            </div>

            <p className="text-muted-foreground">
              Elevate your newsletter growth success with our powerful tools for email building,
              analytics, and integrations.
            </p>

            <div className="flex space-x-4">
              <Link
                href="https://twitter.com/letterflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="https://github.com/letterflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com/company/letterflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link
                href="https://instagram.com/letterflow"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>

          {/* Links sections */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Letterflow. All rights reserved.
          </p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
