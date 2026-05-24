"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AppHeader } from "@/components/layout/app-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } =
    useConvexAuth();
  const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);
  const { user, isLoading: isUserLoading } = useCurrentUser();

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

  if (isConvexLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-xl font-heading">P</span>
          </div>
          <div className="w-28 h-1 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-accent rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  const isDashboard = pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-[260px] min-h-screen safe-area-nav md:pb-0">
        {!isDashboard && <AppHeader />}
        <div className="px-4 md:px-6 py-5 max-w-[1200px] mx-auto w-full">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
