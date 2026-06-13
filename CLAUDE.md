# Robabikia — Project Context

## Design Context

**This project has TWO surfaces with TWO registers.** See PRODUCT.md for the full brief.

### Landing page (`view-home`) — register: `brand` — KEEP AS-IS
- The existing Egyptian-heritage design is locked. Work here is **additive only**: animation and motion.
- Do not restyle, re-token, or re-theme the landing.
- Identity: Rakkas (Arabic display) + Cinzel Decorative (English display) + Cormorant Garamond / Amiri (body), gold-on-near-black.

### Store / app layer (everything else) — register: `product` — FULL REDESIGN
- Ground-up **new premium design system**; all Egyptian-theme styling is removed and replaced here.
- **Aesthetic:** dark boutique — charcoal/ink surfaces, raised graphite panels, spotlit cinematic product photography (Tom Ford / Byredo / Net-a-Porter dark mood).
- **Accent:** a single refined, desaturated gold as the through-line (keeps the store reading as Robabikia). One accent only, used with restraint.
- **Type:** fresh system distinct from the landing. Avoid reflex-reject families and Cormorant Garamond. Arabic-first.
- **No modals for auth:** login, sign-up, forgot-password are dedicated full pages.
- **Architecture decision:** move the store off the current hash SPA to **real multi-page** (separate routes/URLs, working back button, SEO). Changes `server.js` routing.

### Store implementation (built)
The dark-boutique system is implemented as real multi-page, separate from the landing's Egyptian CSS/JS.
- **CSS** (`css/store/`): `tokens.css` (OKLCH dark ramp, type, sharp radii, motion, z-index) → `base.css` (reset, RTL logical props, a11y) → `chrome.css` (header/drawer/footer) → `components.css` (buttons, forms+validation, stepper, badges, table, summary, order-card, toast, reveal) → `pages.css` (pdp, cart, checkout, auth, dashboard, admin) → `catalog.css` (perfumes listing only).
- **JS** (`js/store/`): `chrome.js` is shared on every page — injects header/drawer/footer/toast when absent, runs the language system, persists a localStorage cart, exposes `window.RB` ({lang, cart, orders, toast, addToCart, formatPrice, arDigits}). Per-page: `catalog.js`, `product.js`, `cart.js`, `checkout.js`, `auth.js`, `account.js`, `admin.js`.
- **Pages/routes**: `/shop/perfumes` (file: `shop/perfumes.html`), `/product?id=`, `/cart`, `/checkout`, `/login`, `/signup`, `/account?tab=`, `/admin`. Store pages live in `pages/` (e.g., `pages/cart.html`) — `server.js` has explicit routes mapping each to its file.
- **Bilingual pattern:** `<span data-lang-ar>`/`<span data-lang-en>` swapped by CSS via `:root[lang]`; attributes (alt/aria/placeholder) via `data-ar-*`/`data-en-*` applied in `chrome.js`. Landing uses the global `translations.js` dict; the store is self-contained.
- **Demo data:** real perfume catalog (3 products with real photography). Cart/orders/addresses/admin use localStorage so flows are demonstrable; backend wiring (Supabase/`server.js` API) is not yet connected to these pages.
- **Still to do:** clothing/sneakers category pages need real product photography; connect forms to the Supabase API.

### Landing (index.html)
Standalone landing page — no SPA routing, no 3D.
- **Content:** `view-home` only (hero, brand story, how-to-order), footer.
- **Nav:** Home (`#home`), Our Story (`#story`), Shop Now → `/shop/perfumes`. Language toggle kept.
- **Scripts:** `js/core/translations.js`, `js/core/lang.js`, `js/landing/landing.js`, GSAP + ScrollTrigger (for scroll reveals).
- **CSS:** `css/store/tokens.css` (design tokens), `css/landing/landing.css`, `css/layout/{hero,story,footer}.css`.
- **3D removed:** Three.js, `3d-experience.js`, `router.js`, `scroll.js`, `gallery.js`, `intro.js` all deleted. All 3D CSS (`css/components/`) deleted.

### Shared
- **Users:** Arabic-speaking Egyptian consumers (20–45), mobile-first. RTL (`dir="rtl"`, `lang="ar"`) default, EN toggle on both surfaces.
- **Brand soul:** الأصالة والحنين والفخامة — Authenticity, Nostalgia, Luxury.
- **Anti-references:** Western luxury minimalism (Didot/cream/Swiss); generic Arabic e-commerce (Noon/Jumia); warm-cream light store; glassmorphism-everywhere.
- **Current stack:** `index.html` (landing) + `pages/` (store pages) + `shop/` (catalog pages), served by Express with explicit routes. Supabase backend.
- **Live mode:** configured at `.impeccable/live/config.json`. **DESIGN.md:** not yet generated (run `/impeccable document` for the landing; the store system gets documented once it's built).
