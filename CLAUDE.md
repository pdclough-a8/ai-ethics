# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A **SCORM 1.2 compliant e-learning course** about data ethics, built with the [Adapt Learning](https://www.adaptlearning.org/) framework (v5.31.20). The course covers data collection, storage, usage, sharing, and destruction across 6 topic pages.

This is a **pre-built static distribution** — all JavaScript and CSS are already compiled and minified. There is no build step or package manager. Changes are made directly to JSON content files and deployed as-is.

## Deployment

Deployment is automatic via GitHub Actions ([.github/workflows/static.yml](.github/workflows/static.yml)): push to `main` and the entire repo root is published to GitHub Pages.

- **Standalone (no LMS):** `index.html`
- **LMS/SCORM entry point:** `index_lms.html`

## Content Architecture

Course content is driven entirely by JSON files in [course/en/](course/en/):

| File | Purpose |
|------|---------|
| `course.json` | Course metadata, global nav, and settings |
| `contentObjects.json` | The 6 pages (menu items) |
| `articles.json` | Article containers within pages |
| `blocks.json` | Block groupings within articles |
| `components.json` | All interactive components (~700 total) |

The hierarchy is: **Course → Pages → Articles → Blocks → Components**

Each JSON item has a unique `_id` string. Items reference their parent via `_parentId`. Navigation and completion tracking follow this tree.

## Component Types in Use

Components in `components.json` have a `_component` field identifying their type:

- `text` — narrative content
- `mcq` — multiple choice questions (used for assessments)
- `accordion` — expandable sections
- `graphic` — images
- `narrative` — image+text carousel
- `hotgraphic` — clickable image regions
- `flipcard` — flip card interactions
- `blank` — layout spacer

## Framework Configuration

[course/config.json](course/config.json) controls SCORM tracking behaviour (completion criteria, retry settings), accessibility, and which Adapt plugins are active. The `_spoor` section configures SCORM 1.2 LMS interaction.

[adapt/js/build.min.js](adapt/js/build.min.js) contains the compiled plugin manifest — do not edit this manually.

## Making Content Changes

All content edits go into the JSON files under `course/en/`. Key conventions:

- Component and block `_id` values must remain unique across the entire course
- `_isAvailable` and `_isVisible` flags control what renders
- Assessment components reference an `_assessment` block via `_id`
- Images live in `course/en/assets/` and are referenced by relative path in component JSON

To add a new page: add an entry to `contentObjects.json`, then add corresponding articles/blocks/components referencing that page's `_id` as `_parentId`.

## SCORM Compliance

The course targets **SCORM 1.2**. The manifest is [imsmanifest.xml](imsmanifest.xml). SCORM communication is handled by [libraries/SCORM_API_wrapper.js](libraries/SCORM_API_wrapper.js) (pipwerks wrapper v1.1). Do not modify SCORM wrapper or manifest structure without verifying LMS compatibility.
