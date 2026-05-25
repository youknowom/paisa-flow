import { cn } from "@/lib/utils";

type BadgeVariant =
  | "active"
  | "completed"
  | "pending"
  | "default"
  | "category"
  | "payment";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  active: "bg-accent-muted text-accent border border-accent/20 font-bold",
  completed: "bg-surface-3 text-text-muted font-semibold",
  pending: "bg-amber/10 text-amber font-bold",
  default: "bg-surface-2 text-text-secondary font-semibold",
  category: "bg-surface-2 text-text-secondary font-semibold",
  payment: "bg-surface-2 text-text-muted font-semibold",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
