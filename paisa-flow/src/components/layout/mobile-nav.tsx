"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  MapPin,
  User,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddExpenseDialog } from "@/components/daily/add-expense-dialog";
import { useCurrentUser } from "@/hooks/use-current-user";

const tabs = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/daily", label: "Spend", icon: Wallet },
  { href: "__fab__", label: "Add", icon: Plus },
  { href: "/trips", label: "Trips", icon: MapPin },
  { href: "/profile", label: "You", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const [addOpen, setAddOpen] = useState(false);
  const currency = user?.currency || "INR";

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass safe-area-pb">
        <div className="flex items-center justify-around h-[64px] px-1">
          {tabs.map((tab) => {
            if (tab.href === "__fab__") {
              return (
                <div key="fab" className="flex flex-col items-center -mt-7">
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="btn-fab"
                    aria-label="Add expense"
                  >
                    <Plus size={28} strokeWidth={2.5} />
                  </button>
                </div>
              );
            }

            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center justify-center min-w-[60px] py-1"
              >
                <tab.icon
                  size={22}
                  strokeWidth={isActive ? 2.25 : 2}
                  className={cn(
                    "transition-colors",
                    isActive ? "text-accent" : "text-text-muted"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] mt-1 font-semibold font-heading",
                    isActive ? "text-accent" : "text-text-muted"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AddExpenseDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        currency={currency}
        defaultPaymentMode={user?.defaultPaymentMode ?? undefined}
      />
    </>
  );
}
