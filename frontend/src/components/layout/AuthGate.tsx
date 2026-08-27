"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/layout/AppShell";
import TwitterLogo from "@/components/icons/TwitterLogo";

const PUBLIC_PATHS = ["/login", "/signup"];

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_PATHS.includes(pathname);
  const isOnboarding = pathname === "/onboarding";

  useEffect(() => {
    if (loading) return;
    if (!user) {
      if (!isPublic) router.replace("/login");
      return;
    }
    if (!user.profileComplete) {
      if (!isOnboarding) router.replace("/onboarding");
      return;
    }
    if (isPublic || isOnboarding) {
      router.replace("/");
    }
  }, [user, loading, isPublic, isOnboarding, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <TwitterLogo className="h-10 w-10 animate-pulse text-accent" />
      </div>
    );
  }

  if (!user) {
    return isPublic ? <>{children}</> : null;
  }

  if (!user.profileComplete) {
    return isOnboarding ? <>{children}</> : null;
  }

  if (isPublic || isOnboarding) return null;

  return <AppShell>{children}</AppShell>;
}
