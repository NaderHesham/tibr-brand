/* -------------------------------------------------------------
 * STORE / ADMIN.JS — Orders + product control panel
 * Admin-only: manage products and order statuses.
 * Depends on chrome.js (window.RB) + session.js (RB.supabase).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  var $ = function (selector, context) { return (context || document).querySelector(selector); };
  var $$ = function (selector, context) { return Array.from((context || document).querySelectorAll(selector)); };
  if (!window.RB) return;

  var bi = function (ar, en) { return "<span data-lang-ar>" + ar + "</span><span data-lang-en>" + en + "</span>"; };
  var isAr = function () { return RB.lang() === "ar"; };
  var escapeHtml = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };
  var biSafe = function (ar, en) { return bi(escapeHtml(ar), escapeHtml(en)); };
  var text = function (value) { return escapeHtml(value); };

  var STATUS = {
    pending:   { ar: "قيد المراجعة", en: "Pending" },
    confirmed: { ar: "مؤكّد", en: "Confirmed" },
    shipped:   { ar: "في الطريق", en: "Shipped" },
    delivered: { ar: "تم التوصيل", en: "Delivered" },
    cancelled: { ar: "ملغي", en: "Cancelled" }
  };
  var ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  var PRODUCT_CATEGORIES = {
    perfumes: { ar: "العطور", en: "Perfumes" },
    clothing: { ar: "الملابس", en: "Clothing" },
    sneakers: { ar: "الأحذية", en: "Sneakers" }
  };
  var PRODUCT_GENDERS = {
    men: { ar: "رجالي", en: "Men" },
    women: { ar: "نسائي", en: "Women" },
    unisex: { ar: "للجنسين", en: "Unisex" }
  };

  var _token = null;
  var _orders = [];
  var _products = [];
  var _filter = "all";
  var _editingProductId = null;
  var _ordersLoadFailed = false;
  var _productsLoadFailed = false;

  var productForm = $("#product-form");
  var productNewButton = $("#product-new");
  var productSubmitButton = $("#product-submit");
  var productCancelButton = $("#product-cancel");
  var productModal = $("#product-modal");
  var productModalClose = $("#product-modal-close");
  var productMode = $("#product-form-mode");
  var productOriginalId = $("#product-original-id");
  var productTbody = $("#admin-products");
  var productEmpty = $("#admin-products-empty");
  var productTableWrap = $(".admin-product-table-wrap .table-wrap");
  var tableWrap = $(".admin-orders-table-wrap");
  var adminTabs = $$(".admin-tab");
  var adminPanes = $$("[data-admin-pane]");
  var activePane = "orders";

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(isAr() ? "ar-EG" : "en-GB", { month: "short", day: "numeric" });
    } catch (_) {
      return "";
    }
  }

  function formatMoney(value) {
    return biSafe(RB.formatPrice(value || 0, "ar"), RB.formatPrice(value || 0, "en"));
  }

  function setActivePane(name) {
    activePane = name;
    adminTabs.forEach(function (tab) {
      var isActive = tab.dataset.adminTab === name;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    adminPanes.forEach(function (pane) {
      pane.classList.toggle("is-active", pane.dataset.adminPane === name);
    });
  }

  function categoryLabel(key) {
    return PRODUCT_CATEGORIES[key] || { ar: key || "", en: key || "" };
  }

  function genderLabel(key) {
    return PRODUCT_GENDERS[key] || { ar: key || "", en: key || "" };
  }

  function productPrice(product) {
    return Number(product.ar_price || product.en_price || product.price || 0);
  }

  function productName(product) {
    return isAr() ? (product.ar_name || "") : (product.en_name || "");
  }

  function productSizes(product) {
    if (!Array.isArray(product.sizes) || !product.sizes.length) return isAr() ? "بدون" : "None";
    return product.sizes.join(", ");
  }

  function syncSelectLabels() {
    $$("select[id] option[data-text-ar]").forEach(function (option) {
      option.textContent = isAr() ? (option.dataset.textAr || option.textContent) : (option.dataset.textEn || option.textContent);
    });
  }

  function renderStats() {
    var total = _orders.length;
    var pending = _orders.filter(function (order) { return order.status === "pending"; }).length;
    var delivered = _orders.filter(function (order) { return order.status === "delivered"; }).length;
    var revenue = _orders
      .filter(function (order) { return order.status !== "cancelled"; })
      .reduce(function (sum, order) { return sum + (order.order_total || 0); }, 0);

    var stat = function (val, gold, labAr, labEn) {
      return "<div class='stat'><p class='stat__value" + (gold ? " stat__value--gold" : "") + "'>" + val + "</p>" +
             "<p class='stat__label'>" + bi(labAr, labEn) + "</p></div>";
    };

    var stats = $("#admin-stats");
    if (!stats) return;
    stats.innerHTML =
      stat(isAr() ? RB.arDigits(total) : total, false, "إجمالي الطلبات", "Total orders") +
      stat(isAr() ? RB.arDigits(pending) : pending, false, "قيد المراجعة", "Pending") +
      stat(isAr() ? RB.arDigits(delivered) : delivered, false, "تم التوصيل", "Delivered") +
      stat(formatMoney(revenue), true, "الإيرادات", "Revenue");
  }

  function statusSelect(order) {
    var options = ORDER.map(function (statusKey) {
      return "<option value='" + statusKey + "'" + (statusKey === order.status ? " selected" : "") + ">" +
        (isAr() ? STATUS[statusKey].ar : STATUS[statusKey].en) + "</option>";
    }).join("");

    return "<select class='status-select' data-id='" + escapeHtml(order.id) + "' aria-label='" +
      (isAr() ? "تغيير حالة الطلب" : "Change order status") + "'>" + options + "</select>";
  }

  function renderOrders() {
    var rows = _orders.filter(function (order) { return _filter === "all" || order.status === _filter; });
    var tbody = $("#admin-rows");
    var emptyWrap = $("#admin-empty");
    var count = $("#admin-count");

    if (_ordersLoadFailed) {
      if (tbody) tbody.innerHTML = "";
      if (tableWrap) tableWrap.style.display = "none";
      if (count) count.innerHTML = bi("تعذّر التحميل", "Load failed");
      if (emptyWrap) {
        emptyWrap.innerHTML =
          "<div class='rb-empty'><h3 class='rb-empty__title'>" +
          bi("تعذّر تحميل الطلبات", "Failed to load orders") +
          "</h3></div>";
      }
      return;
    }

    if (count) count.innerHTML = bi(RB.arDigits(rows.length) + " طلب", rows.length + " orders");

    if (!rows.length) {
      if (tbody) tbody.innerHTML = "";
      if (tableWrap) tableWrap.style.display = "none";
      if (emptyWrap) {
        emptyWrap.innerHTML =
          "<div class='rb-empty'>" +
          "<span class='rb-empty__icon'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.3' aria-hidden='true'><circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3' stroke-linecap='round'/></svg></span>" +
          "<h3 class='rb-empty__title'>" + bi("لا توجد طلبات بهذه الحالة", "No orders with this status") + "</h3>" +
          "</div>";
      }
      return;
    }

    if (tableWrap) tableWrap.style.display = "";
    if (emptyWrap) emptyWrap.innerHTML = "";

    if (tbody) {
      tbody.innerHTML = rows.map(function (order) {
        var product = order.products || {};
        var itemName = isAr() ? (product.ar_name || "") : (product.en_name || "");
        var qty = order.qty || 1;
        var itemLabel = escapeHtml(itemName) + (qty > 1 ? " ×" + (isAr() ? RB.arDigits(qty) : qty) : "");
        var total = order.order_total != null ? order.order_total : (order.unit_price ? order.unit_price * qty : 0);
        return "<tr>" +
          "<td class='num'>" + escapeHtml(order.checkout_reference || String(order.id).slice(0, 8)) + "</td>" +
          "<td>" + escapeHtml(order.customer_name || "") + "</td>" +
          "<td>" + itemLabel + "</td>" +
          "<td class='num'>" + formatMoney(total) + "</td>" +
          "<td>" + escapeHtml(fmtDate(order.created_at)) + "</td>" +
          "<td>" + statusSelect(order) + "</td>" +
          "</tr>";
      }).join("");
    }
  }

  function renderProducts() {
    var tbody = productTbody;
    if (!tbody) return;

    if (_productsLoadFailed) {
      tbody.innerHTML = "";
      if (productTableWrap) productTableWrap.style.display = "none";
      if (productEmpty) {
        productEmpty.innerHTML =
          "<div class='admin-product-empty rb-empty'><h3 class='rb-empty__title'>" +
          bi("تعذّر تحميل المنتجات", "Failed to load products") +
          "</h3></div>";
      }
      return;
    }

    if (!Array.isArray(_products) || !_products.length) {
      tbody.innerHTML = "";
      if (productTableWrap) productTableWrap.style.display = "none";
      if (productEmpty) {
        productEmpty.innerHTML =
          "<div class='admin-product-empty rb-empty'>" +
          "<h3 class='rb-empty__title'>" + bi("لا توجد منتجات بعد", "No products yet") + "</h3>" +
          "<p class='rb-empty__text'>" + bi("ابدأ بإضافة أول منتج من زر المنتج الجديد.", "Start by adding the first product from the New product button.") + "</p>" +
          "</div>";
      }
      return;
    }

    if (productEmpty) productEmpty.innerHTML = "";
    if (productTableWrap) productTableWrap.style.display = "";

    tbody.innerHTML = _products.map(function (product) {
      var category = categoryLabel(product.category);
      var gender = genderLabel(product.gender);
      var sizes = productSizes(product);
      var price = formatMoney(productPrice(product));
      return "<tr data-product-id='" + escapeHtml(product.id) + "'>" +
        "<td class='num'>" + escapeHtml(product.id || "") + "</td>" +
        "<td>" + biSafe(category.ar, category.en) + "</td>" +
        "<td><div class='admin-product-meta'><span class='admin-product-meta__name'>" + escapeHtml(product.ar_name || "") + "</span><span class='admin-product-meta__sub'>" + escapeHtml(product.en_name || "") + "</span><span class='admin-product-meta__sub'>" + biSafe(gender.ar, gender.en) + "</span></div></td>" +
        "<td>" + price + "</td>" +
        "<td class='admin-product-sizes'>" + escapeHtml(sizes) + "</td>" +
        "<td><div class='product-actions'>" +
          "<button class='btn btn--secondary' type='button' data-product-action='edit' data-id='" + escapeHtml(product.id) + "'>" +
            bi("تعديل", "Edit") +
          "</button>" +
          "<button class='btn btn--danger' type='button' data-product-action='delete' data-id='" + escapeHtml(product.id) + "'>" +
            bi("حذف", "Delete") +
          "</button>" +
        "</div></td>" +
        "</tr>";
    }).join("");
  }

  function renderAll() {
    renderStats();
    renderOrders();
    renderProducts();
  }

  function loadOrders() {
    return fetch("/api/admin/orders", { headers: { Authorization: "Bearer " + _token } })
      .then(function (response) { return response.ok ? response.json() : Promise.reject(response.status); })
      .then(function (body) {
        _ordersLoadFailed = false;
        _orders = body && body.data ? body.data : [];
      })
      .catch(function () {
        _ordersLoadFailed = true;
        var emptyWrap = $("#admin-empty");
        if (tableWrap) tableWrap.style.display = "none";
        if (emptyWrap) {
          emptyWrap.innerHTML =
            "<div class='rb-empty'><h3 class='rb-empty__title'>" +
            bi("تعذّر تحميل الطلبات", "Failed to load orders") +
            "</h3></div>";
        }
      });
  }

  function loadProducts() {
    return fetch("/api/admin/products", { headers: { Authorization: "Bearer " + _token } })
      .then(function (response) { return response.ok ? response.json() : Promise.reject(response.status); })
      .then(function (body) {
        _productsLoadFailed = false;
        _products = body && body.data ? body.data : [];
      })
      .catch(function () {
        _productsLoadFailed = true;
        _products = [];
        if (productTbody) productTbody.innerHTML = "";
        if (productEmpty) {
          productEmpty.innerHTML =
            "<div class='admin-product-empty rb-empty'><h3 class='rb-empty__title'>" +
            bi("تعذّر تحميل المنتجات", "Failed to load products") +
            "</h3></div>";
        }
      });
  }

  function setFormMode(mode, productId) {
    if (productMode) productMode.value = mode;
    if (productOriginalId) productOriginalId.value = productId || "";
    if ($("#product-id")) $("#product-id").readOnly = mode === "edit";
    if (productSubmitButton) productSubmitButton.innerHTML = mode === "edit" ? bi("حفظ التعديل", "Save changes") : bi("حفظ المنتج", "Save product");
    if (productCancelButton) productCancelButton.hidden = false;
  }

  function clearProductForm() {
    if (!productForm) return;
    productForm.reset();
    if ($("#product-category")) $("#product-category").value = "perfumes";
    if ($("#product-gender")) $("#product-gender").value = "men";
    if ($("#product-id")) $("#product-id").readOnly = false;
    setFormMode("create", "");
    _editingProductId = null;
  }

  function openProductModal(mode, product) {
    if (!productModal) return;
    if (mode === "edit" && product) {
      fillProductForm(product);
    } else {
      clearProductForm();
    }

    if (productModal.hidden) productModal.hidden = false;
    productModal.setAttribute("aria-hidden", "false");
    productModal.dataset.mode = mode;
    document.body.classList.add("product-modal-open");
    syncProductModalTitle();

    var focusTarget = $("#product-id");
    if (focusTarget && focusTarget.focus) {
      setTimeout(function () { focusTarget.focus(); }, 0);
    }
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.hidden = true;
    productModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("product-modal-open");
  }

  function syncProductModalTitle() {
    var title = $("#product-modal-title");
    if (!title) return;
    title.innerHTML = productModal && productModal.dataset.mode === "edit"
      ? bi("تعديل منتج", "Edit product")
      : bi("منتج جديد", "New product");
  }

  function fillProductForm(product) {
    if (!productForm) return;
    $("#product-id").value = product.id || "";
    $("#product-category").value = product.category || "perfumes";
    $("#product-gender").value = product.gender || "men";
    $("#product-image").value = product.image || "";
    $("#product-ar-price").value = product.ar_price != null ? product.ar_price : "";
    $("#product-en-price").value = product.en_price != null ? product.en_price : "";
    $("#product-sizes").value = Array.isArray(product.sizes) ? product.sizes.join(", ") : "";
    $("#product-ar-name").value = product.ar_name || "";
    $("#product-en-name").value = product.en_name || "";
    $("#product-ar-collection").value = product.ar_collection || "";
    $("#product-en-collection").value = product.en_collection || "";
    $("#product-ar-desc").value = product.ar_desc || "";
    $("#product-en-desc").value = product.en_desc || "";
    $("#product-ar-alt").value = product.ar_alt || "";
    $("#product-en-alt").value = product.en_alt || "";
    $("#product-s1l-ar").value = product.s1l || "";
    $("#product-s1l-en").value = product.s1l || "";
    $("#product-ar-s1").value = product.ar_s1 || "";
    $("#product-en-s1").value = product.en_s1 || "";
    $("#product-s2l-ar").value = product.s2l || "";
    $("#product-s2l-en").value = product.s2l || "";
    $("#product-ar-s2").value = product.ar_s2 || "";
    $("#product-en-s2").value = product.en_s2 || "";
    _editingProductId = product.id;
    setFormMode("edit", product.id);
  }

  function readProductForm() {
    return {
      id: ($("#product-id").value || "").trim(),
      category: $("#product-category").value,
      gender: $("#product-gender").value,
      image: ($("#product-image").value || "").trim(),
      ar_price: Number($("#product-ar-price").value),
      en_price: Number($("#product-en-price").value),
      sizes: ($("#product-sizes").value || "").trim(),
      ar_name: ($("#product-ar-name").value || "").trim(),
      en_name: ($("#product-en-name").value || "").trim(),
      ar_collection: ($("#product-ar-collection").value || "").trim(),
      en_collection: ($("#product-en-collection").value || "").trim(),
      ar_desc: ($("#product-ar-desc").value || "").trim(),
      en_desc: ($("#product-en-desc").value || "").trim(),
      ar_alt: ($("#product-ar-alt").value || "").trim(),
      en_alt: ($("#product-en-alt").value || "").trim(),
      s1l: ($("#product-s1l-ar").value || "").trim() || ($("#product-s1l-en").value || "").trim(),
      s2l: ($("#product-s2l-ar").value || "").trim() || ($("#product-s2l-en").value || "").trim(),
      ar_s1: ($("#product-ar-s1").value || "").trim(),
      en_s1: ($("#product-en-s1").value || "").trim(),
      ar_s2: ($("#product-ar-s2").value || "").trim(),
      en_s2: ($("#product-en-s2").value || "").trim()
    };
  }

  function scrollToProducts() {
    var section = $("#admin-products-title");
    if (section && section.scrollIntoView) section.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function saveProduct(event) {
    event.preventDefault();

    if (!_token || !productForm) return;

    var payload = readProductForm();
    if (!payload.id || !payload.category || !payload.gender || !payload.image || !payload.ar_name || !payload.en_name || !(payload.ar_price > 0) || !(payload.en_price > 0)) {
      RB.toast(isAr() ? "أكمل الحقول المطلوبة" : "Please fill the required fields");
      return;
    }

    var endpoint = _editingProductId ? "/api/admin/products/" + encodeURIComponent(_editingProductId) : "/api/admin/products";
    var method = _editingProductId ? "PATCH" : "POST";

    fetch(endpoint, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + _token
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        return response.ok ? response.json() : response.json().then(function (body) {
          throw new Error((body && body.error) || "Request failed");
        });
      })
      .then(function () {
        RB.toast(isAr() ? (_editingProductId ? "تم تحديث المنتج" : "تمت إضافة المنتج") : (_editingProductId ? "Product updated" : "Product added"));
        clearProductForm();
        closeProductModal();
        return loadProducts().then(renderProducts);
      })
      .catch(function (error) {
        RB.toast(error && error.message ? error.message : (isAr() ? "فشل حفظ المنتج" : "Failed to save product"));
      });
  }

  function deleteProduct(productId) {
    if (!productId) return;
    var confirmMessage = isAr() ? "هل تريد حذف هذا المنتج؟" : "Delete this product?";
    if (!window.confirm(confirmMessage)) return;

    fetch("/api/admin/products/" + encodeURIComponent(productId), {
      method: "DELETE",
      headers: { Authorization: "Bearer " + _token }
    })
      .then(function (response) {
        return response.ok ? response.json() : response.json().then(function (body) {
          throw new Error((body && body.error) || "Delete failed");
        });
      })
      .then(function () {
        if (_editingProductId === productId) clearProductForm();
        RB.toast(isAr() ? "تم حذف المنتج" : "Product deleted");
        return loadProducts().then(renderProducts);
      })
      .catch(function (error) {
        RB.toast(error && error.message ? error.message : (isAr() ? "فشل حذف المنتج" : "Failed to delete product"));
      });
  }

  function handleProductAction(event) {
    var actionButton = event.target.closest("[data-product-action]");
    if (!actionButton) return;
    var productId = actionButton.dataset.id;
    var product = _products.find(function (item) { return item.id === productId; });
    if (!product) return;

    if (actionButton.dataset.productAction === "edit") {
      openProductModal("edit", product);
    } else if (actionButton.dataset.productAction === "delete") {
      deleteProduct(productId);
    }
  }

  // Status filter chips
  $$(".filter-chip[data-status]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      _filter = chip.dataset.status;
      $$(".filter-chip[data-status]").forEach(function (button) {
        button.setAttribute("aria-pressed", String(button === chip));
      });
      renderOrders();
    });
  });

  // Per-row status change
  var adminRows = $("#admin-rows");
  if (adminRows) {
    adminRows.addEventListener("change", function (event) {
      var select = event.target.closest(".status-select");
      if (!select) return;
      var id = select.dataset.id;
      var status = select.value;

      fetch("/api/admin/orders/" + encodeURIComponent(id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
        body: JSON.stringify({ status: status })
      })
        .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
        .then(function (body) {
          var updated = body && body.data;
          if (updated) {
            var index = _orders.findIndex(function (order) { return order.id === id; });
            if (index !== -1) _orders[index].status = updated.status;
          }
          renderAll();
          RB.toast(isAr() ? "تم تحديث الحالة" : "Status updated");
        })
        .catch(function () {
          RB.toast(isAr() ? "فشل تحديث الحالة" : "Failed to update status");
          loadOrders().then(renderOrders);
        });
    });
  }

  if (productForm) productForm.addEventListener("submit", saveProduct);
  if (productTbody) productTbody.addEventListener("click", handleProductAction);
  if (productNewButton) productNewButton.addEventListener("click", function () { openProductModal("create"); });
  if (productCancelButton) productCancelButton.addEventListener("click", function () { clearProductForm(); closeProductModal(); });
  if (productModalClose) productModalClose.addEventListener("click", function () { clearProductForm(); closeProductModal(); });
  if (productModal) {
    productModal.addEventListener("click", function (event) {
      if (event.target && event.target.hasAttribute && event.target.hasAttribute("data-product-modal-close")) {
        clearProductForm();
        closeProductModal();
      }
    });
  }
  adminTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setActivePane(tab.dataset.adminTab || "orders");
      if (tab.dataset.adminTab === "products") {
        renderProducts();
      }
    });
  });

  document.addEventListener("languageChanged", function () {
    syncSelectLabels();
    syncProductModalTitle();
    renderAll();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && productModal && !productModal.hidden) {
      clearProductForm();
      closeProductModal();
    }
  });

  function init() {
    if (!RB.requireAuth) {
      location.replace("/login?next=/admin");
      return;
    }

    RB.requireAuth("/admin").then(function (session) {
      if (!session) return;
      _token = session.access_token;

      fetch("/api/profile", { headers: { Authorization: "Bearer " + _token } })
        .then(function (response) { return response.ok ? response.json() : Promise.reject(); })
        .then(function (body) {
          var role = body && body.data && body.data.role;
          if (role !== "admin") {
            document.body.innerHTML =
              "<div style='display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem'>" +
              "<div><h1 style='font-size:1.5rem;margin-bottom:1rem'>" +
              bi("غير مصرّح", "Access denied") +
              "</h1><p>" + bi("هذه الصفحة للمسؤولين فقط.", "This page is for admins only.") + "</p>" +
              "<a href='/account' style='margin-top:1.5rem;display:inline-block'>" + bi("العودة للحساب", "Back to account") + "</a></div></div>";
            return;
          }

          Promise.all([loadOrders(), loadProducts()]).then(function () {
            syncSelectLabels();
            renderAll();
            clearProductForm();
            setActivePane(activePane || "orders");
          });
        })
        .catch(function () {
          location.replace("/login?next=/admin");
        });
    });
  }

  init();
})();
