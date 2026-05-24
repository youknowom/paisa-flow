"use client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface LottieAnimationProps {
  url: string;
  width?: number;
  height?: number;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
}

export function LottieAnimation({
  url,
  width = 300,
  height = 300,
  loop = true,
  autoplay = true,
  className = "",
}: LottieAnimationProps) {
  return (
    <div style={{ width, height }} className={className}>
      <DotLottieReact
        src={url}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
