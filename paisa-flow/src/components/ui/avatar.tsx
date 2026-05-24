"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { getAvatarGradient, getInitials } from "@/lib/avatar-gradient";

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const sizeMap = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-11 h-11 text-sm",
  xl: "w-11 h-11 text-sm",
  "2xl": "w-11 h-11 text-sm",
};

export function Avatar({ name, imageUrl, size = "md", className }: AvatarProps) {
  const initials = getInitials(name);
  const gradient = getAvatarGradient(name);

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative rounded-full overflow-hidden flex-shrink-0",
          sizeMap[size],
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white font-heading",
        sizeMap[size],
        className
      )}
      style={{ background: gradient }}
      aria-hidden
    >
      {initials}
    </div>
  );
}
