"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type Profil = {
  id: string;
  ad_soyad: string | null;
  telefon: string | null;
  adres: string | null;
  avatar_url: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profil: Profil | null;
  yukleniyor: boolean;
  cikisYap: () => Promise<void>;
  profilGuncelle: (data: Partial<Profil>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profil, setProfil] = useState<Profil | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  async function fetchProfil(userId: string) {
    const { data } = await supabase
      .from("profiller")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfil(data);
  }

  useEffect(() => {
    // Mevcut oturumu al
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfil(session.user.id);
      setYukleniyor(false);
    });

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfil(session.user.id);
      } else {
        setProfil(null);
      }
      setYukleniyor(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cikisYap = async () => {
    await supabase.auth.signOut();
  };

  const profilGuncelle = async (data: Partial<Profil>) => {
    if (!user) return;
    const { data: updated } = await supabase
      .from("profiller")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();
    if (updated) setProfil(updated);
  };

  return (
    <AuthContext.Provider value={{ user, session, profil, yukleniyor, cikisYap, profilGuncelle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
