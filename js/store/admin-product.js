/* -------------------------------------------------------------
 * STORE / ADMIN-PRODUCT.JS — Add / edit product page
 * Depends on chrome.js (window.RB) + session.js (RB.supabase).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.from((context || document).querySelectorAll(selector)); };
  if (!window.RB) return;

  var bi = function (ar, en) { return "<span data-lang-ar>" + ar + "</span><span data-lang-en>" + en + "</span>"; };
  var isAr = function () { return RB.lang() === "ar"; };

  var _token = null;
  var _editingProductId = null;

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

  function syncSelectLabels() {
    $$("select[id] option[data-text-ar]").forEach(function (opt) {
      opt.textContent = isAr() ? (opt.dataset.textAr || opt.textContent) : (opt.dataset.textEn || opt.textContent);
    });
  }

  function setMode(mode) {
    var isEdit = mode === "edit";
    var idInput = $("#product-id");
    if (idInput) idInput.readOnly = isEdit;

    if (productSubmitBtn) {
      productSubmitBtn.innerHTML = isEdit ? bi("حفظ التعديل", "Save changes") : bi("حفظ المنتج", "Save product");
    }

    var pageTitle = $("#product-page-title");
    if (pageTitle) {
      pageTitle.innerHTML = isEdit ? bi("تعديل منتج", "Edit product") : bi("منتج جديد", "New product");
    }

    var pageSub = $("#product-page-sub");
    if (pageSub) {
      pageSub.innerHTML = isEdit
        ? bi("عدّل بيانات المنتج ثم احفظ التغييرات.", "Edit the product details, then save your changes.")
        : bi("املأ بيانات المنتج ثم احفظها في قاعدة البيانات.", "Fill in the product details, then save them to the database.");
    }

    document.title = isEdit
      ? (isAr() ? "تعديل منتج · تِبْر" : "Edit product · Tibr")
      : (isAr() ? "منتج جديد · تِبْر" : "New product · Tibr");
  }

  function fillForm(product) {
    var cat = product.category || "perfumes";
    var idInput = $("#product-id");
    if (idInput) idInput.value = product.id || "";
    var catSelect = $("#product-category");
    if (catSelect) catSelect.value = cat;
    var imageInput = $("#product-image");
    if (imageInput) imageInput.value = product.image || "";
    var arName = $("#product-ar-name");
    if (arName) arName.value = product.ar_name || "";
    var enName = $("#product-en-name");
    if (enName) enName.value = product.en_name || "";
    var arPrice = $("#product-ar-price");
    if (arPrice) arPrice.value = product.ar_price != null ? product.ar_price : "";
    var enPrice = $("#product-en-price");
    if (enPrice) enPrice.value = product.en_price != null ? product.en_price : "";
    var qty = $("#product-quantity");
    if (qty) qty.value = product.quantity != null ? product.quantity : 0;
    var arColor = $("#product-ar-color");
    if (arColor) arColor.value = product.ar_color || "";
    var enColor = $("#product-en-color");
    if (enColor) enColor.value = product.en_color || "";
    var sizes = $("#product-sizes");
    if (sizes) sizes.value = Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.sizes || "");
    var reviewAvg = $("#product-review-avg");
    if (reviewAvg) reviewAvg.value = product.review_avg || 0;
    var reviewCount = $("#product-review-count");
    if (reviewCount) reviewCount.value = product.review_count || 0;
    var arDesc = $("#product-ar-desc");
    if (arDesc) arDesc.value = product.ar_desc || "";
    var enDesc = $("#product-en-desc");
    if (enDesc) enDesc.value = product.en_desc || "";
    syncColorRow(cat);
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
    return {
      id:           (($("#product-id") || {}).value || "").trim(),
      category:     cat,
      image:        (($("#product-image") || {}).value || "").trim(),
      ar_name:      (($("#product-ar-name") || {}).value || "").trim(),
      en_name:      (($("#product-en-name") || {}).value || "").trim(),
      ar_price:     Number(($("#product-ar-price") || {}).value),
      en_price:     Number(($("#product-en-price") || {}).value),
      quantity:     parseInt(($("#product-quantity") || {}).value, 10) || 0,
      ar_color:     hasColor ? (($("#product-ar-color") || {}).value || "").trim() : null,
      en_color:     hasColor ? (($("#product-en-color") || {}).value || "").trim() : null,
      sizes:        (($("#product-sizes") || {}).value || "").trim(),
      review_avg:   parseFloat(($("#product-review-avg") || {}).value) || 0,
      review_count: parseInt(($("#product-review-count") || {}).value, 10) || 0,
      ar_desc:      (($("#product-ar-desc") || {}).value || "").trim(),
      en_desc:      (($("#product-en-desc") || {}).value || "").trim()
    };
  }

  function goBack() {
    location.href = "/admin?tab=products";
  }

  function saveProduct(event) {
    event.preventDefault();
    if (!_token || !productForm) return;

    var payload = readForm();
    if (!payload.id || !payload.category || !payload.image || !payload.ar_name || !payload.en_name || !(payload.ar_price > 0) || !(payload.en_price > 0)) {
      RB.toast(isAr() ? "أكمل الحقول المطلوبة" : "Please fill the required fields");
      return;
    }

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
        RB.toast(_editingProductId
          ? (isAr() ? "تم تحديث المنتج" : "Product updated")
          : (isAr() ? "تمت إضافة المنتج" : "Product added"));
        setTimeout(goBack, 700);
      })
      .catch(function (error) {
        if (productSubmitBtn) productSubmitBtn.disabled = false;
        RB.toast(error && error.message ? error.message : (isAr() ? "فشل حفظ المنتج" : "Failed to save product"));
      });
  }

  var catSelect = $("#product-category");
  if (catSelect) {
    catSelect.addEventListener("change", function () {
      syncColorRow(catSelect.value);
      var lbl = $("#ap-cat-label");
      if (lbl) lbl.textContent = catSelect.options[catSelect.selectedIndex].textContent;
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

      var bucket = "product-images";
      var ext = file.name.split(".").pop().toLowerCase();
      var destName = "product-" + Date.now() + "." + ext;

      var supabase = RB.supabase || (window.supabaseClient);
      if (!supabase) {
        if (uploadStatus) uploadStatus.hidden = true;
        if (browseBtn) browseBtn.hidden = false;
        RB.toast(isAr() ? "خدمة التخزين غير متاحة" : "Storage not available");
        return;
      }

      supabase.storage.from(bucket).upload(destName, file, { upsert: true })
        .then(function (res) {
          if (res.error) throw res.error;
          var pub = supabase.storage.from(bucket).getPublicUrl(destName);
          var publicUrl = pub.data && pub.data.publicUrl;
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
          var msg = err && err.message ? err.message : (isAr() ? "فشل رفع الصورة" : "Upload failed");
          RB.toast(msg);
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

  if (productForm) productForm.addEventListener("submit", saveProduct);
  if (productCancelBtn) productCancelBtn.addEventListener("click", goBack);

  document.addEventListener("languageChanged", function () {
    syncSelectLabels();
    var mode = _editingProductId ? "edit" : "create";
    setMode(mode);
  });

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

          syncSelectLabels();
          syncColorRow("perfumes");

          if (productId) {
            fetch("/api/admin/products", { headers: { Authorization: "Bearer " + _token } })
              .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
              .then(function (body) {
                var products = body && body.data ? body.data : [];
                var product = products.find(function (p) { return p.id === productId; });
                if (product) {
                  fillForm(product);
                } else {
                  RB.toast(isAr() ? "المنتج غير موجود" : "Product not found");
                  setTimeout(goBack, 900);
                }
              })
              .catch(function () {
                RB.toast(isAr() ? "تعذّر تحميل المنتج" : "Failed to load product");
              });
          } else {
            setMode("create");
          }
        })
        .catch(function () {
          location.replace("/login?next=" + encodeURIComponent(nextUrl));
        });
    });
  }

  init();
})();
