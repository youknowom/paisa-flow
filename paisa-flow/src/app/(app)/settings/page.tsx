"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { SignOutButton } from "@clerk/nextjs";
import {
  User,
  LogOut,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Heart,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
    );
  }

  const sections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          color: "text-accent",
          bg: "bg-accent/10",
          title: "Personal Profile",
          desc: "Name, currency, and payment defaults",
          href: "/profile",
        },
        {
          icon: Bell,
          color: "text-violet",
          bg: "bg-violet/10",
          title: "Budget Alerts",
          desc: "Warnings at 70%, 90%, and 100% thresholds",
          disabled: true,
        },
      ],
    },
    {
      title: "Security & Support",
      items: [
        {
          icon: Shield,
          color: "text-violet",
          bg: "bg-violet/10",
          title: "Privacy & Security",
          desc: "Clerk sessions and Convex data protection",
          disabled: true,
        },
        {
          icon: HelpCircle,
          color: "text-amber",
          bg: "bg-amber/10",
          title: "Help & FAQs",
          desc: "Split logic, UPI tracking, and more",
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pf-card p-4 flex items-center gap-4"
      >
        <Avatar name={user.name} imageUrl={user.imageUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-text-primary font-heading truncate">
            {user.name}
          </p>
          <p className="text-[12px] text-text-muted truncate">{user.email}</p>
        </div>
        <Badge variant="active">Active</Badge>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.05 }}
          className="space-y-2"
        >
          <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-wider px-1">
            {section.title}
          </h3>

          <div className="pf-card overflow-hidden divide-y divide-border-subtle">
            {section.items.map((item) => {
              const row = (
                <div
                  className={cn(
                    "flex items-center gap-3.5 p-4 w-full text-left transition-colors",
                    !item.disabled && "hover:bg-surface-2 cursor-pointer",
                    item.disabled && "opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      item.bg
                    )}
                  >
                    <item.icon size={18} className={item.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-text-primary font-heading flex items-center gap-2">
                      {item.title}
                      {item.disabled && (
                        <Badge variant="pending">Soon</Badge>
                      )}
                    </p>
                    <p className="text-[11px] text-text-muted mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                  {!item.disabled && item.href && (
                    <ChevronRight
                      size={16}
                      className="text-text-muted flex-shrink-0"
                    />
                  )}
                </div>
              );

              if (item.disabled || !item.href) {
                return <div key={item.title}>{row}</div>;
              }

              return (
                <Link key={item.title} href={item.href} className="block">
                  {row}
                </Link>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Sign out */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="pf-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-[14px] font-bold text-text-primary font-heading">
            Sign Out
          </p>
          <p className="text-[12px] text-text-muted mt-0.5">
            End your session on this device
          </p>
        </div>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red/8 border border-red/15 hover:bg-red/12 text-red text-[13px] font-bold rounded-xl transition-colors font-heading"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </SignOutButton>
      </motion.div>

      <p className="text-center text-[11px] text-text-disabled flex items-center justify-center gap-1 pb-4">
        PaisaFlow v1.0.0 · Made with{" "}
        <Heart size={10} className="text-red fill-red" /> in India
      </p>
    </div>
  );
}
