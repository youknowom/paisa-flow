"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TripCardProps {
  trip: {
    _id: string;
    name: string;
    location: string;
    startDate: string;
    endDate: string;
    status: string;
    coverEmoji?: string;
    totalExpenses: number;
    memberCount: number;
    myBalance: number;
  };
  currency: string;
}

export function TripCard({ trip, currency }: TripCardProps) {
  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

  const isPositive = trip.myBalance >= 0;

  return (
    <Link href={`/trips/${trip._id}`}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="pf-card p-4 md:p-5 cursor-pointer group hover:shadow-lg transition-shadow"
      >
        {/* Top row: emoji + name + badge */}
        <div className="flex items-start gap-3.5 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-2 flex items-center justify-center text-2xl flex-shrink-0">
            {trip.coverEmoji || "🌍"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-text-primary truncate font-heading">
                  {trip.name}
                </h3>
                <p className="text-[12px] text-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin size={11} />
                  {trip.location}
                </p>
              </div>
              <Badge
                variant={
                  trip.status === "active"
                    ? "active"
                    : trip.status === "completed"
                      ? "completed"
                      : "default"
                }
              >
                {trip.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-3 text-[11px] text-text-muted mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span className="font-medium">
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={11} />
            <span className="font-medium">{trip.memberCount} members</span>
          </div>
          <div>
            <span className="font-mono font-semibold text-text-secondary">
              {formatMoney(trip.totalExpenses, currency)}
            </span>
            <span className="ml-1">total</span>
          </div>
        </div>

        {/* Balance row */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              {isPositive ? "You Are Owed" : "You Owe"}
            </p>
            <p
              className={cn(
                "text-[15px] font-mono font-bold",
                isPositive ? "text-accent" : "text-red"
              )}
            >
              {formatMoney(Math.abs(trip.myBalance), currency)}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center group-hover:bg-accent-muted transition-colors">
            <ChevronRight
              size={16}
              className="text-text-muted group-hover:text-accent transition-colors"
            />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
