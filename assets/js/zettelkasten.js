/* ==========================================================================
   ZETTELKASTEN — client behaviour
   --------------------------------------------------------------------------
   Vanilla ES6, no dependencies, no build step. Everything it needs was
   already computed by Liquid at build time and parked in data-* attributes,
   so this file only ever:

     1. reads the filter state (search box + active tag pills + URL query),
     2. toggles two classes per card,
     3. opens a preview modal for a clicked card.

   Loaded with `defer` from _layouts/default.html with a ?v= cache-buster —
   without one, GitHub Pages sends no revalidation header and Firefox will
   happily run a months-old copy of this file (which is exactly what happened
   to assets/js/post-toc.js).
   ========================================================================== */

(function () {
  "use strict";

  var root = document.getElementById("zk");
  if (!root) return;                       // not the Zettelkasten page

  /* ---------------------------------------------------------------- DOM -- */
  var grid        = document.getElementById("zk-grid");
  var cards       = Array.prototype.slice.call(grid.querySelectorAll(".zettel-card"));
  var searchInput = document.getElementById("zk-search-input");
  var searchClear = document.getElementById("zk-search-clear");
  var tagButtons  = Array.prototype.slice.call(root.querySelectorAll("[data-zk-tag]"));
  var resetAll    = document.getElementById("zk-reset-all");
  var visCount    = document.getElementById("zk-visible-count");
  var statusLine  = document.getElementById("zk-status");
  var emptyState  = document.getElementById("zk-empty");

  var modal        = document.getElementById("zk-modal");
  var modalPanel   = modal.querySelector(".zk-modal__panel");
  var modalId      = document.getElementById("zk-modal-id");
  var modalTitle   = document.getElementById("zk-modal-title");
  var modalDate    = document.getElementById("zk-modal-date");
  var modalSource  = document.getElementById("zk-modal-source");
  var modalTags    = document.getElementById("zk-modal-tags");
  var modalBody    = document.getElementById("zk-modal-body");
  var modalLinks   = document.getElementById("zk-modal-links");
  var modalPerma   = document.getElementById("zk-modal-permalink");

  var TOTAL     = cards.length;
  var FADE_MS   = 180;                     // must match the CSS transition
  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  /* -------------------------------------------------------------- index --
     Metadata for every note, keyed by slug, plus a reverse map from the
     Zettel number, so `links: ["42a"]` and `links: ["atomic-habits"]` both
     resolve.                                                               */
  var INDEX = {};
  var BY_NUMBER = {};
  try {
    var raw = document.getElementById("zk-index");
    if (raw) {
      INDEX = JSON.parse(raw.textContent || "{}");
      Object.keys(INDEX).forEach(function (slug) {
        INDEX[slug].slug = slug;
        var n = (INDEX[slug].noteId || "").toLowerCase();
        if (n) BY_NUMBER[n] = INDEX[slug];
      });
    }
  } catch (err) {
    console.warn("[zettelkasten] could not parse the note index:", err);
  }

  function lookup(token) {
    if (!token) return null;
    var key = token.toLowerCase();
    return INDEX[key] || BY_NUMBER[key] || null;
  }

  /* -------------------------------------------------------------- state -- */
  var state = {
    query: "",
    terms: [],                              // query split into AND-ed words
    tags: []                                // active tags, AND-ed
  };

  /* ===================================================================== */
  /*  1. FILTERING                                                          */
  /* ===================================================================== */

  /* A card's own tags, cached once — dataset reads are not free in a loop. */
  cards.forEach(function (card) {
    card._tags    = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
    card._haystack = [
      card.dataset.title || "",
      card.dataset.tags || "",
      card.dataset.id || "",
      card.dataset.content || ""
    ].join(" ");
  });

  function matchesSearch(card) {
    if (!state.terms.length) return true;
    // every word must appear somewhere in the card — AND, not OR
    return state.terms.every(function (term) {
      return card._haystack.indexOf(term) !== -1;
    });
  }

  function matchesTags(card) {
    if (!state.tags.length) return true;
    // a card must carry ALL of the selected topics
    return state.tags.every(function (tag) {
      return card._tags.indexOf(tag) !== -1;
    });
  }

  function show(card) {
    if (!card.classList.contains("is-gone") && !card.classList.contains("is-hidden")) return;
    card.classList.remove("is-gone");
    if (reduceMotion) { card.classList.remove("is-hidden"); return; }
    // one frame with display restored but still transparent, so the fade runs
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { card.classList.remove("is-hidden"); });
    });
  }

  function hide(card) {
    if (card.classList.contains("is-gone")) return;
    card.classList.add("is-hidden");
    if (reduceMotion) { card.classList.add("is-gone"); return; }
    window.setTimeout(function () {
      // still filtered out when the fade ends? then drop it out of the grid
      if (card.classList.contains("is-hidden")) card.classList.add("is-gone");
    }, FADE_MS);
  }

  function apply() {
    var visible = 0;

    // how many notes each tag would still yield under the CURRENT search,
    // so pills that lead nowhere can be dimmed instead of lying
    var reachable = Object.create(null);

    cards.forEach(function (card) {
      var searchHit = matchesSearch(card);
      if (searchHit) {
        card._tags.forEach(function (t) { reachable[t] = (reachable[t] || 0) + 1; });
      }
      if (searchHit && matchesTags(card)) { show(card); visible++; }
      else { hide(card); }
    });

    tagButtons.forEach(function (btn) {
      var tag = btn.dataset.zkTag;
      var on  = state.tags.indexOf(tag) !== -1;
      btn.classList.toggle("is-active", on);
      if (btn.hasAttribute("aria-pressed")) btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (btn.classList.contains("zk-tag")) {
        btn.classList.toggle("is-empty", !on && !reachable[tag]);
      }
    });

    var allPill = root.querySelector("[data-zk-reset].zk-tag");
    if (allPill) {
      var clean = !state.tags.length && !state.query;
      allPill.classList.toggle("is-active", clean);
      allPill.setAttribute("aria-pressed", clean ? "true" : "false");
    }

    if (visCount) visCount.textContent = visible;
    if (statusLine) {
      statusLine.textContent = visible + (visible === 1 ? " note" : " notes") + " shown of " + TOTAL;
    }
    if (emptyState) emptyState.hidden = visible !== 0;
    if (searchClear) searchClear.hidden = !state.query;
    if (resetAll) resetAll.hidden = !state.tags.length && !state.query;

    syncURL();
  }

  /* ===================================================================== */
  /*  2. URL STATE                                                          */
  /* ===================================================================== */

  function syncURL(replace) {
    if (!window.history || !window.history.replaceState) return;
    var params = new URLSearchParams(window.location.search);

    if (state.query) params.set("q", state.query); else params.delete("q");
    if (state.tags.length) params.set("tag", state.tags.join(",")); else params.delete("tag");
    // ?note= is owned by the modal, left untouched here

    var qs  = params.toString();
    var url = window.location.pathname + (qs ? "?" + qs : "") + window.location.hash;
    if (replace === false) window.history.pushState({ zk: true }, "", url);
    else window.history.replaceState({ zk: true }, "", url);
  }

  function readURL() {
    var params = new URLSearchParams(window.location.search);

    var q = (params.get("q") || "").trim();
    state.query = q.toLowerCase();
    state.terms = state.query.split(/\s+/).filter(Boolean);
    if (searchInput) searchInput.value = q;

    var tagParam = params.get("tag") || "";
    state.tags = tagParam.split(/[,+\s]+/)
      .map(function (t) { return t.trim().toLowerCase(); })
      .filter(function (t) {
        if (!t) return false;
        // ignore a tag nobody uses, rather than showing an empty grid
        return tagButtons.some(function (b) { return b.dataset.zkTag === t; });
      });

    return params.get("note");
  }

  /* ===================================================================== */
  /*  3. EVENTS — search + tags                                             */
  /* ===================================================================== */

  var debounce;
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(function () {
        state.query = searchInput.value.trim().toLowerCase();
        state.terms = state.query.split(/\s+/).filter(Boolean);
        apply();
      }, 110);
    });

    // Esc inside the box clears it before the browser does anything odd
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && searchInput.value) {
        e.preventDefault();
        clearSearch();
      }
    });
  }

  function clearSearch() {
    if (!searchInput) return;
    searchInput.value = "";
    state.query = "";
    state.terms = [];
    apply();
    searchInput.focus();
  }

  if (searchClear) searchClear.addEventListener("click", clearSearch);

  function toggleTag(tag) {
    var i = state.tags.indexOf(tag);
    if (i === -1) state.tags.push(tag);
    else state.tags.splice(i, 1);
    apply();
  }

  // one delegated listener covers the panel pills, the badges on every card
  // and the pills inside the modal
  document.addEventListener("click", function (e) {
    var tagBtn = e.target.closest ? e.target.closest("[data-zk-tag]") : null;
    if (tagBtn) {
      e.preventDefault();
      e.stopPropagation();                 // never let it also open the card
      toggleTag(tagBtn.dataset.zkTag);
      if (modal.classList.contains("is-open")) closeModal();
      return;
    }

    var resetBtn = e.target.closest ? e.target.closest("[data-zk-reset]") : null;
    if (resetBtn) {
      e.preventDefault();
      state.tags = [];
      state.query = "";
      state.terms = [];
      if (searchInput) searchInput.value = "";
      apply();
    }
  });

  if (resetAll) {
    resetAll.addEventListener("click", function () {
      state.tags = [];
      state.query = "";
      state.terms = [];
      if (searchInput) searchInput.value = "";
      apply();
    });
  }

  /* ===================================================================== */
  /*  4. MODAL PREVIEW                                                      */
  /* ===================================================================== */

  var bodyCache  = Object.create(null);     // url -> HTML string
  var lastFocus  = null;
  var openSlug   = null;

  grid.addEventListener("click", function (e) {
    // let people open the note properly: new tab, new window, save, middle click
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var card = e.target.closest ? e.target.closest(".zettel-card") : null;
    if (!card) return;

    e.preventDefault();                     // the title <a> would navigate away
    openModal(card, true);
  });

  function cardBySlug(slug) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].dataset.slug === slug) return cards[i];
    }
    return null;
  }

  function openModal(card, pushHistory) {
    lastFocus = document.activeElement;
    openSlug = card.dataset.slug;

    modalId.textContent    = card.dataset.id || "";
    modalTitle.textContent = card.querySelector(".zettel-card__title").textContent.trim();
    modalDate.textContent  = card.dataset.date || "";
    modalPerma.href        = card.dataset.url;

    /* ---- post -> zettel provenance ---- */
    if (card.dataset.sourcePostUrl) {
      modalSource.innerHTML = "Extracted from <a href=\"" + card.dataset.sourcePostUrl + "\">" +
        card.dataset.sourcePostTitle.replace(/</g, "&lt;") + "</a>";
      modalSource.hidden = false;
    } else {
      modalSource.innerHTML = "";
      modalSource.hidden = true;
    }

    /* ---- tags ---- */
    modalTags.innerHTML = "";
    (card.dataset.tags || "").split(/\s+/).filter(Boolean).forEach(function (t) {
      var li = document.createElement("li");
      var b  = document.createElement("button");
      b.type = "button";
      b.dataset.zkTag = t;
      b.textContent = "#" + t;
      li.appendChild(b);
      modalTags.appendChild(li);
    });

    /* ---- bidirectional links ---- */
    modalLinks.innerHTML = "";
    renderLinkGroup("LINKS TO", (card.dataset.links || "").split(/\s+/).filter(Boolean), true);
    renderLinkGroup("LINKED FROM", (card.dataset.backlinks || "").split(/\s+/).filter(Boolean), false);

    /* ---- body ---- */
    modalBody.innerHTML = '<p class="zk-modal__loading">Loading the note&hellip;</p>';
    loadBody(card);

    /* ---- show ---- */
    modal.hidden = false;
    document.body.classList.add("zk-locked");
    window.requestAnimationFrame(function () {
      modal.classList.add("is-open");
      modal.querySelector(".zk-modal__close").focus();
    });

    if (pushHistory && window.history && window.history.pushState) {
      var params = new URLSearchParams(window.location.search);
      params.set("note", openSlug);
      window.history.pushState({ zk: true, note: openSlug }, "",
        window.location.pathname + "?" + params.toString());
    }
  }

  function renderLinkGroup(label, slugs, outgoing) {
    if (!slugs.length) return;

    var wrap = document.createElement("div");
    wrap.className = "zk-links-group";

    var h = document.createElement("p");
    h.className = "zk-links-group__label";
    h.textContent = label;
    wrap.appendChild(h);

    var ul = document.createElement("ul");

    slugs.forEach(function (token) {
      var hit = lookup(token);
      var li  = document.createElement("li");

      if (hit) {
        var a = document.createElement("a");
        a.href = hit.url;
        if (hit.noteId) {
          var num = document.createElement("span");
          num.className = "zk-link-num";
          num.textContent = hit.noteId;
          a.appendChild(num);
        }
        a.appendChild(document.createTextNode(hit.title));
        // keep the reader inside the slip-box: swap the modal, don't navigate
        a.addEventListener("click", function (e) {
          if (e.metaKey || e.ctrlKey || e.shiftKey) return;
          var target = cardBySlug(hit.slug);
          if (!target) return;              // note exists but is filtered out of this build
          e.preventDefault();
          closeModal(true);
          openModal(target, true);
        });
        li.appendChild(a);
      } else if (outgoing) {
        // a link written before the note it points at — worth seeing, not hiding
        var span = document.createElement("span");
        span.className = "zk-link-missing";
        span.textContent = token + " — not written yet";
        li.appendChild(span);
      } else {
        return;
      }

      ul.appendChild(li);
    });

    if (!ul.children.length) return;
    wrap.appendChild(ul);
    modalLinks.appendChild(wrap);
  }

  function loadBody(card) {
    var url = card.dataset.url;

    if (bodyCache[url]) { paintBody(bodyCache[url]); return; }

    if (!window.fetch) { paintFallback(card); return; }

    fetch(url, { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var node = doc.querySelector("[data-zettel-body]") ||
                   doc.querySelector(".post__content");
        if (!node) throw new Error("no note body in the fetched page");
        bodyCache[url] = node.innerHTML;
        // the reader may have closed or switched notes while this was in flight
        if (openSlug === card.dataset.slug) paintBody(bodyCache[url]);
      })
      .catch(function (err) {
        console.warn("[zettelkasten] preview fetch failed:", err);
        if (openSlug === card.dataset.slug) paintFallback(card);
      });
  }

  function paintBody(html) {
    modalBody.innerHTML = html;
    // re-typeset if the note carries LaTeX and MathJax is on the page
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise([modalBody]).catch(function () { /* non-fatal */ });
    }
  }

  function paintFallback(card) {
    var p = document.createElement("p");
    p.textContent = card.querySelector(".zettel-card__excerpt").textContent;
    modalBody.innerHTML = "";
    modalBody.appendChild(p);
  }

  function closeModal(silent) {
    if (!modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    openSlug = null;
    document.body.classList.remove("zk-locked");

    window.setTimeout(function () {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, reduceMotion ? 0 : 240);

    if (!silent) {
      if (lastFocus && lastFocus.focus) lastFocus.focus();
      if (window.history && window.history.replaceState) {
        var params = new URLSearchParams(window.location.search);
        if (params.has("note")) {
          params.delete("note");
          var qs = params.toString();
          window.history.replaceState({ zk: true }, "",
            window.location.pathname + (qs ? "?" + qs : ""));
        }
      }
    }
  }

  modal.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-zk-close]")) {
      e.preventDefault();
      closeModal();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!modal.classList.contains("is-open")) return;

    if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }

    /* focus trap — Tab must not walk out into the page behind the scrim */
    if (e.key !== "Tab") return;
    var focusables = modalPanel.querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    var first = focusables[0];
    var last  = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Back button: closes the preview, or restores a filter state. */
  window.addEventListener("popstate", function () {
    var note = readURL();
    apply();
    if (note) {
      var card = cardBySlug(note);
      if (card) { closeModal(true); openModal(card, false); return; }
    }
    closeModal(true);
  });

  /* ===================================================================== */
  /*  5. BOOT                                                               */
  /* ===================================================================== */

  var initialNote = readURL();
  apply();

  if (initialNote) {
    var card = cardBySlug(initialNote);
    if (card) openModal(card, false);
  }
})();
