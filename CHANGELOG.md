# Changelog

All notable changes to the Shield Engineering style guide are recorded
here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and the version numbers follow [Semantic Versioning](https://semver.org/):
while the guide is at 0.y.z, a minor bump means a new component, token or
section, a patch means a fix, and anything that renames or removes a
class or token is called out under **Changed** or **Removed** with the
replacement. The version lives in one place, `SG_VERSION` in `shield.js`;
`node tools/check.mjs` fails if it and this file disagree.

## [Unreleased]

## [0.9.0] - 2026-10-05

The release that makes the guide meet its own stated standard: 4.5:1 text
contrast in both themes, named and keyboard-operable controls, and a check
that keeps it that way. Nothing was restyled for its own sake; every value
change below is a contrast fix.

### Added
- `CONTRIBUTING.md`, `LICENSES.md` and this changelog.
- Tokens: `--brand-fill` (the action color as a fill carrying white text),
  `--selected-bg`, `--brand-tint`, `--brand-tint-strong`, `--error-tint`,
  `--error-fill`, `--error-fill-hover`, `--fill-inverse`, `--gold`,
  `--gold-bg`, `--gold-border`. Every value that was a raw hex or rgb() in
  `components.css` now reads one of these.
- Table: `num` class for numeric columns (right-aligned, tabular figures).
- Empty: `shield-empty-title` and `shield-empty-action`, and the three kinds
  of empty state.
- `tools/check.mjs` and a GitHub Action that run it: contrast in both
  themes, no hardcoded colors, snippet classes and tokens resolve, every
  handler exists, version matches this file.
- The theme follows the operating system's light/dark setting until the
  visitor picks one.

### Changed
- **Primary button, checked box, radio dot, switch track, segmented and
  pagination "on", done step, avatar** fill with `--brand-fill` (blue-8,
  6.4:1 with white text) instead of blue-7 (4.0:1). This is the one
  visible change in light mode, and it matches what `tokens.css` already
  said the action color was.
- **Solid Danger button** fills with `--error-fill` (#CF1322, true red,
  5.6:1 with white) instead of `--error`, which is a dark text color and
  rendered the button near-black in light mode.
- **Dark mode action text** (`--brand-blue-dark`: links, active tab,
  selected option, info icon, focus ring) is blue-5 on navy (8.8:1); it was
  blue-8 (2.7:1). Fills are unaffected.
- **Dark mode status text**: warning `#FFE08A` (was `#FAB219`, 3.4:1),
  error `#FF8A85` (was `#DA1111`, 2.7:1), info is blue-4 on a deep blue
  background (was blue-8 on blue-5, 3.2:1). Every mood now measures at
  least 4.8:1 in both themes.
- **`--text-quaternary`** in light mode is `rgba(0,0,0,.56)` (4.9:1) so
  placeholders, group labels and the switch's off track are readable; it
  was `.25` (1.8:1).
- **Gold** text is `#7F6422` in light (5.0:1 on its tint) and `#E6C46A` in
  dark.
- **Form errors** are described in text under the field with a hidden
  "Error:" prefix; the red icon is a second cue, not the only one (WCAG
  2.2 SC 3.3.1). Sample copy says what to enter instead of "valid".
- **Select** is a WAI-ARIA combobox: `role="combobox"`, `aria-expanded`,
  `aria-controls`, `aria-autocomplete`, `aria-activedescendant`; the
  panel is a `listbox` of `option`s with `aria-selected`.
- **Dropdown** is a WAI-ARIA menu button: `menu` / `menuitem` /
  `separator` roles; Down or Enter opens on the first item, arrows move,
  Home/End jump, Escape closes and returns focus.
- **Tabs** panels carry `role="tabpanel"`, `aria-labelledby` and `hidden`;
  tabs carry `aria-controls`.
- **Checkbox, radio and switch** controls have accessible names via
  `aria-labelledby` (a `<label>` does not name a `<span>`); descriptions
  via `aria-describedby`. `sgInitNames()` fills in any row that forgot.
- **Descriptions** is a real `<dl>` with `<dt>`/`<dd>` pairs.
- **Toast stack** is a polite live region, so toasts are announced; toast
  text is set with `textContent`.
- **Password reveal and clear** are `<button>`s with names and
  `aria-pressed`; the eye is a Font Awesome glyph, not an emoji.
- **Escape** inside a modal closes an open popover, menu or select first,
  then the modal.
- Section titles use sentence case (Grid & space, Tag & pill, Avatar &
  badge, Skeleton & spin, Checkbox, radio & switch).
- Sample dates use one format everywhere: `Sep 12, 2026` and
  `Sep 12, 2026, 9:04 AM`.
- Toast copy named `useToast()`; it is `sgPushToast()`.
- The version number is written once (`SG_VERSION`) and stamped into the
  sidebar, cover and footer.

### Removed
- The legacy `sl-` naming map from the `components.css` header (those
  names no longer exist anywhere).
- A stray file named `.png` at the repository root. The two palette
  reference images moved to `source_images/reference/`.
- The three `:root[data-theme="dark"]` overrides in `components.css`,
  replaced by the `--selected-bg` token.

### Fixed
- `components.css` referenced a non-existent `sgTooltipKeys`; the comment
  now points at the Tooltip keydown listener.
- `snippets.js` claimed a validation step that did not exist; it exists
  now (`tools/check.mjs`).
- The Switch demo's label changed with state ("Notifications (off)"); a
  switch label must stay constant.

## [0.8.0] - 2026-10-05

- Engineer Mode: a code panel under every section with copy-paste HTML and
  the tokens involved.
- New components and foundations: Motion, Logo & brand, Responsive
  behavior (live iframe), Radio group, Date picker, File upload, Form
  layout, Drawer, Tooltip, Popover, Steps with per-step state, Breadcrumb,
  Pagination, table sorting and selection with a bulk bar, app shell.
- Dark mode moved to deep midnight-blue surfaces with off-white text;
  light-mode borders softened; page color warmed to `#FFFBF7`.
- Larger type scale (16px body), rewritten page copy, palette cover bar.

## Earlier

Before 0.8 the guide was rebuilt from the hand-rolled component library
(2026-09-28), switched its icon set to Font Awesome Classic Solid, was
rebranded from Shield Legal to Shield Engineering, and gained self-hosted
Fraunces and Satoshi. See `git log` for the individual steps.
