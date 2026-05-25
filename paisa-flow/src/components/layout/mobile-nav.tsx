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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-subtle safe-area-pb">
        <div className="flex items-center justify-around h-[64px] px-2">
          {tabs.map((tab) => {
            if (tab.href === "__fab__") {
              return (
                <div key="fab" className="flex flex-col items-center -mt-6">
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="btn-fab"
                    aria-label="Add expense"
                  >
                    <Plus size={26} strokeWidth={2.5} />
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
                className="flex flex-col items-center justify-center min-w-[56px] py-1.5"
              >
                <div
                  className={cn(
                    "w-10 h-7 rounded-full flex items-center justify-center transition-colors mb-0.5",
                    isActive ? "bg-accent-muted" : "bg-transparent"
                  )}
                >
                  <tab.icon
                    size={20}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    className={cn(
                      "transition-colors",
                      isActive ? "text-accent" : "text-text-muted"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold font-heading",
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
