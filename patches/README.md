# pnpm patches

## `eslint-plugin-react@7.37.5`

Upstream still declares `eslint@^9.7` as its max peer (`7.37.5` on npm, checked 2026-06-24).
ESLint 10 removed `context.getFilename()` and `context.getSourceCode()` without fallbacks.

The patch switches three call sites to:

```js
context.getFilename?.() ?? context.filename
context.getSourceCode?.() ?? context.sourceCode
```

Remove this patch when `eslint-plugin-react` publishes official ESLint 10 support.
