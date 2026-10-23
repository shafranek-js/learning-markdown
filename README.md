# Learning Markdown — Interactive Course

An educational, full-screen Markdown studio with eight guided lessons, a free prompt-writing sandbox, instant preview, six themes, five languages, and certificates.

## Getting started

The browser app uses the **pinned modern marked 18.1.1 parser**, bundled locally by Vite.
Install dependencies and launch the development server:

```sh
npm install
npm run dev
```

Then open the Vite address shown in the terminal (usually http://localhost:5173/).

Run production tests and build:

```sh
npm test
npm run build
npm run preview
```

The `dist/` directory contains the entire deployable offline-first application and can be served by any static hosting provider. A bare `python -m http.server` from the **source directory** no longer resolves the npm dependency; build first and serve `dist/` for standalone hosting.

The legacy `vendor/marked.js` source remains in the repository **only as a pinned historical comparison baseline** for the upstream conformance audit. Production preview, examples and smoke tests all use marked 18.1.1.

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


## Markdown syntax profiles (v1.1)

The toolbar provides **H1–H6** (Ctrl+1 through Ctrl+6) and a **Standard** selector.
The selected profile is saved locally and added to the shareable URL fragment.
Switching modes immediately re-renders the same Markdown document **without modifying the text**.

- **GFM · GitHub** (default): CommonMark-style Markdown with GitHub tables, task lists,
  strikethrough and extended autolinks. The default uses `breaks: false`,
  matching Markdown-file soft breaks, not GitHub comment formatting.
- **CommonMark**: `marked` with `gfm: false, pedantic: false`. No GFM-specific
  tables, task list checkboxes or strikethrough. It is a CommonMark-compatible
  learning preview, **not** a certification of exact spec compliance.
- **Original · Legacy**: `marked` with `pedantic: true` and GFM disabled.
  This is approximate compatibility with John Gruber's original `markdown.pl`,
  **not** the original parser or an independent normative standard.

All profiles use the same HTML sanitization policy. Raw HTML is deliberately restricted
for security and may differ from unfiltered Markdown interpreters.

The built-in 8-lesson curriculum teaches some GFM-only features (strikethrough,
tables and task lists). Those checks require GFM; other profiles display an
explanation rather than incorrectly marking unsupported constructs as complete.
The first lesson now practices all six ATX heading levels.

Further reference:
- [Markdown Guide Basic Syntax](https://www.markdownguide.org/basic-syntax/)
- [CommonMark specification](https://spec.commonmark.org/)
- [GitHub Flavored Markdown specification](https://github.github.com/gfm/)
- [Original Markdown syntax](https://daringfireball.net/projects/markdown/syntax)

The included `npm test` script checks dialect differences, all six heading levels,
localized lesson solutions and cheat-sheet coverage. GitHub Actions runs it before building.

## Deep Practice (Basic Syntax coverage)

Each of the eight lessons includes two **optional** additional exercises in the collapsible Lesson Guide:
Setext H1/H2; combined bold+italic and hard breaks; nested lists and escaped list numbers;
multi-paragraph blockquotes and quoted headings; reference links and email autolinks;
indented code blocks and double-backtick inline code; alternative horizontal rules and escaped punctuation;
images with alt/title and safe inline HTML.

These drills are verified against actual rendered Markdown HTML. They work in the **same editor**, have
an insertable example, and do not change the original eight-lesson certificate or previously saved progress.
The expanded/collapsed state is persisted locally.

## Curated CommonMark/GFM regression corpus

`npm test` runs both the course exercises and a curated suite of 30 syntax examples
covering CommonMark 0.31.2 and GFM features. These are intentionally targeted smoke/regression
examples, not the complete official specification fixture suite. Future compatibility claims
must distinguish best-effort rendering via `marked` from exact spec conformance.

### Official upstream conformance report

An independent [GitHub Actions workflow](.github/workflows/conformance.yml) downloads two **pinned** official spec fixture sets: CommonMark 0.31.2 (652 cases) and GFM 0.29 from pinned cmark-gfm revision (648 cases). It compares the bundled parser against every official example, writes per-section summary plus individual differences, and uploads a JSON and Markdown artifact. The audit is informational, does not block publishing, and is **not certification**. It compares exact HTML before safety sanitization; harmless serializer differences may be reported as failures.

### Browser-level UX checks

The independent `Markdown browser UX QA` workflow runs Playwright Chromium tests against the production Vite build: headings, table rendering, dialect changes, Insert snippet controls, undo/redo, language/theme persistence, optional practice, cheat sheet, and mobile navigation. Run locally with `npm install && npm run build && npx playwright install chromium && npm run test:e2e`. The workflow reports test results without blocking the main GitHub Pages deployment.

### Conformance classification

Official example audits now classify mismatches as exact HTML, DOM-equivalent markup, attribute differences, whitespace, textual differences, structural differences, and parser errors. DOM-equivalent comparisons use the HTML5 parser `parse5` and account for entity and attribute ordering normalization. **Other categories are diagnostic and may include false positives.** Summary and examples appear in the GitHub Actions log; exhaustive details are saved in the report artifact. The eight-lesson production smoke/browser tests remain the publication gate.

## Advanced Formatting — Phase 1 (optional HTML)

The compact **HTML / Advanced** toggle opens a physically separate toolbar for safe raw HTML authoring: underline, subscript, superscript, highlighted text and native expandable details. The Lesson Guide also includes a separate, optional **Beyond Markdown · HTML Lab** with examples. Both controls are localized in EN/CS/UK/RO/RU and their expanded/collapsed states persist independently.

Raw HTML is **not an interoperable Markdown formatting standard**: GFM/CommonMark allow HTML syntax in certain contexts, but hosting platforms may filter it. The app sanitizer permits only safe semantic tags for this phase; scripts, event attributes and arbitrary inline styles remain forbidden. Tools write editable HTML into the Markdown source and are undoable; existing eight-lesson completion and certificate remain unchanged. The remaining Word-like functionality and full advanced lessons are tracked in [Epic #1](https://github.com/shafranek-js/learning-markdown/issues/1).

## Advanced Formatting — Issue #2: safe typography and paragraph presets

The separate Advanced HTML toolbar now includes fixed presets for foreground and
background colors, font families/sizes, paragraph alignment, indentation,
line-height and print/PDF page breaks. All controls are labeled in five supported
languages and insert editable HTML with `af-*` class tokens, never inline `style`.
Only allowlisted class names survive the preview sanitizer. User-provided
script/event handlers, arbitrary classes and CSS are removed. Preset choices
and toolbar visibility persist locally without affecting eight-lesson progress.

HTML downloads are self-contained, with bundled advanced/preview CSS and
print-only page breaks, while `.md` remains a plain-text export. Other Markdown
renderers may strip the HTML classes, so styled output is **not portable Markdown**.
