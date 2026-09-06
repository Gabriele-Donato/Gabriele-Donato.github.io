---
title: "Conjugate Priors as Pseudo-Data"
note_id: "3a"
date: 2026-04-09
tags: [bayes, statistics, priors]
links: ["exchangeability", "shrinkage-and-the-prior"]
excerpt: "Conjugacy is not a fact about beliefs, it is a fact about algebra: the prior is data you are pretending to have already seen."
---

Conjugacy is not a claim about anyone's beliefs. It is a statement about
algebra: the prior has the same functional form as the likelihood, so the
posterior stays inside the family and the update collapses into arithmetic on
the parameters.

The honest reading is that a conjugate prior *is data*. A Beta\\((\alpha, \beta)\\)
prior on a binomial rate says: pretend you have already seen \\(\alpha - 1\\)
successes and \\(\beta - 1\\) failures. The posterior after \\(y\\) successes
in \\(n\\) trials,

\\[ \theta \mid y \sim \mathrm{Beta}(\alpha + y,\ \beta + n - y), \\]

is then just the tally. The prior's weight is measured in the only unit that
matters, namely how many observations it is worth.

This is what makes the \\(n \to \infty\\) argument boring rather than
reassuring: the prior does not become "right", it becomes outnumbered.
