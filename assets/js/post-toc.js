document.addEventListener("DOMContentLoaded", function () {
  const content = document.getElementById("post-content");
  const toc = document.getElementById("post-toc-list");

  if (!content || !toc) return;

  const headings = content.querySelectorAll("h2, h3");

  if (!headings.length) {
    const tocContainer = document.querySelector(".post-toc");
    if (tocContainer) tocContainer.style.display = "none";
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
    {
      rootMargin: "-15% 0px -70% 0px"
    }
  );

  headings.forEach(function (heading) {
    observer.observe(heading);
  });
});
