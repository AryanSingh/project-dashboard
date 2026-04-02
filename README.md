# Project Dashboard

A static dashboard that compiles repo-level `STATUS.md` files into a mobile-friendly snapshot you can publish to GitHub Pages.

## What It Tracks

- project state
- progress percentage and summary
- next steps
- blockers
- whether `AGENTS.md` exists
- whether the repo currently has a dirty working tree

Also see:

- [EXECUTION_PLAN.md](/Users/aryansingh/repos/project-dashboard/EXECUTION_PLAN.md)

## Source Of Truth

Each tracked repo should maintain:

- `STATUS.md`
- `AGENTS.md`

The dashboard does not invent project state. It reads the repo-side `STATUS.md` files and writes a static snapshot to `data/projects.json`.

## Local Setup

1. Copy `sources.example.json` to `sources.local.json` if it does not already exist.
2. Put your absolute repo paths in `sources.local.json`.
3. Run:

```bash
npm run sync
```

4. Preview locally:

```bash
npm run serve
```

Then open `http://localhost:4173`.

## Update Workflow

1. Work inside a tracked repo.
2. Update that repo's `STATUS.md`.
3. Return here and run `npm run sync`.
4. Commit the updated dashboard snapshot.
5. Push to GitHub.

## GitHub Pages

The workflow file at `.github/workflows/deploy.yml` publishes the site when changes land on `main`.

If this repo is newly created:

1. Create an empty GitHub repo, for example `project-dashboard`.
2. Add the SSH remote using your personal key alias:

```bash
git remote add origin git@github-personal:AryanSingh/project-dashboard.git
```

3. Push:

```bash
git push -u origin main
```

4. In the GitHub repo settings, enable Pages with GitHub Actions as the source if it is not auto-detected.
