import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  user_id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  company: string;
  project: string;
  avatarUrl?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  role: "admin" | "user" | null;
  currentUser: UserProfile | null;
  authUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: {
    fullName: string;
    email: string;
    phone: string;
    position: string;
    company: string;
    project: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateCurrentUser: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  role: null,
  currentUser: null,
  authUser: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  register: async () => ({ success: false }),
  updateCurrentUser: async () => {},
  refreshProfile: async () => {},
});

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone || "",
    position: data.position || "",
    company: (data as any).company || "",
    project: (data as any).project || "",
    avatarUrl: data.avatar_url || undefined,
  };
}

async function fetchRole(userId: string): Promise<"admin" | "user"> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (data && data.some((r) => r.role === "admin")) return "admin";
  return "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!authUser;

  const loadUserData = async (user: User) => {
    const [profile, userRole] = await Promise.all([
      fetchProfile(user.id),
      fetchRole(user.id),
    ]);
    setCurrentUser(profile);
    setRole(userRole);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user ?? null;
        setAuthUser(user);
        if (user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => loadUserData(user), 0);
        } else {
          setCurrentUser(null);
          setRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      setAuthUser(user);
      if (user) {
        loadUserData(user).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setCurrentUser(null);
    setRole(null);
  };

  const register = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    position: string;
    company: string;
    project: string;
    password: string;
  }) => {
    const { error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.fullName,
          phone: userData.phone,
          position: userData.position,
          company: userData.company,
          project: userData.project,
        },
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const updateCurrentUser = async (updates: Partial<UserProfile>) => {
    if (!authUser) return;
    const dbUpdates: Record<string, any> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.position !== undefined) dbUpdates.position = updates.position;
    if (updates.company !== undefined) dbUpdates.company = updates.company;
    if (updates.project !== undefined) dbUpdates.project = updates.project;
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

    await supabase
      .from("profiles")
      .update(dbUpdates)
      .eq("user_id", authUser.id);

    setCurrentUser((prev) => prev ? { ...prev, ...updates } : prev);
  };

  const refreshProfile = async () => {
    if (authUser) await loadUserData(authUser);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        currentUser,
        authUser,
        loading,
        login,
        logout,
        register,
        updateCurrentUser,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
