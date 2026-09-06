---
title: "Box Muller Transform Derivation Steps"
note_id: "1"
date: 2026-09-06
tags: [random numbers, MCMC, monte carlo, bayesian statistics, gaussian random numbers]
excerpt: "Steps to derive the Box-Muller transform."
---

In polar coordinates:

$$x = r cos (\theta)$$ &emsp; (1)

$$y = r sin (\theta)$$ &emsp; (2)

Consider two Random Variables $$X, Y$$ whose joint distribution is Normal.

$$f(x, y) = \frac{1}{2\pi}e^{ {\frac{-(x^{2}+y^{2})}{2}} }$$  &emsp; being the joint PDF.

Since:

$$x^{2} + y^{2} = r^{2}$$ &emsp;&emsp; from &emsp; $$cos^{2}(\theta) + sin^{2}(\theta) = 1$$

Then, substituting into the PDF:

$$f(\r, \theta) = \frac{1}{2\pi}e^{ {\frac{-r^{2}}{2}} }$$  &emsp;&emsp; being the joint PDF in polar coordinates.

The above is a function of the radius and the angle, and can be split into its constituent PDFs:

$$f(\theta) = \frac{1}{2\pi}$$

$$f(r) = e^{ {\frac{-r^{2}}{2}} }$$

---

**Key step:** Now we have a Normal PDF in polar coordinates and we can generate a Uniform random number using a PC. Hence, if we find a way to generate a random radius and a random angle we should be able to
input those into the newly found PDFs and get a random number back. Since the PDF is a gaussian that random number will be gaussian. However, the simplest thing we can do is generating random numbers in the interval 
$$[0,1]$$. Hence what we are asking can be written more schematically:

Generate two uniform random numbers $$a, b$$ in $$[0,1]$$ such that a transformation of $$a$$ yields the radius corresponding to the probability of a (i.e. what is the radius that corresponds to $$a=0.5$$); and 
such that a transformation of $$b$$ yields the angle corresponding to the probability of $$b$$ (i.e. what is the angle that corresponds to $$b=0.33$$).

Hence we need a mapping from $$r, \theta \rightarrow a, b \in [0,1]$$ such that we can somehow find the inverse and go from $$p, q \in [0,1] \rightarrow r, \theta$$, then we can use r and theta to compute (1) and (2).

Since we have $$r$$ and $$\theta$$ PDFs, we can compute their CDF which takes as input a radius or an angle and returns a probability in $$[0,1]$$.

---




**References**

- There is an handwritten derivation in the documents.