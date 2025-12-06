// src/auth/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cargar sesión al inicio
  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await ensureProfile(currentUser);
      } else {
        setProfile(null);
      }

      setAuthLoading(false);
    };

    init();

    // Escuchar cambios de sesión (login / logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        await ensureProfile(currentUser);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Crea o actualiza el perfil público en constella_profiles
  const ensureProfile = async (authUser) => {
    const email = authUser.email || "";
    const baseName =
      authUser.user_metadata?.full_name ||
      email.split("@")[0] ||
      "Sin nombre";

    const { data, error } = await supabase
      .from("constella_profiles")
      .upsert(
        {
          id: authUser.id,
          email,
          display_name: baseName,
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    } else {
      console.error("Error cargando/creando perfil:", error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    authLoading,
    signOut,
    refreshProfile: () => user && ensureProfile(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return ctx;
}