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

  // 5. Fiery Mouse Click Cursor & Sparks
  var fireTimer = null;
  function triggerFireCursor(e) {
    if (fireTimer) clearTimeout(fireTimer);
    document.documentElement.classList.add("fire-active");
    document.body.classList.add("fire-active");
    if (e && typeof e.clientX === "number") {
      createFireSpark(e.clientX, e.clientY);
    }
  }

  function releaseFireCursor() {
    if (fireTimer) clearTimeout(fireTimer);
    fireTimer = setTimeout(function () {
      document.documentElement.classList.remove("fire-active");
      document.body.classList.remove("fire-active");
    }, 320);
  }

  window.addEventListener("mousedown", triggerFireCursor);
  window.addEventListener("mouseup", releaseFireCursor);
  window.addEventListener("blur", function () {
    if (fireTimer) clearTimeout(fireTimer);
    document.documentElement.classList.remove("fire-active");
    document.body.classList.remove("fire-active");
  });

  function createFireSpark(x, y) {
    var colors = ["#ff4500", "#ff8c00", "#ffd700", "#ff2200", "#ffaa00"];
    for (var i = 0; i < 6; i++) {
      var spark = document.createElement("span");
      spark.className = "fire-spark";
      var angle = Math.random() * Math.PI * 2;
      var dist = 14 + Math.random() * 20;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist - 6;
      var size = 3 + Math.random() * 4;

      spark.style.left = x + "px";
      spark.style.top = y + "px";
      spark.style.width = size + "px";
      spark.style.height = size + "px";
      spark.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      spark.style.setProperty("--dx", dx + "px");
      spark.style.setProperty("--dy", dy + "px");

      document.body.appendChild(spark);

      setTimeout(
        (function (el) {
          return function () {
            if (el.parentNode) el.parentNode.removeChild(el);
          };
        })(spark),
        420
      );
    }
  }
})();

