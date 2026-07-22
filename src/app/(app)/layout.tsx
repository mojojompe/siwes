"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/Skeleton";
import { SyncManager } from "@/components/SyncManager";
import { Footer } from "@/components/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const isChatSessionPage = pathname?.match(/^\/chat\/[a-zA-Z0-9_-]+$/);

  if (status === "loading") {
    return (
      <div className={`flex flex-col min-h-screen ${isChatSessionPage ? "" : "pb-24"}`}>
        <Skeleton />
        {!isChatSessionPage && <BottomNav />}
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className={`flex flex-col min-h-screen relative ${isChatSessionPage ? "" : "pb-24"}`}>
      <SyncManager />
      {children}
      {!isChatSessionPage && <Footer />}
      {!isChatSessionPage && <BottomNav />}
    </div>
  );
}
