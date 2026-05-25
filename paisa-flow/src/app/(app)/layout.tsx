"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppHeader } from "@/components/layout/app-header";

function LoadingSplash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#f8cb46] flex items-center justify-center shadow-lg">
          <span className="text-[#3a2f0e] font-black text-2xl font-heading">
            P
          </span>
        </div>
        <div className="w-28 h-1.5 bg-surface-3 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-accent rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } =
    useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const { user, isLoading: isUserLoading } = useCurrentUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConvexAuthenticated) {
      createOrUpdateUser();
    }
  }, [isConvexAuthenticated, createOrUpdateUser]);

  useEffect(() => {
    if (
      !isUserLoading &&
      user &&
      !user.onboardingCompleted &&
      pathname !== "/onboarding"
    ) {
      router.push("/onboarding");
    }
  }, [user, isUserLoading, pathname, router]);

  // Always render the same structure on server and first client render
  // to avoid hydration mismatch
  if (!mounted || isConvexLoading) {
    return <LoadingSplash />;
  }

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar />

      {/* Main content area */}
      <main className="md:ml-[260px] min-h-screen pb-[80px] md:pb-0">
        {/* Unified header — handles both mobile & desktop */}
        <AppHeader />

        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <MobileNav />
    </div>
  );
}
