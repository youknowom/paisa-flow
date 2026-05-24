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
  active: "bg-accent-muted text-accent border border-accent/20",
  completed: "bg-surface-2 text-text-muted",
  pending: "bg-amber/10 text-amber",
  default: "bg-surface-2 text-text-secondary",
  category: "bg-surface-2 text-text-secondary",
  payment: "bg-surface-2 text-text-muted",
};

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-label",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
