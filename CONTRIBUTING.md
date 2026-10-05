# Contributing to the Shield Engineering style guide

The guide is the written standard for how Shield products look and
behave. Changing it changes every product that follows it, so a change is
a proposal, a review and a release, not an edit. The full process, with
the reasoning, is the **How this guide changes** section of `index.html`;
this file is the short version for people opening a pull request.

## Before you start

1. Open `index.html` in a browser (it works from disk, no server) and read
   the section you want to change, with Engineer Mode on so you see the
   snippet and tokens it exposes.
2. Check `CHANGELOG.md` and open pull requests so you are not proposing
   something already in flight.
3. If the change is more than a wording fix, open an issue first and say
   what problem it solves. A rule the guide does not state yet is a
   proposal; a rule that is stated and wrong is a bug.

## Making the change

- **Tokens first.** A new color, size or duration is a token in
  `tokens.css`, with a comment that says what it is for, before anything
  in `components.css` uses it. Never write a raw hex, rgb() or pixel value
  in a component rule.
- **Both themes.** Any color change is checked in light and dark. If a
  value needs to differ, add it to the dark block; do not add a
  `:root[data-theme="dark"]` override in `components.css`.
- **Measure, do not guess.** Any text / background pair must be 4.5:1 or
  better (WCAG 2.2 SC 1.4.3), non-text marks 3:1 (SC 1.4.11). Add the pair
  to `PAIRS` in `tools/check.mjs` so it stays measured.
- **Name, role, value.** Anything interactive has an accessible name, a
  role and a state that a screen reader can read. Use the WAI-ARIA
  Authoring Practices pattern for the component you are building; the
  Select, Tabs, Dialog and Checkbox sections show how.
- **Keep the demo and the snippet in step.** If you change markup in
  `index.html`, change the matching entry in `snippets.js`, and vice versa.
- **Write in the guide's voice.** Plain sentences, sentence case, the
  reason next to the rule. End a new section with a Sources list that
  links the standard or system the rule comes from.
- **Update the copy that quotes a number.** The Color section states
  contrast ratios; `tokens.css` comments repeat them. If you change a
  value, change the words.

## Before you open the pull request

```bash
node tools/check.mjs
```

It must pass. It re-measures contrast in both themes, rejects hardcoded
colors in `components.css`, verifies every class and token a snippet names,
confirms every `sg*` handler exists, and checks that the version in
`shield.js` matches the newest `CHANGELOG.md` entry. The same script runs
in GitHub Actions on every push and pull request.

Then add a line to `CHANGELOG.md` under **Unreleased**, in plain English,
saying what changed and why.

## Releasing

Versions follow semantic versioning:

| Bump | When |
| --- | --- |
| **Patch** (0.9.0 → 0.9.1) | Copy, comments, a visual fix that does not change any token value, class name or behavior a product depends on. |
| **Minor** (0.9.0 → 0.10.0) | A new component, token, section or modifier class. Existing names and values keep working. |
| **Major** (0.9.0 → 1.0.0) | A token or class is renamed or removed, or a value changes in a way products must react to (a spacing step, a breakpoint, the primary fill). |

To release: set `SG_VERSION` in `shield.js`, move the **Unreleased** notes
in `CHANGELOG.md` under a dated heading with that version, run the check,
and tag the commit `vX.Y.Z`. Anything removed must have been marked
deprecated (in the guide and the changelog) for at least one minor release
first.

## Review

A change to this guide needs two approvals: one from engineering (the
rule can be built and the check passes) and one from whoever owns design
for the product (the rule is the right rule). Code owners for this
repository are the people in `.github/CODEOWNERS` once the guide moves to
the organization; until then the repository owner reviews.
