import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { AuthSession, AuthUser } from "@/integrations/supabase/client";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: AuthSession | null;
  user: AuthUser | null;
  profile: { display_name: string | null; email: string | null; avatar_url: string | null } | null;
  role: "admin" | "user" | "marketer" | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [role, setRole] = useState<"admin" | "user" | "marketer" | null>(null);
  const [loading, setLoading] = useState(true);
  const activeUserIdRef = useRef<string | null>(null);

  const fetchRolesWithRetry = async (userId: string, retries = 5) => {
    let lastError: unknown = null;

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const rolesRes = await supabase.from("user_roles").select("role").eq("user_id", userId);

      if (!rolesRes.error && (rolesRes.data?.length ?? 0) > 0) {
        return rolesRes.data;
      }

      lastError = rolesRes.error;

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }

    if (lastError) {
      console.error("Failed to fetch user roles:", lastError);
    }

    return [] as { role: "admin" | "user" | "marketer" }[];
  };

  const fetchUserData = async (userId: string) => {
    const [profileRes, rolesData] = await Promise.all([
      supabase.from("profiles").select("display_name, email, avatar_url").eq("user_id", userId).single(),
      fetchRolesWithRetry(userId),
    ]);

    // Ignore stale async responses from a previous user session
    if (activeUserIdRef.current !== userId) return;

    const roles = (rolesData ?? []).map((r) => r.role);
    const resolvedRole = roles.includes("admin")
      ? "admin"
      : roles.includes("marketer")
        ? "marketer"
        : roles.includes("user")
          ? "user"
          : null;

    setProfile(profileRes.data ?? null);
    setRole(resolvedRole);
  };

  useEffect(() => {
    let mounted = true;

    // Safety timeout - never stay loading forever
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 4000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      activeUserIdRef.current = ((session as any)?.user)?.id ?? null;
      setSession(session);
      setUser(((session as any)?.user) ?? null);
      if (((session as any)?.user)) {
        await fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      activeUserIdRef.current = ((session as any)?.user)?.id ?? null;
      setSession(session);
      setUser(((session as any)?.user) ?? null);
      if (((session as any)?.user)) {
        fetchUserData(session.user.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // IMPORTANT: don't toggle global `loading` here, otherwise the whole app swaps to a fullscreen
    // loader and users never see inline login errors.

    try {
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        }),
        8000
      );

      if (!error && data.user) {
        const { data: sessionData } = await supabase.auth.getSession();
        const resolvedSession = sessionData.session ?? data.session ?? null;
        const resolvedUser = resolvedSession?.user ?? data.user;

        activeUserIdRef.current = resolvedUser.id;
        setSession(resolvedSession);
        setUser(resolvedUser);

        // Fetch user data with a timeout so login never gets stuck
        try {
          await withTimeout(fetchUserData(resolvedUser.id), 5000);
        } catch (e) {
          console.error("fetchUserData timeout/error after login:", e);
        }
      }

      setLoading(false);
      return { error: error?.message ?? null };
    } catch (e) {
      console.error("signIn unexpected error:", e);
      setLoading(false);
      return { error: "Произошла ошибка при входе" };
    }
  };

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 2000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("Auth timeout")), timeoutMs);
      }),
    ]);
  };

  const signOut = async () => {
    // Instant local logout so UI never gets stuck on dashboard
    activeUserIdRef.current = null;
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
    setLoading(false);

    try {
      await withTimeout(supabase.auth.signOut());
    } catch (err) {
      console.error("Global signOut failed, fallback to local signOut:", err);
      try {
        await withTimeout(supabase.auth.signOut({ scope: "local" }), 1500);
      } catch (localErr) {
        console.error("Local signOut fallback failed:", localErr);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // During HMR or if rendered outside provider, return safe defaults
    return {
      session: null,
      user: null,
      profile: null,
      role: null,
      loading: true,
      signIn: async () => ({ error: "Auth not ready" }),
      signOut: async () => {},
    } as AuthContextType;
  }
  return ctx;
}

