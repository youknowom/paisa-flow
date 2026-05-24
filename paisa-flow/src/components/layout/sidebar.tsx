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
    <aside className="hidden md:flex flex-col w-[260px] h-screen fixed left-0 top-0 z-40 bg-surface-1 border-r border-border-subtle">
      <div className="px-5 pt-6 pb-5 border-b border-border-subtle">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-base font-heading">P</span>
          </div>
          <span className="text-lg font-bold font-heading text-text-primary">
            Paisa<span className="text-accent">Flow</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium font-heading transition-colors",
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                )}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive ? 2.25 : 2}
                  className={isActive ? "text-accent" : "text-text-muted"}
                />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-2 transition-colors">
          <Avatar name={user?.name || "User"} imageUrl={user?.imageUrl} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate font-heading">
              {user?.name || "Loading..."}
            </p>
            <p className="text-caption truncate text-xs">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg text-text-muted hover:text-red hover:bg-red/5 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
