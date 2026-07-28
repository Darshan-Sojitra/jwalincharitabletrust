/* Jwalin Charitable Trust — site interactions
   Small, dependency-free, progressive-enhancement only. */
(function () {
  "use strict";

  /* ---- Page loader ---------------------------------------- */
  var pageLoader = document.createElement("div");
  pageLoader.className = "page-loader";
  pageLoader.setAttribute("role", "status");
  pageLoader.setAttribute("aria-live", "polite");
  pageLoader.innerHTML = '<div class="loader-mark" aria-hidden="true"></div><span>Loading</span>';
  document.body.classList.add("is-loading");
  document.body.appendChild(pageLoader);

  function finishLoading() {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-loaded");
    window.setTimeout(function () {
      if (pageLoader && pageLoader.parentNode) pageLoader.parentNode.removeChild(pageLoader);
    }, 450);
  }

  if (document.readyState === "complete") {
    window.setTimeout(finishLoading, 350);
  } else {
    window.addEventListener("load", function () {
      window.setTimeout(finishLoading, 350);
    });
  }
  window.setTimeout(finishLoading, 1800);

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

  /* ---- Calm long reading sections ------------------------- */
  Array.prototype.slice.call(document.querySelectorAll(".prose")).forEach(function (prose, index) {
    var paragraphs = Array.prototype.slice.call(prose.querySelectorAll(":scope > p"));
    if (paragraphs.length < 5 || prose.classList.contains("no-collapse")) return;

    var id = "prose-more-" + index;
    var extra = document.createElement("div");
    extra.className = "prose-extra";
    extra.id = id;

    paragraphs.slice(3).forEach(function (p) {
      extra.appendChild(p);
    });

    var button = document.createElement("button");
    button.className = "text-toggle";
    button.type = "button";
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", id);
    button.textContent = "Read more";

    button.addEventListener("click", function () {
      var open = prose.classList.toggle("expanded");
      button.setAttribute("aria-expanded", open ? "true" : "false");
      button.textContent = open ? "Show less" : "Read more";
    });

    prose.appendChild(extra);
    prose.appendChild(button);
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

  Array.prototype.slice.call(document.querySelectorAll(
    "main > section:not(.hero-carousel), .section-head, .card, .feature, .stat, .split-media, .form-card"
  )).forEach(function (el) {
    if (!el.classList.contains("reveal")) el.classList.add("reveal");
  });

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  reveals.forEach(function (el, i) {
    el.style.setProperty("--reveal-delay", Math.min(i % 8, 5) * 70 + "ms");
  });

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

  /* ---- Hero carousel -------------------------------------- */
  var carousel = document.querySelector(".hero-carousel");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dotsWrap = carousel.querySelector(".hero-dots");
    var prevBtn = carousel.querySelector(".hero-arrow.prev");
    var nextBtn = carousel.querySelector(".hero-arrow.next");
    var current = 0;
    var timer = null;
    var DELAY = 6000;
    var swipeStartX = 0;
    var swipeStartY = 0;
    var swipeActive = false;
    var swipePointerId = null;
    var SWIPE_THRESHOLD = 45;

    var dots = slides.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show slide " + (i + 1));
      b.addEventListener("click", function () { go(i); restart(); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    function go(i) {
      slides[current].classList.remove("active");
      if (dots[current]) dots[current].classList.remove("active");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("active");
      if (dots[current]) dots[current].classList.add("active");
    }
    function next() { go(current + 1); }
    function prev() { go(current - 1); }
    function start() { if (!prefersReduced && slides.length > 1 && !timer) timer = setInterval(next, DELAY); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    if (dots[0]) dots[0].classList.add("active");
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restart(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restart(); });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    carousel.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" || slides.length < 2) return;
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
      swipeActive = true;
      swipePointerId = e.pointerId;
      stop();
    }, { passive: true });

    carousel.addEventListener("pointerup", function (e) {
      if (!swipeActive || e.pointerId !== swipePointerId) return;
      var deltaX = e.clientX - swipeStartX;
      var deltaY = e.clientY - swipeStartY;
      swipeActive = false;
      swipePointerId = null;

      if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        if (deltaX < 0) next();
        else prev();
      }
      restart();
    }, { passive: true });

    carousel.addEventListener("pointercancel", function (e) {
      if (!swipeActive || e.pointerId !== swipePointerId) return;
      swipeActive = false;
      swipePointerId = null;
      restart();
    }, { passive: true });

    start();
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
