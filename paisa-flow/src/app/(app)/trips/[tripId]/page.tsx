"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { TripDetailTabs, type TripTab } from "@/components/trip/trip-detail-tabs";
import { OverviewTab } from "@/components/trip/overview-tab";
import { ExpensesTab } from "@/components/trip/expenses-tab";
import { BalancesTab } from "@/components/trip/balances-tab";
import { MembersTab } from "@/components/trip/members-tab";
import { SettlementsTab } from "@/components/trip/settlements-tab";
import { Skeleton } from "@/components/shared/loading-skeleton";
import { MoneyDisplay } from "@/components/shared/money-display";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.tripId as Id<"trips">;
  const { user } = useCurrentUser();
  const currency = user?.currency || "INR";
  const [activeTab, setActiveTab] = useState<TripTab>("overview");

  const trip = useQuery(api.trips.getTripById, { tripId });
  const overview = useQuery(api.trips.getTripOverview, { tripId });

  if (trip === undefined) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-12 rounded-xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (trip === null) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">Trip not found</p>
      </div>
    );
  }

  const formatDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const myBalance = overview?.myBalance ?? 0;
  const myPaid = overview?.myPaid ?? 0;
  const myShare = overview?.myShare ?? 0;
  const totalExpenses = overview?.totalExpenses ?? 0;

  return (
    <div>
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => router.push("/trips")}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back
      </motion.button>

      <div className="mb-2">
        <h1 className="text-h2 font-semibold text-text-primary font-heading">
          {trip.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {trip.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </span>
        </div>
      </div>

      {/* Hero summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 mb-8 mt-6 bg-violet text-white"
      >
        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <p className="text-caption text-white/60">My Share</p>
            <MoneyDisplay
              amount={myShare}
              currency={currency}
              className="text-lg font-semibold text-white block mt-1"
            />
          </div>
          <div>
            <p className="text-caption text-white/60">Total Expenses</p>
            <MoneyDisplay
              amount={totalExpenses}
              currency={currency}
              className="text-2xl font-bold text-white block mt-1"
            />
          </div>
          <div>
            <p className="text-caption text-white/60">My Paid</p>
            <MoneyDisplay
              amount={myPaid}
              currency={currency}
              className="text-lg font-semibold text-white block mt-1"
            />
          </div>
        </div>
        <div className="text-center pt-4 border-t border-white/20">
          <p className="text-caption text-white/60">
            {myBalance >= 0 ? "You Are Owed" : "You Owe"}
          </p>
          <p
            className={cn(
              "text-xl font-mono-amount font-bold mt-1",
              myBalance >= 0 ? "text-green-200" : "text-red-200"
            )}
          >
            {formatMoney(Math.abs(myBalance), currency)}
          </p>
        </div>
      </motion.div>

      <TripDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && (
            <OverviewTab tripId={tripId} currency={currency} />
          )}
          {activeTab === "expenses" && (
            <ExpensesTab tripId={tripId} currency={currency} />
          )}
          {activeTab === "balances" && (
            <BalancesTab tripId={tripId} currency={currency} />
          )}
          {activeTab === "members" && <MembersTab tripId={tripId} />}
          {activeTab === "settlements" && (
            <SettlementsTab tripId={tripId} currency={currency} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
