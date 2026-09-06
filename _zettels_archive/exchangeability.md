---
title: "Exchangeability, Not Independence"
note_id: "3b"
date: 2026-04-14
tags: [bayes, statistics, probability]
links: ["conjugate-priors"]
excerpt: "De Finetti's theorem buys the i.i.d. likelihood back as a consequence of symmetry, rather than assuming it as a fact about the world."
---

The i.i.d. assumption is almost never a belief anyone actually holds. What one
believes is something weaker and far more defensible: that the *order* of the
observations carries no information.

De Finetti's theorem turns that symmetry into the whole apparatus. If
\\(y_1, \dots, y_n\\) are exchangeable binary variables, then

\\[ p(y_1, \dots, y_n) = \int_0^1 \prod_{i=1}^{n} \theta^{y_i}(1-\theta)^{1-y_i}\, \pi(\theta)\, d\theta, \\]

so the parameter, the i.i.d. likelihood *and* the prior all fall out as a
representation of the judgement of symmetry. The parameter is not a fact about
the world one has posited; it is the thing that makes the observations
conditionally independent.

Which is the cleanest available answer to "where does the prior come from":
the same place the likelihood does.
