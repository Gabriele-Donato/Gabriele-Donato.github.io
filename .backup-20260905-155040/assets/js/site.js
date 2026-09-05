/* ==========================================================================
   site.js — top bar + drawer.
   Loaded on every page. No dependencies.
   ========================================================================== */
(function () {
  "use strict";

  var topbar = document.getElementById("topbar");
  var btn    = document.getElementById("menu-btn");
  var drawer = document.getElementById("drawer");
  var scrim  = document.getElementById("drawer-scrim");
  var close  = document.getElementById("drawer-close");

  /* ---------- transparent bar over the hero, solid once scrolled ----------
     Measured from the hero's live position rather than a scrollY threshold,
     so it stays correct after resize, rotation and late image load.        */
  if (topbar && topbar.classList.contains("topbar--overlay")) {
    var hero = document.querySelector(".hero");
    var ticking = false;

    var sync = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var solid;
        if (hero) {
          // solid as soon as the bar no longer sits over the image
          solid = hero.getBoundingClientRect().bottom <= topbar.offsetHeight;
        } else {
          solid = window.scrollY > 24;
        }
        topbar.classList.toggle("is-scrolled", solid);
        ticking = false;
      });
    };

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.addEventListener("load", sync);
    sync();
  }

  /* ---------- drawer ---------- */
  if (!btn || !drawer || !scrim) return;

  var lastFocus = null;

  function openDrawer() {
    lastFocus = document.activeElement;
    scrim.hidden = false;
    // force a reflow so the opacity transition actually runs
    void scrim.offsetWidth;
    drawer.classList.add("is-open");
    scrim.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    document.body.classList.add("drawer-open");
    if (close) close.focus();
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    scrim.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("drawer-open");
    window.setTimeout(function () { scrim.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toggleDrawer() {
    if (drawer.classList.contains("is-open")) closeDrawer();
    else openDrawer();
  }

  btn.addEventListener("click", toggleDrawer);
  scrim.addEventListener("click", closeDrawer);
  if (close) close.addEventListener("click", closeDrawer);

  // any link inside the drawer closes it (incl. the TOC anchors)
  drawer.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a") : null;
    if (a) closeDrawer();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  // if the viewport grows back to desktop, don't leave the body locked
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768 && drawer.classList.contains("is-open")) closeDrawer();
  });
})();