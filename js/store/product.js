/* -------------------------------------------------------------
 * STORE / PRODUCT.JS — Product detail page (all categories)
 * Fetches /api/products/:id, wires size, qty, add-to-cart,
 * related items. Depends on chrome.js (window.RB).
 * ------------------------------------------------------------- */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const CATS = {
    perfumes: { en: "Perfumes", href: "/shop/perfumes" },
    clothing: { en: "Clothing", href: "/shop/clothing" },
    sneakers: { en: "Sneakers", href: "/shop/sneakers" }
  };

  const params = new URLSearchParams(location.search);
  const productId = params.get("id");

  if (!productId) {
    location.replace("/shop/perfumes");
    return;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render(p) {
    const cat   = CATS[p.category] || { en: p.category, href: "/shop/perfumes" };
    const price = Number(p.en_price || p.ar_price || p.price || 0);
    const sizes = Array.isArray(p.sizes) ? p.sizes : [];

    // Breadcrumb
    const catLink = $("#pdp-cat-link");
    if (catLink) { catLink.href = cat.href; catLink.textContent = cat.en; }
    const crumb = $("#pdp-crumb");
    if (crumb) crumb.textContent = p.en_name || "";

    // Nav active state
    $$(".store-nav__link, .store-drawer__link").forEach((a) => {
      if (a.getAttribute("href") === cat.href) a.setAttribute("aria-current", "page");
      else if ((a.getAttribute("href") || "").startsWith("/shop/")) a.removeAttribute("aria-current");
    });

    // Media
    const img = $("#pdp-img");
    if (img) { img.src = p.image || ""; img.alt = p.en_name || ""; }

    // Info
    const collEl = $("#pdp-collection");
    if (collEl) collEl.textContent = p.en_collection || cat.en;

    const titleEl = $("#pdp-title");
    if (titleEl) titleEl.textContent = p.en_name || "";

    const priceEl = $("#pdp-price");
    if (priceEl) priceEl.textContent = window.RB ? RB.formatPrice(price) : price + " EGP";

    const descEl = $("#pdp-desc");
    if (descEl) descEl.textContent = p.en_desc || "";

    document.title = (p.en_name || "Product") + " · Tibr";

    // Spec rows — show color if available, otherwise hide the notes section
    const spec1Label = $("#pdp-spec1-label");
    const spec1Val   = $("#pdp-spec1");
    const spec2Label = $("#pdp-spec2-label");
    const spec2Val   = $("#pdp-spec2");
    const notesEl    = $(".pdp__notes");

    if (p.en_color && spec1Label && spec1Val) {
      spec1Label.textContent = "Color";
      spec1Val.textContent   = p.en_color;
      if (spec2Label) spec2Label.textContent = "";
      if (spec2Val)   spec2Val.textContent   = "";
    } else if (notesEl) {
      notesEl.style.display = "none";
    }

    // Sizes
    const sizesWrap = $("#pdp-sizes");
    if (sizesWrap) {
      if (sizes.length) {
        sizesWrap.innerHTML = sizes.map((s, i) =>
          "<label class='size-chip'><input type='radio' name='size' value='" + esc(s) + "'" +
          (i === 0 ? " checked" : "") + "><span>" + esc(s) + "</span></label>"
        ).join("");
      } else {
        const sizeRow = sizesWrap.parentElement;
        if (sizeRow) sizeRow.style.display = "none";
      }
    }

    // Qty stepper
    let qty = 1;
    const qtyValue = $("#qty-value");
    const minus    = $("#qty-minus");
    const plus     = $("#qty-plus");

    function renderQty() {
      if (qtyValue) qtyValue.textContent = String(qty);
      if (minus) minus.disabled = qty <= 1;
    }
    if (minus) minus.addEventListener("click", () => { if (qty > 1) { qty--; renderQty(); } });
    if (plus)  plus.addEventListener("click",  () => { qty++; renderQty(); });
    renderQty();

    // Add to cart
    const addBtn = $("#pdp-add");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        const checked     = sizesWrap ? sizesWrap.querySelector("input:checked") : null;
        const selectedSize = checked ? checked.value : (sizes[0] || "");
        if (window.RB) {
          RB.addToCart({ id: String(p.id), en_name: p.en_name, price, image: p.image || "", size: selectedSize, qty });
        }
      });
    }

    // Wishlist
    const wishBtn = $("#pdp-wish");
    if (wishBtn) {
      wishBtn.addEventListener("click", () => {
        const pressed = wishBtn.getAttribute("aria-pressed") === "true";
        wishBtn.setAttribute("aria-pressed", String(!pressed));
        wishBtn.classList.toggle("is-wished", !pressed);
      });
    }
  }

  function renderRelated(p, allProducts) {
    const relatedEl = $("#pdp-related");
    if (!relatedEl) return;

    const related = allProducts
      .filter((r) => String(r.id) !== String(p.id) && r.category === p.category)
      .slice(0, 3);

    if (!related.length) {
      const section = relatedEl.closest("section.related");
      if (section) section.style.display = "none";
      return;
    }

    relatedEl.innerHTML = related.map((r) => {
      const rPrice = Number(r.en_price || r.ar_price || r.price || 0);
      const rName  = esc(r.en_name || "");
      const rImg   = esc(r.image || "");
      const priceStr = window.RB ? RB.formatPrice(rPrice) : rPrice + " EGP";
      return "<article class='product is-visible'>" +
        "<div class='product__media'>" +
          "<a class='product__link' href='/product?id=" + esc(r.id) + "' aria-label='" + rName + "'>" +
            "<img class='product__img' src='" + rImg + "' loading='lazy' decoding='async' alt='" + rName + "'>" +
          "</a>" +
        "</div>" +
        "<div class='product__body'>" +
          "<a class='product__name-link' href='/product?id=" + esc(r.id) + "'>" +
            "<h3 class='product__name'>" + rName + "</h3>" +
          "</a>" +
          "<div class='product__meta'><span class='product__price'>" + priceStr + "</span></div>" +
        "</div>" +
        "</article>";
    }).join("");
  }

  // Loading state
  const titleEl = $("#pdp-title");
  if (titleEl) titleEl.textContent = "Loading…";

  fetch("/api/products/" + encodeURIComponent(productId))
    .then((r) => r.ok ? r.json() : Promise.reject(r.status))
    .then((body) => {
      const p = body.data;
      if (!p) { location.replace("/shop/perfumes"); return; }
      render(p);
      return fetch("/api/products")
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then((allBody) => renderRelated(p, allBody.data || []));
    })
    .catch(() => {
      if (titleEl) titleEl.textContent = "Product not found";
    });
})();
