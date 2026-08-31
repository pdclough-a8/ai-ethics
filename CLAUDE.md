# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

An **Analytics8-branded AI Ethics and Responsible AI learning object**, built as a static [Astro](https://astro.build/) site (v7). The course follows the AI project lifecycle across 7 pages: Introduction, AI Ethics: The Foundations, Business Understanding, Data Acquisition & Understanding, Modeling, Deployment & Beyond, and Conclusion.

This was originally an Adapt Learning / SCORM 1.2 course (see git history). It has since been **rebuilt as a standalone Astro site, decoupled from Adapt and from any LMS/SCORM dependency** — there is no `course/` directory, SCORM manifest, or LMS entry point anymore. Progress and quiz-answer tracking is now purely client-side (localStorage), not SCORM reporting.

## Stack & Commands

- Node >=22.12.0, Astro ^7.1.6, TypeScript (`astro/tsconfigs/strict`). No other runtime dependencies.
- `npm run dev` — local dev server
- `npm run build` — static build to `dist/`
- `npm run preview` — preview the built `dist/` output

## Deployment

Push to `main` triggers [.github/workflows/static.yml](.github/workflows/static.yml), which runs `npm run build` and publishes `dist/` to GitHub Pages.

- Site is served at `https://pdclough-a8.github.io/ai-ethics/` — a **project site, not the domain root** — so [astro.config.mjs](astro.config.mjs) sets `base: '/ai-ethics'`.
- Any hand-written internal link or asset path (nav `href`s, image `src` values pulled from content JSON) **must** go through `withBase()` in [src/scripts/paths.ts](src/scripts/paths.ts). Astro only auto-prefixes URLs it generates itself (its own bundled JS/CSS) — plain `"/..."` strings we write ourselves resolve against the domain root unless passed through `withBase()`.
- Astro's default `build.assets` output folder (`_astro`) is intentionally left alone — do not rename it to something like `assets`, which would collide with `public/assets/` (course images).

## PWA (Installable App)

The site is installable (Add to Home Screen / desktop browser install) as a Progressive Web App — this is additive, not a fork: the same build serves both the plain browser experience and the installed one, and it has no effect on desktop rendering.

- [src/pages/manifest.webmanifest.ts](src/pages/manifest.webmanifest.ts) and [src/pages/sw.js.ts](src/pages/sw.js.ts) are Astro endpoints, not static files in `public/` — they're generated at build time so their `start_url`/`scope`/icon/precache paths go through `withBase()` like everything else, instead of hardcoding `/ai-ethics` a second place that could drift from `astro.config.mjs`. Astro prerenders them to `dist/manifest.webmanifest` and `dist/sw.js` same as any other route.
- Both are registered from [Layout.astro](src/layouts/Layout.astro): the manifest/icons/theme-color via `<link>`/`<meta>` tags in `<head>`, the service worker via `navigator.serviceWorker.register()` in the existing inline script.
- **Service worker strategy:** network-first for page navigations (always fresh when online; falls back to cache when offline), cache-first with background refresh for everything else. All 10 pages (7 core lifecycle pages + the 2 `bonusPages.ts` pages) are precached on install, so the course works fully offline once opened online at least once.
- **Cache busting:** `CACHE_VERSION` at the top of `sw.js.ts` — bump it on any deploy where already-installed users should drop stale cached content immediately rather than waiting for the network-first/cache-first logic to refresh it naturally.
- `CORE_PAGES` in `sw.js.ts` is a **fourth** hardcoded copy of the 7-page list (alongside `Layout.astro`'s nav, `index.astro`'s menu grid, and — for the bonus pages only — the shared `bonusPages.ts`). Keep it in sync if pages are added/renamed/removed.
- **App icons** live in `public/icons/` (192/512 standard + maskable, 180 `apple-touch-icon`, 16/32 favicons), generated from the loop mark cropped out of `public/assets/logo-analytics8.png` — white mark on `--a8-accent`, plus an ink-coloured "AI ETHICS" pill, horizontally centred below the mark (favicons excluded — too small to read at 16/32px). Full text rather than a two-letter chip since Analytics8 may publish more than one AI-related resource, where "AI" alone wouldn't disambiguate them. The badge text, not the mark or accent colour, is what should change for a different A8 resource's icon — the accent colour is the one deliberately shared brand colour across courses (see `theme.css`'s note on `--a8-accent`), not something to fork per-resource. Regenerated via a one-off Python/Pillow script (not checked into the repo — recreate from this description, or ask for it, if the icons need regenerating) rather than a runtime dependency, matching this repo's "no other runtime dependencies" stance.

## Content Architecture

Course content is driven entirely by JSON files in [src/content/](src/content/), one per page:

`introduction.json`, `foundations.json`, `business-understanding.json`, `data-acquisition.json`, `modeling.json`, `deployment-beyond.json`, `conclusion.json`

Each file is flat, not a nested tree:

```json
{
  "title": "Page Title",
  "duration": "6 minutes.",
  "blocks": [ { "type": "text", ... }, { "type": "mcq", ... }, ... ]
}
```

`blocks` is an ordered array rendered top-to-bottom. Each entry's `type` field selects the Astro component that renders it, dispatched by [src/components/Block.astro](src/components/Block.astro):

| `type` | Component | Purpose |
|---|---|---|
| `text` | [Text.astro](src/components/Text.astro) | Narrative content (most common) |
| `graphic` | [Graphic.astro](src/components/Graphic.astro) | Standalone image |
| `accordion` | [Accordion.astro](src/components/Accordion.astro) | Expandable sections |
| `mcq` | [Mcq.astro](src/components/Mcq.astro) | Multiple-choice knowledge check |
| `narrative` | [Narrative.astro](src/components/Narrative.astro) | Image+text carousel |
| `hotgraphic` | [Hotgraphic.astro](src/components/Hotgraphic.astro) | Clickable image regions |
| `flipcard` | [Flipcard.astro](src/components/Flipcard.astro) | Flip card interactions |
| `reveal` | [Reveal.astro](src/components/Reveal.astro) | Before/after image reveal |

A page's `.astro` file (in [src/pages/](src/pages/)) is just: import its JSON, `<Layout>`, then map `blocks` through `<Block block={block} />`. Each block object's fields must match the `Props` interface of its target component exactly (see that component's file) — there is no schema validation, so a typo in a field name silently renders as missing content rather than erroring.

[src/pages/index.astro](src/pages/index.astro) is the landing/menu page and is hand-authored HTML (hero copy + a 7-tile menu grid), not driven by a content JSON file.

## MCQ Components

`mcq` blocks are **ungraded, multi-attempt self-checks** — no scoring, no pass/fail, no completion gating:

- `isRadio: true` → single-select (radio); `false`/omitted → multi-select (checkbox).
- Each item has `shouldBeSelected: boolean` and an optional `feedback` string. Result is `correct` / `partlyCorrect` / `incorrect`, computed client-side in [Mcq.astro](src/components/Mcq.astro)'s inline script.
- Only a fully `correct` answer locks the question. An `incorrect`/`partlyCorrect` attempt shows feedback but leaves inputs and Submit enabled, so the learner can change their answer and resubmit — each resubmission overwrites the previously-saved attempt. Revisiting the page restores the last-saved attempt (still editable, unless it was correct) — persisted via `recordInteraction()`/`getInteraction()` in [src/scripts/tracking.ts](src/scripts/tracking.ts), not SCORM.
- An item's own `feedback` is shown (instead of the question's generic `feedbackIncorrect`) when that's the single wrong option selected — the common case for a single-select question answered incorrectly. It falls back to `feedbackIncorrect` if the item has no `feedback`, or if more than one wrong option was selected at once (multi-select). Every current `mcq` block's incorrect items have their own `feedback` written; a newly-added item without one just falls back gracefully.
- `id` on an `mcq` block must be stable and unique — it's the localStorage key.

## Progress Tracking (no LMS)

[src/scripts/tracking.ts](src/scripts/tracking.ts) is the **single place** that touches `localStorage` for progress/quiz state, namespaced `a8-ai-ethics-*` (kept distinct from the sibling Data Ethics course, which shares the same GitHub Pages origin). `Layout.astro` calls `recordPageVisit()` on every page load; `index.astro` uses `getVisitedPages()` to mark visited tiles and suggest a "Continue here" tile.

If SCORM/LMS reporting is ever reintroduced, this file is where a `wrapper.setValue(...)` call would be added — no other file should touch storage directly.

## Making Content Changes

All content edits go into the JSON files under `src/content/`. Key conventions:

- `mcq` block `id` values must stay unique (they're localStorage keys) — otherwise, block ordering within a page is just array order, and there's no cross-file ID scheme to maintain (unlike the old Adapt `_id`/`_parentId` tree).
- Body text is raw HTML strings (`<p>`, `<strong>`, `<em>`, `<a class="customlink" ...>` etc.) — matches the component's `set:html` usage.
- Images referenced from content JSON live in `public/assets/` and use paths like `/assets/filename.png` — pass through `withBase()` when used in a hand-written link/`src`, same as nav hrefs.
- To add a new page: create `src/content/<slug>.json`, create `src/pages/<slug>.astro` following the existing pattern, and add it to the menu grid in `index.astro`.

## Known Content Gap

`conclusion.json`'s `flipcard` block ("Top tips") has 6 items with **every field empty** (`frontImageSrc`, `frontImageAlt`, `backTitle`, `backBody` all `""`). This renders as 6 blank cards — it's unpopulated placeholder content carried over from the migration, not a bug in the flipcard component itself, and needs real "top tips" copy written before it's meaningful to a learner.

## Migration History

[scripts/extract-content.mjs](scripts/extract-content.mjs) is a **one-off, non-runtime** migration script that converted the old Adapt JSON tree (`course/en/{contentObjects,articles,blocks,components}.json`) into the current flat `src/content/*.json` files. The old Adapt source (`course/`, the SCORM manifest, LMS entry points) has been deleted from the repo but remains recoverable via git history. The script is kept for reference/re-running only until content is fully verified as ported.
