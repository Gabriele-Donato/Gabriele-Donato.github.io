/* ==========================================================================
   post-toc.js — builds the table of contents from the article headings and
   injects it into BOTH the desktop rail (#toc-desktop) and the mobile
   drawer (#toc-mobile). Adds scroll-spy highlighting.
   Loaded only on post pages.
   ========================================================================== */
(function () {
  "use strict";

  var article = document.getElementById("post-content");
  var rail    = document.getElementById("toc-desktop");
  var mobile  = document.getElementById("toc-mobile");

  // Not a post page (no article body) — nothing to do, and no warning.
  if (!article) return;

  if (!rail && !mobile) {
    console.warn("[post-toc] #post-content found but no #toc-desktop / #toc-mobile " +
                 "container. Is _layouts/post.html the updated version?");
    return;
  }

  var headings = Array.prototype.slice.call(
    article.querySelectorAll("h2, h3")
  );

  var railSticky = document.querySelector(".toc-rail__sticky");

  if (!headings.length) {
    // collapse the rail rather than showing a bare "CONTENTS" label
    if (railSticky) railSticky.classList.add("is-empty");
    console.warn("[post-toc] no <h2>/<h3> found inside #post-content — " +
                 "TOC hidden. Add section headings to the post.");
    return;
  }

  /* ---------- slugify + guarantee unique ids ---------- */
  var used = Object.create(null);

  function slugify(text) {
    var s = text
      .toLowerCase()
      .replace(/[‘’“”]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    return s || "section";
  }

  headings.forEach(function (h) {
    if (!h.id) {
      var base = slugify(h.textContent);
      var id = base, n = 2;
      while (used[id] || document.getElementById(id)) { id = base + "-" + n; n++; }
      h.id = id;
    }
    used[h.id] = true;
  });

  /* ---------- build the list once ---------- */
  var ol = document.createElement("ol");
  headings.forEach(function (h) {
    var li = document.createElement("li");
    li.className = h.tagName === "H3" ? "toc-h3" : "toc-h2";

    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.textContent = h.textContent.trim();
    a.dataset.target = h.id;

    li.appendChild(a);
    ol.appendChild(li);
  });

  if (rail)   rail.appendChild(ol.cloneNode(true));
  if (mobile) mobile.appendChild(ol.cloneNode(true));

  /* ---------- scroll-spy ---------- */
  var links = Array.prototype.slice.call(
    document.querySelectorAll('#toc-desktop a[data-target], #toc-mobile a[data-target]')
  );

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.dataset.target === id);
    });
  }

  if ("IntersectionObserver" in window) {
    var visible = Object.create(null);

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible[entry.target.id] = true;
        else delete visible[entry.target.id];
      });

      // highlight the first heading currently in the top band of the viewport
      for (var i = 0; i < headings.length; i++) {
        if (visible[headings[i].id]) { setActive(headings[i].id); return; }
      }
      // nothing in the band: fall back to the last heading we scrolled past
      var last = null;
      for (var j = 0; j < headings.length; j++) {
        if (headings[j].getBoundingClientRect().top < 120) last = headings[j];
      }
      if (last) setActive(last.id);
    }, {
      // a band just under the sticky top bar
      rootMargin: "-72px 0px -70% 0px",
      threshold: 0
    });

    headings.forEach(function (h) { observer.observe(h); });
  }
})();
