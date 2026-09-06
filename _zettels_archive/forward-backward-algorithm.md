---
title: "The Forward-Backward Algorithm"
note_id: "8a"
date: 2026-05-20
tags: [statistics, hmm, algorithms]
source_post: "Russo-Ukraine-War"
excerpt: "Baum-Welch fits a Hidden Markov Model by alternating between a forward-backward pass that infers the hidden states and a re-estimation step that updates the parameters given them."
---

Pulled out of the retaliation-patterns post because it is a method, not an
argument about Ukraine, and it will come up again.

Baum-Welch fits a Hidden Markov Model in two alternating passes. The
forward-backward pass holds the transition and emission parameters fixed and
computes, for every time step, the probability of each hidden state given the
whole observed sequence — using the future observations as well as the past,
which is the entire point of the "backward" half. The re-estimation step then
holds those probabilities fixed and updates the parameters to the values that
make the observed sequence most likely.

It is expectation-maximisation, specialised to a sequence: infer the
posterior over hidden states, then maximise the parameters against that
posterior, repeat until neither moves.
