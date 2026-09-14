(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsEl = document.getElementById("dots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const timerFill = document.getElementById("timerbarFill");
  const clockTime = document.getElementById("clockTime");
  const clockToggle = document.getElementById("clockToggle");
  const wipe = document.getElementById("wipe");

  let current = 0;
  let animating = false;
  const total = slides.length;

  // Build progress dots
  slides.forEach((slide, i) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    const presenter = slide.dataset.presenter;
    if (presenter && presenter !== "0") dot.classList.add("d-p" + presenter);
    dot.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(dot);
  });
  const dots = Array.from(dotsEl.children);

  function render() {
    slides.forEach((s, i) => {
      s.classList.toggle("active", i === current);
      s.classList.toggle("prev", i < current);
    });
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    const pct = (current / (total - 1)) * 100;
    timerFill.style.width = pct + "%";
    runSlideEffects(slides[current]);
  }

  // Quick film-cut wipe masks the actual slide swap for a punchier transition.
  function goTo(i) {
    const target = Math.max(0, Math.min(total - 1, i));
    if (target === current || animating) return;
    animating = true;
    current = target;
    wipe.classList.remove("play");
    void wipe.offsetWidth; // restart animation
    wipe.classList.add("play");
    setTimeout(render, 230);
    setTimeout(() => {
      wipe.classList.remove("play");
      animating = false;
    }, 500);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key.toLowerCase() === "n") {
      document.body.classList.toggle("show-notes");
    } else if (e.key.toLowerCase() === "f") {
      toggleFullscreen();
    } else if (e.key === "Home") {
      goTo(0);
    } else if (e.key === "End") {
      goTo(total - 1);
    }
  });

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }

  // ---- per-slide kinetic effects (typewriter quotes + counting stats) ----
  function typewriter(el) {
    if (!el.dataset.full) el.dataset.full = el.textContent.trim();
    const full = el.dataset.full;
    if (el._timer) clearInterval(el._timer);
    el.textContent = "";
    el.classList.add("typing");
    const cite = el.closest(".quote") && el.closest(".quote").querySelector("cite");
    if (cite) cite.classList.remove("shown");
    let i = 0;
    el._timer = setInterval(() => {
      i++;
      el.textContent = full.slice(0, i);
      if (i >= full.length) {
        clearInterval(el._timer);
        el.classList.remove("typing");
        if (cite) cite.classList.add("shown");
      }
    }, 12);
  }

  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10) || 0;
    const duration = 1400;
    const start = performance.now();
    const token = Symbol();
    el._token = token;
    function tick(now) {
      if (el._token !== token) return;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target).toLocaleString("de-DE");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function runSlideEffects(slide) {
    if (!slide) return;
    slide.querySelectorAll(".qtext").forEach(typewriter);
    slide.querySelectorAll("[data-counter]").forEach(animateCounter);
  }

  // ---- Stopwatch (helps pace the 10-minute talk) ----
  let elapsed = 0;
  let running = false;
  let intervalId = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  function tick() {
    elapsed += 1;
    clockTime.textContent = formatTime(elapsed);
    if (elapsed >= 600) {
      clockTime.style.color = "var(--p2)";
    } else if (elapsed >= 480) {
      clockTime.style.color = "var(--p3)";
    }
  }

  clockToggle.addEventListener("click", () => {
    running = !running;
    clockToggle.textContent = running ? "❚❚" : "▶";
    if (running) {
      intervalId = setInterval(tick, 1000);
    } else {
      clearInterval(intervalId);
    }
  });

  render();
})();
