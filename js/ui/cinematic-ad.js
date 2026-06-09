document.addEventListener("DOMContentLoaded", () => {
  const initCinematicScenes = (root = document) => {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    const scenes = scope.querySelectorAll(".cinematic-scene");

    scenes.forEach((scene) => {
      if (scene.dataset.cinematicReady === "true") return;
      scene.dataset.cinematicReady = "true";

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isGalleryScene = scene.classList.contains("cinematic-ad-scene");
      const parallaxIntensity = isGalleryScene ? 14 : 10;
      const bottleMove = isGalleryScene ? 30 : 24;
      const bottleTiltY = isGalleryScene ? 22 : 18;
      const bottleTiltX = isGalleryScene ? 16 : 13;
      const cardTiltY = isGalleryScene ? 7 : 5;
      const cardTiltX = isGalleryScene ? 6 : 4;
      const backgroundShift = isGalleryScene ? 10 : 7;

      const resetPointer = () => {
        scene.style.setProperty("--pointer-x", "0px");
        scene.style.setProperty("--pointer-y", "0px");
        scene.style.setProperty("--scene-rotate-x", "0deg");
        scene.style.setProperty("--scene-rotate-y", "0deg");
        scene.style.setProperty("--background-shift-x", "0px");
        scene.style.setProperty("--background-shift-y", "0px");
        scene.style.setProperty("--bottle-move-x", "0px");
        scene.style.setProperty("--bottle-move-y", "0px");
        scene.style.setProperty("--bottle-tilt-x", "0deg");
        scene.style.setProperty("--bottle-tilt-y", "0deg");
        scene.style.setProperty("--bottle-tilt-z", "0deg");
      };

      scene.addEventListener("pointermove", (event) => {
        if (prefersReducedMotion) return;

        const bounds = scene.getBoundingClientRect();
        const normalizedX = (event.clientX - bounds.left) / bounds.width - 0.5;
        const normalizedY = (event.clientY - bounds.top) / bounds.height - 0.5;
        const offsetX = normalizedX * parallaxIntensity;
        const offsetY = normalizedY * parallaxIntensity;

        scene.style.setProperty("--pointer-x", `${offsetX.toFixed(2)}px`);
        scene.style.setProperty("--pointer-y", `${offsetY.toFixed(2)}px`);
        scene.style.setProperty("--scene-rotate-y", `${(normalizedX * cardTiltY).toFixed(2)}deg`);
        scene.style.setProperty("--scene-rotate-x", `${(-normalizedY * cardTiltX).toFixed(2)}deg`);
        scene.style.setProperty("--background-shift-x", `${(normalizedX * backgroundShift).toFixed(2)}px`);
        scene.style.setProperty("--background-shift-y", `${(normalizedY * backgroundShift).toFixed(2)}px`);
        scene.style.setProperty("--bottle-move-x", `${(normalizedX * bottleMove).toFixed(2)}px`);
        scene.style.setProperty("--bottle-move-y", `${(normalizedY * bottleMove * 1.1).toFixed(2)}px`);
        scene.style.setProperty("--bottle-tilt-y", `${(-normalizedX * bottleTiltY).toFixed(2)}deg`);
        scene.style.setProperty("--bottle-tilt-x", `${(normalizedY * bottleTiltX).toFixed(2)}deg`);
        scene.style.setProperty("--bottle-tilt-z", `${(normalizedX * 6).toFixed(2)}deg`);
      });

      scene.addEventListener("pointerleave", resetPointer);
      scene.addEventListener("pointercancel", resetPointer);

      if (!prefersReducedMotion) {
        const baseZoom = scene.classList.contains("cinematic-ad-scene") ? 1.055 : 1.04;
        const start = performance.now() + Math.random() * 680;

        const tick = (now) => {
          if (!scene.isConnected) return;
          const time = (now - start) / 1000;
          const zoom = baseZoom + Math.sin(time * 0.38) * 0.014;
          scene.style.setProperty("--scene-zoom", zoom.toFixed(4));
          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      }
    });
  };

  window.initCinematicScenes = initCinematicScenes;

  const sceneButtons = document.querySelectorAll(".scene-selector-btn");
  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.sceneTarget;
      sceneButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      document.querySelectorAll(".hero-scene-stack .cinematic-scene").forEach((scene) => {
        scene.classList.toggle("is-active", scene.dataset.scene === target);
      });
    });
  });

  initCinematicScenes(document);
});
