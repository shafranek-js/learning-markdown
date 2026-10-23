# Learning Markdown — Interactive Course

An educational, full-screen Markdown studio with eight guided lessons, a free prompt-writing sandbox, instant preview, six themes, five languages, and certificates.

## Getting started

No build step is required for the original static ES-module application:

```sh
python3 -m http.server 8000
```

Open **http://localhost:8000/**. The ES-module imports require a local HTTP server; do not double-click `index.html` if your browser blocks local-file module imports.

Optionally use Vite for development and bundling:

```sh
npm install
npm run dev
npm run build
```

The `dist/` folder is the deployable Vite output, including a generated offline asset cache.

## Deploy to GitHub Pages

1. Create a repository (for example, `learning-markdown`) and add these project files at the repository root.
2. Push to the `main` branch.
3. Open **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will build and publish the `dist/` output. The project uses relative paths (`./`) for Pages subpaths.

## Course and editor

- **01_01:** Headings & hierarchy — H1, H2, H3.
- **01_02:** Emphasis & tone — bold, italic, strikethrough.
- **01_03:** Lists & prompts — bullets, numbers, at least four items.
- **01_04:** Blockquotes — plain, nested, formatted content.
- **02_01:** Links & images.
- **02_02:** Inline code and language-labeled fenced code blocks.
- **02_03:** GFM tables and task checklists.
- **03_01:** Capstone AI prompt and README.

Shortcuts: Ctrl/Cmd+Z (undo), Ctrl+Y or Ctrl+Shift+Z (redo), Ctrl+1/2/3 (heading), Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link). Keyboard shortcuts use physical key codes for non-English layouts. A compact snapshot history is maintained for each lesson/language draft.

The six themes and all lesson drafts and completion records are stored in `localStorage` (`md_course_state_v1`). Existing progress from the monolithic prototype is migrated when the new storage key is empty. Clear progress in the **Contents → Reset All Progress** menu. No data is transmitted to a server.

## Security and offline support

The preview is generated with bundled **marked.js** (MIT-licensed copy shipped under `vendor/`) and filtered through a local, allowlist-based HTML sanitizer (`js/core/sanitize.js`) that removes active content, scripts, event handlers, and dangerous URL protocols. If DOMPurify is made available on `window`, `preview.js` uses it instead. No arbitrary Markdown HTML is injected into the app without filtering.

The static project includes a Service Worker that precaches local application resources. The Vite postbuild script rewrites the precache list to include fingerprinted build assets. Offline availability begins **after the first successful online load on HTTPS or localhost**; it is not available for `file://` URLs. External image URLs placed in the user’s Markdown may require network access.

For a security-critical public release, replace the fallback sanitizer with a pinned, audited **DOMPurify** bundle and establish a restrictive Content Security Policy. A successful production build and cross-browser smoke-test should be required before launch.

## File organization

- `index.html` — semantic course UI and dialogs.
- `css/` — themes, layout, editor, preview and local utility classes.
- `js/core/` — state, routing, undo/redo, validator and sanitization.
- `js/ui/` — editor, toolbar, resizers, preview, dialogs.
- `js/data/` — eight lessons and interactive cheat sheet.
- `js/i18n/` — localizations for EN, CS, UK, RO, RU.
- `manifest.json`, `sw.js` — installability/offline behavior.
- `.github/workflows/deploy.yml` — automated GitHub Pages publishing.

## Known limitations

- The in-app certificate is issued only after all eight lessons have been completed; it is a learning achievement, **not a formally accredited credential**.
- Draft/history persistence: drafts persist across reloads; undo stacks are in-memory and reset on reload.
- Languages share the same validation rules but use separate initial draft documents, mirroring the original prototype.
- The syntax-highlighted editor uses a lightweight textarea overlay instead of a full programming editor; complex IME/mobile input and typography should be part of future cross-browser QA.

### Licenses

Application source: copyright and license retained by the project owner (no license chosen here). Bundled `vendor/marked.js`: Marked (MIT), copyright retained in that file. Tailwind-derived CSS utilities: Tailwind CSS (MIT), compiled during project preparation. No Google Fonts or external CDNs are required for core use.
