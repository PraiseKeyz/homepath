"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

// Client-side only: we store the token in localStorage, not a cookie, so a
// protected page can't be blocked server-side. This checks after mount and
// redirects — acceptable for a hackathon, but means there's a brief flash
// before the redirect if someone hits the URL directly without a session.
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) return null;

  return <>{children}</>;
}
