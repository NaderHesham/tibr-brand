/* -------------------------------------------------------------
 * STORE / SESSION.JS — Supabase client + auth helpers
 * Must load after: /js/config.js  (sets window.TIBR_CONFIG)
 *              and Supabase CDN    (sets window.supabase)
 *              and chrome.js       (sets window.RB)
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  const cfg = window.TIBR_CONFIG;
  if (!cfg || !window.supabase) {
    console.warn("[session] TIBR_CONFIG or supabase CDN not loaded");
    return;
  }

  const client = window.supabase.createClient(cfg.url, cfg.key);

  async function getSession() {
    const { data: { session } } = await client.auth.getSession();
    return session;
  }

  async function getToken() {
    const session = await getSession();
    return session ? session.access_token : null;
  }

  async function requireAuth(next) {
    const session = await getSession();
    if (!session) {
      const target = next || (location.pathname + location.search);
      location.replace("/login?next=" + encodeURIComponent(target));
      return null;
    }
    return session;
  }

  async function authFetch(url, opts) {
    const token = await getToken();
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      opts && opts.headers,
      token ? { "Authorization": "Bearer " + token } : {}
    );
    return fetch(url, Object.assign({}, opts, { headers }));
  }

  async function signOut() {
    await client.auth.signOut();
    location.href = "/login";
  }

  // Attach to window.RB (chrome.js already ran and set up RB)
  var RB = window.RB || {};
  RB.supabase    = client;
  RB.getSession  = getSession;
  RB.getToken    = getToken;
  RB.requireAuth = requireAuth;
  RB.authFetch   = authFetch;
  RB.signOut     = signOut;
  window.RB = RB;
})();
