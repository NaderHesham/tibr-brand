/* products.js — Catalog loader, product modal, and admin form */

document.addEventListener("DOMContentLoaded", () => {
  let products = [];

  const loadProducts = async () => {
    try {
      const { data } = await window.apiClient.getProducts();

      if (data && data.length > 0) {
        products = data.map(item => ({
          id: item.id,
          category: item.category,
          subCategory: item.sub_category,
          gender: item.gender,
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          image: item.image,
          accentGlow: item.accent_glow,
          accentColor: item.accent_color,
          ar: {
            name: item.ar_name,
            collection: item.ar_collection,
            shortDesc: item.ar_short_desc,
            desc: item.ar_desc,
            specLeftVal: item.ar_spec_left,
            specRightVal: item.ar_spec_right,
            price: item.ar_price,
            mood: item.ar_mood
          },
          en: {
            name: item.en_name,
            collection: item.en_collection,
            shortDesc: item.en_short_desc,
            desc: item.en_desc,
            specLeftVal: item.en_spec_left,
            specRightVal: item.en_spec_right,
            price: item.en_price,
            mood: item.en_mood
          }
        }));
      }

      window.catalogProducts = products;
      document.dispatchEvent(new CustomEvent("productsLoaded", { detail: { products } }));
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  // --- Modal DOM references ---
  const modal = document.getElementById("product-modal");
  const modalClose = document.getElementById("modal-close");
  const modalImgContainer = modal ? modal.querySelector(".modal-img-container") : null;
  const mCollection = document.getElementById("modal-perfume-collection");
  const mName = document.getElementById("modal-perfume-name");
  const mPrice = document.getElementById("modal-perfume-price");
  const mDesc = document.getElementById("modal-perfume-desc");
  const mSpecLeftTitle = document.getElementById("modal-spec-left-title");
  const mSpecRightTitle = document.getElementById("modal-spec-right-title");
  const mSpecLeftVal = document.getElementById("modal-perfume-top");
  const mSpecRightVal = document.getElementById("modal-perfume-base");
  const mMoodWrapper = document.getElementById("modal-mood-wrapper");
  const mMoodVal = document.getElementById("modal-perfume-mood");
  const mWaLink = document.getElementById("modal-whatsapp-link");
  const mSizeWrapper = document.getElementById("modal-size-wrapper");
  const mSizeOptions = document.getElementById("modal-size-options");

  let activeLang = localStorage.getItem("robabikia-lang") || "ar";
  let activeProductId = null;
  let selectedSize = null;

  // --- Perfume cinematic scene helpers (used in modal) ---

  const getPerfumeSceneVariant = (imagePath = "", productId = "") => {
    const source = `${imagePath} ${productId}`.toLowerCase();
    if (source.includes("jasmine") || source.includes("etoilee") || source.includes("فل")) return "jasmine";
    if (source.includes("nostalgia") || source.includes("rouge") || source.includes("نوستالج")) return "nostalgia";
    return "oud";
  };

  const getPerfumeSceneHTML = (product, data) => {
    const variant = getPerfumeSceneVariant(product.image, product.id);
    const kickerMap = { oud: "Luxury Scent Film", jasmine: "Floral Scent Film", nostalgia: "Vintage Scent Film" };
    return `
      <div class="cinematic-scene scene--${variant} modal-perfume-scene" data-scene="${variant}">
        <div class="cinematic-scene__frame"></div>
        <div class="cinematic-scene__glow"></div>
        <div class="cinematic-scene__mist cinematic-scene__mist--1"></div>
        <div class="cinematic-scene__mist cinematic-scene__mist--2"></div>
        <div class="cinematic-scene__mist cinematic-scene__mist--3"></div>
        <div class="cinematic-scene__base">
          <img src="${product.image}" alt="${data.name}" class="cinematic-scene__image">
        </div>
        <div class="cinematic-scene__smoke">
          <span class="smoke-wisp smoke-wisp--1"></span>
          <span class="smoke-wisp smoke-wisp--2"></span>
          <span class="smoke-wisp smoke-wisp--3"></span>
          <span class="smoke-wisp smoke-wisp--4"></span>
        </div>
        <div class="cinematic-scene__bottle-wrap">
          <div class="cinematic-scene__bottle">
            <img src="${product.image}" alt="${data.name}" class="cinematic-scene__image">
            <span class="cinematic-scene__highlight"></span>
          </div>
        </div>
        <div class="cinematic-scene__vignette"></div>
      </div>
    `;
  };

  // --- Modal logic ---

  const selectSize = (sizeVal, btnNode) => {
    selectedSize = sizeVal;
    mSizeOptions.querySelectorAll(".size-btn").forEach(btn => btn.classList.remove("active"));
    btnNode.classList.add("active");
    updateWhatsAppLink();
  };

  const updateWhatsAppLink = () => {
    if (!activeProductId) return;
    const product = products.find(p => p.id === activeProductId);
    if (!product) return;
    const data = product[activeLang];
    const phone = "201000000000";

    let messageText = "";
    if (product.category === "perfumes") {
      const msgTemplate = translations[activeLang]["wa-msg-prefix"];
      messageText = msgTemplate
        .replace("{name}", data.name)
        .replace("{collection}", data.collection)
        .replace("{price}", data.price);
    } else {
      const msgTemplate = translations[activeLang]["wa-msg-apparel"];
      const sizeStr = selectedSize || (activeLang === "ar" ? "لم يتم التحديد" : "Not Selected");
      messageText = msgTemplate
        .replace("{name}", data.name)
        .replace("{collection}", data.collection)
        .replace("{size}", sizeStr)
        .replace("{price}", data.price);
    }

    mWaLink.href = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
  };

  const populateModal = (id, lang) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const data = product[lang];

    mCollection.textContent = data.collection;
    mName.textContent = data.name;
    mPrice.textContent = data.price;
    mDesc.textContent = data.desc;
    mSpecLeftVal.textContent = data.specLeftVal;
    mSpecRightVal.textContent = data.specRightVal;
    modal.querySelector(".product-modal").style.borderColor = product.accentColor;

    if (product.category === "perfumes") {
      if (modalImgContainer) {
        modalImgContainer.innerHTML = `
          ${getPerfumeSceneHTML(product, data)}
          <div class="modal-glow-bg" id="modal-glow-bg"></div>
        `;
      }
      mSpecLeftTitle.textContent = translations[lang]["modal-top-notes-title"];
      mSpecRightTitle.textContent = translations[lang]["modal-base-notes-title"];
      mMoodWrapper.style.display = "block";
      mMoodVal.textContent = data.mood;
      mSizeWrapper.style.display = "none";
      selectedSize = null;
    } else {
      if (modalImgContainer) {
        modalImgContainer.innerHTML = `
          <img src="${product.image}" id="modal-perfume-img" alt="${data.name}">
          <div class="modal-glow-bg" id="modal-glow-bg"></div>
        `;
      }
      mSpecLeftTitle.textContent = translations[lang]["modal-spec-left"];
      mSpecRightTitle.textContent = translations[lang]["modal-spec-right"];
      mMoodWrapper.style.display = "none";
      mSizeWrapper.style.display = "block";

      selectedSize = product.sizes[0];
      mSizeOptions.innerHTML = product.sizes.map(size =>
        `<button class="size-btn ${size === selectedSize ? "active" : ""}" data-size="${size}">${size}</button>`
      ).join("");
    }

    const currentGlow = modal ? modal.querySelector("#modal-glow-bg") : null;
    currentGlow?.style.setProperty("--accent-glow", product.accentGlow);
    window.initCinematicScenes?.(modalImgContainer || modal);

    updateWhatsAppLink();
  };

  const openProductModal = (id) => {
    activeProductId = id;
    window.activeProductId = id;
    window.activeModalProduct = products.find(p => p.id === id) || null;
    populateModal(id, activeLang);
    window.reviews?.load(id);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeProductModal = () => {
    modal.classList.remove("active");
    activeProductId = null;
    selectedSize = null;
    window.activeModalProduct = null;
    if (!document.body.classList.contains("intro-active")) {
      document.body.style.overflow = "";
    }
  };

  // --- Event listeners ---

  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest(".product-card-btn");
    if (btn) openProductModal(btn.getAttribute("data-id"));
  });

  mSizeOptions?.addEventListener("click", (e) => {
    const btn = e.target.closest(".size-btn");
    if (btn) selectSize(btn.getAttribute("data-size"), btn);
  });

  modalClose?.addEventListener("click", closeProductModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeProductModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal?.classList.contains("active")) closeProductModal();
  });

  document.addEventListener("languageChanged", (e) => {
    activeLang = e.detail.lang;

    const sizeTitle = mSizeWrapper?.querySelector(".modal-size-title");
    if (sizeTitle) {
      const key = sizeTitle.getAttribute("data-i18n");
      if (key && translations[activeLang][key]) sizeTitle.textContent = translations[activeLang][key];
    }

    const dbOrderBtn = document.getElementById("modal-db-order-btn");
    if (dbOrderBtn) {
      const key = dbOrderBtn.getAttribute("data-i18n");
      if (key && translations[activeLang][key]) dbOrderBtn.textContent = translations[activeLang][key];
    }

    const waOrderBtn = document.getElementById("modal-whatsapp-link");
    if (waOrderBtn) {
      const span = waOrderBtn.querySelector("span");
      if (span) {
        const key = span.getAttribute("data-i18n");
        if (key && translations[activeLang][key]) span.textContent = translations[activeLang][key];
      }
    }

    if (activeProductId && modal?.classList.contains("active")) {
      populateModal(activeProductId, activeLang);
    }
  });

  // --- Admin form ---

  const adminForm = document.getElementById("admin-form");
  const adminModal = document.getElementById("admin-modal");

  if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = document.getElementById("admin-submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "جاري الحفظ... (Saving...)";

      const sizesInput = document.getElementById("admin-prod-sizes").value;
      const sizesArray = sizesInput.split(",").map(s => s.trim()).filter(s => s);

      const newProduct = {
        id: document.getElementById("admin-prod-id").value,
        category: document.getElementById("admin-prod-category").value,
        sub_category: document.getElementById("admin-prod-subcategory").value || null,
        gender: document.getElementById("admin-prod-gender").value,
        sizes: sizesArray,
        image: document.getElementById("admin-prod-image").value,
        accent_glow: document.getElementById("admin-prod-glow").value || null,
        accent_color: document.getElementById("admin-prod-color").value || null,
        ar_name: document.getElementById("admin-prod-name-ar").value,
        ar_collection: document.getElementById("admin-prod-collection-ar").value || null,
        ar_short_desc: document.getElementById("admin-prod-short-ar").value || null,
        ar_desc: document.getElementById("admin-prod-desc-ar").value || null,
        ar_spec_left: document.getElementById("admin-prod-spec-l-ar").value || null,
        ar_spec_right: document.getElementById("admin-prod-spec-r-ar").value || null,
        ar_price: document.getElementById("admin-prod-price-ar").value,
        ar_mood: document.getElementById("admin-prod-mood-ar").value || null,
        en_name: document.getElementById("admin-prod-name-en").value,
        en_collection: document.getElementById("admin-prod-collection-en").value || null,
        en_short_desc: document.getElementById("admin-prod-short-en").value || null,
        en_desc: document.getElementById("admin-prod-desc-en").value || null,
        en_spec_left: document.getElementById("admin-prod-spec-l-en").value || null,
        en_spec_right: document.getElementById("admin-prod-spec-r-en").value || null,
        en_price: document.getElementById("admin-prod-price-en").value,
        en_mood: document.getElementById("admin-prod-mood-en").value || null
      };

      try {
        await window.apiClient.createProduct(newProduct);
        alert("تم حفظ وإضافة المنتج بنجاح!");
        adminForm.reset();
        if (adminModal) {
          adminModal.classList.remove("active");
          document.body.style.overflow = "";
        }
        await loadProducts();
      } catch (err) {
        alert("حدث خطأ أثناء حفظ المنتج: " + (err.message || err));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "حفظ وإضافة المنتج (Save Product)";
      }
    });
  }

  loadProducts();
});
