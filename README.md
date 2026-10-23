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

## Advanced Formatting — Rich HTML templates (Issue #3)

The dedicated Advanced ribbon now has three translated menus (EN/CS/UK/RO/RU):
rich tables, informational blocks/anchors and list numbering. Table templates
provide `colspan` and `rowspan` examples, colored cells, invisible borders and compact layout.
Callouts use strictly approved CSS classes, and lists use native `<ol type="a|A|i|I">`.
An internal-anchor command generates a unique `id` and corresponding `#id` link.
Clicking that link inside Preview scrolls to the target **without overwriting**
the application's URL-hash lesson route. HTML export retains native hash links.

All HTML templates insert into the same undoable Markdown source, are listed
in the optional HTML Lab, and do not affect the initial eight lessons or certificate.
The class/attribute sanitizer limits numeric spans to 1–20, filters duplicate or
invalid IDs, allows only safe list types, and strips arbitrary `style`, scripts
and `on*` handlers. Templates are not a visual table-merge editor: merge values
can be adjusted manually in the HTML source. Other Markdown renderers may
strip the HTML features or the CSS classes.

## Beyond Markdown advanced curriculum (Issue #4)

Separate seven-lesson track, ids `04_01`–`04_07`, accessible in Contents or with
the top **Beyond Markdown** control. It covers HTML portability, semantic text
styling, layout/print formatting, merged tables, callouts/details/internal
anchors, custom ordered lists, and a capstone document.

Each lesson contains five-language theory, examples, a prefilled draft,
hints/solutions, and live DOM-based checks (3 per lesson, 6 in the capstone:
24 checks). Verification runs against sanitized preview output: raw tags
inside fenced code blocks do not count.

Advanced completion `completedAdvancedLessons` (7 ids), source drafts
`advanced_<n>_<lang>`, routing and certificate are independent of the
original eight lessons, their completion and original certificate. Reset
of the core course does not erase advanced drafts or achievements.

The advanced certificate is a printable self-contained HTML download unlocked
at 7/7 and can be printed to PDF with Ctrl+P in the browser; recipient names
are HTML-escaped. It is a course-generated completion certificate, not an
external professional accreditation. Both course and certificate use all
five supported interface languages.

## Issue #5 — portability and secure export

The Preview pane contains a localized **Compatibility & export** panel. Its
indicators inspect sanitized rendered output (not raw code in fenced blocks),
compare GFM with the CommonMark and legacy parser modes, and flag app-specific
HTML/CSS. This is a warning system, *not* normative compliance certification.
When the active document includes advanced markup, downloading `.md` first
explains that the source remains intact but other platforms may strip HTML
or ignore preset classes. The warning can be dismissed to continue.

**HTML** export applies the strict sanitizer again (defense in depth), embeds
both preview and advanced CSS, and includes a restrictive document CSP:
no JavaScript, objects, connections, forms or remote fonts. HTTPS images remain
permitted and naturally require an internet connection; embedded CSS is
self-contained. The new **Print / PDF** button opens the standalone printable
HTML in another tab; browser Ctrl+P produces a PDF. Print-specific page breaks
are included in the HTML export and tested in Chromium. This is a browser print
workflow rather than an in-app PDF generator.

The existing app CSP still permits inline **styles** for its current UI
architecture, but scripts are restricted to same-origin resources. The
offline-first Vite build generates content-hashed service-worker precache
entries in the postbuild step; this is tested separately in Chromium.

## Interactive GFM task checkboxes

GFM task lists display checked/unchecked values correctly in Preview. Clicking an editable checkbox toggles only its corresponding Markdown `[x]`/`[ ]` marker and records an Undo/Redo step; draft changes persist across reloads. The editor enables preview checkboxes only when rendered tasks and source markers agree one-to-one, avoiding potentially destructive edits for ambiguous HTML, code fences or unsupported formats. Standalone HTML exports preserve checked states as disabled static checkboxes. CommonMark and Original parsing modes remain unaffected.

## Table insertion grid (Word-like)

The portable Markdown Table button now opens a 10-column × 8-row interactive selection grid. Hover or use arrow keys to choose a rectangle; click/Enter to insert a GFM table with that number of rows and columns. Number fields support larger dimensions up to 20 columns × 50 rows. Row count includes the header row; Markdown requires a separate separator line. The source is editable and changes are undoable. The popover is keyboard/mobile accessible and localized in EN, CS, UK, RO and RU. In CommonMark/Original mode it explains that the resulting Markdown table requires GFM rendering.

## Existing-table editing (Issue #6, second milestone)

Click a cell in **Live Preview** to show a contextual Edit Table toolbar. Choose row/column insertion or removal; Shift+click a second cell to select a rectangle for merging; use Merge Right/Down, Split Cell, color presets and table border controls. Simple GFM table row/column changes remain Markdown. On merging or applying cell styles, the GFM table is intentionally converted into safe semantic HTML, since GFM has no rowspan/colspan. Existing valid HTML tables can also be edited, including spans. Cell content is preserved while merging, with line breaks between previous cells; split retains content in the top-left cell. Unsupported/ambiguous table shapes are refused rather than rewritten. All edits use Undo/Redo, persist in the editor and flow through strict sanitized Live Preview and the standalone HTML/print exporter. Current scope is standalone top-level Markdown/HTML tables, not nested tables or arbitrary tables inside blockquotes. The edit toolbar is available in all five languages and supports keyboard access.

