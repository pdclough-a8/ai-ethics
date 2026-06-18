# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A **SCORM 1.2 compliant e-learning course** about AI ethics, built with the [Adapt Learning](https://www.adaptlearning.org/) framework (v5.31.20). The course follows the AI project lifecycle across 7 pages: Introduction, AI Ethics: The Foundations, Business Understanding, Data Acquisition & Understanding, Modeling, Deployment & Beyond, and Conclusion.

This is a **pre-built static distribution** - all JavaScript and CSS are already compiled and minified. There is no build step or package manager. Changes are made directly to JSON content files and deployed as-is.

## Deployment

Push to `main` to publish to GitHub Pages (the GitHub Actions workflow in [.github/workflows/](github/workflows/) deploys the entire repo root automatically).

- **Standalone (no LMS):** `index.html`
- **LMS/SCORM entry point:** `index_lms.html`
- **Local SCORM testing:** `scorm_test_harness.html` (simulates a cookie-based LMS)

## Content Architecture

Course content is driven entirely by JSON files in [course/en/](course/en/):

| File | Purpose |
|------|---------|
| `course.json` | Course metadata, global nav, and settings |
| `contentObjects.json` | The 7 pages (menu items) |
| `articles.json` | Article containers within pages |
| `blocks.json` | Block groupings within articles |
| `components.json` | All interactive components (~43 total) |

The hierarchy is: **Course → Pages → Articles → Blocks → Components**

Each JSON item has a unique `_id` string. Items reference their parent via `_parentId`. Navigation and completion tracking follow this tree.

`_latestTrackingId` in `course.json` must be incremented when adding new trackable components - it is the high-water mark for SCORM interaction IDs.

## Component Types in Use

Components in `components.json` have a `_component` field identifying their type:

- `text` - narrative content (most common)
- `mcq` - multiple choice questions
- `accordion` - expandable sections
- `narrative` - image+text carousel
- `hotgraphic` - clickable image regions
- `flipcard` - flip card interactions

## Framework Configuration

[course/config.json](course/config.json) controls SCORM tracking and completion behaviour:

- `_requireContentCompleted: true`, `_requireAssessmentCompleted: false` - completion triggers when all content is visited (not when assessments pass)
- `_shouldSubmitScore: true` - scores are still reported to the LMS even though assessment completion is not required
- `_forceRouteLocking: true` - pages must be visited sequentially; learners cannot skip ahead
- The `_spoor` section configures SCORM 1.2 LMS interaction (commit frequency, retry logic, exit state)

[adapt/js/build.min.js](adapt/js/build.min.js) contains the compiled plugin manifest - do not edit this manually.

## Making Content Changes

All content edits go into the JSON files under `course/en/`. Key conventions:

- Component and block `_id` values must remain unique across the entire course
- `_isAvailable` and `_isVisible` flags control what renders
- Assessment components reference an `_assessment` block via `_id`
- Images live in `course/en/assets/` and are referenced by relative path in component JSON

To add a new page: add an entry to `contentObjects.json`, then add corresponding articles/blocks/components referencing that page's `_id` as `_parentId`.

## SCORM Compliance

The course targets **SCORM 1.2**. The manifest is [imsmanifest.xml](imsmanifest.xml). SCORM communication is handled by [libraries/SCORM_API_wrapper.js](libraries/SCORM_API_wrapper.js) (pipwerks wrapper v1.1). Do not modify the SCORM wrapper or manifest structure without verifying LMS compatibility.
