"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar, ChevronRight } from "lucide-react";
import { cardTapScale } from "@/lib/motion-presets";
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
  const borderColor = isPositive ? "border-l-accent" : "border-l-red";

  return (
    <Link href={`/trips/${trip._id}`}>
      <motion.div
        {...cardTapScale}
        whileHover={{ backgroundColor: "rgba(22, 22, 22, 0.8)" }}
        className={cn(
          "card-surface p-5 border-l-[3px] cursor-pointer group transition-shadow hover:shadow-[0_0_20px_rgba(0,210,106,0.08)]",
          borderColor
        )}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center text-2xl flex-shrink-0">
            {trip.coverEmoji || "🌍"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-h3 font-semibold text-text-primary truncate font-heading">
                  {trip.name}
                </h3>
                <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                  <MapPin size={12} />
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

        <div className="flex flex-wrap gap-4 text-caption text-text-muted mb-4">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span className="text-text-secondary">
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span className="text-text-secondary">{trip.memberCount} members</span>
          </div>
          <div>
            <span className="text-text-secondary font-mono-amount">
              {formatMoney(trip.totalExpenses, currency)}
            </span>
            <span className="ml-1">total</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
          <div>
            <p className="text-label text-text-muted">
              {isPositive ? "You Are Owed" : "You Owe"}
            </p>
            <p
              className={cn(
                "text-base font-mono-amount font-bold",
                isPositive ? "text-accent" : "text-red"
              )}
            >
              {formatMoney(Math.abs(trip.myBalance), currency)}
            </p>
          </div>
          <ChevronRight
            size={18}
            className="text-text-muted group-hover:text-accent transition-colors"
          />
        </div>
      </motion.div>
    </Link>
  );
}
