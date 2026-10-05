#!/usr/bin/env node
/* =====================================================================
   Shield Engineering style guide — consistency checks
   =====================================================================

   WHAT THIS FILE IS
   One script, no dependencies, that re-measures the promises the guide
   makes in its own copy. Run it before a commit:

       node tools/check.mjs

   It exits non-zero on any failure, and .github/workflows/check.yml runs
   it on every push and pull request. It checks four things:

   1. CONTRAST. Every text / background pair the guide relies on, in both
      themes, must measure 4.5:1 or better (WCAG 2.2 SC 1.4.3). Values are
      read from tokens.css, var() references are resolved, and translucent
      colors are composited onto the surface they sit on. The pairs are
      listed in PAIRS below; add a line when you add a token that carries
      text.
   2. HARDCODED COLORS. components.css must not contain a raw hex or rgb()
      color outside a short allowlist (#fff on solid fills, the pure-black
      shadow stops). Everything else must be a var(--token).
   3. SNIPPETS. Every shield- class and every --token named in snippets.js
      must exist in components.css / index.html and tokens.css.
   4. WIRING. Every sg* function called from index.html, snippets.js or
      responsive-demo.html must be defined in shield.js, and the version
      stamped by shield.js must match CHANGELOG.md's newest entry.
   ===================================================================== */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(join(root, f), "utf8");
const tokensCss = read("tokens.css");
const componentsCss = read("components.css");
const indexHtml = read("index.html");
const snippetsJs = read("snippets.js");
const shieldJs = read("shield.js");
const demoHtml = read("responsive-demo.html");
let changelog = "";
try { changelog = read("CHANGELOG.md"); } catch {}

const failures = [];
const fail = (msg) => failures.push(msg);
const ok = (msg) => console.log("  ok   " + msg);

/* ---------- 1. Contrast ---------- */

// Split tokens.css into the light block (:root {...}) and the dark override block.
// Comments are stripped first so a selector mentioned in prose is not mistaken for the rule.
function tokenBlock(src, selector) {
  src = src.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = src.search(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{"));
  if (start < 0) return "";
  const open = src.indexOf("{", start);
  let depth = 0, i = open;
  for (; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) break;
  }
  return src.slice(open + 1, i);
}
function parseTokens(block) {
  const out = {};
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of clean.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) out[m[1]] = m[2].trim();
  return out;
}
const light = parseTokens(tokenBlock(tokensCss, ":root"));
const darkOverrides = parseTokens(tokenBlock(tokensCss, ':root[data-theme="dark"]'));
if (!Object.keys(darkOverrides).length) fail("tokens  could not find the :root[data-theme=\"dark\"] block in tokens.css");
const dark = { ...light, ...darkOverrides };

