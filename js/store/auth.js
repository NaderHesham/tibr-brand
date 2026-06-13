/* -------------------------------------------------------------
 * STORE / AUTH.JS — Login + signup with real Supabase auth
 * Depends on chrome.js (window.RB) + session.js (RB.supabase).
 * ------------------------------------------------------------- */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const form = $(".auth__form");
  if (!form) return;

  const kind = form.dataset.form; // "login" | "signup"
  const isAr = () => (localStorage.getItem("tibr-lang") || "ar") === "ar";
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE = /^01[0125]\d{8}$/;
  const toLatinDigits = (s) => String(s).replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); });

  // If already logged in, skip to destination
  (function redirectIfLoggedIn() {
    var RB = window.RB;
    if (!RB || !RB.getSession) return;
    RB.getSession().then(function (session) {
      if (!session) return;
      var next = new URLSearchParams(location.search).get("next") || "/account";
      location.replace(next);
    });
  })();

  // ---- Field error helpers ----
  function setInvalid(el, invalid) {
    var wrap = el.closest(".field");
    if (wrap) wrap.classList.toggle("is-invalid", invalid);
    el.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function showFormError(msg) {
    var banner = form.querySelector(".auth__error");
    if (!banner) {
      banner = document.createElement("p");
      banner.className = "auth__error";
      banner.style.cssText = "color:var(--c-error,#d04040);margin-block:.75rem 0;font-size:var(--fs-sm);text-align:center";
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.insertAdjacentElement("beforebegin", banner);
      else form.appendChild(banner);
    }
    banner.textContent = msg;
    banner.hidden = false;
  }

  function hideFormError() {
    var el = form.querySelector(".auth__error");
    if (el) el.hidden = true;
  }

  // ---- Validation ----
  function validate() {
    var firstInvalid = null;
    var checks = [];

    if (kind === "signup") {
      var name = $("#name"), phone = $("#phone"), confirm = $("#confirm");
      checks.push([name,       name.value.trim().length >= 2]);
      checks.push([phone,      PHONE.test(toLatinDigits(phone.value).replace(/\s/g, ""))]);
      checks.push([$("#email"),    EMAIL.test($("#email").value.trim())]);
      checks.push([$("#password"), $("#password").value.length >= 8]);
      checks.push([confirm,    confirm.value === $("#password").value && confirm.value.length > 0]);
    } else {
      checks.push([$("#email"),    EMAIL.test($("#email").value.trim())]);
      checks.push([$("#password"), $("#password").value.length > 0]);
    }

    checks.forEach(function (pair) {
      var el = pair[0], ok = pair[1];
      setInvalid(el, !ok);
      if (!ok && !firstInvalid) firstInvalid = el;
    });

    if (firstInvalid) firstInvalid.focus();
    return !firstInvalid;
  }

  form.querySelectorAll("input").forEach(function (el) {
    el.addEventListener("input", function () { setInvalid(el, false); hideFormError(); });
  });

  // ---- Submit ----
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var btn = form.querySelector('button[type="submit"]');
    btn.classList.add("is-loading");
    btn.disabled = true;
    hideFormError();

    var supabase = window.RB && window.RB.supabase;
    if (!supabase) {
      showFormError(isAr() ? "خطأ في الاتصال بالخادم. حاول مجددًا." : "Server connection error. Please try again.");
      btn.classList.remove("is-loading");
      btn.disabled = false;
      return;
    }

    if (kind === "login") {
      supabase.auth.signInWithPassword({
        email: $("#email").value.trim(),
        password: $("#password").value
      }).then(function (result) {
        if (result.error) {
          var isServerError = result.error.status >= 500;
          showFormError(isAr()
            ? (isServerError ? "خطأ في الخادم. حاول مجددًا." : "البريد الإلكتروني أو كلمة المرور غير صحيحة.")
            : (isServerError ? "Server error. Please try again." : "Incorrect email or password."));
          btn.classList.remove("is-loading");
          btn.disabled = false;
          return;
        }
        var next = new URLSearchParams(location.search).get("next") || "/account";
        location.href = next;
      }).catch(function () {
        showFormError(isAr() ? "حدث خطأ. حاول مجددًا." : "An error occurred. Please try again.");
        btn.classList.remove("is-loading");
        btn.disabled = false;
      });

    } else {
      // signup
      supabase.auth.signUp({
        email: $("#email").value.trim(),
        password: $("#password").value,
        options: {
          data: {
            full_name: $("#name").value.trim(),
            phone_number: toLatinDigits($("#phone").value).replace(/\s/g, "")
          }
        }
      }).then(function (result) {
        if (result.error) {
          var isExisting = /already registered|already exists/i.test(result.error.message);
          showFormError(isAr()
            ? (isExisting ? "هذا البريد الإلكتروني مسجّل بالفعل." : "حدث خطأ أثناء إنشاء الحساب.")
            : (isExisting ? "This email is already registered." : "An error occurred during sign-up."));
          btn.classList.remove("is-loading");
          btn.disabled = false;
          return;
        }

        // Email confirmation required (no session yet)
        if (result.data.user && !result.data.session) {
          form.hidden = true;
          var card = form.closest(".auth__card");
          var msg = document.createElement("div");
          msg.style.cssText = "text-align:center;padding:var(--sp-6) var(--sp-4)";
          msg.innerHTML = isAr()
            ? "<h2 style='margin-block-end:var(--sp-3)'>راجع بريدك الإلكتروني</h2><p>أرسلنا إليك رسالة تأكيد على <strong>" + result.data.user.email + "</strong>.<br>انقر على الرابط في الرسالة لتفعيل حسابك.</p>"
            : "<h2 style='margin-block-end:var(--sp-3)'>Check your email</h2><p>We sent a confirmation link to <strong>" + result.data.user.email + "</strong>.<br>Click the link to activate your account.</p>";
          if (card) card.appendChild(msg);
          else document.body.appendChild(msg);
          return;
        }

        // Email confirmation disabled — session ready
        var next = new URLSearchParams(location.search).get("next") || "/account";
        location.href = next;
      }).catch(function () {
        showFormError(isAr() ? "حدث خطأ. حاول مجددًا." : "An error occurred. Please try again.");
        btn.classList.remove("is-loading");
        btn.disabled = false;
      });
    }
  });
})();
