/* -------------------------------------------------------------
 * PRODUCTS.JS — Dynamic Catalog Controller & Category Layouts
 * ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Core Catalog Dataset (Bilingual Classic-Modern Products with Sub-Categories)
  const products = [
    // --- Perfumes ---
    {
      id: "jasmine",
      category: "perfumes",
      subCategory: "original",
      ar: {
        name: "ذاكرة الفل",
        collection: "مجموعة الماضي الجميل",
        shortDesc: "رقة الفل والياسمين البلدي في بيوت القاهرة القديمة بمشربياتها العتيقة.",
        desc: "نفحات عطرية تصحبك لبيوت القاهرة القديمة بمشربياتها الخشبية العتيقة وحدائقها المليئة بالفل والياسمين البري مع نسيم الليل الهادئ. عطر يحاكي براءة ونقاء أيام الطفولة.",
        specLeftVal: "فل بلدي، ياسمين جبلي، زنبق الوادي",
        specRightVal: "خشب الصندل الدافئ، مسك أبيض ناعم",
        price: "٤٥٠ جنيه",
        mood: "دافئ، رومانسي، ناعم"
      },
      en: {
        name: "Jasmine Memory",
        collection: "Vintage Past Collection",
        shortDesc: "The delicacy of local jasmine in ancient Cairo houses with antique mashrabiyas.",
        desc: "Aromatic notes accompanying you to Cairo's old houses with vintage wooden mashrabiyas and gardens blooming with local jasmine in the quiet night breeze. A scent mimicking childhood innocence.",
        specLeftVal: "Local Jasmine, Mountain Jasmine, Lily of the Valley",
        specRightVal: "Warm Sandalwood, Soft White Musk",
        price: "450 EGP",
        mood: "Warm, Romantic, Soft"
      },
      image: "assets/images/product_jasmine.png",
      accentGlow: "rgba(237, 224, 200, 0.15)",
      accentColor: "#EDE0C8"
    },
    {
      id: "oud",
      category: "perfumes",
      subCategory: "inspired",
      ar: {
        name: "سر العود",
        collection: "مجموعة التراث المعتق",
        shortDesc: "بخور العود الفخم مع توابل وبزارات الحسين التاريخية المعتقة.",
        desc: "عطر مهيب مستوحى من أبخرة النحاس المشتعل بالعود الفاخر في بازارات الحسين التاريخية. مزيج ساحر يمنحك حضوراً واثقاً وغامضاً يعود بك لقرون مضت.",
        specLeftVal: "زعفران ناري، دارسين (قرفة)، هيل بري",
        specRightVal: "عود ملكي معتق، خشب الأرز، لبان مسك",
        price: "٥٥٠ جنيه",
        mood: "غامض، فخم، مهيب"
      },
      en: {
        name: "Oud Secret",
        collection: "Aged Heritage Collection",
        shortDesc: "Premium oud incense blended with historical Hussein aged spices and bazaars.",
        desc: "A majestic fragrance inspired by copper burner vapors of luxurious oud in the historical bazaars of El Hussein. A magical blend giving you a confident, mysterious presence going back centuries.",
        specLeftVal: "Fiery Saffron, Cinnamon, Wild Cardamom",
        specRightVal: "Royal Aged Oud, Cedarwood, Musk Frankincense",
        price: "550 EGP",
        mood: "Mysterious, Luxurious, Majestic"
      },
      image: "assets/images/product_oud.png",
      accentGlow: "rgba(201, 168, 76, 0.2)",
      accentColor: "#C9A84C"
    },
    {
      id: "nostalgia",
      category: "perfumes",
      subCategory: "recreated",
      ar: {
        name: "عبير النوستالجيا",
        collection: "مجموعة الحنين الفاخرة",
        shortDesc: "ورد مجفف وعنبر دافئ يجسدان صندوق ذكريات الحب الرائعة.",
        desc: "توليفة مخملية تجسد ذكريات الحب الرائعة المكتوبة برائحة الورد المجفف وأحجار العنبر الدافئة المنسكبة في صندوق خشبي قديم. يمنحك طاقة دفء تدوم طويلاً.",
        specLeftVal: "ورد جوري أحمر، زهر البرتقال، توت بري",
        specRightVal: "عنبر خام، باتشولي دافئ، فانيليا معتقة",
        price: "٤٩٠ جنيه",
        mood: "مخملي، جذاب، عميق"
      },
      en: {
        name: "Nostalgia Breeze",
        collection: "Luxury Nostalgia Collection",
        shortDesc: "Dried roses and warm amber embodying a box of wonderful love memories.",
        desc: "A velvety blend embodying wonderful love memories written in the scent of dried roses and warm amber stones stored in an old wooden box. Gives you a long-lasting warm energy.",
        specLeftVal: "Red Damask Rose, Orange Blossom, Wild Berries",
        specRightVal: "Raw Amber, Warm Patchouli, Vintage Vanilla",
        price: "490 EGP",
        mood: "Velvety, Attractive, Deep"
      },
      image: "assets/images/product_nostalgia.png",
      accentGlow: "rgba(123, 45, 62, 0.25)",
      accentColor: "#7B2D3E"
    },

    // --- Clothes ---
    {
      id: "linen-shirt",
      category: "clothes",
      sizes: ["S", "M", "L", "XL", "XXL"],
      ar: {
        name: "قميص كتان راقي",
        collection: "مجموعة الصيف الفاخرة",
        shortDesc: "قميص كتان إيطالي ناعم وبارد بتفاصيل خياطة يدوية راقية.",
        desc: "قميص صيفي كلاسيكي عصري مصنوع من خامة الكتان الطبيعي الفاخر بنسبة 100%. يتميز بقصة مريحة وأنيقة تناسب الإطلالات اليومية الذكية في الطقس الدافئ.",
        specLeftVal: "كتان إيطالي نقي 100% فائق النعومة",
        specRightVal: "قصة مريحة (Slim/Regular) خياطة وتطريز يدوي دقيق",
        price: "٨٥٠ جنيه"
      },
      en: {
        name: "Premium Linen Shirt",
        collection: "Luxury Summer Collection",
        shortDesc: "Breathable and soft Italian linen shirt with minimalist stitching.",
        desc: "A classic-modern summer shirt tailored from 100% pure premium natural linen. Features a relaxed yet structured fit perfect for smart casual outings.",
        specLeftVal: "100% Pure Ultra-Soft Italian Linen",
        specRightVal: "Comfortable Slim/Regular Cut, fine manual tailoring",
        price: "850 EGP"
      },
      image: "assets/images/product_jasmine.png",
      accentGlow: "rgba(237, 224, 200, 0.15)",
      accentColor: "#EDE0C8"
    },
    {
      id: "tailored-trousers",
      category: "clothes",
      sizes: ["30", "32", "34", "36", "38"],
      ar: {
        name: "بنطال كلاسيكي أنيق",
        collection: "مجموعة الأناقة العصرية",
        shortDesc: "بنطال صوف خفيف وقصة ممتازة تمنحك إطلالة رسمية ومريحة.",
        desc: "بنطال مصمم بعناية فائقة من أقمشة مخلوطة خفيفة الوزن توفر سهولة الحركة مع الحفاظ على الشكل الكلاسيكي المرتب والمثالي للمناسبات الرسمية والعملية.",
        specLeftVal: "صوف خفيف مخلوط بالقطن العضوي الممتاز",
        specRightVal: "قصة مستقيمة كلاسيكية (Straight Fit)، تفاصيل حزام مدمج",
        price: "١٢٠٠ جنيه"
      },
      en: {
        name: "Classic Tailored Trousers",
        collection: "Modern Elegance Collection",
        shortDesc: "Light wool-blend trousers with a refined fit for structured daily style.",
        desc: "Meticulously designed pants tailored from light breathable wool and cotton blend. Offers outstanding flexibility while keeping a clean classic outline.",
        specLeftVal: "Light Wool and Organic Cotton Blend",
        specRightVal: "Straight Classic Fit, build-in waist adjusters",
        price: "1,200 EGP"
      },
      image: "assets/images/story_bg.png",
      accentGlow: "rgba(201, 168, 76, 0.15)",
      accentColor: "#C9A84C"
    },

    // --- Shoes ---
    {
      id: "minimalist-sneakers",
      category: "shoes",
      sizes: ["40", "41", "42", "43", "44", "45"],
      ar: {
        name: "حذاء جلدي عصري",
        collection: "مجموعة الخطوات المريحة",
        shortDesc: "حذاء رياضي جلدي بسيط ومريح يناسب جميع المناسبات الكاجوال.",
        desc: "حذاء رياضي كاجوال مصنع بالكامل من الجلد الطبيعي الممتاز. تصميم بسيط بخطوط نظيفة ونعل مطاطي مريح يناسب الاستخدام اليومي والأناقة العصرية الكاجوال.",
        specLeftVal: "جلد طبيعي 100% مدبوغ بعناية",
        specRightVal: "نعل مطاطي مرن ومبطن، بطانة طبية مريحة",
        price: "١٤٥٠ جنيه"
      },
      en: {
        name: "Minimalist Leather Sneakers",
        collection: "Comfort Steps Collection",
        shortDesc: "Clean and minimalist leather sneakers for smart casual everyday comfort.",
        desc: "Sleek low-top sneakers crafted entirely from high-grade natural leather. Minimalist design featuring flexible support ideal for dynamic modern life.",
        specLeftVal: "100% Hand-finished Genuine Leather",
        specRightVal: "Flexible rubber sole, orthotic padded inner lining",
        price: "1,450 EGP"
      },
      image: "assets/images/product_nostalgia.png",
      accentGlow: "rgba(123, 45, 62, 0.15)",
      accentColor: "#7B2D3E"
    },
    {
      id: "leather-loafers",
      category: "shoes",
      sizes: ["40", "41", "42", "43", "44", "45"],
      ar: {
        name: "حذاء لوفر كلاسيكي",
        collection: "مجموعة المناسبات الراقية",
        shortDesc: "لوفر جلدي فاخر مصنوع يدوياً ليناسب الإطلالات الكلاسيكية والأنيقة.",
        desc: "حذاء لوفر كلاسيكي أنيق مصنع يدوياً من أفخر أنواع الجلود الطبيعية. يوفر راحة تامة للقدمين ومظهرًا فخمًا يليق بالمناسبات والبدل الرسمية والأطقم الكلاسيكية.",
        specLeftVal: "جلد ماعز طبيعي مدبوغ ومطرز يدوياً بالكامل",
        specRightVal: "نعل جلدي معزز بطبقة مطاطية مدمجة لمنع الانزلاق",
        price: "١٦٥٠ جنيه"
      },
      en: {
        name: "Classic Leather Loafers",
        collection: "Premium Occasions Collection",
        shortDesc: "Handcrafted luxury leather loafers for tailored formal and semi-formal looks.",
        desc: "Timeless classic leather loafers, handcrafted by skilled artisan shoemakers. Made with soft leather for a custom-fit feel and clean luxurious look.",
        specLeftVal: "Artisan Tanned Premium Goatskin Leather",
        specRightVal: "Stacked premium leather sole with anti-slip grip insert",
        price: "1,650 EGP"
      },
      image: "assets/images/product_oud.png",
      accentGlow: "rgba(201, 168, 76, 0.2)",
      accentColor: "#C9A84C"
    }
  ];

  // DOM Layout Grid references
  const gridPerfumes = document.getElementById("perfumes-scent-grid");
  const containerClothes = document.getElementById("clothes-editorial-rows");
  const gridShoes = document.getElementById("shoes-lookbook-grid");

  // Home overview page references
  const homePerfumesGrid = document.getElementById("overview-perfumes-grid");
  const homeClothesGrid = document.getElementById("overview-clothes-grid");
  const homeShoesGrid = document.getElementById("overview-shoes-grid");

  // Sub-filter DOM reference
  const subFilterWrapper = document.getElementById("perfume-subfilters");

  // Modal DOM references
  const modal = document.getElementById("product-modal");
  const modalClose = document.getElementById("modal-close");
  const mImg = document.getElementById("modal-perfume-img");
  const mGlow = document.getElementById("modal-glow-bg");
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
  let activeSubFilter = "all";
  let activeProductId = null;
  let selectedSize = null;

  // Custom builder states
  let builderTop = "فل بلدي (Jasmine)";
  let builderHeart = "ورد جوري (Damask Rose)";
  let builderBase = "عود ملكي (Royal Oud)";
  let builderVolume = "50ml";

  // --- HTML Rendering templates ---
  
  // Template: Scent Card Layout (3 columns)
  const getCardHTML = (product, lang, discoverText) => {
    const data = product[lang];
    const notesSummary = product.category === "perfumes" ? data.specLeftVal : "";
    return `
      <div class="product-card" id="card-${product.id}" style="--accent-glow: ${product.accentGlow};">
        <div class="product-img-wrapper">
          <img src="${product.image}" alt="${data.name}" class="product-img">
        </div>
        <div class="product-info">
          <span class="product-collection">${data.collection}</span>
          <h3 class="product-title">${data.name}</h3>
          <p class="product-short-desc">${data.shortDesc}</p>
          ${notesSummary ? `<span class="product-card-notes">🌸 ${notesSummary}</span>` : ""}
          <div class="product-price">${data.price}</div>
          <button class="product-card-btn" data-id="${product.id}">${discoverText}</button>
        </div>
      </div>
    `;
  };

  // Template: Zara-style Editorial layout (Alternating Rows)
  const getEditorialHTML = (product, lang, index, discoverText) => {
    const data = product[lang];
    const isReverse = index % 2 !== 0 ? "row-reverse" : "";
    return `
      <div class="editorial-row ${isReverse}" style="--accent-glow: ${product.accentGlow};">
        <div class="editorial-img-wrapper">
          <img src="${product.image}" alt="${data.name}" class="editorial-img">
        </div>
        <div class="editorial-content glass-panel">
          <span class="editorial-collection">${data.collection}</span>
          <h3 class="editorial-title">${data.name}</h3>
          <p class="editorial-desc">${data.desc}</p>
          <div class="editorial-price">${data.price}</div>
          <button class="btn btn-outline product-card-btn" data-id="${product.id}">${discoverText}</button>
        </div>
      </div>
    `;
  };

  // Template: Lookbook Layout (2 columns)
  const getLookbookHTML = (product, lang, discoverText) => {
    const data = product[lang];
    return `
      <div class="lookbook-card" style="--accent-glow: ${product.accentGlow};">
        <div class="lookbook-img-wrapper">
          <img src="${product.image}" alt="${data.name}" class="lookbook-img">
        </div>
        <div class="lookbook-info">
          <h3 class="lookbook-title">${data.name}</h3>
          <div class="lookbook-price">${data.price}</div>
          <button class="lookbook-btn product-card-btn" data-id="${product.id}">${discoverText}</button>
        </div>
      </div>
    `;
  };

  // Template: Interactive Custom Scent Builder Form HTML
  const getBuilderHTML = (lang) => {
    const dict = translations[lang];

    // Multi-language note selections
    const arTopNotes = ["فل بلدي", "ياسمين جبلي", "ليمون إيطالي دافئ", "نعناع بري منعش"];
    const enTopNotes = ["Local Jasmine", "Mountain Jasmine", "Warm Italian Lemon", "Fresh Wild Mint"];
    const topNotes = lang === "ar" ? arTopNotes : enTopNotes;

    const arHeartNotes = ["ورد جوري فاخر", "لافندر فرنسي هادئ", "قرفة الحسين الدافئة", "زنبق الوادي"];
    const enHeartNotes = ["Luxury Damask Rose", "Calming French Lavender", "Warm Al-Hussein Cinnamon", "Lily of the Valley"];
    const heartNotes = lang === "ar" ? arHeartNotes : enHeartNotes;

    const arBaseNotes = ["عود ملكي معتق", "مسك أبيض ناعم", "عنبر خام دافئ", "فانيليا معتقة غنية"];
    const enBaseNotes = ["Royal Aged Oud", "Soft White Musk", "Warm Raw Amber", "Rich Aged Vanilla"];
    const baseNotes = lang === "ar" ? arBaseNotes : enBaseNotes;

    // Reset default selected builder values to localized text if changed
    if (!topNotes.includes(builderTop)) builderTop = topNotes[0];
    if (!heartNotes.includes(builderHeart)) builderHeart = heartNotes[0];
    if (!baseNotes.includes(builderBase)) builderBase = baseNotes[0];

    return `
      <div class="scent-builder-container glass-panel animate-fade-up">
        <h3 class="builder-header-title">${dict["builder-title"]}</h3>
        <p class="builder-header-desc">${dict["builder-desc"]}</p>
        
        <div class="builder-form-grid">
          <!-- Top Notes Selector -->
          <div class="builder-select-group">
            <label>${dict["builder-top-note"]}</label>
            <select id="builder-select-top" class="builder-select">
              ${topNotes.map(note => `<option value="${note}" ${note === builderTop ? "selected" : ""}>${note}</option>`).join("")}
            </select>
          </div>

          <!-- Heart Notes Selector -->
          <div class="builder-select-group">
            <label>${dict["builder-heart-note"]}</label>
            <select id="builder-select-heart" class="builder-select">
              ${heartNotes.map(note => `<option value="${note}" ${note === builderHeart ? "selected" : ""}>${note}</option>`).join("")}
            </select>
          </div>

          <!-- Base Notes Selector -->
          <div class="builder-select-group">
            <label>${dict["builder-base-note"]}</label>
            <select id="builder-select-base" class="builder-select">
              ${baseNotes.map(note => `<option value="${note}" ${note === builderBase ? "selected" : ""}>${note}</option>`).join("")}
            </select>
          </div>

          <!-- Size Selector -->
          <div class="builder-select-group">
            <label>${dict["builder-size"]}</label>
            <div class="builder-sizes">
              <button class="builder-size-btn ${builderVolume === "50ml" ? "active" : ""}" data-volume="50ml">50ml</button>
              <button class="builder-size-btn ${builderVolume === "100ml" ? "active" : ""}" data-volume="100ml">100ml</button>
            </div>
          </div>
        </div>

        <a href="#" id="builder-submit-btn" target="_blank" class="btn btn-gold builder-submit-btn hover-vibrate">
          <span>${dict["builder-order-btn"]}</span>
        </a>
      </div>
    `;
  };

  // Compile Scent Builder Order details to WhatsApp
  const updateBuilderWhatsApp = () => {
    const submitBtn = document.getElementById("builder-submit-btn");
    if (!submitBtn) return;

    const phone = "201000000000";
    const template = translations[activeLang]["wa-msg-custom"];
    const message = template
      .replace("{top}", builderTop)
      .replace("{heart}", builderHeart)
      .replace("{base}", builderBase)
      .replace("{size}", builderVolume);

    submitBtn.href = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Render Layouts based on active language and filters
  const renderCatalog = (lang) => {
    const discoverText = translations[lang]["scents-discover-btn"];

    // 1. Separate items by category
    const perfumes = products.filter(p => p.category === "perfumes");
    const clothes = products.filter(p => p.category === "clothes");
    const shoes = products.filter(p => p.category === "shoes");

    // 2. Render Full Page Layouts
    if (gridPerfumes) {
      if (activeSubFilter === "custom") {
        // Toggle grid columns stylesheet for builder page layout
        gridPerfumes.classList.add("builder-layout-active");
        gridPerfumes.innerHTML = getBuilderHTML(lang);
        
        // Bind dynamic builder controls listeners
        bindBuilderListeners();
        updateBuilderWhatsApp();
      } else {
        gridPerfumes.classList.remove("builder-layout-active");
        const filteredPerfumes = activeSubFilter === "all" 
          ? perfumes 
          : perfumes.filter(p => p.subCategory === activeSubFilter);
        gridPerfumes.innerHTML = filteredPerfumes.map(p => getCardHTML(p, lang, discoverText)).join("");
      }
    }
    
    if (containerClothes) {
      containerClothes.innerHTML = clothes.map((c, idx) => getEditorialHTML(c, lang, idx, discoverText)).join("");
    }
    
    if (gridShoes) {
      gridShoes.innerHTML = shoes.map(s => getLookbookHTML(s, lang, discoverText)).join("");
    }

    // 3. Render Home Overview Previews (Home View)
    if (homePerfumesGrid) {
      homePerfumesGrid.innerHTML = perfumes.slice(0, 3).map(p => getCardHTML(p, lang, discoverText)).join("");
    }
    if (homeClothesGrid) {
      homeClothesGrid.innerHTML = clothes.slice(0, 1).map((c, idx) => getEditorialHTML(c, lang, idx, discoverText)).join("");
    }
    if (homeShoesGrid) {
      homeShoesGrid.innerHTML = shoes.slice(0, 2).map(s => getLookbookHTML(s, lang, discoverText)).join("");
    }
  };

  // Bind builder select menus and buttons selectors listeners
  const bindBuilderListeners = () => {
    const sTop = document.getElementById("builder-select-top");
    const sHeart = document.getElementById("builder-select-heart");
    const sBase = document.getElementById("builder-select-base");
    const sizeBtnsWrapper = document.querySelector(".builder-sizes");

    if (sTop) {
      sTop.addEventListener("change", (e) => {
        builderTop = e.target.value;
        updateBuilderWhatsApp();
      });
    }
    if (sHeart) {
      sHeart.addEventListener("change", (e) => {
        builderHeart = e.target.value;
        updateBuilderWhatsApp();
      });
    }
    if (sBase) {
      sBase.addEventListener("change", (e) => {
        builderBase = e.target.value;
        updateBuilderWhatsApp();
      });
    }
    if (sizeBtnsWrapper) {
      sizeBtnsWrapper.addEventListener("click", (e) => {
        const btn = e.target.closest(".builder-size-btn");
        if (btn) {
          const btns = sizeBtnsWrapper.querySelectorAll(".builder-size-btn");
          btns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          builderVolume = btn.getAttribute("data-volume");
          updateBuilderWhatsApp();
        }
      });
    }
  };

  // --- Modal Logic ---

  const selectSize = (sizeVal, btnNode) => {
    selectedSize = sizeVal;
    const buttons = mSizeOptions.querySelectorAll(".size-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
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

    mImg.src = product.image;
    mImg.alt = data.name;
    mCollection.textContent = data.collection;
    mName.textContent = data.name;
    mPrice.textContent = data.price;
    mDesc.textContent = data.desc;
    mSpecLeftVal.textContent = data.specLeftVal;
    mSpecRightVal.textContent = data.specRightVal;

    mGlow.style.setProperty("--accent-glow", product.accentGlow);
    modal.querySelector(".product-modal").style.borderColor = product.accentColor;

    if (product.category === "perfumes") {
      mSpecLeftTitle.textContent = translations[lang]["modal-top-notes-title"];
      mSpecRightTitle.textContent = translations[lang]["modal-base-notes-title"];
      mMoodWrapper.style.display = "block";
      mMoodVal.textContent = data.mood;
      mSizeWrapper.style.display = "none";
      selectedSize = null;
    } else {
      mSpecLeftTitle.textContent = translations[lang]["modal-spec-left"];
      mSpecRightTitle.textContent = translations[lang]["modal-spec-right"];
      mMoodWrapper.style.display = "none";
      mSizeWrapper.style.display = "block";
      
      selectedSize = product.sizes[0];
      mSizeOptions.innerHTML = product.sizes.map(size => {
        const activeClass = size === selectedSize ? "active" : "";
        return `<button class="size-btn ${activeClass}" data-size="${size}">${size}</button>`;
      }).join("");
    }

    updateWhatsAppLink();
  };

  const openProductModal = (id) => {
    activeProductId = id;
    populateModal(id, activeLang);
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  };

  const closeProductModal = () => {
    modal.classList.remove("active");
    activeProductId = null;
    selectedSize = null;
    if (!document.body.classList.contains("intro-active")) {
      document.body.style.overflow = "";
    }
  };

  // Bind Fragrances page Sub-filters Switcher delegates
  if (subFilterWrapper) {
    subFilterWrapper.addEventListener("click", (e) => {
      const btn = e.target.closest(".sub-btn");
      if (btn) {
        const buttons = subFilterWrapper.querySelectorAll(".sub-btn");
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        activeSubFilter = btn.getAttribute("data-sub");
        renderCatalog(activeLang);
      }
    });
  }

  // Page dynamic click event delegation for discover action buttons
  document.body.addEventListener("click", (e) => {
    if (e.target && e.target.classList.contains("product-card-btn")) {
      const id = e.target.getAttribute("data-id");
      openProductModal(id);
    }
  });

  if (mSizeOptions) {
    mSizeOptions.addEventListener("click", (e) => {
      if (e.target && e.target.classList.contains("size-btn")) {
        const sizeVal = e.target.getAttribute("data-size");
        selectSize(sizeVal, e.target);
      }
    });
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeProductModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeProductModal();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeProductModal();
    }
  });

  // Listen to Language Switch events from lang.js
  document.addEventListener("languageChanged", (e) => {
    activeLang = e.detail.lang;

    // Sync active sub-filters label translation
    if (subFilterWrapper) {
      const buttons = subFilterWrapper.querySelectorAll(".sub-btn");
      buttons.forEach(btn => {
        const key = btn.getAttribute("data-i18n");
        if (key && translations[activeLang][key]) {
          btn.textContent = translations[activeLang][key];
        }
      });
    }

    renderCatalog(activeLang);
    
    if (activeProductId && modal.classList.contains("active")) {
      populateModal(activeProductId, activeLang);
    }
  });

  // Initial render
  renderCatalog(activeLang);
});
