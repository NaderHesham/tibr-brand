/* -------------------------------------------------------------
 * GALLERY.JS — Mouse-Drag Scroll Track & Custom cursor Logic
 * ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const gallery = document.getElementById("gallery-wrapper");
  const track = document.getElementById("gallery-track");
  const cursor = document.getElementById("custom-cursor");

  if (!gallery) return;

  // ==========================================
  // 1. MOUSE-DRAG / TOUCH-SWIPE SCROLL TRACK
  // ==========================================
  let isDown = false;
  let startX;
  let scrollLeft;
  let dragged = false;

  gallery.addEventListener("mousedown", (e) => {
    isDown = true;
    dragged = false;
    gallery.classList.add("active");
    startX = e.pageX - gallery.offsetLeft;
    scrollLeft = gallery.scrollLeft;
    
    // Rotate custom cursor slightly when dragging to simulate pouring/active state
    if (cursor) {
      gsap.to(cursor, { rotate: -15, scale: 1.15, duration: 0.2 });
    }
  });

  gallery.addEventListener("mouseleave", () => {
    isDown = false;
    gallery.classList.remove("active");
    
    // Restore cursor state
    if (cursor) {
      gsap.to(cursor, { scale: 0, duration: 0.3 });
    }
  });

  gallery.addEventListener("mouseup", () => {
    isDown = false;
    gallery.classList.remove("active");
    
    // Restore cursor scale & rotation
    if (cursor) {
      gsap.to(cursor, { rotate: 0, scale: 1, duration: 0.2 });
    }
  });

  gallery.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    
    // Calculate distance dragged
    const x = e.pageX - gallery.offsetLeft;
    const walk = (x - startX) * 2; // scroll speed multiplier
    if (Math.abs(x - startX) > 6) dragged = true;
    gallery.scrollLeft = scrollLeft - walk;
  });

  // ==========================================
  // 1b. CLICK A PERFUME CARD → ITS 3D PAGE
  // ==========================================
  track?.querySelectorAll(".gallery-item[data-perfume]").forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      if (dragged) return; // ignore clicks that were really drags
      window.location.href = `3d-product.html?p=${item.dataset.perfume}`;
    });
  });

  // ==========================================
  // 2. CUSTOM BOTTLE CURSOR ENGAGEMENT
  // ==========================================
  document.addEventListener("mousemove", (e) => {
    if (!cursor) return;
    
    // Custom cursor positioning
    gsap.to(cursor, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.1, // micro lag for natural feel
      ease: "power2.out"
    });
  });

  // Scale in cursor when mouse enters the gallery area
  gallery.addEventListener("mouseenter", () => {
    if (cursor) {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  });
});
