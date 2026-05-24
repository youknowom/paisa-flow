"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "violet";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost:
    "h-12 px-4 rounded-xl text-text-secondary font-semibold font-heading hover:bg-surface-3 bg-transparent border-0 shadow-none",
  danger:
    "h-12 px-5 rounded-xl bg-red text-white font-semibold font-heading hover:bg-red/90 shadow-none",
  violet:
    "h-12 px-5 rounded-xl bg-violet text-white font-semibold font-heading hover:opacity-90 shadow-none",
};

const sizeOverrides = {
  sm: "!h-10 !text-sm !px-4 !rounded-lg",
  md: "",
  lg: "!h-14 !text-base !px-6",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        variants[variant],
        sizeOverrides[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : children}
    </button>
  );
}
