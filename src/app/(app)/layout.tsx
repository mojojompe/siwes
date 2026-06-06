"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/Skeleton";
import { SyncManager } from "@/components/SyncManager";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex flex-col min-h-screen pb-24">
        <Skeleton />
        <BottomNav />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="flex flex-col min-h-screen pb-24 relative">
      <SyncManager />
      {children}
      <BottomNav />
    </div>
  );
}
