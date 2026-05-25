import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("rounded-2xl skeleton-shimmer", className)} style={style} />;
}

export function StatCardSkeleton() {
  return (
    <div className="pf-card p-4">
      <div className="flex justify-between mb-3">
        <Skeleton className="h-3 w-20 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-6 w-24 mb-2 rounded-lg" />
      <Skeleton className="h-3 w-16 rounded-lg" />
    </div>
  );
}

export function ExpenseRowSkeleton() {
  return (
    <div className="flex items-center gap-3.5 p-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36 rounded-lg" />
        <Skeleton className="h-3 w-24 rounded-lg" />
      </div>
      <Skeleton className="h-5 w-16 rounded-lg" />
    </div>
  );
}

export function ExpenseCardSkeleton() {
  return (
    <div className="pf-card p-4">
      <ExpenseRowSkeleton />
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="pf-card p-4">
      <div className="flex items-center gap-3.5 mb-3">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex gap-4 mb-3">
        <Skeleton className="h-3 w-24 rounded-lg" />
        <Skeleton className="h-3 w-16 rounded-lg" />
        <Skeleton className="h-3 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-4 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  const heights = [40, 70, 30, 85, 50, 60, 45];
  return (
    <div className="pf-card p-5">
      <Skeleton className="h-5 w-40 mb-5 rounded-lg" />
      <div className="flex items-end gap-2 h-44">
        {heights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-lg"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-3 p-6 mb-5">
      <Skeleton className="h-3 w-32 mb-3 rounded-lg" />
      <Skeleton className="h-10 w-48 mb-3 rounded-lg" />
      <Skeleton className="h-6 w-24 rounded-full" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <HeroSkeleton />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <ChartSkeleton />
      <div className="pf-card">
        {Array.from({ length: 4 }).map((_, i) => (
          <ExpenseRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
