"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";

const navLinks = [
  { name: "About Us", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "Blog", href: "#blog" },
  { name: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession()
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href={"/"} className="flex items-center gap-2">
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
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        {!session?.user ? <div className="hidden md:flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/get-started">Get Started</Link>
          </Button>
        </div> : <div className="hidden md:flex items-center gap-4">
          <Button variant="default" size="sm" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
        }
        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <div className="flex flex-col gap-6 mt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/get-started">Get Started</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
