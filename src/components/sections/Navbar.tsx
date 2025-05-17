"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

const navLinks = [
  { name: "About Us", href: "/about" },
  { name: "Features", href: "/features" },
  { name: "Blog", href: "/blog" },
  { name: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session } = useSession();

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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6 flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Link href={"/"} className="flex items-center gap-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-emerald-500 group-hover:text-emerald-400 transition-colors duration-200"
            >
              <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
              <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
              <path d="M5 7.8 3 6.6V18l2 1.2" />
              <path d="m12 10.5-5-3" />
              <path d="m17 7.5-5 3" />
              <path d="M12 13v6" />
            </svg>
            <span className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors duration-200">
              Letterflow
            </span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
            >
              <Link
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-all duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Auth Buttons */}
        {!session?.user ? (
          <motion.div
            className="hidden md:flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-200"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              size="sm"
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
            >
              <Link href="/get-started">Get Started</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            className="hidden md:flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Button
              variant="default"
              size="sm"
              asChild
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </motion.div>
        )}

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-slate-800/70 hover:text-emerald-400 transition-all duration-200"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-slate-900/95 backdrop-blur-md border-slate-800 text-white p-6"
          >
            <nav className="flex flex-col gap-6 mt-10">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    className="text-base font-medium text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-3 mt-8">
                <Button
                  variant="outline"
                  asChild
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-emerald-400 hover:border-emerald-500 transition-all duration-200"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button
                  asChild
                  className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all duration-200"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
