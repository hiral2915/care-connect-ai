/**
 * CareConnect AI — Auth Context (Lovable Cloud / Supabase)
 *
 * Wraps the app with auth + role state pulled from Supabase Auth and the
 * `user_roles` table. Exposes a hasRole() helper.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Session, User as SupaUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "doctor" | "patient";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: SupaUser | null;
  session: Session | null;
  profile: Profile | null;
  roles: AppRole[];
  primaryRole: AppRole | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: AppRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { full_name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupaUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserExtras = useCallback(async (uid: string) => {
    const [{ data: prof }, { data: rolesRows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile((prof as Profile | null) ?? null);
    setRoles(((rolesRows ?? []) as { role: AppRole }[]).map((r) => r.role));
  }, []);

  useEffect(() => {
    // Hydrate
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        loadUserExtras(data.session.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (event === "SIGNED_OUT" || !sess) {
        setProfile(null);
        setRoles([]);
        return;
      }
      // Defer DB calls to avoid deadlocks inside the listener
      setTimeout(() => {
        if (sess.user) loadUserExtras(sess.user.id);
      }, 0);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserExtras]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const register = useCallback(
    async (data: { full_name: string; email: string; password: string; phone?: string }) => {
      const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: data.full_name, phone: data.phone ?? null },
        },
      });
      if (error) throw error;
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRoles([]);
  }, []);

  const refresh = useCallback(async () => {
    if (user) await loadUserExtras(user.id);
  }, [user, loadUserExtras]);

  const hasRole = useCallback((r: AppRole) => roles.includes(r), [roles]);

  const primaryRole = useMemo<AppRole | null>(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("doctor")) return "doctor";
    if (roles.includes("patient")) return "patient";
    return null;
  }, [roles]);

  const value: AuthContextValue = {
    user,
    session,
    profile,
    roles,
    primaryRole,
    isLoading,
    isAuthenticated: !!user,
    hasRole,
    login,
    register,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
