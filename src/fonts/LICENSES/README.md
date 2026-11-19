# Font sources and licences

The profile redesign's fonts (umbrella plan `process/features/profile-site-redesign/`,
Phase 0). Each file is the woff2 subset Google Fonts serves for the family,
downloaded on 18-11-26 from `https://fonts.gstatic.com/s/<family>/<version>/`
through the CSS2 API (`fonts.googleapis.com/css2`, Chrome user agent). The
`unicode-range` of each `@font-face` in `src/styles/fonts.css` is copied from
that same response. All four families are under the SIL Open Font License 1.1;
the licence texts beside this file come from the `google/fonts` repository
(`ofl/<family>/OFL.txt`).

| File | Family | Style | Subset | Version | Bytes | SHA-256 |
| --- | --- | --- | --- | --- | --- | --- |
| `instrument-serif-latin.woff2` | Instrument Serif | normal | latin | v5 | 15040 | `60c06664b5a95c7de6cc3e00d1f9034d78bd1e40b564016b241674449a067d4d` |
| `instrument-serif-latin-ext.woff2` | Instrument Serif | normal | latin-ext | v5 | 7828 | `a8c4bd7cd7073180e740d2d83a616b5cb0845579b73207eeafeae8532e70c901` |
| `instrument-serif-italic-latin.woff2` | Instrument Serif | italic | latin | v5 | 15684 | `6ee678c33f388dd7ba59700ebea635deb98821baafd817b09891f7927177f702` |
| `instrument-serif-italic-latin-ext.woff2` | Instrument Serif | italic | latin-ext | v5 | 8444 | `a04fc7ed18a8037149ce0bfda58076709d8e0840e136ed00abbdc196b7992443` |
| `onest-latin.woff2` | Onest | normal | latin | v11 | 33808 | `cc61cbd632bb677cd55f0eec9ebdd3e1525c5f30904cbf0769e2ac50d0fba992` |
| `onest-latin-ext.woff2` | Onest | normal | latin-ext | v11 | 28428 | `f72bdc75595bf844f68b15e18dae7eb4f5829b633c402201c8e036d1dfc5f17b` |
| `onest-cyrillic.woff2` | Onest | normal | cyrillic | v11 | 15828 | `c3f4223046fb9623a0e92414d2834745cbebb260742e049aff103018b991fd47` |
| `onest-symbols.woff2` | Onest | normal | symbols | v11 | 18164 | `5977fb8a281a636793b099a3929ad9919e38af52c494a45603930e4a3b4ecc7c` |
| `jetbrains-mono-latin.woff2` | JetBrains Mono | normal | latin | v24 | 40480 | `1e06740a02a443fb7f3eeda8fcaa685a0f6c620e3f01e6666e847295469ce3ad` |
| `jetbrains-mono-latin-ext.woff2` | JetBrains Mono | normal | latin-ext | v24 | 15204 | `7db7affbce1fdee69c1ffc2641bbca289b049867f524c9d861fe35ab6670bf29` |
| `patrick-hand-latin.woff2` | Patrick Hand | normal | latin | v25 | 14224 | `42156e008dd5fc3000679ff4e9ba9cbd3f417b6317c6dcbe11a12e9c87a09b28` |
| `patrick-hand-latin-ext.woff2` | Patrick Hand | normal | latin-ext | v25 | 10604 | `670f39d1fb3f168229c65b6af8b9016a61915731709c8a1da689e74394bc666f` |

Notes:

- `onest-symbols.woff2` is declared for the arrows only (`U+2190-2199`), so
  "→" renders in Onest and the file loads only on pages that show an arrow.
- Fallback faces (`Onest Fallback` on Arial, `Instrument Serif Fallback` on
  Times New Roman, `JetBrains Mono Fallback` on Courier New) use the metric
  overrides that next/font computes from `@capsizecss/metrics` 4.5.0, as the
  Noto Sans Thai fallback does. Patrick Hand has none: it loads
  only with the notebook.
