"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, Plus } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar } from "@/components/ui/avatar";
import { AddExpenseDialog } from "@/components/daily/add-expense-dialog";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getPageTitle(pathname: string): string | null {
  const map: Record<string, string> = {
    "/daily": "Daily Spend",
    "/trips": "Trips",
    "/analytics": "Analytics",
    "/budget": "Budget",
    "/profile": "Profile",
    "/settings": "Settings",
  };
  for (const [path, title] of Object.entries(map)) {
    if (pathname === path || pathname.startsWith(path + "/")) return title;
  }
  return null;
}

export function AppHeader() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Defer time-dependent content to client to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";
  const currency = user?.currency || "INR";
  const isDashboard = pathname === "/dashboard";
  const pageTitle = getPageTitle(pathname);

  const greeting = mounted ? getGreeting() : "Hello";
  const today = mounted
    ? new Date().toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "";

  return (
    <>
      {/* ─── Mobile Header ─── */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border-subtle">
        <div className="px-4 pt-3 pb-2.5">
          {isDashboard ? (
            /* Dashboard mobile header — Blinkit style greeting */
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative">
                  <Avatar name={user?.name || "User"} imageUrl={user?.imageUrl} size="md" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-text-muted" suppressHydrationWarning>
                    {greeting} 👋
                  </p>
                  <p className="text-[16px] font-bold text-text-primary font-heading leading-tight truncate">
                    {firstName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={19} strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : (
            /* Non-dashboard mobile header — page title */
            <div className="flex items-center justify-between">
              <h1 className="text-[18px] font-bold text-text-primary font-heading">
                {pageTitle || "PaisaFlow"}
              </h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center text-text-muted hover:bg-surface-3 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={19} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {/* Search bar — only on dashboard */}
          {isDashboard && (
            <div className="mt-3 search-bar">
              <Search size={16} className="text-text-muted flex-shrink-0" />
              <span className="search-bar-text">
                Search expenses, trips, budgets...
              </span>
            </div>
          )}
        </div>
      </header>

      {/* ─── Desktop Header ─── */}
      <header className="hidden md:block sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border-subtle">
        <div className="px-6 lg:px-8 max-w-[1200px] mx-auto">
          <div className="flex items-center justify-between h-[68px]">
            {/* Left: greeting or page title */}
            <div className="flex items-center gap-4 min-w-0">
              {isDashboard ? (
                <div suppressHydrationWarning>
                  <p className="text-[13px] font-semibold text-text-muted">
                    {greeting} 👋
                  </p>
                  <p className="text-[18px] font-bold text-text-primary font-heading leading-tight">
                    {firstName}
                    {today && (
                      <span className="text-text-muted font-normal text-sm ml-2">
                        · {today}
                      </span>
                    )}
                  </p>
                </div>
              ) : (
                <h1 className="page-title">{pageTitle || "PaisaFlow"}</h1>
              )}
            </div>

            {/* Right: search + actions */}
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="search-bar w-[280px] lg:w-[320px]">
                <Search size={16} className="text-text-muted flex-shrink-0" />
                <span className="search-bar-text truncate">
                  Search expenses, trips, budgets...
                </span>
              </div>

              {/* Notification */}
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-surface-1 border border-border-subtle flex items-center justify-center text-text-muted hover:bg-surface-2 hover:text-text-primary transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} strokeWidth={2} />
              </button>

              {/* Add Expense CTA */}
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="btn-primary !h-10 !text-[13px] !rounded-xl !px-4"
              >
                <Plus size={16} strokeWidth={2.5} />
                Add Expense
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        currency={currency}
        defaultPaymentMode={user?.defaultPaymentMode ?? undefined}
      />
    </>
  );
}
