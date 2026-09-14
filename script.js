(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dotsEl = document.getElementById("dots");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const timerFill = document.getElementById("timerbarFill");
  const clockTime = document.getElementById("clockTime");
  const clockToggle = document.getElementById("clockToggle");

  let current = 0;
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
    // presentation progress based on slide index (rough guide only)
    const pct = (current / (total - 1)) * 100;
    timerFill.style.width = pct + "%";
  }

  function goTo(i) {
    current = Math.max(0, Math.min(total - 1, i));
    render();
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
