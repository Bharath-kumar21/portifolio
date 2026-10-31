(function () {
  "use strict";

  var root = document.documentElement;
  var themeToggleBtn = document.getElementById("tg");
  var paletteBtn = document.getElementById("palette-btn");
  var paletteDropdown = document.getElementById("palette-dropdown");
  var swatchButtons = document.querySelectorAll(".swatch-pill[data-color]");
  var customColorInput = document.getElementById("custom-color-input");
  var copyBtn = document.getElementById("copy-email-btn");
  var toast = document.getElementById("toast");
  var nav = document.querySelector("nav");
  var navLinks = document.querySelectorAll("nav .r a");
  var sections = document.querySelectorAll("section[id], #home");

  // 1. Color Palette & Dark Mode Manager
  function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function applyPalette(paletteName) {
    if (paletteName === "default") {
      root.removeAttribute("data-palette");
    } else {
      root.setAttribute("data-palette", paletteName);
    }

    swatchButtons.forEach(function (btn) {
      if (btn.getAttribute("data-color") === paletteName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    try {
      localStorage.setItem("palette", paletteName);
    } catch (e) {}
  }

  function applyCustomColor(hex) {
    var r = parseInt(hex.substr(1, 2), 16) || 0;
    var g = parseInt(hex.substr(3, 2), 16) || 0;
    var b = parseInt(hex.substr(5, 2), 16) || 0;
    var lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    var isLight = lum > 135;

    root.style.setProperty("--custom-bg", hex);
    root.style.setProperty("--custom-fg", isLight ? "#121212" : "#f5f5f5");
    root.style.setProperty("--custom-mut", isLight ? "rgba(18, 18, 18, 0.65)" : "rgba(245, 245, 245, 0.65)");
    root.style.setProperty("--custom-line", isLight ? "rgba(18, 18, 18, 0.15)" : "rgba(245, 245, 245, 0.15)");
    root.style.setProperty("--custom-surface", isLight ? "rgba(18, 18, 18, 0.03)" : "rgba(245, 245, 245, 0.04)");

    applyPalette("custom");
    if (customColorInput) customColorInput.value = hex;

    try {
      localStorage.setItem("custom_hex", hex);
    } catch (e) {}
  }

  function setMode(mode) {
    root.setAttribute("data-theme", mode);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        "title",
        mode === "dark" ? "Switch to normal mode" : "Switch to dark mode"
      );
    }
    try {
      localStorage.setItem("th", mode);
    } catch (e) {}
  }

  // Initial State Setup
  try {
    var savedTheme = localStorage.getItem("th") || getSystemTheme();
    var savedPalette = localStorage.getItem("palette") || "default";

    if (savedPalette === "custom") {
      var customHex = localStorage.getItem("custom_hex") || "#efeee9";
      applyCustomColor(customHex);
    } else {
      applyPalette(savedPalette);
    }

    setMode(savedTheme);
  } catch (e) {
    setMode("light");
  }

  // Toggle Dark Mode / Normal Mode
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      var currentMode = root.getAttribute("data-theme") || "light";
      var nextMode = currentMode === "dark" ? "light" : "dark";

      setMode(nextMode);

      if (nextMode === "light") {
        // Return to normal mode with chosen palette
        var pal = localStorage.getItem("palette") || "default";
        if (pal === "custom") {
          var hex = localStorage.getItem("custom_hex") || "#efeee9";
          applyCustomColor(hex);
        } else {
          applyPalette(pal);
        }
      }
    });
  }

  // Palette Dropdown Toggle
  if (paletteBtn && paletteDropdown) {
    paletteBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = paletteDropdown.classList.contains("open");
      if (isOpen) {
        paletteDropdown.classList.remove("open");
        paletteDropdown.setAttribute("aria-hidden", "true");
      } else {
        paletteDropdown.classList.add("open");
        paletteDropdown.setAttribute("aria-hidden", "false");
      }
    });

    document.addEventListener("click", function (e) {
      if (!paletteDropdown.contains(e.target) && e.target !== paletteBtn) {
        paletteDropdown.classList.remove("open");
        paletteDropdown.setAttribute("aria-hidden", "true");
      }
    });
  }

  // Swatch Pill Clicks
  swatchButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var color = btn.getAttribute("data-color");
      // Selecting a color activates Normal (Light) Mode with this palette
      setMode("light");
      applyPalette(color);
      if (paletteDropdown) {
        paletteDropdown.classList.remove("open");
        paletteDropdown.setAttribute("aria-hidden", "true");
      }
    });
  });

  // Custom Color Input
  if (customColorInput) {
    customColorInput.addEventListener("input", function (e) {
      setMode("light");
      applyCustomColor(e.target.value);
    });
  }

  // 2. Navbar Scroll Style
  window.addEventListener(
    "scroll",
    function () {
      if (window.scrollY > 40) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    },
    { passive: true }
  );

  // 3. ScrollSpy / Active Link in Nav
  function updateActiveNav() {
    var scrollPosition = window.scrollY + 160;

    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute("id");

      if (scrollPosition >= top && scrollPosition < top + height) {
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + id) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  updateActiveNav();

  // 4. Copy Email to Clipboard
  if (copyBtn && toast) {
    copyBtn.addEventListener("click", function () {
      var email = "bharatkumartalagana@gmail.com";
      var originalText = copyBtn.innerText;

      function showToast() {
        copyBtn.innerText = "✓ Copied!";
        toast.classList.add("show");
        setTimeout(function () {
          toast.classList.remove("show");
          copyBtn.innerText = originalText;
        }, 2200);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(showToast).catch(function () {
          fallbackCopy(email);
        });
      } else {
        fallbackCopy(email);
      }

      function fallbackCopy(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          showToast();
        } catch (err) {}
        document.body.removeChild(textArea);
      }
    });
  }

  // 5. Inverted Negative Circle Cursor & Click Shockwave Burst
  var cursor = document.getElementById("cursor-dot");
  if (cursor) {
    var hasMoved = false;

    window.addEventListener("mousemove", function (e) {
      cursor.style.left = e.clientX + "px";
      cursor.style.top = e.clientY + "px";
      if (!hasMoved) {
        hasMoved = true;
        cursor.style.opacity = "1";
      }
    });

    document.addEventListener("mouseleave", function () {
      cursor.style.opacity = "0";
    });

    document.addEventListener("mouseenter", function () {
      if (hasMoved) cursor.style.opacity = "1";
    });

    // Hover effect on interactive elements: expand into inverted lens
    var interactiveSelectors = "a, button, input, select, textarea, .pj, .swatch-pill, .social-btn, .logo, .tg, .palette-btn";
    document.addEventListener("mouseover", function (e) {
      if (e.target && e.target.closest && e.target.closest(interactiveSelectors)) {
        cursor.classList.add("cursor-hover");
      }
    });

    document.addEventListener("mouseout", function (e) {
      if (e.target && e.target.closest && e.target.closest(interactiveSelectors)) {
        cursor.classList.remove("cursor-hover");
      }
    });

    // Click effect: punch cursor + spawn randomized Spider-Sense tingling burst
    window.addEventListener("mousedown", function (e) {
      cursor.classList.add("cursor-active");
      spawnSpiderSense(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", function () {
      cursor.classList.remove("cursor-active");
    });
  }

  // Spider-Verse Colorway Palettes for randomized tingling aura
  var spiderColorways = [
    { c1: "#ff007f", c2: "#00f0ff", hue: "0deg", sparks: ["#ff007f", "#00f0ff", "#ffffff", "#ff2a85"] }, // Classic Comic
    { c1: "#ff0033", c2: "#ffd700", hue: "320deg", sparks: ["#ff0033", "#ffd700", "#ff4500", "#ffffff"] }, // Miles Morales
    { c1: "#00e5ff", c2: "#ff0055", hue: "190deg", sparks: ["#00e5ff", "#ff0055", "#00ffff", "#ff1493"] }, // Spider-Man 2099
    { c1: "#9d00ff", c2: "#00ffcc", hue: "75deg", sparks: ["#9d00ff", "#00ffcc", "#d800ff", "#00ffff"] }, // Symbiote / Violet
    { c1: "#ff00aa", c2: "#ffea00", hue: "290deg", sparks: ["#ff00aa", "#ffea00", "#ff66cc", "#ffffff"] }  // Spider-Punk
  ];

  function spawnSpiderSense(x, y) {
    // 1. Pick random Spider-Verse colorway
    var palette = spiderColorways[Math.floor(Math.random() * spiderColorways.length)];

    // 2. Random pattern archetype (0: Directional Crown, 1: Opposite/Inverted Arc, 2: Dual 360 Omni-Warning, 3: Chromatic Double Jitter)
    var patternType = Math.floor(Math.random() * 4);

    // Random base angles & mirror flip
    var baseAngles = [0, -35, 35, -65, 65, 180, -145, 145];
    var baseRot = baseAngles[Math.floor(Math.random() * baseAngles.length)] + (Math.random() * 16 - 8);
    var flipX = Math.random() > 0.5 ? 1 : -1;
    var baseScale = 0.85 + Math.random() * 0.25; // 0.85 to 1.1 (tighter, reduced area)

    var bursts = [];

    function createBurstEl(rot, flip, sc, hueShift) {
      var el = document.createElement("div");
      el.className = "click-burst";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.setProperty("--rot", rot + "deg");
      el.style.setProperty("--flip", flip);
      el.style.setProperty("--scale", sc);
      el.style.setProperty("--hue", hueShift || palette.hue);
      el.style.setProperty("--c1", palette.c1);
      el.style.setProperty("--c2", palette.c2);
      document.body.appendChild(el);
      bursts.push(el);
      return el;
    }

    if (patternType === 0) {
      // Pattern 0: Single directional crown alert
      createBurstEl(baseRot, flipX, baseScale);
    } else if (patternType === 1) {
      // Pattern 1: Opposing wave alert
      createBurstEl(baseRot + 180, -flipX, baseScale * 0.95);
    } else if (patternType === 2) {
      // Pattern 2: Dual 360° Omnidirectional warning (two opposing arcs)
      createBurstEl(baseRot, flipX, baseScale);
      createBurstEl(baseRot + 180, -flipX, baseScale * 0.9);
    } else {
      // Pattern 3: Spider-Verse chromatic double jitter
      createBurstEl(baseRot, flipX, baseScale, palette.hue);
      setTimeout(function () {
        createBurstEl(baseRot + 30, -flipX, baseScale * 0.88, (parseFloat(palette.hue) + 60) + "deg");
      }, 40);
    }

    // 3. Spider-Sense inner pulse ring (random size between 65px and 90px)
    var ring = document.createElement("div");
    ring.className = "click-burst-ring";
    ring.style.left = x + "px";
    ring.style.top = y + "px";
    ring.style.setProperty("--ring-color", palette.c1);
    ring.style.setProperty("--ring-color2", palette.c2);
    var ringMax = (68 + Math.floor(Math.random() * 22)) + "px";
    ring.style.setProperty("--ring-max", ringMax);
    document.body.appendChild(ring);

    // 4. Radiant electric comic sparks (random count, tight distances)
    var sparkCount = 5 + Math.floor(Math.random() * 4); // 5 to 8 sparks
    for (var i = 0; i < sparkCount; i++) {
      var spark = document.createElement("span");
      spark.className = "click-spark";
      var angle = (i / sparkCount) * Math.PI * 2 + (Math.random() * 0.5 - 0.25);
      var dist = 14 + Math.random() * 22; // tight, reduced radius
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      var size = 2 + Math.random() * 3.5;

      spark.style.left = x + "px";
      spark.style.top = y + "px";
      spark.style.width = size + "px";
      spark.style.height = size + "px";
      spark.style.backgroundColor = palette.sparks[Math.floor(Math.random() * palette.sparks.length)];
      spark.style.boxShadow = "0 0 6px " + spark.style.backgroundColor;
      spark.style.setProperty("--dx", dx + "px");
      spark.style.setProperty("--dy", dy + "px");

      document.body.appendChild(spark);

      setTimeout(
        (function (s) {
          return function () {
            if (s.parentNode) s.parentNode.removeChild(s);
          };
        })(spark),
        360
      );
    }

    setTimeout(function () {
      bursts.forEach(function (b) {
        if (b.parentNode) b.parentNode.removeChild(b);
      });
      if (ring.parentNode) ring.parentNode.removeChild(ring);
    }, 450);
  }
})();