Existing-table **cell content editing**: selecting a Preview cell populates the contextual single-line Cell Text field. Saving edits the corresponding GFM cell without converting the table to HTML, or edits the escaped text of an HTML cell while retaining colspan/rowspan and approved CSS classes. Rich existing cell markup is deliberately replaced with plain text when explicitly saved (the UI warns the user). Enter saves; Undo/Redo, draft persistence and HTML export work unchanged. Multi-line rich text editing is deferred.

The optional Advanced HTML ribbon now includes a six-way category filter (All / Text / Paragraph / Tables / Blocks / Lists), translated in all five UI languages and persisted in local storage. Each category shows only its relevant presets and rich snippet controls; All restores the original two-strip layout. Core Markdown toolbar and lessons remain separate and unchanged.

## Multi-cursor editor (opt-in)

Select **Multi-cursor** in the Editor header to enable CodeMirror 6 (bundled with Vite, loaded on demand, included in offline Service Worker assets). The original textarea editor remains available via the same button. The Markdown document, drafts, lesson validation, Preview, HTML export, toolbar and table tools still use one synchronized source. In multi-cursor mode: **Alt+Click** adds a caret, **Ctrl+D** selects the next occurrence (Cmd+D on macOS), **Ctrl+Alt+Up/Down** adds a caret vertically (Cmd+Option+Up/Down on macOS), and **Alt+Shift+Drag** selects a rectangle. Core inline wrapping and snippet insertion act on every selection, with native CodeMirror Undo/Redo history. Switching back retains text. The user's mode choice persists. A fallback textarea is deliberately kept during migration; multi-cursor mode uses its own undo stack and keyboard bindings.

### Advanced multi-selection formatting

While **Multi-cursor** is active, Advanced HTML inline presets (color, background, font, size) and paragraph presets (alignment, indent, line spacing) apply to every selected range as a single CodeMirror transaction. HTML underline/subscript/superscript/highlight, page breaks, rich table templates, callouts, ordered-list numbering, internal anchors, spoiler/details blocks and headings H1–H6 are multi-range aware. Internal anchors automatically allocate distinct IDs for multiple selections. One Undo reverses the whole operation; regular single-cursor textarea mode keeps its previous behavior and Markdown source / sanitized Preview remain synchronized. Rich HTML examples deliberately insert trusted predefined templates (not arbitrary HTML).


### Line-end cursors and indentation

In Multi-cursor mode, select any set of lines and press **Shift+Alt+I** to create a caret at the end of each selected line (for the whole document, use **Ctrl+A** first). A selection ending at the beginning of the following line excludes that following line. Press **Tab** to add two spaces to each selected line, or **Shift+Tab** to remove up to two spaces (or one leading tab). With one empty selection, Tab inserts two spaces at the caret. Changes to multiple lines are grouped into a single history transaction and preserve the multi-cursor selection.


### Multi-cursor editing regression coverage

The CodeMirror editor preserves all cursors when returning from textarea mode **as long as the document content is unchanged**. Editing the document in the textarea resets stale CodeMirror selections and history when re-enabled, rather than allowing Undo to resurrect old content. Line indentation, headings and list formatting preserve cursor positions after their inserted prefixes. Manual formatting commands are isolated as separate Undo/Redo steps, and Undo/Redo buttons restore focus to the editing surface.

Chromium checks run on `main` via `.github/workflows/browser-qa.yml`; `.github/workflows/browser-tests.yml` runs on pull requests and manually via **workflow_dispatch**. This avoids running the complete Playwright suite twice on every push. It checks 100-cursor line and inline formatting, multi-cursor Undo/Redo, real tab outdenting, and editor mode switching. Failed runs upload the Playwright report as an artifact.


### Bulk selection shortcuts

**Ctrl+Shift+L** (Cmd+Shift+L on macOS) selects every occurrence of the currently selected text; combine it with typing or a toolbar command to edit all matches simultaneously. **Esc** collapses all selections to the main caret without changing the document. **Ctrl+D** still selects the next occurrence, and **Shift+Alt+I** creates a cursor at the end of each selected line. These commands are available only when Multi-cursor mode is active. The cursor count is announced as an accessible status, and shortcut hints are translated into all five supported languages.


### Large-selection performance and list safety

Moving multi-cursors without editing text no longer triggers redundant synchronous draft writes to `localStorage`. A text change still persists the draft as before. Sequential heading/list formatting has browser coverage for cursor-count preservation and independent Undo/Redo steps.

Reapplying the Task List command preserves completed `[x]` markers instead of resetting them to `[ ]`. Numbering applied to disjoint line groups starts at `1.` for each group rather than numbering unrelated lines as a continuous list. Dedicated Playwright cases protect both behaviors.

Both GitHub Actions workflows (Pages deployment and browser regression CI) use Node 24-compatible GitHub action releases. The project application itself continues building on Node 22.
