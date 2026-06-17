import { create } from "zustand";
import { supabase } from "@/lib/supabase";

// `token` is stored as plain state (not a getter): Zustand's set() does
// Object.assign({}, state, partial), which would evaluate a getter once and
// freeze its value — silently breaking every authenticated request.
export const useAuth = create((set) => ({
  user: null,
  session: null,
  token: null,
  loading: true,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, token: session?.access_token ?? null, loading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, token: session?.access_token ?? null });
    });
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ session: data.session, user: data.user, token: data.session?.access_token ?? null });
    return data;
  },

  signUp: async (email, password, meta = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, token: null });
  },
}));
