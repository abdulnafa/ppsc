(function (window, document) {
  "use strict";

  var STORAGE_KEY = "ppsc-prep:theme:v1";
  var DARK_MODE_QUERY = "(prefers-color-scheme: dark)";
  var LIGHT_THEME_COLOR = "#12366b";
  var DARK_THEME_COLOR = "#0d1522";
  var mediaQuery = typeof window.matchMedia === "function"
    ? window.matchMedia(DARK_MODE_QUERY)
    : null;
  var savedTheme = readSavedTheme();

  function normalizeTheme(value) {
    return value === "light" || value === "dark" ? value : null;
  }

  function readSavedTheme() {
    try {
      return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function systemTheme() {
    return mediaQuery && mediaQuery.matches ? "dark" : "light";
  }

  function resolvedTheme() {
    return savedTheme || systemTheme();
  }

  function updateControls(theme) {
    var darkMode = theme === "dark";
    var actionLabel = darkMode ? "Switch to light mode" : "Switch to dark mode";
    var visibleLabel = darkMode ? "Light mode" : "Dark mode";
    var icon = darkMode ? "\u2600" : "\u263d";

    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      button.setAttribute("aria-pressed", darkMode ? "true" : "false");
      button.setAttribute("aria-label", actionLabel);
      button.setAttribute("title", actionLabel);

      var label = button.querySelector("[data-theme-toggle-label]");
      if (label) label.textContent = visibleLabel;

      var iconElement = button.querySelector("[data-theme-toggle-icon]");
      if (iconElement) iconElement.textContent = icon;
    });
  }

  function applyTheme(theme) {
    var resolved = normalizeTheme(theme) || systemTheme();
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;

    var themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute("content", resolved === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
    }

    updateControls(resolved);
  }

  function saveAndApplyTheme(theme) {
    savedTheme = normalizeTheme(theme);
    try {
      if (savedTheme) window.localStorage.setItem(STORAGE_KEY, savedTheme);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // The selected theme still applies for this page if storage is unavailable.
    }
    applyTheme(resolvedTheme());
  }

  function toggleTheme() {
    saveAndApplyTheme(resolvedTheme() === "dark" ? "light" : "dark");
  }

  function bindControls() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (button) {
      if (button.getAttribute("data-theme-toggle-bound") === "true") return;
      button.setAttribute("data-theme-toggle-bound", "true");
      button.addEventListener("click", toggleTheme);
    });
    applyTheme(resolvedTheme());
  }

  function handleSystemThemeChange() {
    if (!savedTheme) applyTheme(systemTheme());
  }

  function handleStorageChange(event) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    savedTheme = event.key === STORAGE_KEY
      ? normalizeTheme(event.newValue)
      : readSavedTheme();
    applyTheme(resolvedTheme());
  }

  applyTheme(resolvedTheme());

  if (mediaQuery) {
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }
  window.addEventListener("storage", handleStorageChange);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControls, { once: true });
  } else {
    bindControls();
  }
})(window, document);
