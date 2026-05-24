"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import { PageHeader } from "@/components/shared/page-header";
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
import { cardTapScale } from "@/lib/motion-presets";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading || !user) {
    return (
      <div className="space-y-8 max-w-2xl mx-auto">
        <Skeleton className="h-14 w-56" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
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
          bg: "bg-accent/15",
          title: "Personal Profile",
          desc: "Name, currency, and payment defaults",
          href: "/profile",
        },
        {
          icon: Bell,
          color: "text-violet",
          bg: "bg-violet/15",
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
          bg: "bg-violet/15",
          title: "Privacy & Security",
          desc: "Clerk sessions and Convex data protection",
          disabled: true,
        },
        {
          icon: HelpCircle,
          color: "text-amber",
          bg: "bg-amber/15",
          title: "Help & FAQs",
          desc: "Split logic, UPI tracking, and more",
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <PageHeader
        title="Settings"
        subtitle="App preferences and account controls"
      />

      {/* User card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface-elevated p-5 flex items-center gap-4"
      >
        <Avatar name={user.name} imageUrl={user.imageUrl} size="lg" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary font-heading truncate">
            {user.name}
          </p>
          <p className="text-caption text-text-muted truncate">{user.email}</p>
        </div>
        <Badge variant="active">Active</Badge>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.05 }}
          className="space-y-3"
        >
          <h3 className="text-label text-text-muted px-1">{section.title}</h3>

          <div className="card-surface overflow-hidden divide-y divide-border-subtle">
            {section.items.map((item) => {
              const row = (
                <motion.div
                  {...(item.disabled ? {} : cardTapScale)}
                  className={cn(
                    "flex items-center gap-4 p-4 w-full text-left transition-colors",
                    !item.disabled && "hover:bg-surface-2/80 cursor-pointer",
                    item.disabled && "opacity-60"
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
                    <p className="text-sm font-semibold text-text-primary font-heading flex items-center gap-2">
                      {item.title}
                      {item.disabled && (
                        <Badge variant="pending">Soon</Badge>
                      )}
                    </p>
                    <p className="text-caption text-text-muted mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                  {!item.disabled && item.href && (
                    <ChevronRight
                      size={16}
                      className="text-text-muted flex-shrink-0"
                    />
                  )}
                </motion.div>
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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-surface p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <p className="text-sm font-semibold text-text-primary font-heading">
            Sign Out
          </p>
          <p className="text-caption text-text-muted mt-0.5">
            End your session on this device
          </p>
        </div>
        <SignOutButton redirectUrl="/">
          <motion.button
            {...cardTapScale}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-red/10 border border-red/20 hover:bg-red/15 text-red text-sm font-semibold rounded-xl transition-colors font-heading"
          >
            <LogOut size={16} />
            Sign Out
          </motion.button>
        </SignOutButton>
      </motion.div>

      <p className="text-center text-caption text-text-disabled flex items-center justify-center gap-1 pb-4">
        PaisaFlow v1.0.0 · Made with{" "}
        <Heart size={10} className="text-red fill-red" /> in India
      </p>
    </div>
  );
}
