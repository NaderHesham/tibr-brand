const SUPABASE_URL = 'https://hlmbehyjshdtklhjqiii.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsbWJlaHlqc2hkdGtsaGpxaWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1OTM0MjcsImV4cCI6MjA5NjE2OTQyN30.ydpvRKaN_uEH73eYtKOHa8qDQUBzz397V_ycgdUi658';

if (window.supabase) {
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error("Supabase CDN script failed to load or is blocked.");
  // Safe mock client to prevent uncaught runtime crashes
  window.supabaseClient = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => {},
      signInWithPassword: async () => { throw new Error('Supabase client failed to load from CDN. Please check your connection or ad-blocker.'); },
      signUp: async () => { throw new Error('Supabase client failed to load from CDN. Please check your connection or ad-blocker.'); }
    },
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: async () => ({ error: new Error('Supabase client failed to load from CDN. Please check your connection or ad-blocker.') })
    })
  };
}
