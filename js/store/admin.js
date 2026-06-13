/* -------------------------------------------------------------
 * STORE / ADMIN.JS — Orders control panel
 * Auth-guarded + admin-role check. Loads real orders from API.
 * Depends on chrome.js (window.RB) + session.js (RB.supabase).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.from((c || document).querySelectorAll(s)); };
  if (!window.RB) return;

  var bi = function (ar, en) { return "<span data-lang-ar>" + ar + "</span><span data-lang-en>" + en + "</span>"; };
  var isAr = function () { return RB.lang() === "ar"; };

  var STATUS = {
    pending:   { ar: "قيد المراجعة", en: "Pending" },
    confirmed: { ar: "مؤكّد",         en: "Confirmed" },
    shipped:   { ar: "في الطريق",     en: "Shipped" },
    delivered: { ar: "تم التوصيل",   en: "Delivered" },
    cancelled: { ar: "ملغي",          en: "Cancelled" }
  };
  var ORDER = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

  var _token  = null;
  var _orders = [];
  var _filter = "all";

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString(isAr() ? "ar-EG" : "en-GB", { month: "short", day: "numeric" }); }
    catch (_) { return ""; }
  }

  function renderStats() {
    var total     = _orders.length;
    var pending   = _orders.filter(function (o) { return o.status === "pending"; }).length;
    var delivered = _orders.filter(function (o) { return o.status === "delivered"; }).length;
    var revenue   = _orders.filter(function (o) { return o.status !== "cancelled"; })
                           .reduce(function (n, o) { return n + (o.order_total || 0); }, 0);
    var stat = function (val, gold, labAr, labEn) {
      return "<div class='stat'><p class='stat__value" + (gold ? " stat__value--gold" : "") + "'>" + val + "</p>" +
             "<p class='stat__label'>" + bi(labAr, labEn) + "</p></div>";
    };
    var stats = $("#admin-stats");
    if (!stats) return;
    stats.innerHTML =
      stat(isAr() ? RB.arDigits(total)     : total,     false, "إجمالي الطلبات", "Total orders") +
      stat(isAr() ? RB.arDigits(pending)   : pending,   false, "قيد المراجعة",   "Pending") +
      stat(isAr() ? RB.arDigits(delivered) : delivered, false, "تم التوصيل",     "Delivered") +
      stat(bi(RB.formatPrice(revenue, "ar"), RB.formatPrice(revenue, "en")), true, "الإيرادات", "Revenue");
  }

  function statusSelect(o) {
    var opts = ORDER.map(function (s) {
      return "<option value='" + s + "'" + (s === o.status ? " selected" : "") + ">" +
             (isAr() ? STATUS[s].ar : STATUS[s].en) + "</option>";
    }).join("");
    return "<select class='status-select' data-id='" + o.id + "' aria-label='" +
           (isAr() ? "تغيير حالة الطلب" : "Change order status") + "'>" + opts + "</select>";
  }

  function renderRows() {
    var rows   = _orders.filter(function (o) { return _filter === "all" || o.status === _filter; });
    var tbody  = $("#admin-rows");
    var emptyW = $("#admin-empty");
    var tWrap  = $(".table-wrap");
    var count  = $("#admin-count");

    if (count) count.innerHTML = bi(RB.arDigits(rows.length) + " طلب", rows.length + " orders");

    if (!rows.length) {
      if (tbody)  tbody.innerHTML = "";
      if (tWrap)  tWrap.style.display = "none";
      if (emptyW) emptyW.innerHTML =
        "<div class='rb-empty'>" +
        "<span class='rb-empty__icon'><svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.3' aria-hidden='true'><circle cx='11' cy='11' r='7'/><path d='M21 21l-4.3-4.3' stroke-linecap='round'/></svg></span>" +
        "<h3 class='rb-empty__title'>" + bi("لا طلبات بهذه الحالة", "No orders with this status") + "</h3>" +
        "</div>";
      return;
    }

    if (tWrap)  tWrap.style.display = "";
    if (emptyW) emptyW.innerHTML = "";

    if (tbody) tbody.innerHTML = rows.map(function (o) {
      var product  = o.products || {};
      var itemName = isAr() ? (product.ar_name || "") : (product.en_name || "");
      var qty      = o.qty || 1;
      var itemStr  = itemName + (qty > 1 ? " ×" + (isAr() ? RB.arDigits(qty) : qty) : "");
      var total    = o.order_total != null ? o.order_total : (o.unit_price ? o.unit_price * qty : 0);
      return "<tr>" +
        "<td class='num'>" + (o.checkout_reference || o.id.slice(0, 8)) + "</td>" +
        "<td>" + (o.customer_name || "") + "</td>" +
        "<td>" + itemStr + "</td>" +
        "<td class='num'>" + bi(RB.formatPrice(total, "ar"), RB.formatPrice(total, "en")) + "</td>" +
        "<td>" + fmtDate(o.created_at) + "</td>" +
        "<td>" + statusSelect(o) + "</td>" +
        "</tr>";
    }).join("");
  }

  function renderAll() { renderStats(); renderRows(); }

  function loadOrders() {
    fetch("/api/admin/orders", { headers: { "Authorization": "Bearer " + _token } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (body) {
        _orders = (body && body.data) ? body.data : [];
        renderAll();
      })
      .catch(function (err) {
        var emptyW = $("#admin-empty");
        var tWrap  = $(".table-wrap");
        if (tWrap) tWrap.style.display = "none";
        if (emptyW) emptyW.innerHTML =
          "<div class='rb-empty'>" +
          "<h3 class='rb-empty__title'>" + bi("تعذّر تحميل الطلبات", "Failed to load orders") + "</h3>" +
          "</div>";
      });
  }

  // Status filter chips
  $$(".filter-chip[data-status]").forEach(function (chip) {
    chip.addEventListener("click", function () {
      _filter = chip.dataset.status;
      $$(".filter-chip[data-status]").forEach(function (c) {
        c.setAttribute("aria-pressed", String(c === chip));
      });
      renderRows();
    });
  });

  // Per-row status change
  var adminRows = $("#admin-rows");
  if (adminRows) adminRows.addEventListener("change", function (e) {
    var sel = e.target.closest(".status-select");
    if (!sel) return;
    var id     = sel.dataset.id;
    var status = sel.value;

    fetch("/api/admin/orders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + _token },
      body: JSON.stringify({ status: status })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (body) {
        var updated = body && body.data;
        if (updated) {
          var idx = _orders.findIndex(function (o) { return o.id === id; });
          if (idx !== -1) _orders[idx].status = updated.status;
        }
        renderAll();
        RB.toast(isAr() ? "تم تحديث الحالة" : "Status updated");
      })
      .catch(function () {
        RB.toast(isAr() ? "فشل تحديث الحالة" : "Failed to update status");
        loadOrders();
      });
  });

  document.addEventListener("languageChanged", renderAll);

  // ---- Init (auth + admin guard) ----
  function init() {
    if (!RB.requireAuth) {
      location.replace("/login?next=/admin");
      return;
    }
    RB.requireAuth("/admin").then(function (session) {
      if (!session) return;
      _token = session.access_token;

      // Check admin role via profile API
      fetch("/api/profile", { headers: { "Authorization": "Bearer " + _token } })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
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
          loadOrders();
        })
        .catch(function () {
          location.replace("/login?next=/admin");
        });
    });
  }

  init();
})();
