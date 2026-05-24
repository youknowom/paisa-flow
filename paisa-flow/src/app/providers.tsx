"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { dark } from "@clerk/themes";
import { ReactNode } from "react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string
);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22c55e",
          colorBackground: "#111111",
          colorInputBackground: "#18181b",
          colorInputText: "#fafafa",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          borderRadius: "0.75rem",
        },
        elements: {
          card: "bg-card border border-border shadow-2xl",
          formButtonPrimary:
            "bg-accent hover:bg-accent-hover text-background font-semibold",
          footerActionLink: "text-accent hover:text-accent-hover",
          socialButtonsBlockButton:
            "bg-card-hover border border-border hover:bg-surface transition-colors",
          socialButtonsBlockButtonText: "text-text-primary font-medium",
          formFieldInput:
            "bg-card-hover border-border text-text-primary focus:border-accent",
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
