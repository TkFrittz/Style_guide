#!/usr/bin/env node
/* =====================================================================
   Shield Engineering style guide — token export
   =====================================================================

   WHAT THIS FILE IS
   Reads tokens.css (the source of truth) and writes tokens.json in the
   Design Tokens Community Group format (https://www.designtokens.org/
   TR/drafts/format/), so design tools and other platforms can read the
   same values the browser reads. Run it after changing tokens.css:

       node tools/export-tokens.mjs

   HOW IT MAPS
   - Each --name becomes a token under a group chosen from its name
     (color, space, radius, shadow, font, duration, ease, z, misc).
   - var(--other) references become DTCG aliases: "{color.blue-8}".
   - Light values are the token's $value. Dark overrides from the
     :root[data-theme="dark"] block are kept under
     $extensions["com.shieldlegal.theme"].dark, since the format has no
     built-in notion of modes yet.
   - $type is inferred: color, dimension, duration, cubicBezier, number,
     fontFamily, fontWeight, shadow.
   The file is generated: edit tokens.css, not tokens.json.
   ===================================================================== */

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

function block(selector) {
  const start = css.search(new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{"));
  const open = css.indexOf("{", start);
  let depth = 0, i = open;
  for (; i < css.length; i++) { if (css[i] === "{") depth++; else if (css[i] === "}" && --depth === 0) break; }
  return css.slice(open + 1, i);
}
const parse = (b) => Object.fromEntries([...b.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const light = parse(block(":root"));
const dark = parse(block(':root[data-theme="dark"]'));

function group(name) {
  if (/^--(blue|brand|bg|sider|text|border|fill|selected|success|warning|error|info|gold|scrim)/.test(name)) return "color";
  if (/^--space-/.test(name)) return "space";
  if (/^--radius-/.test(name)) return "radius";
  if (/^--shadow-/.test(name)) return "shadow";
  if (/^--font-size/.test(name)) return "font.size";
  if (/^--font-/.test(name)) return "font.family";
  if (/^--weight-/.test(name)) return "font.weight";
  if (/^--duration-/.test(name)) return "duration";
  if (/^--ease/.test(name)) return "ease";
  if (/^--z-/.test(name)) return "z";
  return "misc";
}
function type(g, v) {
  if (g === "color") return "color";
  if (g === "space" || g === "radius" || g === "font.size") return "dimension";
  if (g === "shadow") return "shadow";
  if (g === "font.family") return "fontFamily";
  if (g === "font.weight") return "fontWeight";
  if (g === "duration") return "duration";
  if (g === "ease") return "cubicBezier";
  if (g === "z") return "number";
  return /^\d/.test(v) ? "number" : "string";
}
// Convert one CSS value into a DTCG $value for its type.
function value(t, v) {
  const alias = v.match(/^var\((--[a-z0-9-]+)\)$/);
  if (alias) return `{${group(alias[1])}.${alias[1].slice(2)}}`;
  if (t === "dimension" || t === "duration") { const m = v.match(/^([\d.]+)(px|rem|s|ms)$/); return m ? { value: +m[1], unit: m[2] } : v; }
  if (t === "number" || t === "fontWeight") return isNaN(+v) ? v : +v;
  if (t === "fontFamily") return v.split(",").map((f) => f.trim().replace(/^"|"$/g, ""));
  if (t === "cubicBezier") { const m = v.match(/^cubic-bezier\(([^)]+)\)$/); return m ? m[1].split(",").map(Number) : v; }
  if (t === "shadow") {
    return v.split(/,(?![^(]*\))/).map((layer) => {
      const m = layer.trim().match(/^(-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (-?[\d.]+)px (.+)$/);
      return m ? { offsetX: { value: +m[1], unit: "px" }, offsetY: { value: +m[2], unit: "px" }, blur: { value: +m[3], unit: "px" }, spread: { value: +m[4], unit: "px" }, color: m[5] } : layer.trim();
    });
  }
  return v;
}

const out = {
  $description: "Shield Engineering design tokens, exported from tokens.css by tools/export-tokens.mjs. Do not edit; edit tokens.css. Dark-mode values are under $extensions.com.shieldlegal.theme.dark.",
};
for (const [name, v] of Object.entries(light)) {
  const g = group(name), t = type(g, v);
  let node = out;
  for (const part of g.split(".")) node = node[part] ??= {};
  const token = { $type: t, $value: value(t, v) };
  if (name in dark) token.$extensions = { "com.shieldlegal.theme": { dark: value(t, dark[name]) } };
  node[name.slice(2)] = token;
}
writeFileSync(join(root, "tokens.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`tokens.json written: ${Object.keys(light).length} tokens, ${Object.keys(dark).length} with dark values`);
