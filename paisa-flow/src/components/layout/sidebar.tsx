"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Wallet,
  MapPin,
  BarChart3,
  PiggyBank,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/daily", label: "Expenses", icon: Wallet },
  { href: "/trips", label: "Trips", icon: MapPin },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/budget", label: "Budget", icon: PiggyBank },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { signOut } = useClerk();

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 z-50 bg-white border-r border-border-subtle">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border-subtle">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#f8cb46] flex items-center justify-center shadow-sm">
            <span className="text-[#3a2f0e] font-black text-xl font-heading tracking-tighter">
              P
            </span>
          </div>
          <span className="text-[20px] font-black font-heading text-text-primary tracking-tight">
            Paisa<span className="text-accent">Flow</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold font-heading transition-all duration-150",
                  isActive
                    ? "bg-accent-muted text-accent shadow-sm"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    isActive
                      ? "bg-accent/10"
                      : "bg-surface-3"
                  )}
                >
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    className={isActive ? "text-accent" : "text-text-muted"}
                  />
                </div>
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-2 transition-colors">
          <Avatar
            name={user?.name || "User"}
            imageUrl={user?.imageUrl}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-text-primary truncate font-heading">
              {user?.name || "Loading..."}
            </p>
            <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-text-muted hover:text-red hover:bg-red/5 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
