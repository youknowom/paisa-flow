"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      appearance={{
        variables: {
          colorPrimary: "#0C831F",
          colorBackground: "#ffffff",
          colorInputBackground: "#faf8f5",
          colorInputText: "#1a1a1a",
          colorText: "#1a1a1a",
          colorTextSecondary: "#555555",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-white border border-border shadow-lg",
          formButtonPrimary:
            "bg-accent hover:bg-accent-hover text-white font-semibold",
          footerActionLink: "text-accent hover:text-accent-hover",
          socialButtonsBlockButton:
            "bg-surface-2 border border-border hover:bg-surface-3 transition-colors",
          socialButtonsBlockButtonText: "text-text-primary font-medium",
          formFieldInput:
            "bg-surface-2 border-border text-text-primary focus:border-accent",
          headerTitle: "text-text-primary",
          headerSubtitle: "text-text-secondary",
          dividerLine: "bg-border",
          dividerText: "text-text-muted",
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
