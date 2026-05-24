"use client";

import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface DashboardGreetingProps {
  name: string;
  imageUrl?: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardGreeting({ name, imageUrl }: DashboardGreetingProps) {
  const firstName = name.split(" ")[0] || name;
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={name} imageUrl={imageUrl} size="md" />
        <div className="min-w-0">
          <p className="text-[15px] text-text-secondary">
            {getGreeting()},{" "}
            <span className="font-bold text-text-primary font-heading">
              {firstName}
            </span>
          </p>
          <p className="text-[12px] text-text-muted mt-0.5">{today}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          className="w-10 h-10 rounded-xl border border-border-subtle bg-surface-1 flex items-center justify-center text-text-muted"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <button
          type="button"
          className="w-10 h-10 rounded-xl border border-border-subtle bg-surface-1 flex items-center justify-center text-text-muted"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
