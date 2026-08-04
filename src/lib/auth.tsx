import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncServerAccessTokenCookie } from "./auth-cookie";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function syncAuthCookie(session: Session | null) {
  if (typeof document === "undefined") return;
  if (session?.access_token) {
    document.cookie = `sb-access-token=${encodeURIComponent(session.access_token)}; path=/; max-age=604800; SameSite=Lax`;
  } else {
    document.cookie = `sb-access-token=; path=/; max-age=0; SameSite=Lax`;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      syncServerAccessTokenCookie(next);
      setSession(next);
      syncAuthCookie(next);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: current }) => {
      syncServerAccessTokenCookie(current.session);
      setSession(current.session);
      syncAuthCookie(current.session);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        syncServerAccessTokenCookie(null);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
