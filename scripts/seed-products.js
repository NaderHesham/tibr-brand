const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sampleProducts = [
  // PERFUMES - WOMEN
  {
    id: "rose-elegance-women",
    category: "perfumes",
    sub_category: "original",
    gender: "women",
    sizes: ["50ml", "100ml"],
    image: "assets/images/product_nostalgia.png",
    accent_glow: "rgba(212, 175, 55, 0.15)",
    accent_color: "#d4af37",
    ar_name: "وردة الأناقة",
    ar_collection: "مجموعة النخبة",
    ar_short_desc: "رقة الورد بأصالة القاهرة",
    ar_desc: "عطر فاخر يجمع بين رقة ورد الفاو القديم ومسك أبيض ناعم. رائحة دافئة وحنينية تذكرك بحدائق القاهرة القديمة.",
    ar_spec_left: "الورد الدمشقي، الفاو",
    ar_spec_right: "المسك الأبيض، العنبر",
    ar_price: "٣٥٠ ج.م",
    ar_mood: "رومانسية دافئة",
    en_name: "Rose Elegance",
    en_collection: "Elite Collection",
    en_short_desc: "Delicate rose with Cairo authenticity",
    en_desc: "A luxurious fragrance combining the delicacy of old rose with soft white musk. A warm and nostalgic aroma reminiscent of Cairo's ancient gardens.",
    en_spec_left: "Damask Rose, Fao",
    en_spec_right: "White Musk, Amber",
    en_price: "350 EGP",
    en_mood: "Warm Romance"
  },
  {
    id: "jasmine-memories-women",
    category: "perfumes",
    sub_category: "original",
    gender: "women",
    sizes: ["50ml", "100ml"],
    image: "assets/images/product_jasmine.png",
    accent_glow: "rgba(200, 220, 255, 0.15)",
    accent_color: "#c8dcff",
    ar_name: "ذاكرة الفل",
    ar_collection: "مجموعة النخبة",
    ar_short_desc: "ياسمين القاهرة الدافئ",
    ar_desc: "يجسد هذا العطر رائحة الياسمين الليلي في شرفات بيوت القاهرة القديمة. خليط حساس من الزهور البيضاء مع قاعدة خشبية دافئة.",
    ar_spec_left: "الياسمين، الفل البلدي",
    ar_spec_right: "العود، الصندل",
    ar_price: "٣٧٥ ج.م",
    ar_mood: "أنثوية رقيقة",
    en_name: "Jasmine Memories",
    en_collection: "Heritage Line",
    en_short_desc: "Warm jasmine of Cairo nights",
    en_desc: "This fragrance embodies the scent of night jasmine on the balconies of old Cairo homes. A delicate blend of white flowers with a warm wooden base.",
    en_spec_left: "Jasmine, Local Sambac",
    en_spec_right: "Oud, Sandalwood",
    en_price: "375 EGP",
    en_mood: "Delicate Femininity"
  },

  // PERFUMES - MEN
  {
    id: "oud-mystery-men",
    category: "perfumes",
    sub_category: "original",
    gender: "men",
    sizes: ["50ml", "100ml"],
    image: "assets/images/product_oud.png",
    accent_glow: "rgba(139, 69, 19, 0.15)",
    accent_color: "#8b4513",
    ar_name: "سر العود",
    ar_collection: "مجموعة الرجولة",
    ar_short_desc: "عود الحسين المعتق",
    ar_desc: "عطر جريء وساحر يمزج بين العود المعتق الفاخر والبخور التقليدي. رائحة عميقة تعكس عراقة التراث المصري.",
    ar_spec_left: "العود الملكي، البخور",
    ar_spec_right: "المسك، السرو",
    ar_price: "٤٥٠ ج.م",
    ar_mood: "خشبي شرقي",
    en_name: "Oud Mystery",
    en_collection: "Masculinity Collection",
    en_short_desc: "Aged El Hussein oud",
    en_desc: "A bold and enchanting fragrance blending premium aged oud with traditional incense. A deep aroma reflecting the authenticity of Egyptian heritage.",
    en_spec_left: "Royal Oud, Incense",
    en_spec_right: "Musk, Cypress",
    en_price: "450 EGP",
    en_mood: "Oriental Woody"
  },
  {
    id: "spice-legend-men",
    category: "perfumes",
    sub_category: "inspired",
    gender: "men",
    sizes: ["50ml", "100ml"],
    image: "assets/images/product_oud.png",
    accent_glow: "rgba(255, 140, 0, 0.15)",
    accent_color: "#ff8c00",
    ar_name: "أسطورة التوابل",
    ar_collection: "مجموعة الرجولة",
    ar_short_desc: "توابل الأسواق القديمة",
    ar_desc: "عطر مستوحى من رائحة أسواق خان الخليلي. يجمع بين العطرية الحارة والرائحة الدافئة المريحة.",
    ar_spec_left: "القرفة، الزنجبيل",
    ar_spec_right: "الجلد، الفانيليا",
    ar_price: "٣٠٠ ج.م",
    ar_mood: "حار منعش",
    en_name: "Spice Legend",
    en_collection: "Marketplace Line",
    en_short_desc: "Spices of ancient bazaars",
    en_desc: "A fragrance inspired by the aromas of Khan El-Khalili markets. Combines spicy freshness with comforting warm notes.",
    en_spec_left: "Cinnamon, Ginger",
    en_spec_right: "Leather, Vanilla",
    en_price: "300 EGP",
    en_mood: "Spicy Fresh"
  },

  // CLOTHES - WOMEN
  {
    id: "linen-abaya-women",
    category: "clothes",
    sub_category: "classic",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "assets/images/hero_bg.png",
    accent_glow: "rgba(169, 169, 169, 0.15)",
    accent_color: "#a9a9a9",
    ar_name: "عباية الكتان الفاخرة",
    ar_collection: "مجموعة الكلاسيكيات",
    ar_short_desc: "أناقة كلاسيكية معاصرة",
    ar_desc: "عباية مصنوعة من كتان فاخر 100% مع تطريز يدوي دقيق. تجمع بين التقليد والحداثة بأسلوب انعكاسي.",
    ar_spec_left: "كتان 100% مصري",
    ar_spec_right: "تطريز يدوي فني",
    ar_price: "٨٥٠ ج.م",
    ar_mood: "أنثوية كلاسيكية",
    en_name: "Linen Abaya",
    en_collection: "Classics Collection",
    en_short_desc: "Contemporary classic elegance",
    en_desc: "An abaya crafted from 100% premium linen with delicate hand embroidery. Merges tradition and modernity in a reflective style.",
    en_spec_left: "100% Egyptian Linen",
    en_spec_right: "Fine Hand Embroidery",
    en_price: "850 EGP",
    en_mood: "Classic Femininity"
  },
  {
    id: "silk-dress-women",
    category: "clothes",
    sub_category: "contemporary",
    gender: "women",
    sizes: ["XS", "S", "M", "L", "XL"],
    image: "assets/images/story_bg.png",
    accent_glow: "rgba(219, 112, 147, 0.15)",
    accent_color: "#db7093",
    ar_name: "فستان الحرير الأنثوي",
    ar_collection: "مجموعة العصرية",
    ar_short_desc: "أناقة عصرية بروح تراثية",
    ar_desc: "فستان مصنوع من حرير ناعم مع قصة عصرية وتفاصيل تراثية. ملائم لجميع المناسبات الراقية.",
    ar_spec_left: "حرير طبيعي ناعم",
    ar_spec_right: "قصة معاصرة أنيقة",
    ar_price: "١٢٠٠ ج.م",
    ar_mood: "فخامة معاصرة",
    en_name: "Silk Dress",
    en_collection: "Contemporary Line",
    en_short_desc: "Modern elegance with heritage touch",
    en_desc: "A dress made from soft silk with contemporary cut and heritage details. Perfect for all upscale occasions.",
    en_spec_left: "Soft Natural Silk",
    en_spec_right: "Elegant Contemporary Cut",
    en_price: "1200 EGP",
    en_mood: "Modern Luxury"
  },

  // CLOTHES - MEN
  {
    id: "linen-shirt-men",
    category: "clothes",
    sub_category: "classic",
    gender: "men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/hero_bg.png",
    accent_glow: "rgba(135, 206, 235, 0.15)",
    accent_color: "#87ceeb",
    ar_name: "قميص الكتان الكلاسيكي",
    ar_collection: "مجموعة الرجولة",
    ar_short_desc: "كلاسيكية مصرية أصلية",
    ar_desc: "قميص كتان 100% مصري برقة عالية وتهوية طبيعية. ملائم للطقس الحار مع أناقة لا تخطئها العين.",
    ar_spec_left: "كتان 100% مصري",
    ar_spec_right: "خياطة يدوية دقيقة",
    ar_price: "٦٥٠ ج.م",
    ar_mood: "كلاسيكي أنيق",
    en_name: "Linen Shirt",
    en_collection: "Men's Classics",
    en_short_desc: "Authentic Egyptian classic",
    en_desc: "A 100% Egyptian linen shirt with excellent fineness and natural ventilation. Perfect for hot weather with undeniable elegance.",
    en_spec_left: "100% Egyptian Linen",
    en_spec_right: "Precise Hand Stitching",
    en_price: "650 EGP",
    en_mood: "Classic Elegance"
  },
  {
    id: "cotton-vest-men",
    category: "clothes",
    sub_category: "contemporary",
    gender: "men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "assets/images/story_bg.png",
    accent_glow: "rgba(105, 105, 105, 0.15)",
    accent_color: "#696969",
    ar_name: "جيليه القطن المعاصر",
    ar_collection: "مجموعة العصرية",
    ar_short_desc: "حداثة بلمسة تراثية",
    ar_desc: "جيليه قطن عالي الجودة بقطع عصرية وتفاصيل تراثية. مثالي للعمل والمناسبات الرسمية.",
    ar_spec_left: "قطن عالي الجودة",
    ar_spec_right: "قصة عصرية دقيقة",
    ar_price: "٧٥٠ ج.م",
    ar_mood: "عصري احترافي",
    en_name: "Cotton Vest",
    en_collection: "Men's Contemporary",
    en_short_desc: "Modernity with heritage touch",
    en_desc: "A high-quality cotton vest with contemporary cuts and heritage details. Perfect for work and formal occasions.",
    en_spec_left: "Premium Quality Cotton",
    en_spec_right: "Precise Modern Cut",
    en_price: "750 EGP",
    en_mood: "Professional Modern"
  },

  // SHOES - WOMEN
  {
    id: "leather-heels-women",
    category: "shoes",
    sub_category: null,
    gender: "women",
    sizes: ["35", "36", "37", "38", "39", "40"],
    image: "assets/images/hero_bg.png",
    accent_glow: "rgba(160, 82, 45, 0.15)",
    accent_color: "#a0522d",
    ar_name: "كعب جلدي فاخر",
    ar_collection: "مجموعة الأحذية",
    ar_short_desc: "أناقة بكل خطوة",
    ar_desc: "حذاء بكعب عالي مصنوع من جلد طبيعي فاخر. تصميم كلاسيكي مع لمسات معاصرة.",
    ar_spec_left: "جلد طبيعي 100%",
    ar_spec_right: "كعب عالي مريح",
    ar_price: "١٥٠٠ ج.م",
    ar_mood: "أنثوية فخمة",
    en_name: "Leather Heels",
    en_collection: "Footwear Collection",
    en_short_desc: "Elegance with every step",
    en_desc: "A high-heeled shoe made from premium natural leather. Classic design with contemporary touches.",
    en_spec_left: "100% Natural Leather",
    en_spec_right: "Comfortable High Heel",
    en_price: "1500 EGP",
    en_mood: "Luxurious Femininity"
  },
  {
    id: "leather-flats-women",
    category: "shoes",
    sub_category: null,
    gender: "women",
    sizes: ["35", "36", "37", "38", "39", "40"],
    image: "assets/images/story_bg.png",
    accent_glow: "rgba(211, 211, 211, 0.15)",
    accent_color: "#d3d3d3",
    ar_name: "باليه جلدي راقي",
    ar_collection: "مجموعة الأحذية",
    ar_short_desc: "راحة وأناقة معاً",
    ar_desc: "حذاء بدون كعب من الجلد الإيطالي الناعم. مريح للاستخدام اليومي مع أناقة لا تنتهي.",
    ar_spec_left: "جلد إيطالي ناعم",
    ar_spec_right: "راحة عالية اليوم",
    ar_price: "١٢٠٠ ج.م",
    ar_mood: "كلاسيكي مريح",
    en_name: "Leather Flats",
    en_collection: "Casual Elegance",
    en_short_desc: "Comfort and style together",
    en_desc: "A flat shoe from soft Italian leather. Comfortable for daily use with endless elegance.",
    en_spec_left: "Soft Italian Leather",
    en_spec_right: "All-Day Comfort",
    en_price: "1200 EGP",
    en_mood: "Classic Comfort"
  },

  // SHOES - MEN
  {
    id: "leather-loafers-men",
    category: "shoes",
    sub_category: null,
    gender: "men",
    sizes: ["40", "41", "42", "43", "44", "45"],
    image: "assets/images/hero_bg.png",
    accent_glow: "rgba(101, 67, 33, 0.15)",
    accent_color: "#654321",
    ar_name: "لوفر جلدي كلاسيكي",
    ar_collection: "مجموعة الأحذية",
    ar_short_desc: "رجولة بكل خطوة",
    ar_desc: "حذاء لوفر من جلد طبيعي فاخر. تصميم كلاسيكي يناسب المناسبات الرسمية والعملية.",
    ar_spec_left: "جلد طبيعي 100%",
    ar_spec_right: "تصميم كلاسيكي",
    ar_price: "١٤٠٠ ج.م",
    ar_mood: "رجولة فخمة",
    en_name: "Leather Loafers",
    en_collection: "Men's Footwear",
    en_short_desc: "Masculinity with every step",
    en_desc: "A loafer shoe from premium natural leather. Classic design suitable for formal and professional occasions.",
    en_spec_left: "100% Natural Leather",
    en_spec_right: "Classic Design",
    en_price: "1400 EGP",
    en_mood: "Luxurious Masculinity"
  },
  {
    id: "leather-oxfords-men",
    category: "shoes",
    sub_category: null,
    gender: "men",
    sizes: ["40", "41", "42", "43", "44", "45"],
    image: "assets/images/story_bg.png",
    accent_glow: "rgba(47, 79, 79, 0.15)",
    accent_color: "#2f4f4f",
    ar_name: "أكسفورد جلدي فاخر",
    ar_collection: "مجموعة الأحذية",
    ar_short_desc: "أناقة الأعمال والمناسبات",
    ar_desc: "حذاء أكسفورد من الجلد البريطاني الفاخر. للحفلات الرسمية والمناسبات الراقية.",
    ar_spec_left: "جلد بريطاني فخم",
    ar_spec_right: "خياطة دقيقة جداً",
    ar_price: "١٦٠٠ ج.م",
    ar_mood: "فخامة رسمية",
    en_name: "Leather Oxfords",
    en_collection: "Formal Elegance",
    en_short_desc: "Business and occasion elegance",
    en_desc: "An Oxford shoe from premium British leather. Perfect for formal events and upscale occasions.",
    en_spec_left: "Premium British Leather",
    en_spec_right: "Precise Stitching",
    en_price: "1600 EGP",
    en_mood: "Formal Luxury"
  }
];

async function seedProducts() {
  try {
    console.log(`Starting to seed ${sampleProducts.length} products...`);

    for (const product of sampleProducts) {
      const { data, error } = await supabase
        .from("products")
        .insert([product])
        .select();

      if (error) {
        console.error(`Error inserting product ${product.id}:`, error.message);
      } else {
        console.log(`✓ Added product: ${product.ar_name}`);
      }
    }

    console.log("\n✅ Seeding completed!");
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    process.exit(1);
  }
}

seedProducts();
