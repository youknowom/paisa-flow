"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { EmptyState } from "@/components/shared/empty-state";
import { TripCardSkeleton } from "@/components/shared/loading-skeleton";
import { CreateTripDialog } from "@/components/trip/create-trip-dialog";
import { TripCard } from "@/components/trip/trip-card";
import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TripsPage() {
  const { user } = useCurrentUser();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("active");

  const trips = useQuery(api.trips.getUserTrips, {
    status: statusFilter || undefined,
  });

  const currency = user?.currency || "INR";

  return (
    <div>
      {/* Desktop header (mobile title is in AppHeader) */}
      <div className="hidden md:flex items-center justify-between mb-5">
        <div />
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="btn-primary !h-10 !text-[13px] !rounded-xl !px-4"
        >
          <Plus size={16} />
          New Trip
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-5">
        {[
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ].map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "chip",
              statusFilter === filter.value && "chip-active"
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {trips === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState
          title="No trips yet"
          description="Create a trip and invite friends to split expenses together."
          lottieUrl="https://lottie.host/a0e8038b-d250-42be-9b78-4a6c62b5db21/bR4MzcRfKi.lottie"
          action={
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="btn-primary w-full"
            >
              Create Trip
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {trips.map((trip) => (
              <motion.div
                key={trip._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <TripCard trip={trip} currency={currency} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile: floating new trip button */}
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="btn-fab fixed bottom-[calc(80px+env(safe-area-inset-bottom))] right-4 md:hidden z-40"
        aria-label="New trip"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <CreateTripDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
