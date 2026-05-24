"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { navTapScale } from "@/lib/motion-presets";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "expenses", label: "Expenses" },
  { value: "balances", label: "Balances" },
  { value: "members", label: "Members" },
  { value: "settlements", label: "Settlements" },
] as const;

export type TripTab = (typeof TABS)[number]["value"];

interface TripDetailTabsProps {
  activeTab: TripTab;
  onTabChange: (tab: TripTab) => void;
}

export function TripDetailTabs({
  activeTab,
  onTabChange,
}: TripDetailTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 pb-1">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.value;
        return (
          <motion.button
            key={tab.value}
            {...navTapScale}
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "relative flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-medium font-heading whitespace-nowrap transition-colors",
              isActive
                ? "bg-surface-2 text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            )}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="trip-tab-underline"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
