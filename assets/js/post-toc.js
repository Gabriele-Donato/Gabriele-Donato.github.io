document.addEventListener("DOMContentLoaded", function () {
  const content = document.getElementById("post-content");
  const toc = document.getElementById("post-toc-list");

  if (!content || !toc) return;

  const headings = content.querySelectorAll("h2, h3");
  const toggleBtn = document.getElementById("mobile-toc-toggle");
  const tocElement = document.getElementById("post-toc");
  const overlay = document.getElementById("toc-overlay");

  if (!headings.length) {
    if (tocElement) tocElement.style.display = "none";
    if (toggleBtn) toggleBtn.style.display = "none";
    return;
  }

  headings.forEach(function (heading, index) {
    if (!heading.id) {
      heading.id = "section-" + (index + 1);
    }
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + heading.id;
    link.textContent = heading.textContent.trim();
    if (heading.tagName.toLowerCase() === "h3") {
      li.classList.add("toc-h3");
    }
    li.appendChild(link);
    toc.appendChild(li);
  });

  const links = toc.querySelectorAll("a");

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (link) {
          link.classList.remove("active");
        });
        const active = toc.querySelector('a[href="#' + entry.target.id + '"]');
        if (active) {
          active.classList.add("active");
        }
      });
    },
    { rootMargin: "-15% 0px -70% 0px" }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });

  if (toggleBtn && tocElement && overlay) {
    function closeTOC() {
      tocElement.classList.remove("open");
      overlay.classList.remove("open");
      document.body.style.overflow = ""; 
    }

    toggleBtn.addEventListener("click", function() {
      tocElement.classList.add("open");
      overlay.classList.add("open");
      document.body.style.overflow = "hidden"; 
    });

    overlay.addEventListener("click", closeTOC);

    links.forEach(function(link) {
      link.addEventListener("click", closeTOC);
    });
  }
});
