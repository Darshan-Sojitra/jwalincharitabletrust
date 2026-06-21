/* Jwalin Charitable Trust — site interactions
   Small, dependency-free, progressive-enhancement only. */
(function () {
  "use strict";

  /* ---- Mobile navigation toggle --------------------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var primaryNav = document.getElementById("primary-nav");

  if (navToggle && primaryNav) {
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  /* ---- Dropdown menus (click + keyboard) ------------------ */
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll(".has-dropdown"));

  dropdowns.forEach(function (dd) {
    var toggle = dd.querySelector(".dropdown-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      var isOpen = dd.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      // close siblings
      dropdowns.forEach(function (other) {
        if (other !== dd) {
          other.classList.remove("open");
          var t = other.querySelector(".dropdown-toggle");
          if (t) t.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  // Close dropdowns when clicking outside or pressing Escape
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-dropdown")) {
      dropdowns.forEach(function (dd) {
        dd.classList.remove("open");
        var t = dd.querySelector(".dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      dropdowns.forEach(function (dd) {
        dd.classList.remove("open");
        var t = dd.querySelector(".dropdown-toggle");
        if (t) t.setAttribute("aria-expanded", "false");
      });
      if (primaryNav && primaryNav.classList.contains("open") && navToggle) {
        primaryNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    }
  });

  /* ---- Header shadow on scroll ---------------------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Reveal on scroll & animated counters --------------- */
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.floor(eased * target);
      el.textContent = value.toLocaleString("en-IN") + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("en-IN") + suffix;
    }
    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && !prefersReduced) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        if (entry.target.hasAttribute("data-count")) animateCount(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.18 });
    reveals.forEach(function (el) { obs.observe(el); });
    counters.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
    counters.forEach(function (el) {
      var t = parseFloat(el.getAttribute("data-count")) || 0;
      el.textContent = t.toLocaleString("en-IN") + (el.getAttribute("data-suffix") || "");
    });
  }

  /* ---- Footer year ---------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Demo form handling (no backend yet) ---------------- */
  Array.prototype.slice.call(document.querySelectorAll("form[data-demo]")).forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = form.querySelector(".form-msg");
      if (msg) {
        msg.hidden = false;
        msg.focus && msg.focus();
      }
      form.reset();
    });
  });
})();
