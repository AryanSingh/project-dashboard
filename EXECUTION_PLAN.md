# Cross-Repo Execution Plan

This is the recommended order for turning the current set of repos into a cleaner, more reliable working portfolio.

## Priority Order

1. `verifyAI`
2. `pawPetrol` with `detective_dog_ai` as the likely primary path
3. `channel-manager`
4. `clipMaker`

## Why This Order

### 1. verifyAI

This is the best short path to a credible, explainable product.

- The frontend already builds successfully.
- The backend flow is understandable and bounded.
- The missing work is mostly documentation, setup clarity, and testing rather than massive product invention.

### 2. pawPetrol

This has strong creative pipeline momentum, but the project direction needs consolidation.

- The advanced pipeline has clear evidence of actual runs.
- There are multiple overlapping implementations, which makes progress harder to track.
- One documented happy path would raise confidence quickly.

### 3. channel-manager

This has the most code, but also the largest scope and the highest verification risk.

- A lot is implemented on paper and in code structure.
- The repo is mid-refactor.
- It needs build verification and doc correction before more expansion.

### 4. clipMaker

This should wait until its product definition exists.

- There is no real scaffold yet.
- Starting implementation now would just be guessing.

## Definition Of Progress

Use these milestones instead of vague percentage feelings.

### verifyAI

- M1: root README explains product, architecture, and setup
- M2: one reproducible local run path works
- M3: backend score logic has tests
- M4: API and UX limitations are documented

### pawPetrol

- M1: root README explains the two subprojects and declares the primary one
- M2: one documented end-to-end run works for `detective_dog_ai`
- M3: dependencies and model/service prerequisites are explicit
- M4: old or secondary pipeline is either archived or clearly marked as reference only

### channel-manager

- M1: current refactor state is documented honestly
- M2: backend builds successfully
- M3: frontend build and app run path are verified
- M4: docs stop claiming blanket completion where validation is still pending

### clipMaker

- M1: one-paragraph product brief exists
- M2: tech stack decision exists
- M3: first scaffold exists with README
- M4: first meaningful feature is implemented

## Weekly Operating Loop

1. Pick one repo as the focus repo for the week.
2. Define one milestone from the list above.
3. Do not switch the focus repo unless blocked.
4. At the end of each session:
   - update repo `STATUS.md`
   - update blocker notes honestly
   - regenerate the dashboard snapshot

## Current Recommendation

If you want the fastest visible progress:

1. finish `verifyAI` docs and setup first
2. stabilize `detective_dog_ai` next
3. only then return to `channel-manager`
