---
title: "Check Compiler Standard"
note_id: "1d1"
date: 2026-12-09
tags: [c_standard]
excerpt: "Meaning and code for checking gcc standard"
---

<pre><code class="language-bash">gcc --version</code></pre>


**Meaning:**
-dM prints all macros for preprocessor.

-E runs only preprocessor.

-< /dev/null is an empty input file to make it work.