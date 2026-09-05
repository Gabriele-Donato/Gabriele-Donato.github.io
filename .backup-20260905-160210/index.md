---
layout: default
title:
image: /assets/images/rambosson.jpg
---

<div class="home">

  <!-- To show your site description above the list, uncomment the next line:
  <p class="home__intro">{{ site.description }}</p>
  -->

  <ul class="post-list">
    {%- for post in site.posts %}
    <li class="post-list__item">
      <h2 class="post-list__title">
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      </h2>
      <p class="post-list__date">
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %-d, %Y" }}</time>
      </p>
      <p class="post-list__excerpt">{{ post.excerpt | strip_html | truncatewords: 50 }}</p>
    </li>
    {%- endfor %}
  </ul>

</div>
