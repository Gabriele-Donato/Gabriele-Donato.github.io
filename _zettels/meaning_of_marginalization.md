---
title: "Meaning of Marginalization"
note_id: "1"
date: 2026-09-09
tags: [collapsed_gibbs_sampling, MCMC, bayesian_statistics]
excerpt: "The idea behind the concept of marginalization"
---

The word "marginalization" comes from the sums at the margin of a table.

Imagine that a variable $$y$$ depends on two parameters being $$M$$ and $$\sigma^{2}$$,

If we assume that the parameters can assume a finite number of values:

| | $$M = 1$$ | $$M =2$$ | $$M =3$$ | |
|---|---:|---:|---:|---:|
| $$\sigma^{2} = 1$$ | 0.05 | 0.3 | 0.05 | **0.4** |
| $$\sigma^{2} = 2$$ | 0.15 | 0.3 | 0.15 | **0.6** |
| |**0.2** |**0.6** |**0.2** | **1** |

Marginalizing means "not considering" the variable so summing over the columns effectively gives a distribution for $$M$$ which includes all possible changes in $$\sigma^{2}$$ values.

Formally, a marginal distribution over a discrete space is:

$$
\sum_{\sigma^{2}} P(M|y, \sigma^{2}) P(\sigma^{2}|y).
$$

Hence:

$$
P(M|y, \sigma^{2} = 1)
= \frac{0.05 + 0.3 + 0.05}{0.4}
= (0.125, 0.75, 0.125)
$$

$$
P(M|y, \sigma^{2} = 2)
= \frac{0.15 + 0.3 + 0.15}{0.6}
= (0.25, 0.50, 0.25)
$$

Also,

$$
\sum_{\sigma^{2}}
= 0.4 \times (0.125, 0.75, 0.125)
+ 0.6 \times (0.25, 0.50, 0.25)
= (0.2, 0.6, 0.2)
$$

which equals the bottom row (representing the sum of $$M$$ over all possible values of $$\sigma^{2}$$).
