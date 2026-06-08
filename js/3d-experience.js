/* -------------------------------------------------------------
 * 3D-EXPERIENCE.JS — Scroll-driven WebGL product showcase
 * Three.js (ES modules via import map) + GSAP ScrollTrigger
 * Model: assets/models/bottle.glb (Draco-compressed)
 * ------------------------------------------------------------- */

import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// GSAP + ScrollTrigger are loaded as classic globals (see HTML)
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const MODEL_PATH = "./assets/models/bottle.glb";
const DRACO_PATH = "https://www.gstatic.com/draco/versioned/decoders/1.5.6/";

const root = document.querySelector(".experience-3d");
const canvas = document.getElementById("three-canvas");
const loaderScreen = document.getElementById("loader-screen");
const loaderFill = document.getElementById("loader-fill");
const scrollHint = document.getElementById("scroll-hint");

const prefersReducedMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Per-perfume content (keyed by ?p= slug) ────────────────
   One page, three configs. All share the same bottle model and
   are differentiated by copy, scent notes, and accent colour. ── */
const PRODUCTS = {
  oud: {
    id: "oud-mystery-men",
    name: "سر العود",
    collection: "مجموعة الرجولة",
    shortDesc: "عود الحسين المعتق",
    desc: "عطر جريء وساحر يمزج بين العود المعتق الفاخر والبخور التقليدي. رائحة عميقة تعكس عراقة التراث المصري.",
    mood: "خشبي شرقي",
    notesTop: "العود الملكي، البخور",
    notesBase: "المسك، السرو",
    price: "٤٥٠ ج.م",
    sizes: ["50ml", "100ml"],
    accent: "#b5651d",
    orbit: ["عود", "بخور", "مسك", "سرو", "فخامة", "تراث", "رجولة", "أصالة"],
  },
  jasmine: {
    id: "jasmine-memories-women",
    name: "ذاكرة الفل",
    collection: "مجموعة النخبة",
    shortDesc: "ياسمين القاهرة الدافئ",
    desc: "يجسد هذا العطر رائحة الياسمين الليلي في شرفات بيوت القاهرة القديمة. خليط حساس من الزهور البيضاء مع قاعدة خشبية دافئة.",
    mood: "أنثوية رقيقة",
    notesTop: "الياسمين، الفل البلدي",
    notesBase: "العود، الصندل",
    price: "٣٧٥ ج.م",
    sizes: ["50ml", "100ml"],
    accent: "#9bb8e8",
    orbit: ["ياسمين", "فل", "زهور", "عود", "صندل", "رقة", "أناقة", "حنين"],
  },
  nostalgia: {
    id: "rose-elegance-women",
    name: "وردة الأناقة",
    collection: "مجموعة النخبة",
    shortDesc: "رقة الورد بأصالة القاهرة",
    desc: "عطر فاخر يجمع بين رقة ورد الفاو القديم ومسك أبيض ناعم. رائحة دافئة وحنينية تذكرك بحدائق القاهرة القديمة.",
    mood: "رومانسية دافئة",
    notesTop: "الورد الدمشقي، الفاو",
    notesBase: "المسك الأبيض، العنبر",
    price: "٣٥٠ ج.م",
    sizes: ["50ml", "100ml"],
    accent: "#d4af37",
    orbit: ["ورد", "فاو", "مسك", "عنبر", "رومانسية", "حنين", "أناقة", "فخامة"],
  },
};

const slug = new URLSearchParams(location.search).get("p");
const cfg = PRODUCTS[slug] || PRODUCTS.oud;

/* ── Populate page text from the chosen config (DOM is ready:
   this module is deferred). Runs even if WebGL is unavailable. ── */
function populateContent(c) {
  document.title = `روبابيكيا — ${c.name}`;

  document.querySelectorAll("[data-field]").forEach((el) => {
    if (c[el.dataset.field] != null) el.textContent = c[el.dataset.field];
  });

  const orbitPath = document.querySelector("#orbit-svg-group textPath");
  if (orbitPath) orbitPath.textContent = c.orbit.join(" ✦ ") + " ✦ ";

  const notes = document.getElementById("scent-notes");
  if (notes) {
    notes.innerHTML = `
      <li><span class="note-label">المقدمة</span> ${c.notesTop}</li>
      <li><span class="note-label">القاعدة</span> ${c.notesBase}</li>`;
  }

  const meta = document.getElementById("scent-meta");
  if (meta) {
    meta.innerHTML = `
      <span class="scent-meta__price">${c.price}</span>
      <span class="scent-meta__sizes">${c.sizes.join(" · ")}</span>`;
  }

  const cta = document.getElementById("cta-shop");
  if (cta) cta.href = `index.html#perfumes`;

  // Tint the cinematic accents to match the scent
  if (root) root.style.setProperty("--x-red", c.accent);
}

populateContent(cfg);

/* ── WebGL capability check ─────────────────────────────── */
function webglSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) {
    return false;
  }
}

if (!webglSupported()) {
  root.classList.add("no-webgl");
  throw new Error("WebGL not supported — falling back to static page.");
}

/* ── Renderer ───────────────────────────────────────────── */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

/* ── Scene + camera ─────────────────────────────────────── */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5.6);

