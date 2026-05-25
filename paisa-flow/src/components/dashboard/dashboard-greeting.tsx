"use client";

/**
 * DashboardGreeting is no longer used directly — greeting is now
 * handled by the unified AppHeader component for both mobile and desktop.
 * This file is kept for backwards compatibility.
 */

interface DashboardGreetingProps {
  name: string;
  imageUrl?: string | null;
}

export function DashboardGreeting({ name, imageUrl }: DashboardGreetingProps) {
  // Greeting is now in AppHeader — this component intentionally renders nothing
  return null;
}
