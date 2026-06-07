/* -------------------------------------------------------------
 * INTRO.JS — Cinematic Entrance: Ornament Draw, Curtain Lift, Iris Exit
 * ------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const body = document.body;
  const curtain = document.getElementById("intro-curtain");
  const skipBtn = document.getElementById("skip-btn");

  if (!curtain) return;

  const bgGlow        = curtain.querySelector(".intro-bg-glow");
  const ornTop        = curtain.querySelector(".intro-ornament-top");
  const ornBottom     = curtain.querySelector(".intro-ornament-bottom");
  const pathsLeft     = curtain.querySelectorAll(".orn-path-left");
  const pathsRight    = curtain.querySelectorAll(".orn-path-right");
  const diamonds      = curtain.querySelectorAll(".orn-diamond");
  const logoAr        = curtain.querySelector(".intro-logo-ar");
  const logoEn        = curtain.querySelector(".intro-logo-en");
  const tagline       = curtain.querySelector(".intro-tagline");

  body.classList.add("intro-active");

  // ─── Sand Particles ────────────────────────────────────────────
  let sandInterval;

  const createSandParticle = () => {
    const particle = document.createElement("div");
    const size = Math.random() * 2 + 0.8;
    const startX = Math.random() * window.innerWidth;
    const colors = ['#C9A84C', '#EDE0C8', '#8B7355', '#D4AF37'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position:absolute; bottom:-10px; left:${startX}px;
      width:${size}px; height:${size}px; background:${color};
      border-radius:50%; pointer-events:none; z-index:2;
      opacity:${(Math.random() * 0.45 + 0.25).toFixed(2)};
    `;
    curtain.appendChild(particle);

    gsap.to(particle, {
      y: -(window.innerHeight + 60),
      x: `+=${(Math.random() - 0.5) * 180}`,
      duration: Math.random() * 2 + 1.6,
      ease: "power1.out",
      onComplete: () => particle.remove()
    });
  };

  const startSand = () => {
    sandInterval = setInterval(() => {
      for (let i = 0; i < 6; i++) createSandParticle();
    }, 65);
  };

  const stopSand = () => clearInterval(sandInterval);

  // Mouse-reactive sand displacement
  curtain.addEventListener("mousemove", (e) => {
    for (let i = 0; i < 3; i++) {
      const p = document.createElement("div");
      const size = Math.random() * 2.5 + 1;
      const colors = ['#C9A84C', '#EDE0C8', '#D4AF37'];
      p.style.cssText = `
        position:absolute;
        top:${e.clientY + (Math.random() * 40 - 20)}px;
        left:${e.clientX + (Math.random() * 40 - 20)}px;
        width:${size}px; height:${size}px;
        background:${colors[Math.floor(Math.random() * colors.length)]};
        border-radius:50%; pointer-events:none; z-index:2;
        opacity:${(Math.random() * 0.65 + 0.25).toFixed(2)};
      `;
      curtain.appendChild(p);
      gsap.to(p, {
        y: `+=${Math.random() * 140 + 40}`,
        x: `+=${(Math.random() - 0.5) * 80}`,
        opacity: 0,
        duration: Math.random() + 0.5,
        ease: "power2.out",
        onComplete: () => p.remove()
      });
    }
  });

  // ─── Reveal Function ────────────────────────────────────────────
  function revealPage() {
    stopSand();

    const exitTl = gsap.timeline({
      onComplete: () => {
        body.classList.remove("intro-active");
        curtain.style.display = "none";
        document.dispatchEvent(new CustomEvent("introFinished"));
      }
    });

    // Text elements fade and lift out
    exitTl.to([logoAr, logoEn, tagline, ornTop, ornBottom], {
      opacity: 0,
      y: -18,
      duration: 0.65,
      stagger: 0.05,
      ease: "power2.in"
    });

    exitTl.to(skipBtn, { opacity: 0, duration: 0.3 }, 0);

    // Iris wipe: the dark curtain shrinks to a vanishing point
    exitTl.to(curtain, {
      clipPath: "circle(0% at 50% 50%)",
      duration: 1.05,
      ease: "power2.in"
    }, 0.35);
  }

  // ─── Master Timeline ────────────────────────────────────────────
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Establish starting states
  gsap.set(curtain, { clipPath: "circle(150% at 50% 50%)" });
  gsap.set(bgGlow, { opacity: 0 });
  gsap.set([ornTop, ornBottom], { opacity: 1 });
  gsap.set(logoAr, { y: "110%" });
  gsap.set(logoEn, { opacity: 0, letterSpacing: "24px" });
  gsap.set(tagline, { opacity: 0, filter: "blur(14px)" });
  gsap.set(skipBtn, { opacity: 0 });

  // 0.3s → Atmospheric glow blooms
  tl.to(bgGlow, { opacity: 1, duration: 2.0, ease: "power1.inOut" }, 0.3);

  // 0.6s → Top ornament draws from center outward
  tl.to([pathsLeft[0], pathsRight[0]], {
    strokeDashoffset: 0,
    duration: 0.85,
    stagger: 0.07,
    ease: "power2.inOut"
  }, 0.6);

  // 1.1s → Top diamond materialises
  tl.to(diamonds[0], { opacity: 1, duration: 0.25 }, 1.1);

  // 1.2s → Arabic logo rises: the curtain lift
  tl.to(logoAr, {
    y: "0%",
    duration: 1.05,
    ease: "power3.out"
  }, 1.2);

  // 1.9s → Bottom ornament draws in (mirrored timing)
  tl.to([pathsLeft[1], pathsRight[1]], {
    strokeDashoffset: 0,
    duration: 0.85,
    stagger: 0.07,
    ease: "power2.inOut"
  }, 1.9);

  tl.to(diamonds[1], { opacity: 1, duration: 0.25 }, 2.35);

  // 2.1s → English text contracts from wide tracking
  tl.to(logoEn, {
    opacity: 1,
    letterSpacing: "8px",
    duration: 1.05,
    ease: "power2.out"
  }, 2.1);

  // 3.0s → Tagline resolves through blur
  tl.to(tagline, {
    opacity: 1,
    filter: "blur(0px)",
    duration: 1.5,
    ease: "power2.out"
  }, 3.0);

  // 3.2s → Skip button and sand appear
  tl.to(skipBtn, { opacity: 1, duration: 0.9 }, 3.2);
  tl.add(startSand, 3.4);

  // 5.8s → Auto-reveal
  tl.add(revealPage, 5.8);

  skipBtn.addEventListener("click", () => {
    tl.kill();
    revealPage();
  });
});
