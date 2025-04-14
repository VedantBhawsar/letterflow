"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Mail,
  BarChart2,
  Users,
  Settings,
  LogOut,
  FileText,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-14 items-center border-b px-4">
        <Link href={"/dashboard"} className="flex items-center gap-2">
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
      </div>

      <nav className="flex justify-between flex-col h-full px-2">
        <div className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-primary/10 text-primary"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            href="/dashboard/campaigns"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Mail className="h-4 w-4" />
            Campaigns
          </Link>

          <Link
            href="/dashboard/newsletters"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FileText className="h-4 w-4" />
            Newsletters
          </Link>

          <Link
            href="/dashboard/subscribers"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Users className="h-4 w-4" />
            Subscribers
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <BarChart2 className="h-4 w-4" />
            Analytics
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>

        <button
          onClick={() => router.push("/api/auth/signout")}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Mobile Navbar */}
      <div className="flex h-14 items-center border-b bg-white dark:bg-gray-800 px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-2">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="text-primary">Letterflow</span>
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-shrink-0 border-r bg-white dark:bg-gray-800 md:block">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
