import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase, type Profile } from "../lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAnonymous: boolean;
  isAdmin: boolean;
}

interface AuthContextType extends AuthState {
  signInAnonymous: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    isAnonymous: false,
    isAdmin: false,
  });

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from("td_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          loading: false,
          isAnonymous: session.user.is_anonymous ?? false,
          isAdmin: profile?.is_admin ?? false,
        });
      } else {
        setState((s) => ({ ...s, loading: false }));
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          session,
          profile,
          loading: false,
          isAnonymous: session.user.is_anonymous ?? false,
          isAdmin: profile?.is_admin ?? false,
        });
      } else {
        setState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          isAnonymous: false,
          isAdmin: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInAnonymous = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) console.error("Anonymous sign-in error:", error);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) console.error("Google sign-in error:", error);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!state.user) return;
    const { error } = await supabase
      .from("td_profiles")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", state.user.id);
    if (!error) {
      const profile = await fetchProfile(state.user.id);
      setState((s) => ({
        ...s,
        profile,
        isAdmin: profile?.is_admin ?? false,
      }));
    }
  };

  const refreshProfile = async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((s) => ({
      ...s,
      profile,
      isAdmin: profile?.is_admin ?? false,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signInAnonymous,
        signInWithGoogle,
        signOut,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
