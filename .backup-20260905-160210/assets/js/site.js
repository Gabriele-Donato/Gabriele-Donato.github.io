/* ==========================================================================
   site.js — drawer + floating contents button.
   Loaded on every page. No dependencies.

   The top bar is position:absolute (Balzac's behaviour): it sits on the
   banner and scrolls away. Nothing here touches the bar.
   ========================================================================== */
(function () {
  "use strict";

  var btn    = document.getElementById("menu-btn");
  var fab    = document.getElementById("toc-fab");
  var drawer = document.getElementById("drawer");
  var scrim  = document.getElementById("drawer-scrim");
  var close  = document.getElementById("drawer-close");

  if (!drawer || !scrim) return;

  var lastFocus = null;

  function openDrawer(trigger) {
    lastFocus = trigger || document.activeElement;
    scrim.hidden = false;
    void scrim.offsetWidth;              // force reflow so the fade runs
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (btn) btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    if (close) close.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (btn) btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    window.setTimeout(function () { scrim.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggleDrawer(e) {
    if (drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer(e && e.currentTarget);
  }

  if (btn) btn.addEventListener("click", toggleDrawer);
  if (fab) fab.addEventListener("click", toggleDrawer);
  scrim.addEventListener("click", closeDrawer);
  if (close) close.addEventListener("click", closeDrawer);

  // any link inside the drawer closes it (including the TOC anchors)
  drawer.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  /* ---------- reveal the floating contents button past the banner ---------- */
  if (fab) {
    var hero = document.querySelector(".hero");
    var ticking = false;

    var sync = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var past = hero
          ? hero.getBoundingClientRect().bottom <= 0
          : window.scrollY > 240;
        fab.classList.toggle("is-visible", past);
        ticking = false;
      });
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.addEventListener("load", sync);
    sync();
  }
})();