function resolve(tokens, value, depth = 0) {
  if (depth > 10) throw new Error("token loop: " + value);
  const m = value.match(/^var\((--[a-z0-9-]+)\)$/);
  if (m) {
    if (!(m[1] in tokens)) throw new Error("unknown token " + m[1]);
    return resolve(tokens, tokens[m[1]], depth + 1);
  }
  return value;
}
// Returns [r, g, b, a] from #rgb, #rrggbb, #rrggbbaa, rgb(), rgba().
function parseColor(v) {
  v = v.trim();
  let m;
  if ((m = v.match(/^#([0-9a-f]{3})$/i))) return [...m[1]].map((c) => parseInt(c + c, 16)).concat([1]);
  if ((m = v.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i))) {
    const h = m[1];
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).concat([m[2] ? parseInt(m[2], 16) / 255 : 1]);
  }
  if ((m = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/))) {
    return [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  }
  throw new Error("cannot parse color " + v);
}
const color = (tokens, name) => parseColor(resolve(tokens, name.startsWith("--") ? tokens[name] : name));
// Composite a translucent color onto an opaque one.
function over(fg, bg) {
  const a = fg[3];
  return [0, 1, 2].map((i) => fg[i] * a + bg[i] * (1 - a)).concat([1]);
}
function luminance([r, g, b]) {
  const ch = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}
function contrast(fg, bg) {
  const l1 = luminance(fg), l2 = luminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

// [text, background, surface the background sits on (for translucent backgrounds), minimum]
// A minimum of 3 is the WCAG 1.4.11 bar for non-text marks; 4.5 is 1.4.3 for text.
const PAIRS = [
  // body text on the three surfaces
  ["--text", "--bg-container", null, 4.5],
  ["--text", "--bg-layout", null, 4.5],
  ["--text", "--bg-elevated", null, 4.5],
  ["--text-secondary", "--bg-container", null, 4.5],
  ["--text-tertiary", "--bg-container", null, 4.5],
  ["--text-quaternary", "--bg-container", null, 4.5],   // placeholders and group labels are text
  ["--text-tertiary", "--bg-layout", null, 4.5],
  // the four moods: text on its own background, and the text alone on the card
  ["--success", "--success-bg", "--bg-container", 4.5],
  ["--warning", "--warning-bg", "--bg-container", 4.5],
  ["--error", "--error-bg", "--bg-container", 4.5],
  ["--info", "--info-bg", "--bg-container", 4.5],
  ["--success", "--bg-container", null, 4.5],
  ["--warning", "--bg-container", null, 4.5],
  ["--error", "--bg-container", null, 4.5],
  ["--info", "--bg-container", null, 4.5],
  ["--gold", "--gold-bg", "--bg-container", 4.5],
  // the action color as text, and white on the action fills
  ["--brand-blue-dark", "--bg-container", null, 4.5],
  ["--brand-blue-dark", "--bg-layout", null, 4.5],
  ["--brand-blue-dark", "--selected-bg", "--bg-elevated", 4.5],
  ["#ffffff", "--brand-fill", null, 4.5],
  ["#ffffff", "--blue-9", null, 4.5],
  ["#ffffff", "--error-fill", null, 4.5],
  ["#ffffff", "--error-fill-hover", null, 4.5],
  // tooltip text on the spotlight surface
  ["--bg-container", "--bg-spotlight", "--bg-layout", 4.5],
  // non-text marks: the error icon, the focus ring, the switch's off track
  ["--error-solid", "--bg-container", null, 3],
  ["--brand-blue-dark", "--bg-container", null, 3],
  ["--text-quaternary", "--bg-container", null, 3],
];

console.log("Contrast (WCAG 2.2 SC 1.4.3 text 4.5:1, SC 1.4.11 non-text 3:1)");
for (const [theme, tokens] of [["light", light], ["dark", dark]]) {
  for (const [fgName, bgName, surfaceName, min] of PAIRS) {
    try {
      let bg = color(tokens, bgName);
      if (bg[3] < 1) bg = over(bg, surfaceName ? color(tokens, surfaceName) : color(tokens, "--bg-container"));
      let fg = color(tokens, fgName);
      if (fg[3] < 1) fg = over(fg, bg);
      const ratio = contrast(fg, bg);
      const label = `${theme.padEnd(5)} ${fgName} on ${bgName}: ${ratio.toFixed(2)}:1 (min ${min})`;
      if (ratio + 1e-9 < min) fail("contrast  " + label); else ok(label);
    } catch (e) {
      fail(`contrast  ${theme} ${fgName} on ${bgName}: ${e.message}`);
    }
  }
}

/* ---------- 2. Hardcoded colors in components.css ---------- */

console.log("\nHardcoded colors in components.css");
{
  const noComments = componentsCss.replace(/\/\*[\s\S]*?\*\//g, "");
  const allow = [/#fff\b/i, /rgba\(0,\s*0,\s*0,\s*0?\.\d+\)/, /color-mix\(/];
  const lines = noComments.split("\n");
  let count = 0;
  lines.forEach((line, i) => {
    const raw = line.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi) || [];
    for (const hit of raw) {
      if (allow.some((re) => re.test(hit))) continue;
      count++;
      fail(`hardcoded  components.css:${i + 1}: ${hit}  (use a var(--token) from tokens.css)`);
    }
  });
  if (!count) ok("no raw colors outside the allowlist (#fff on fills, black shadow stops)");
}

/* ---------- 3. Snippets name real classes, tokens and sections ---------- */

console.log("\nSnippets");
{
  const cssClasses = new Set([...componentsCss.matchAll(/\.(shield-[a-z0-9-]+)/g)].map((m) => m[1]));
  const htmlClasses = new Set();
  for (const m of indexHtml.matchAll(/class="([^"]+)"/g)) for (const c of m[1].split(/\s+/)) if (c.startsWith("shield-")) htmlClasses.add(c);
  const snippetClasses = new Set([...snippetsJs.matchAll(/(?:class="|\.)(shield-[a-z0-9-]+)/g)].map((m) => m[1]));
  let bad = 0;
  for (const c of snippetClasses) if (!cssClasses.has(c) && !htmlClasses.has(c)) { bad++; fail(`snippet  class .${c} is not defined in components.css`); }
  for (const c of htmlClasses) if (!cssClasses.has(c)) { bad++; fail(`index.html  class .${c} has no rule in components.css`); }
  const defined = new Set([...tokensCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const snippetTokens = new Set([...snippetsJs.matchAll(/(--[a-z0-9]+(?:-[a-z0-9]+)*)/g)].map((m) => m[1]));
  for (const t of snippetTokens) {
    if (/^--col-/.test(t)) continue; // set per element by the grid, not in tokens.css
    if (!defined.has(t)) { bad++; fail(`snippet  token ${t} is not defined in tokens.css`); }
  }
  // every snippet key is a section id in index.html
  const keys = [...snippetsJs.matchAll(/^\s{2}([a-z]+):\s*\{/gm)].map((m) => m[1]);
  for (const k of keys) if (!indexHtml.includes(`<section id="${k}"`)) { bad++; fail(`snippet  key "${k}" has no <section id="${k}"> in index.html`); }
  if (!bad) ok(`${snippetClasses.size} classes, ${snippetTokens.size} tokens and ${keys.length} section keys all resolve`);
}

/* ---------- 4. Wiring and version ---------- */

console.log("\nWiring");
{
  const called = new Set([...(indexHtml + snippetsJs + demoHtml).matchAll(/\b(sg[A-Z][A-Za-z]+)\(/g)].map((m) => m[1]));
  const defined = new Set([...shieldJs.matchAll(/function (sg[A-Za-z]+)\(/g)].map((m) => m[1]));
  let bad = 0;
  for (const f of called) if (!defined.has(f)) { bad++; fail(`wiring  ${f}() is called from markup but not defined in shield.js`); }
  if (!bad) ok(`${called.size} sg* handlers called from markup are all defined`);

  const v = shieldJs.match(/const SG_VERSION = "([^"]+)"/);
  if (!v) fail("version  SG_VERSION not found in shield.js");
  else {
    const cl = changelog.match(/^## \[?v?([0-9]+\.[0-9]+\.[0-9]+)/m);
    if (!cl) fail("version  CHANGELOG.md has no '## x.y.z' entry");
    else if (cl[1] !== v[1]) fail(`version  shield.js says ${v[1]} but CHANGELOG.md's newest entry is ${cl[1]}`);
    else ok(`version ${v[1]} matches CHANGELOG.md`);
    if (/v0\.\d(?:\.\d)?\b/.test(indexHtml.replace(/data-sg-version>v[^<]*/g, ""))) fail("version  index.html still has a hand-typed version number; use <span data-sg-version>");
  }
}

/* ---------- Result ---------- */

console.log("");
if (failures.length) {
  console.error(`${failures.length} check(s) failed:\n`);
  for (const f of failures) console.error("  FAIL " + f);
  process.exit(1);
} else {
  console.log("All checks passed.");
}
