/* -------------------------------------------------------------
 * STORE / ADMIN-PRODUCT.JS — Add / edit product page
 * Depends on chrome.js (window.RB) + session.js (RB.supabase).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.from((context || document).querySelectorAll(selector)); };
  if (!window.RB) return;

  var _token = null;
  var _editingProductId = null;
  var _allProducts = null;

  var ID_CONFIG = {
    perfumes: 1,
    clothing: 2,
    sneakers: 3
  };

  /* ── Cascading taxonomy tree ─────────────────────────────── */
  var TAXONOMY = {
    perfumes: { children: {
      men:    { label: "Men — رجالي",     children: {
        oud:      { label: "Oud — عود" },
        oriental: { label: "Oriental — شرقي" },
        woody:    { label: "Woody — خشبي" },
        fresh:    { label: "Fresh — منعش" },
        aquatic:  { label: "Aquatic — مائي" },
        citrus:   { label: "Citrus — حمضي" }
      }},
      women:  { label: "Women — نسائي",   children: {
        floral:   { label: "Floral — زهري" },
        oriental: { label: "Oriental — شرقي" },
        oud:      { label: "Oud — عود" },
        fresh:    { label: "Fresh — منعش" },
        powdery:  { label: "Powdery — بودري" },
        citrus:   { label: "Citrus — حمضي" }
      }},
      unisex: { label: "Unisex — للجنسين", children: {
        oud:      { label: "Oud — عود" },
        oriental: { label: "Oriental — شرقي" },
        woody:    { label: "Woody — خشبي" },
        fresh:    { label: "Fresh — منعش" },
        aquatic:  { label: "Aquatic — مائي" }
      }}
    }},
    clothing: { children: {
      men:    { label: "Men — رجالي",     children: {
        tshirts:    { label: "T-Shirts — تيشيرتات" },
        shirts:     { label: "Shirts — قمصان" },
        pants:      { label: "Pants — بناطيل" },
        jackets:    { label: "Jackets — جاكيتات" },
        sportswear: { label: "Sportswear — رياضي" },
        galabiya:   { label: "Galabiya — جلابية" }
      }},
      women:  { label: "Women — نسائي",   children: {
        dresses:    { label: "Dresses — فساتين" },
        tops:       { label: "Tops — توبات" },
        pants:      { label: "Pants — بناطيل" },
        abayas:     { label: "Abayas — عبايات" },
        sportswear: { label: "Sportswear — رياضي" },
        galabiya:   { label: "Galabiya — جلابية" }
      }},
      kids:   { label: "Kids — أطفال",    children: {
        boys:   { label: "Boys — أولاد",   children: {
          tshirts:  { label: "T-Shirts — تيشيرتات" },
          pants:    { label: "Pants — بناطيل" },
          jackets:  { label: "Jackets — جاكيتات" }
        }},
        girls:  { label: "Girls — بنات",   children: {
          dresses:  { label: "Dresses — فساتين" },
          tops:     { label: "Tops — توبات" },
          pants:    { label: "Pants — بناطيل" }
        }},
        unisex: { label: "Unisex — للجنسين", children: {
          tshirts:  { label: "T-Shirts — تيشيرتات" },
          pants:    { label: "Pants — بناطيل" }
        }}
      }},
      unisex: { label: "Unisex — للجنسين", children: {
        tshirts:    { label: "T-Shirts — تيشيرتات" },
        hoodies:    { label: "Hoodies — هودي" },
        sweatpants: { label: "Sweatpants — سويت بانت" },
        sportswear: { label: "Sportswear — رياضي" }
      }}
    }},
    sneakers: { children: {
      men:    { label: "Men — رجالي",     children: {
        running:  { label: "Running — جري" },
        casual:   { label: "Casual — كاجوال" },
        classic:  { label: "Classic — كلاسيك" },
        hightop:  { label: "High-top — هاي توب" },
        athletic: { label: "Athletic — رياضي" }
      }},
      women:  { label: "Women — نسائي",   children: {
        running:  { label: "Running — جري" },
        casual:   { label: "Casual — كاجوال" },
        platform: { label: "Platform — بلاتفورم" },
        classic:  { label: "Classic — كلاسيك" },
        athletic: { label: "Athletic — رياضي" }
      }},
      kids:   { label: "Kids — أطفال",    children: {
        boys:   { label: "Boys — أولاد",   children: {
          running: { label: "Running — جري" },
          casual:  { label: "Casual — كاجوال" },
          classic: { label: "Classic — كلاسيك" }
        }},
        girls:  { label: "Girls — بنات",   children: {
          running: { label: "Running — جري" },
          casual:  { label: "Casual — كاجوال" },
          classic: { label: "Classic — كلاسيك" }
        }},
        unisex: { label: "Unisex — للجنسين", children: {
          running: { label: "Running — جري" },
          casual:  { label: "Casual — كاجوال" }
        }}
      }},
      unisex: { label: "Unisex — للجنسين", children: {
        running:  { label: "Running — جري" },
        casual:   { label: "Casual — كاجوال" },
        classic:  { label: "Classic — كلاسيك" },
        athletic: { label: "Athletic — رياضي" }
      }}
    }}
  };

  var LEVEL_LABELS = ["Gender", "Type", "Style"];

  function renderChainLevel(container, children, path, depth) {
    var keys = Object.keys(children);
    if (!keys.length) return;

    var wrap = document.createElement("div");
    wrap.setAttribute("data-chain-depth", depth);
    wrap.style.cssText = "display:flex;flex-direction:column;gap:var(--sp-1);min-width:180px;flex:1;max-width:260px;";

    var lbl = document.createElement("label");
    lbl.className = "ap-label ap-label-ar";
    lbl.setAttribute("for", "subcat-level-" + depth);
    lbl.innerHTML = (LEVEL_LABELS[depth] || "Detail") + '<span class="ap-req">*</span>';

    var sel = document.createElement("select");
    sel.className = "ap-select";
    sel.id = "subcat-level-" + depth;
    sel.setAttribute("data-chain-depth", depth);

    keys.forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = children[key].label || key;
      if (path[depth] === key) opt.selected = true;
      sel.appendChild(opt);
    });

    wrap.appendChild(lbl);
    wrap.appendChild(sel);
    container.appendChild(wrap);

    /* render next level for the currently selected value */
    var activeKey = path[depth] || keys[0];
    var activeNode = children[activeKey];
    if (activeNode && activeNode.children && Object.keys(activeNode.children).length) {
      renderChainLevel(container, activeNode.children, path, depth + 1);
    }

    sel.addEventListener("change", function () {
      /* remove all levels deeper than this one */
      Array.from(container.children).forEach(function (el) {
        if (parseInt(el.getAttribute("data-chain-depth"), 10) > depth) container.removeChild(el);
      });
      var chosen = children[sel.value];
      if (chosen && chosen.children && Object.keys(chosen.children).length) {
        renderChainLevel(container, chosen.children, [], depth + 1);
      }
    });
  }

  function buildChain(category, savedPath) {
    var wrap = document.getElementById("subcategory-chain-wrap");
    var container = document.getElementById("subcategory-chain");
    if (!container) return;
    container.innerHTML = "";
    var root = TAXONOMY[category];
    if (!root || !root.children || !Object.keys(root.children).length) {
      if (wrap) wrap.style.display = "none";
      return;
    }
    if (wrap) wrap.style.display = "";
    renderChainLevel(container, root.children, savedPath || [], 0);
  }

  function getChainPath() {
    var container = document.getElementById("subcategory-chain");
    if (!container) return [];
    return Array.from(container.querySelectorAll("select")).map(function (s) { return s.value; });
  }

  function generateNextId(category, products) {
    var pad = ID_CONFIG[category] || 1;
    var catProducts = products.filter(function (p) { return p.category === category; });
    var maxNum = 0;
    catProducts.forEach(function (p) {
      var num = parseInt(p.id, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    var next = String(maxNum + 1);
    while (next.length < pad) next = "0" + next;
    return next;
  }

  function autoFillId(category) {
    var idInput = $("#product-id");
    if (!idInput || _editingProductId) return;

    function fill(products) {
      idInput.value = generateNextId(category, products);
    }

    if (_allProducts) {
      fill(_allProducts);
      return;
    }

    if (!_token) return;
    fetch("/api/admin/products", { headers: { Authorization: "Bearer " + _token } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (body) {
        _allProducts = (body && body.data) ? body.data : [];
        fill(_allProducts);
      })
      .catch(function () {});
  }

  var productForm = $("#product-form");
  var productSubmitBtn = $("#product-submit");
  var productCancelBtn = $("#product-cancel");

  function getIdFromURL() {
    return new URLSearchParams(window.location.search).get("id") || null;
  }

  function syncColorRow(category) {
    var row = $("#product-color-row");
    if (!row) return;
    row.style.display = (category === "clothing" || category === "sneakers") ? "" : "none";
  }

  function setMode(mode) {
    var isEdit = mode === "edit";
    var idInput = $("#product-id");
    if (idInput) {
      idInput.readOnly = true; // always readonly — system-assigned in create, locked in edit
      idInput.style.opacity = isEdit ? "1" : "0.6";
      idInput.title = isEdit ? "" : "Auto-assigned by the system";
    }

    if (productSubmitBtn) {
      productSubmitBtn.textContent = isEdit ? "Save changes" : "Save product";
    }

    var pageTitle = $("#product-page-title");
    if (pageTitle) {
      pageTitle.textContent = isEdit ? "Edit product" : "New product";
    }

    var pageSub = $("#product-page-sub");
    if (pageSub) {
      pageSub.textContent = isEdit
        ? "Edit the product details, then save your changes."
        : "Fill in the product details, then save them to the database.";
    }

    document.title = isEdit ? "Edit product · Tibr" : "New product · Tibr";
  }

  function fillForm(product) {
    var cat = product.category || "perfumes";
    var idInput = $("#product-id");
    if (idInput) idInput.value = product.id || "";
    var catSelect = $("#product-category");
    if (catSelect) catSelect.value = cat;
    var imageInput = $("#product-image");
    if (imageInput) imageInput.value = product.image || "";
    var enName = $("#product-en-name");
    if (enName) enName.value = product.en_name || product.ar_name || "";
    var enPrice = $("#product-en-price");
    if (enPrice) enPrice.value = (product.en_price != null ? product.en_price : (product.ar_price != null ? product.ar_price : ""));
    var qty = $("#product-quantity");
    if (qty) qty.value = product.quantity != null ? product.quantity : 0;
    var enColor = $("#product-en-color");
    if (enColor) enColor.value = product.en_color || product.ar_color || "";
    var sizes = $("#product-sizes");
    if (sizes) sizes.value = Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.sizes || "");
    var enDesc = $("#product-en-desc");
    if (enDesc) enDesc.value = product.en_desc || product.ar_desc || "";
    syncColorRow(cat);
    var savedPath = [product.sub_category, product.sub_category_2, product.sub_category_3].filter(Boolean);
    buildChain(cat, savedPath);
    var catLbl = $("#ap-cat-label");
    var catEl = $("#product-category");
    if (catLbl && catEl) catLbl.textContent = catEl.options[catEl.selectedIndex] ? catEl.options[catEl.selectedIndex].textContent : cat;
    if (previewWrap && previewImg && product.image) {
      previewImg.src = product.image;
      previewImg.onload = function () { previewWrap.classList.add("has-img"); };
    }
    _editingProductId = product.id;
    setMode("edit");
  }

  function readForm() {
    var cat = ($("#product-category") || {}).value || "perfumes";
    var hasColor = cat === "clothing" || cat === "sneakers";
    // English-only store: the admin enters English values; mirror them into the
    // ar_* columns so the bilingual data model / NOT NULL constraints stay satisfied.
    var name  = (($("#product-en-name") || {}).value || "").trim();
    var price = Number(($("#product-en-price") || {}).value);
    var color = hasColor ? (($("#product-en-color") || {}).value || "").trim() : null;
    var desc  = (($("#product-en-desc") || {}).value || "").trim();
    return {
      id:             (($("#product-id") || {}).value || "").trim(),
      category:       cat,
      sub_category:   (getChainPath()[0] || ""),
      sub_category_2: (getChainPath()[1] || ""),
      sub_category_3: (getChainPath()[2] || ""),
      image:        (($("#product-image") || {}).value || "").trim(),
      ar_name:      name,
      en_name:      name,
      ar_price:     price,
      en_price:     price,
      quantity:     parseInt(($("#product-quantity") || {}).value, 10) || 0,
      ar_color:     color,
      en_color:     color,
      sizes:        (($("#product-sizes") || {}).value || "").trim(),
      review_avg:   0,
      review_count: 0,
      ar_desc:      desc,
      en_desc:      desc
    };
  }

  function goBack() {
    location.href = "/admin?tab=products";
  }

  function saveProduct(event) {
    event.preventDefault();
    if (!_token || !productForm) return;

    var payload = readForm();
    if (!payload.id)              { RB.toast("Product ID is missing — try changing the category to regenerate it"); return; }
    if (!payload.en_name)         { RB.toast("Please enter the product name"); return; }
    if (!(payload.en_price > 0))  { RB.toast("Please enter a valid price"); return; }
    if (!payload.image)           { RB.toast("Please add a product image (upload or paste a URL)"); return; }

    var endpoint = _editingProductId
      ? "/api/admin/products/" + encodeURIComponent(_editingProductId)
      : "/api/admin/products";
    var method = _editingProductId ? "PATCH" : "POST";

    if (productSubmitBtn) productSubmitBtn.disabled = true;

    fetch(endpoint, {
      method: method,
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.ok ? response.json() : response.json().then(function (body) {
          throw new Error((body && body.error) || "Request failed");
        });
      })
      .then(function () {
        RB.toast(_editingProductId ? "Product updated" : "Product added");
        setTimeout(goBack, 700);
      })
      .catch(function (error) {
        if (productSubmitBtn) productSubmitBtn.disabled = false;
        RB.toast(error && error.message ? error.message : "Failed to save product");
      });
  }

  var catSelect = $("#product-category");
  if (catSelect) {
    catSelect.addEventListener("change", function () {
      syncColorRow(catSelect.value);
      buildChain(catSelect.value);
      var lbl = $("#ap-cat-label");
      if (lbl) lbl.textContent = catSelect.options[catSelect.selectedIndex].textContent;
      if (!_editingProductId) autoFillId(catSelect.value);
    });
  }

  var imageInput = $("#product-image");
  var previewWrap = $("#ap-preview-img");
  var previewImg = $("#ap-preview-img-el");
  var fileInput = $("#product-image-file");
  var browseBtn = $("#product-browse-btn");
  var fileInfo = $("#ap-file-info");
  var fileName = $("#ap-file-name");
  var fileClear = $("#ap-file-clear");
  var uploadStatus = $("#ap-upload-status");

  function setPreviewUrl(url) {
    if (!previewImg || !previewWrap) return;
    if (url) {
      previewImg.src = url;
      previewImg.onload = function () { previewWrap.classList.add("has-img"); };
      previewImg.onerror = function () { previewWrap.classList.remove("has-img"); previewImg.src = ""; };
    } else {
      previewWrap.classList.remove("has-img");
      previewImg.src = "";
    }
  }

  if (imageInput) {
    var _previewTimer;
    imageInput.addEventListener("input", function () {
      clearTimeout(_previewTimer);
      _previewTimer = setTimeout(function () { setPreviewUrl(imageInput.value.trim()); }, 400);
    });
  }

  if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", function () { fileInput.click(); });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      var localUrl = URL.createObjectURL(file);
      setPreviewUrl(localUrl);

      if (fileName) fileName.textContent = file.name;
      if (fileInfo) fileInfo.hidden = false;
      if (uploadStatus) uploadStatus.hidden = false;
      if (browseBtn) browseBtn.hidden = true;

      if (!_token) {
        if (uploadStatus) uploadStatus.hidden = true;
        if (browseBtn) browseBtn.hidden = false;
        RB.toast("Not authenticated — please refresh and log in again");
        return;
      }

      var formData = new FormData();
      formData.append("file", file);

      fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": "Bearer " + _token },
        body: formData
      })
        .then(function (r) { return r.ok ? r.json() : r.json().then(function (b) { throw new Error((b && b.error) || "Upload failed"); }); })
        .then(function (body) {
          var publicUrl = body && body.url;
          if (publicUrl && imageInput) {
            imageInput.value = publicUrl;
            setPreviewUrl(publicUrl);
            URL.revokeObjectURL(localUrl);
          }
          if (uploadStatus) uploadStatus.hidden = true;
          if (browseBtn) browseBtn.hidden = false;
        })
        .catch(function (err) {
          if (uploadStatus) uploadStatus.hidden = true;
          if (browseBtn) browseBtn.hidden = false;
          RB.toast(err && err.message ? err.message : "Upload failed");
        });
    });
  }

  if (fileClear) {
    fileClear.addEventListener("click", function () {
      if (fileInput) fileInput.value = "";
      if (fileInfo) fileInfo.hidden = true;
      if (imageInput) imageInput.value = "";
      setPreviewUrl("");
    });
  }

  var descAutoGenBtn = $("#desc-autogen-btn");
  if (descAutoGenBtn) {
    descAutoGenBtn.addEventListener("click", function () {
      var name     = (($("#product-en-name") || {}).value || "").trim();
      var cat      = (($("#product-category") || {}).value || "perfumes");
      var price    = (($("#product-en-price") || {}).value || "").trim();
      var sizes    = (($("#product-sizes") || {}).value || "").trim();
      var color    = (($("#product-en-color") || {}).value || "").trim();
      var descArea = $("#product-en-desc");

      var catLabels = { perfumes: "perfume", clothing: "clothing piece", sneakers: "sneaker" };
      var catLabel  = catLabels[cat] || cat;

      var parts = [];
      if (name) {
        parts.push(name + " is a premium " + catLabel + " by Tibr.");
      } else {
        parts.push("A premium " + catLabel + " by Tibr.");
      }
      if (color) parts.push("Available in " + color + ".");
      if (sizes) parts.push("Comes in " + sizes + ".");
      if (price) parts.push("Priced at " + price + " EGP.");

      if (cat === "perfumes") {
        parts.push("A luxurious scent crafted from the finest ingredients, inspired by the heritage and spirit of Egypt.");
      } else if (cat === "clothing") {
        parts.push("Designed for those who appreciate quality craftsmanship and timeless Egyptian style.");
      } else if (cat === "sneakers") {
        parts.push("Built for comfort and style, reflecting the modern Egyptian aesthetic.");
      }

      if (descArea) {
        descArea.value = parts.join(" ");
        descArea.focus();
      }
    });
  }

  if (productForm) productForm.addEventListener("submit", saveProduct);
  if (productCancelBtn) productCancelBtn.addEventListener("click", goBack);

  function init() {
    var productId = getIdFromURL();
    var nextUrl = "/admin/product" + window.location.search;

    if (!RB.requireAuth) {
      location.replace("/login?next=" + encodeURIComponent(nextUrl));
      return;
    }

    RB.requireAuth(nextUrl).then(function (session) {
      if (!session) return;
      _token = session.access_token;

      fetch("/api/profile", { headers: { Authorization: "Bearer " + _token } })
        .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
        .then(function (body) {
          var role = body && body.data && body.data.role;
          if (role !== "admin") {
            location.replace("/account");
            return;
          }

          syncColorRow("perfumes");
          buildChain("perfumes");

          if (productId) {
            fetch("/api/admin/products", { headers: { Authorization: "Bearer " + _token } })
              .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
              .then(function (body) {
                var products = body && body.data ? body.data : [];
                _allProducts = products;
                var product = products.find(function (p) { return p.id === productId; });
                if (product) {
                  fillForm(product);
                } else {
                  RB.toast("Product not found");
                  setTimeout(goBack, 900);
                }
              })
              .catch(function () {
                RB.toast("Failed to load product");
              });
          } else {
            setMode("create");
            autoFillId("perfumes");
          }
        })
        .catch(function () {
          location.replace("/login?next=" + encodeURIComponent(nextUrl));
        });
    });
  }

  init();
})();