/* ── Environment (soft realistic reflections) ───────────── */
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ── 3-point cinematic lighting ─────────────────────────── */
const keyLight = new THREE.DirectionalLight(0xffd699, 1.8);
keyLight.position.set(3, 4, 5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0x6688cc, 0.6);
fillLight.position.set(-3, 2, 3);
scene.add(fillLight);

const rimLight = new THREE.PointLight(0xe63946, 2.0, 10);
rimLight.position.set(0, 2, -3);
rimLight.color.set(cfg.accent); // match rim glow to the scent's accent
scene.add(rimLight);

const ambient = new THREE.AmbientLight(0x1a1410, 0.8);
scene.add(ambient);

/* ── Load the model ─────────────────────────────────────── */
// Pivot group keeps the two motion sources independent:
// scroll drives `model` (rotation + descent), mouse drives `pivot`.
const pivot = new THREE.Group();
scene.add(pivot);

let model = null;

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(DRACO_PATH);

const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader);

loader.load(
  MODEL_PATH,
  (gltf) => {
    model = gltf.scene;

    // Auto-center + auto-scale so any model fits nicely
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.1 / maxDim;

    model.scale.setScalar(scale);
    model.position.sub(center.multiplyScalar(scale));

    pivot.add(model);

    hideLoader();
    initScrollAnimations();
  },
  (xhr) => {
    if (xhr.total) {
      const percent = (xhr.loaded / xhr.total) * 100;
      loaderFill.style.width = percent + "%";
    }
  },
  (error) => {
    console.error("Failed to load model:", error);
    loaderFill.style.width = "100%";
    // Soft-fail: keep an empty scene rather than a frozen loader
    hideLoader();
  }
);

function hideLoader() {
  loaderFill.style.width = "100%";
  setTimeout(() => loaderScreen.classList.add("is-hidden"), 350);
}

/* ── Scroll-driven master timeline ──────────────────────── */
function initScrollAnimations() {
  if (!model) return;

  // Always reveal the first scene; if motion is reduced, skip scrubbing.
  if (prefersReducedMotion) {
    gsap.set("#scene-1", { opacity: 1, y: 0 });
    model.rotation.y = Math.PI * 0.15;
    return;
  }

  const progressBar = document.getElementById("progress-bar");

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.5,
      onUpdate: (self) => {
        if (progressBar) progressBar.style.width = self.progress * 100 + "%";
      },
    },
  });

  /* ── Parallax background: each layer drifts up at a different speed ── */
  tl.to(".parallax-layer--gradient", { yPercent: -40, ease: "none", duration: 1 }, 0);
  tl.to(".parallax-layer--particles", { yPercent: -50, ease: "none", duration: 1 }, 0);

  /* ── Orbiting words: spin around the model, fade out at ~55% ── */
  tl.to("#orbit-svg-group", {
    rotation: 360,
    transformOrigin: "center center",
    ease: "none",
    duration: 1,
  }, 0);
  tl.to("#orbit-svg", { opacity: 0, scale: 1.3, duration: 0.15 }, 0.55);

  /* ── Model: ONE continuous, perfectly linear turntable spin across the
       whole scroll. A single tween (no overlapping rotations) means the
       bottle turns smoothly and consistently even on fast scrolling, and it
       stays centered/fixed instead of drifting down the screen. ── */
  tl.to(model.rotation, { y: Math.PI * 2, ease: "none", duration: 1 }, 0);

  /* ── Scene text reveals (bottle stays put underneath them) ── */
  tl.fromTo("#scene-1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0);
  tl.to("#scene-1", { opacity: 0, y: -30, duration: 0.06 }, 0.18);

  tl.fromTo("#scene-2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.27);
  tl.to("#scene-2", { opacity: 0, y: -30, duration: 0.06 }, 0.42);

  tl.to(rimLight, { intensity: 4, duration: 0.2 }, 0.5);
  tl.fromTo("#scene-3", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08 }, 0.52);
  tl.to("#scene-3", { opacity: 0, y: -30, duration: 0.06 }, 0.67);

  tl.to(rimLight, { intensity: 2, duration: 0.15 }, 0.85);
  tl.fromTo("#scene-4", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.1 }, 0.78);

  /* Hide scroll hint after the user starts scrolling */
  ScrollTrigger.create({
    trigger: "#scroll-container",
    start: "top top+=40",
    onEnter: () => gsap.to(scrollHint, { opacity: 0, duration: 0.4 }),
    onLeaveBack: () => gsap.to(scrollHint, { opacity: 1, duration: 0.4 }),
  });
}

/* ── Mouse parallax ─────────────────────────────────────── */
if (!prefersReducedMotion) {
  document.addEventListener("mousemove", (e) => {
    if (!model) return;
    // Drive the pivot, not the model — leaves scroll free to own model.position.y.
    const x = (e.clientX / window.innerWidth - 0.5) * 0.3;
    const y = (e.clientY / window.innerHeight - 0.5) * 0.15;
    gsap.to(pivot.position, {
      x: x,
      y: -y,
      duration: 0.8,
      ease: "power2.out",
      overwrite: "auto",
    });
  });
}

/* ── Render loop ────────────────────────────────────────── */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

/* ── Resize ─────────────────────────────────────────────── */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ScrollTrigger.refresh();
});
