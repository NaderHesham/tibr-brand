/* -------------------------------------------------------------
 * STORE / CATALOG.JS — Category listing, API-driven
 * Fetches /api/products, filters by category, renders cards.
 * Depends on chrome.js (window.RB).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const grid        = $("#product-grid");
  const skeletonGrid = $("#skeleton-grid");
  const emptyEl     = $("#catalog-empty");
  const countNodes  = $$("#catalog-count [data-count]");
  if (!grid) return;

  const CATEGORY = grid.dataset.category || "perfumes";
  const reduced  = window.RB ? RB.reduced : false;

  const state = { search: "", sort: "newest" };
  let _allProducts = [];

  /* ── Skeletons ── */
  function buildSkeletons(n) {
    if (!skeletonGrid) return;
    skeletonGrid.innerHTML = "";
    for (let i = 0; i < n; i++) {
      const card = document.createElement("div");
      card.className = "skeleton-card";
      card.innerHTML =
        '<div class="skeleton skeleton-card__media"></div>' +
        '<div class="skeleton-card__body">' +
          '<div class="skeleton skeleton-line skeleton-line--sm"></div>' +
          '<div class="skeleton skeleton-line skeleton-line--lg"></div>' +
          '<div class="skeleton skeleton-line skeleton-line--price"></div>' +
        '</div>';
      skeletonGrid.appendChild(card);
    }
    skeletonGrid.style.display = "";
  }

  function hideSkeletons() {
    if (!skeletonGrid) return;
    skeletonGrid.style.display = "none";
    skeletonGrid.innerHTML = "";
  }

  /* ── Card HTML builder ── */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function starsHtml(avg, count) {
    if (!count) return "";
    const full  = Math.round(avg);
    const stars = "★".repeat(Math.max(0, Math.min(5, full))) + "☆".repeat(Math.max(0, 5 - full));
    return "<div class='product__reviews'>" +
      "<span class='product__stars' aria-hidden='true'>" + stars + "</span>" +
      "<span class='product__review-count'>(" + count + ")</span>" +
      "</div>";
  }

  function cardHtml(p) {
    const price  = Number(p.en_price || p.ar_price || p.price || 0);
    const name   = p.en_name || "";
    const imgSrc = esc(p.image || "");
    return "<article class='product is-visible' data-product" +
      " data-id='" + esc(p.id) + "'" +
      " data-price='" + price + "'" +
      " data-en-name='" + esc(name) + "'" +
      " data-reveal>" +
      "<div class='product__media'>" +
        "<a class='product__link' href='/product?id=" + esc(p.id) + "' aria-label='" + esc(name) + "'>" +
          "<img class='product__img' src='" + imgSrc + "' loading='lazy' decoding='async' alt='" + esc(name) + "'>" +
        "</a>" +
        "<button class='product__wish' type='button' aria-pressed='false' aria-label='Add " + esc(name) + " to wishlist'>" +
          "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' stroke-linecap='round' stroke-linejoin='round'/></svg>" +
        "</button>" +
      "</div>" +
      "<div class='product__body'>" +
        "<a class='product__name-link' href='/product?id=" + esc(p.id) + "'>" +
          "<h3 class='product__name'>" + esc(name) + "</h3>" +
        "</a>" +
        starsHtml(p.review_avg || 0, p.review_count || 0) +
        "<div class='product__meta'>" +
          "<span class='product__price'>" + price + " EGP</span>" +
          "<button class='product__cart-btn' type='button' data-add data-en-name='" + esc(name) + "' aria-label='Add to cart'>" +
            "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.7' aria-hidden='true'><path d='M6 8h12l-1 12H7L6 8z' stroke-linejoin='round'/><path d='M9 8V6.5a3 3 0 0 1 6 0V8' stroke-linecap='round'/></svg>" +
          "</button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* ── Filter + sort ── */
  function filtered() {
    const q = state.search.trim().toLowerCase();
    return _allProducts.filter((p) =>
      !q || (p.en_name || "").toLowerCase().includes(q)
    );
  }

  function sorted(arr) {
    const copy = arr.slice();
    if (state.sort === "price-asc")  return copy.sort((a, b) => (a.en_price || 0) - (b.en_price || 0));
    if (state.sort === "price-desc") return copy.sort((a, b) => (b.en_price || 0) - (a.en_price || 0));
    return copy; // newest = API order (created_at asc)
  }

  /* ── Render ── */
  function render() {
    const visible = sorted(filtered());
    const n = visible.length;

    countNodes.forEach((node) => { node.textContent = String(n); });

    if (!n) {
      grid.innerHTML = "";
      grid.style.display = "none";
      if (emptyEl) emptyEl.classList.add("is-shown");
      return;
    }

    if (emptyEl) emptyEl.classList.remove("is-shown");
    grid.style.display = "";
    grid.innerHTML = visible.map(cardHtml).join("");
    grid.setAttribute("aria-busy", "false");

    wireCartButtons();
    wireWishButtons();
    if (!reduced) attachReveal();
  }

  /* ── Cart wiring ── */
  function wireCartButtons() {
    $$("[data-add]", grid).forEach((btn) => {
      btn.addEventListener("click", () => {
        const art = btn.closest("[data-product]");
        if (!art || !window.RB) return;
        const img = art.querySelector(".product__img");
        RB.addToCart({
          id:      art.dataset.id,
          en_name: art.dataset.enName,
          price:   +art.dataset.price,
          image:   img ? img.getAttribute("src") : "",
          size:    ""
        });
      });
    });
  }

  /* ── Wishlist wiring ── */
  function wireWishButtons() {
    $$(".product__wish", grid).forEach((btn) => {
      btn.addEventListener("click", () => {
        const pressed = btn.getAttribute("aria-pressed") === "true";
        btn.setAttribute("aria-pressed", String(!pressed));
        btn.classList.toggle("is-wished", !pressed);
      });
    });
  }

  /* ── Reveal animation ── */
  function attachReveal() {
    if (reduced || !("IntersectionObserver" in window)) return;
    const els = $$("[data-reveal]", grid);
    els.forEach((el, i) => { el.style.transitionDelay = Math.min(i, 6) * 70 + "ms"; });
    // Mark already-visible cards immediately; only animate below-fold cards
    document.documentElement.classList.add("js-reveal");
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px" });
    // Use rAF so layout is flushed before observer fires
    requestAnimationFrame(() => els.forEach((el) => io.observe(el)));
  }

  /* ── Controls ── */
  const searchInput = $("#catalog-search");
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      state.search = searchInput.value;
      render();
    });
  }

  const sortSelect = $("#sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      state.sort = sortSelect.value;
      render();
    });
  }

  const resetBtn = $("#reset-filters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.search = ""; state.sort = "newest";
      if (searchInput) searchInput.value = "";
      if (sortSelect)  sortSelect.value  = "newest";
      render();
    });
  }

  const advFilter = $(".catalog-filter__disclosure");
  if (advFilter) {
    document.addEventListener("click", (e) => {
      if (advFilter.open && !advFilter.contains(e.target)) advFilter.open = false;
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && advFilter.open) {
        advFilter.open = false;
        const toggle = advFilter.querySelector(".catalog-filter__toggle");
        if (toggle) toggle.focus();
      }
    });
  }

  /* ── Bootstrap: fetch + render ── */
  if (skeletonGrid) skeletonGrid.style.display = "none";
  buildSkeletons(3);
  grid.style.display = "none";

  fetch("/api/products")
    .then((r) => r.ok ? r.json() : Promise.reject(r.status))
    .then((body) => {
      _allProducts = (body.data || []).filter((p) => p.category === CATEGORY);
      hideSkeletons();
      render();
    })
    .catch(() => {
      hideSkeletons();
      grid.style.display = "";
      grid.setAttribute("aria-busy", "false");
      if (emptyEl) {
        emptyEl.classList.add("is-shown");
        const t = emptyEl.querySelector(".catalog-empty__title");
        if (t) t.textContent = "Failed to load products";
      }
    });
})();
