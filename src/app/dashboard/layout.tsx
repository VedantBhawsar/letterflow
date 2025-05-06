"use client";

import { useEffect, useState, useMemo } from "react"; // Added useState, useMemo
import { useSession, signOut } from "next-auth/react"; // Added signOut
import { usePathname, useRouter } from "next/navigation"; // Added usePathname
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Menu,
  Home,
  Mail,
  BarChart2,
  Users,
  Settings,
  LogOut,
  FileText,
  type LucideIcon, // Import type LucideIcon
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import clsx from "clsx"; // Import clsx

// Define the structure for a navigation item
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon; // Use the imported type
}

// Define navigation items in an array for easier mapping
const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Mail },
  { href: "/dashboard/newsletters", label: "Newsletters", icon: FileText },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

// --- Sidebar Component ---
// Moved outside the main layout component for better separation and potential reuse
const SidebarContent = () => {
  const pathname = usePathname(); // Get the current path

  // Function to determine if a link is active
  // Handles exact match for dashboard and startsWith for others (for nested routes)
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href={"/dashboard"} className="flex items-center gap-2 group">
          <svg /* Your SVG logo */
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary transition-transform group-hover:rotate-[15deg]" // Added subtle hover effect
          >
            <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
            <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
            <path d="M5 7.8 3 6.6V18l2 1.2" />
            <path d="m12 10.5-5-3" />
            <path d="m17 7.5-5 3" />
            <path d="M12 13v6" />
          </svg>
          <span className="text-lg font-semibold">Letterflow</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-4">
        {" "}
        {/* Added more padding */}
        <div className="space-y-1.5">
          {" "}
          {/* Increased spacing */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                // Use clsx for conditional classes
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all", // Base styles + padding/rounding adjustment
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-semibold" // Active styles
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50" // Inactive + Hover styles
              )}
            >
              <item.icon className="h-4 w-4" /> {/* Slightly smaller icons can look cleaner */}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto border-t p-4">
        {" "}
        {/* Pushed to bottom with separator */}
        <Button
          variant="ghost" // Ghost variant looks cleaner here
          onClick={() => signOut({ callbackUrl: "/login" })} // Use signOut directly
          className="flex w-full items-center justify-start gap-3 text-sm font-medium text-red-600 hover:bg-red-100/50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

// --- Main Layout Component ---
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Memoize QueryClient instance to prevent recreation on every render
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        {" "}
        {/* Use theme background */}
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>{" "}
        {/* Slightly larger spinner */}
      </div>
    );
  }

  return (
    // Provide QueryClient globally within the layout
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full flex-col bg-muted/40 dark:bg-background">
        {" "}
        {/* Subtle background change */}
        {/* Mobile Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          {" "}
          {/* Adjusted for mobile */}
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="md:hidden">
                {" "}
                {/* Use md:hidden to match sidebar */}
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0">
              {" "}
              {/* Slightly wider sheet */}
              <SidebarContent />
            </SheetContent>
          </Sheet>
          {/* Mobile Header Title - Optional */}
          {/* <span className="text-lg font-semibold">Letterflow</span> */}
        </header>
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 border-r bg-background md:block">
            {" "}
            {/* Use theme background */}
            <SidebarContent />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {" "}
            {/* Increased padding on larger screens */}
            {children}
          </main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
