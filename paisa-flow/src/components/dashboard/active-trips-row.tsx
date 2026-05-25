"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { ArrowRight, Users } from "lucide-react";
import { motion } from "motion/react";

interface Trip {
  _id: string;
  name: string;
  emoji: string;
  totalExpenses: number;
  memberCount: number;
  myBalance: number;
  status: string;
}

interface ActiveTripsRowProps {
  trips: Trip[];
  currency: string;
}

export function ActiveTripsRow({ trips, currency }: ActiveTripsRowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold text-text-primary font-heading">
          Active Trips
        </h3>
        <Link
          href="/trips"
          className="text-[12px] font-bold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors uppercase tracking-wider"
        >
          View all <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {trips.slice(0, 4).map((trip) => (
          <Link
            key={trip._id}
            href={`/trips/${trip._id}`}
            className="flex-shrink-0 w-[200px] md:w-auto md:flex-1"
          >
            <div className="pf-card p-4 hover:shadow-lg transition-shadow h-full">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="text-xl">{trip.emoji || "✈️"}</span>
                <p className="text-[14px] font-bold text-text-primary font-heading truncate">
                  {trip.name}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted mb-2">
                <Users size={12} />
                <span className="font-medium">{trip.memberCount} members</span>
              </div>
              <div className="pt-2 border-t border-border-subtle">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-0.5">
                  {trip.myBalance >= 0 ? "You get back" : "You owe"}
                </p>
                <span className={`text-[15px] font-mono font-bold ${trip.myBalance >= 0 ? "text-accent" : "text-red"}`}>
                  {formatMoney(Math.abs(trip.myBalance), currency)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
