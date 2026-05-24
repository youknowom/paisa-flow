"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { formatMoney } from "@/lib/format-money";
import { MapPin } from "lucide-react";
import { cardTapScale } from "@/lib/motion-presets";

interface Trip {
  _id: string;
  name: string;
  location: string;
  coverEmoji?: string;
  myBalance: number;
}

interface ActiveTripsRowProps {
  trips: Trip[];
  currency: string;
}

export function ActiveTripsRow({ trips, currency }: ActiveTripsRowProps) {
  if (trips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
    >
      <h3 className="text-h3 font-medium text-text-primary font-heading mb-4">
        Active Trips
      </h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {trips.map((trip) => {
          const owed = trip.myBalance >= 0;
          return (
            <Link key={trip._id} href={`/trips/${trip._id}`}>
              <motion.div
                {...cardTapScale}
                className="flex-shrink-0 w-[200px] card-surface-elevated p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center text-xl">
                    {trip.coverEmoji || "🌍"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate font-heading">
                      {trip.name}
                    </p>
                    <p className="text-caption text-text-muted flex items-center gap-0.5 truncate">
                      <MapPin size={10} />
                      {trip.location}
                    </p>
                  </div>
                </div>
                <p className="text-caption text-text-muted">
                  {owed ? "You are owed" : "You owe"}
                </p>
                <p
                  className={`text-sm font-mono-amount font-semibold ${
                    owed ? "text-accent" : "text-red"
                  }`}
                >
                  {formatMoney(Math.abs(trip.myBalance), currency)}
                </p>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
