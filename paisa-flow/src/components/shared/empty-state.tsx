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
    <div className="rounded-2xl bg-white border border-dashed border-border-strong p-10 flex flex-col items-center text-center">
      <LottieAnimation url={lottieUrl} width={140} height={140} />
      <h3 className="text-[16px] font-bold text-text-primary font-heading mt-5">
        {title}
      </h3>
      {description && (
        <p className="text-[13px] text-text-muted mt-2 max-w-[280px] leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6 w-full max-w-[240px]">{action}</div>}
    </div>
  );
}
