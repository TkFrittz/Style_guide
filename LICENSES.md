# Third-party assets and their licenses

Everything the guide ships is either Shield's own or covered by one of the
licenses below. If you add an asset, add a row here and keep its license
file or notice alongside it.

| Asset | Where it lives | License | What it allows | Attribution required |
| --- | --- | --- | --- | --- |
| Fraunces (variable font, latin and latin-ext subsets) | `fonts/Fraunces-*.woff2` | SIL Open Font License 1.1 | Use, embed, self-host and redistribute, including commercially; the font may not be sold on its own and derivative fonts may not use the Reserved Font Name. | No, but keep the OFL notice: https://scripts.sil.org/OFL |
| Satoshi (variable font) | `fonts/Satoshi-Variable.woff2` | Fontshare / Indian Type Foundry **Free Font License (ITF FFL)** | Free for personal and commercial use, including self-hosting on a website. The FFL **does not permit redistributing the font files on their own**. Keeping the `.woff2` in a public repository is a gray area under that clause. | Read the license before this repo becomes public under the company name: https://www.fontshare.com/licenses/itf-ffl. If in doubt, serve Satoshi from Fontshare's CDN instead of committing the file, or confirm the clause with Fontshare. |
| Font Awesome Free 6 (Classic Solid icons, one Regular glyph) | Inlined `<svg>` paths in `index.html`, `shield.js`, `snippets.js` | Icons: CC BY 4.0. (Font Awesome's own fonts: SIL OFL 1.1; code: MIT.) | Use and embed the SVG paths, including commercially. Attribution is required for CC BY. | Yes. The Icons section of the guide credits Font Awesome and links the pack; keep that credit in any product that ships the paths. https://fontawesome.com/license/free |
| Shield Engineering mark | `source_images/Shield_Engineering_Icon.png` | Shield Legal, all rights reserved | Internal use in Shield products and documents per the Logo & brand section. | n/a |
| Palette reference images | `source_images/reference/*.png` | Shield Legal, internal working files | Reference only; not used by the guide at runtime. | n/a |

## The guide itself

`index.html`, `tokens.css`, `components.css`, `shield.js`, `snippets.js`,
`responsive-demo.html` and `tools/check.mjs` are Shield Legal internal
material. They are not licensed for use outside Shield Legal and its
engineering partners unless a LICENSE file is added to this repository that
says otherwise.
