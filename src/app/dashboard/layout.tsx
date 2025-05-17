"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import clsx from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/campaigns", label: "Campaigns", icon: Mail },
  { href: "/dashboard/newsletters", label: "Newsletters", icon: FileText },
  { href: "/dashboard/subscribers", label: "Subscribers", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const SidebarContent = () => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      {/* Logo/Header */}
      <div className="flex h-16 items-center border-b border-slate-700/50 px-6">
        <Link href={"/dashboard"} className="flex items-center gap-2 group">
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
            className="text-emerald-500 transition-all duration-300 group-hover:rotate-[15deg] group-hover:text-emerald-400"
          >
            <path d="M6.8 22 12 19l5.2 3V7.8l-5.2-3-5.2 3Z" />
            <path d="m19 7.8 2-1.2V18l-2.2 1.2" />
            <path d="M5 7.8 3 6.6V18l2 1.2" />
            <path d="m12 10.5-5-3" />
            <path d="m17 7.5-5 3" />
            <path d="M12 13v6" />
          </svg>
          <span className="text-lg font-semibold text-emerald-500">Letterflow</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4">
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-slate-800 text-emerald-500 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <item.icon
                className={clsx("h-4 w-4", isActive(item.href) ? "text-emerald-500" : "")}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="mt-auto border-t border-slate-700/50 p-4">
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center justify-start gap-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useMemo(() => new QueryClient(), []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen w-full flex-col bg-slate-950 text-slate-300">
        {/* Mobile Navbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-700/50 bg-slate-900 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="border-slate-700 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[260px] p-0 bg-slate-900 border-r border-slate-700"
            >
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 flex-shrink-0 border-r border-slate-700/50 md:block">
            <SidebarContent />
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </QueryClientProvider>
  );
}
