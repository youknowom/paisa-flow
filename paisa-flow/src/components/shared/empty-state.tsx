"use client";

import { LottieAnimation } from "./lottie-animation";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  lottieUrl: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  lottieUrl,
  action,
}: EmptyStateProps) {
  return (
    <div className="empty-box flex flex-col items-center text-center">
      <LottieAnimation url={lottieUrl} width={160} height={160} />
      <h3 className="text-[17px] font-bold text-text-primary font-heading mt-4">
        {title}
      </h3>
      {description && (
        <p className="text-[14px] text-text-muted mt-2 max-w-[260px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6 w-full max-w-[240px]">{action}</div>}
    </div>
  );
}
