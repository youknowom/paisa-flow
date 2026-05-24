import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl skeleton-shimmer", className)} />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card-surface p-5">
      <div className="flex justify-between mb-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-6 w-24 mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ExpenseRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-16" />
    </div>
  );
}

export function ExpenseCardSkeleton() {
  return (
    <div className="card-surface-elevated p-4">
      <ExpenseRowSkeleton />
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="card-surface p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-px w-full mb-4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card-surface p-5">
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="flex items-end gap-2 h-48">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="card-surface rounded-2xl p-6 mb-8">
      <Skeleton className="h-3 w-32 mb-4 bg-white/20" />
      <Skeleton className="h-12 w-48 mb-4 bg-white/20" />
      <Skeleton className="h-6 w-24 rounded-full bg-white/20" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      <div className="flex justify-between">
        <div className="flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-10 h-10 rounded-xl" />
        </div>
      </div>
      <HeroSkeleton />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
      <div className="card-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <ExpenseRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
