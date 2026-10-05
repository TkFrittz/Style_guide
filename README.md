# Shield Engineering style guide

The visual and interaction standard for Shield Legal's operations
software: colors, type, spacing, motion, components, writing rules, data
formats, page patterns, and the accessibility bar they all meet. It is a
single static page with no build step, and every demo on it is a working
component.

**Open it:** double-click `index.html`, or serve the folder with anything
(`python -m http.server`, `npx serve`). Nothing is fetched from the
network; fonts are self-hosted.

**Current version:** see the sidebar, or `SG_VERSION` in `shield.js`.
`CHANGELOG.md` says what changed in each release.

## What is in the folder

| File | What it is |
| --- | --- |
| `index.html` | The guide. Each section is a component or a rule set, with a live demo, a spec line and, where a rule rests on a standard, a Sources list. |
| `tokens.css` | The design tokens: every color, size, shadow, duration and layer, with light values on `:root` and dark values under `:root[data-theme="dark"]`. The single source of truth. |
| `components.css` | The component styles. One class per component, `shield-` prefixed, reading only tokens. |
| `shield.js` | The interactions on the page (select, modal, tabs, menus, theme), plus the ARIA safety nets and the version stamp. Plain JavaScript, `sg`-prefixed functions wired from markup. |
| `snippets.js` | The copy-paste HTML and token list shown under each section when Engineer Mode is on. |
| `responsive-demo.html` | The page loaded in the Responsive behavior iframe so the real media queries run at a chosen width. |
| `fonts.css`, `fonts/` | Fraunces and Satoshi as self-hosted variable fonts. |
| `tokens.json` | Generated from `tokens.css` by `tools/export-tokens.mjs`, in the Design Tokens Community Group format, for design tools and other platforms. |
| `tools/check.mjs` | The checks that keep the guide honest (below). |
| `.github/workflows/check.yml` | Runs the checks on every push and pull request. |
| `CHANGELOG.md`, `CONTRIBUTING.md`, `LICENSES.md` | What changed, how to change it, and what the third-party assets allow. |
| `source_images/` | The brand mark and the palette reference images. |

## Using it in a product

1. Load `tokens.css` and `components.css` (and `fonts.css` with the
   `fonts/` folder) before your own styles.
2. Switch on **Engineer Mode** in the guide's sidebar: every section shows
   the markup to paste and the tokens it reads. Copy the `sg*` helper that
   goes with it from `shield.js`, or wire your framework's state to the
   same classes and ARIA attributes.
3. Set `data-theme="dark"` on `<html>` for dark mode, or leave it off and
   follow `prefers-color-scheme` the way `shield.js` does.
4. Compose screens from the **Page patterns** section, write copy by the
   **Writing** section, format values by **Data formats**, and run the
   review checklist in **Accessibility conformance** before shipping.

Pin a version. Read the changelog when you move. Open an issue, not a
local override, when a screen needs something the guide does not have.

## Checks

```bash
node tools/check.mjs
```

Measures every text/background pair in both themes against WCAG 2.2
(4.5:1 text, 3:1 non-text), rejects hardcoded colors in `components.css`,
confirms every class and token a snippet names exists, confirms every
`sg*` handler called from markup is defined, and checks that the version in
`shield.js` matches the newest changelog entry. The GitHub Action runs the
same script.

```bash
node tools/export-tokens.mjs
```

Regenerates `tokens.json` from `tokens.css`. Run it whenever a token
changes and commit both.

## Changing the guide

Read `CONTRIBUTING.md`, and the **How this guide changes** section of the
guide for the reasoning: roles, the proposal path, semantic versioning,
the deprecation lifecycle, release cadence and what 1.0 means.

## Status

Release candidate. The open items before 1.0 are listed in the guide under
**Accessibility conformance** (one decision on border contrast) and
**Logo & brand** (the missing brand assets), and in **How this guide
changes** under "What 1.0 means".
