"use client";

import { onAuthStateChanged, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase-auth";
import { getUserProfile } from "@/lib/firestore";
import { LoadingState } from "@/components/LoadingState";
import type { UserProfile } from "@/types";

type AuthGateProps = {
  children: (data: { user: User; profile: UserProfile | null }) => ReactNode;
  requireOnboarding?: boolean;
};

export function AuthGate({ children, requireOnboarding = true }: AuthGateProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ user: User; profile: UserProfile | null } | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (requireOnboarding && !profile?.onboardingCompleted) {
        router.replace("/onboarding");
        return;
      }
      setData({ user, profile });
      setLoading(false);
    });

    return unsubscribe;
  }, [requireOnboarding, router]);

  if (loading || !data) {
    return <LoadingState label="Preparing your Ayuva space..." />;
  }

  return <>{children(data)}</>;
}
