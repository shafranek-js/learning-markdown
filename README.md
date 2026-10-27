# Learning Markdown

[![Deploy to GitHub Pages](https://github.com/shafranek-js/learning-markdown/actions/workflows/deploy.yml/badge.svg)](https://github.com/shafranek-js/learning-markdown/actions/workflows/deploy.yml)
[![Browser UX QA](https://github.com/shafranek-js/learning-markdown/actions/workflows/browser-qa.yml/badge.svg)](https://github.com/shafranek-js/learning-markdown/actions/workflows/browser-qa.yml)
[![Version](https://img.shields.io/github/package-json/v/shafranek-js/learning-markdown?label=version)](package.json)

**Write Markdown, see the result, and learn by doing — all in one browser tab.**

Learning Markdown is a free-to-use, interactive Markdown course and writing studio. Work through short, checked lessons or open the AI Prompt Sandbox and start writing immediately. The editor puts Markdown source beside a live, safely rendered preview; formatting tools, advanced HTML options and export controls are there when you need them.

Your document drafts and learning progress stay in your browser. No account, server-side project or AI API key is required.

**[Open Learning Markdown](https://shafranek-js.github.io/learning-markdown/)** · [Cloudflare Pages](https://learning-markdown.pages.dev/) · [Browse the source](https://github.com/shafranek-js/learning-markdown) · [Report an issue](https://github.com/shafranek-js/learning-markdown/issues)

![Learning Markdown in Split View: Markdown source with Wrap text on the left and live formatted Preview on the right](docs/images/readme-studio.png)

*The actual browser interface: source editor, Live Preview, Markdown formatting tools and the Wrap text control. Captured automatically from the production build with an example document.*


> **Project status:** actively developed, installable PWA. The application displays its package version and short Git revision in the footer so you can identify the running build. Refer to [Known limitations](#known-limitations) before relying on advanced HTML outside this app.

## Contents

- [What you can do](#what-you-can-do)
- [A quick tour](#a-quick-tour)
- [Lesson Guide and editor workspace](#lesson-guide-and-editor-workspace)
- [Learn Markdown](#learn-markdown)
- [Editing and shortcuts](#editing-and-shortcuts)
- [Compatibility and export](#compatibility-and-export)
- [Install and use offline](#install-and-use-offline)
- [How it works](#how-it-works)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Scripts and tests](#scripts-and-tests)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Documentation and roadmap](#documentation-and-roadmap)
- [Attribution and license](#attribution-and-license)

## What you can do

**Write and preview**

- Edit source alongside a live Preview in a resizable Split View, or switch to Preview/HTML layouts.
- Choose **GFM (GitHub Flavored Markdown)**, **CommonMark-compatible**, or **Original / Legacy** parsing. Switching profiles never rewrites your source.
- Use a compact toolbar for headings, emphasis, quotations, lists, code, links, images, symbols and tables. Optional **HTML / Advanced** tools open in one horizontally scrollable contextual ribbon, grouped under **All / Text / Paragraph / Tables / Blocks / Lists**.
- Turn **Wrap text** on or off; soft wrapping is on by default and does not insert newlines into the document.
- Switch between the basic source editor and **CodeMirror 6 Multi-cursor** mode for simultaneous edits.

**Learn while writing**

- Complete **eight core lessons** with interactive checks and a separate optional **seven-lesson Beyond Markdown** track.
- Practice with insertable examples, an optional Deep Practice section and the Extensions & Hacks Lab.
- Use the **AI Prompt Sandbox** for free-form prompts and documents; this is a writing workspace, not a connected AI chatbot.
- Show **Lesson Guide** while learning, or hide it to reclaim editing space and remove lesson-only header controls; your choice is saved for the next visit.
- Read the Markdown guide and Cheat Sheet when you need syntax reminders.

**Go beyond the basics**

- Edit GFM tables visually; use safe semantic HTML tables for merged cells, styling, and selected richer cell content.
- Add allowed Advanced HTML for underlining, sub/superscript, highlighting, typography, callouts, spoilers, anchors, lists and print layout.
- Create Mermaid diagrams using bundled templates with safe Live Preview; the source remains ordinary fenced Markdown.
- Enable documented optional extensions such as footnotes, heading IDs, definition lists and emoji aliases while keeping their portability caveats visible.

**Keep your work**

- Download the original `.md` source or a standalone `.html` document, copy Markdown, or print / save as PDF through your browser.
- Save drafts, per-document extension choices, editor preferences and lesson progress locally in the browser profile.
- Use one of **six themes** and five interface languages: **English, Czech, Ukrainian, Romanian and Russian**.
- Install the app as a PWA for an app-like window and offline access to previously cached application resources.

## A quick tour

1. Open the [live app](https://shafranek-js.github.io/learning-markdown/).
2. Select **AI Prompt Sandbox** for an empty-ended writing exercise, or **Contents** for guided lessons.
3. Write Markdown on the left and inspect **Live Preview** on the right. Drag the divider to change their widths. Toggle **Lesson Guide** to focus on the editor when you don't need the course panel.
4. Use **Wrap text** for long lines, or **Multi-cursor** to insert/edit at several positions at once.
5. Choose **Export** above Preview to download Markdown or HTML, or print to PDF.

For example, this source:

~~~markdown
# A useful project brief

> Explain the goal in one clear sentence.

## Deliverables
- [x] Define the problem
- [ ] Write a first draft
- [ ] Review the result

See the [CommonMark specification](https://spec.commonmark.org/).
~~~

renders as a formatted heading, quotation, checklist and link without changing the editable source.

## Lesson Guide and editor workspace

The **Lesson Guide** button switches between a learning-focused layout and a less cluttered writing workspace. It doesn't delete lessons, reset progress or alter your Markdown document.

| Header content | Lesson Guide on | Lesson Guide off |
|---|---|---|
| Course title, subtitle and progress indicator | Shown (where screen width permits) | Hidden |
| **Beyond Markdown** and the two certificate buttons | Shown | Hidden |
| **Contents**, **Lesson Guide**, **AI Prompt Sandbox** and **Cheat Sheet** | Available | Available |
| Theme, language, Markdown toolbar, editor, Preview and export tools | Available | Available |

- Closing the guide also closes the guide panel and its resize handle; the editor/Preview can use the freed space. Reopen it with **Lesson Guide**.
- Your guide visibility preference survives a page reload. Course navigation, saved drafts and progress remain intact.
- **AI Prompt Sandbox** is a dedicated free-form writing view. It hides the lesson-specific header and guide; the **Lesson Guide** button returns to the course.
- The **Contents** drawer remains the place to navigate lessons, track progress and access course actions, even while the guide is hidden.

## Learn Markdown

| Track | Contents | Progress |
|---|---|---|
| **Core** | Eight lessons: headings, emphasis, lists, blockquotes, links and media, code, GFM tables/tasks, final project | Core completion and certificate |
| **Beyond Markdown** | Seven optional modules on safe HTML formatting, layout, rich tables, interactive content, numbering and a capstone | Separate advanced progression |
| **Extensions & Hacks Lab** | Extra focused practice in GFM, portability, footnotes, figures, Unicode, Mermaid and other extensions | Independent from the two certificate tracks |

The certificate documents progress in the application; **it is not an accredited qualification**.

## Editing and shortcuts

The default textarea editor and optional CodeMirror editor operate on the same Markdown document. The regular source editor uses a synchronized syntax-highlight overlay; Multi-cursor mode provides native multiple selections, and the UI retains a shared draft and preview.

| Action | Shortcut / control |
|---|---|
| Undo / redo | `Ctrl+Z` / `Ctrl+Y` or `Ctrl+Shift+Z` |
| Bold / italic / link | `Ctrl+B` / `Ctrl+I` / `Ctrl+K` |
| Headings | `Ctrl+1` through `Ctrl+6` |
| Continue bullet, numbered or task list | Both editors: `Enter` at the end of an item (CodeMirror handles multiple list cursors together) |
| Exit an empty list item | Both editors: `Enter` on an empty item |
| Indent / outdent list items | `Tab` / `Shift+Tab` (including selections of list lines); CodeMirror also supports general code-style indentation |
| Add another cursor | **Multi-cursor** mode: `Alt+Click` |
| Select next occurrence | **Multi-cursor** mode: `Ctrl+D` |
| Select all matching occurrences | **Multi-cursor** mode: `Ctrl+Shift+L` |
| Add cursor above / below | **Multi-cursor** mode: `Ctrl+Alt+Up/Down` |
| Cursor at end of every selected line | **Multi-cursor** mode: `Shift+Alt+I` |
| Rectangular selection | **Multi-cursor** mode: `Alt+Shift+Drag` |
| Collapse to one cursor | **Multi-cursor** mode: `Esc` |

On macOS, corresponding shortcuts use Command/Option where available. Some combinations may be intercepted by the operating system, browser or keyboard layout.

**List and quote toolbar:** in either editor, selecting one or more Markdown lines and clicking a bullet, numbered list, task list or quote command now reformats those lines without replacing their contents. Multiple CodeMirror cursors sharing a line apply one edit, and a single Undo reverses the operation. With no selection in the standard editor, the buttons still insert example templates. If any selected line is inside a fenced code block, the entire formatting request is refused and a message explains why.

**Heading toolbar:** select multiple source lines in either editor and apply H1–H6 to convert each nonblank line while keeping blank separators intact. Applying the same level to an existing heading removes its marker; changing the level preserves its content. One Undo reverts the operation. If the selection includes fenced or indented code, it is rejected without partial edits. An empty line creates an editable heading example.

**Inline toolbar:** Bold supports both `**bold**` and `__bold__`, while Italic supports `_italic_` and `*italic*`. The corresponding button removes either valid marker style when the whole wrapper or its interior is selected, without disturbing strong-underscore formatting or identifiers such as `file_name`. Strikethrough (`~~`) and inline code also toggle off; otherwise these actions wrap the selection or insert editable placeholder text. In either editor, inline and Advanced wrappers refuse a selection touching a fenced code block instead of modifying code. CodeMirror applies all cursors in one undoable transaction and rejects mixed safe/unsafe selections atomically.

**Selected-line indentation:** in either editor, select one or more lines and press `Tab` to add two leading spaces per logical line, or `Shift+Tab` to remove up to two spaces (or one leading tab). This works for mixed prose, list and blank lines, preserves the Markdown text and selection, and can be reversed in one Undo step. Selecting only part of a line indents that whole line instead of replacing the selected words. With a single caret, `Shift+Tab` also outdents the current line when it begins with spaces or a tab (including ordinary prose and source code), and otherwise retains standard backward browser focus navigation in the textarea. The existing list-specific Tab behavior remains unchanged; IME composition is not intercepted.

**List editing:** pressing Enter at the end of an existing item continues a bullet or numbered list, and resets the next task checkbox to unchecked. Enter on an empty list item exits it. Both the native source editor and optional CodeMirror Multi-cursor editor support these source-safe rules. In Multi-cursor mode, multiple eligible list cursors are edited atomically, so one Undo reverses the entire operation. Mixed list/paragraph cursors fall back to CodeMirror's default Enter behavior. Tab/Shift+Tab change list indentation without replacing item contents; ordinary CodeMirror text retains its normal indentation controls. Fenced code blocks are not automatically treated as lists.

**Table editing:** select a table cell in Live Preview to open contextual controls. GFM edits remain GFM when possible; merges or non-portable cell styling require safe HTML. Supported captions, row groups, header `scope`, cell spans, alignment and app-defined styling classes survive safe edits. Tables with unmodeled structural metadata (for example, custom `data-*` attributes, `title`, inline `style`, unknown classes or unsupported alignment) are read-only in the visual editor to avoid losing source attributes. You can still edit their exact Markdown/HTML source directly. Dangerous event-handler attributes are explicitly removed from rendered HTML by the sanitizer.

## Compatibility and export

Markdown is a text format; **HTML/CSS formatting is an extension, not portable Markdown**. The app deliberately distinguishes these paths:

| Format | What is preserved | Portability |
|---|---|---|
| **Markdown (`.md`)** | The exact editable Markdown source | Portable for supported standard syntax; optional extensions or HTML may differ across renderers |
| **Standalone HTML (`.html`)** | Sanitized rendered document, with bundled supported styling | Open in a browser; remotely linked images still need internet |
| **Print / PDF** | Browser print view of the rendered document | Appearance can vary by browser, page settings and printer |

The **Compatibility** menu explains differences among GFM, CommonMark, Legacy parsing, GitHub rendering and app-only features. Advanced HTML uses a strict allowlist: arbitrary JavaScript, event handlers, unrestricted CSS and dangerous URL protocols are not supported.

If you need a document to look identical on GitHub, another Markdown platform and this application, prefer standard Markdown and test in the destination renderer.

## Install and use offline

Open the published HTTPS application at least once while online: [GitHub Pages](https://shafranek-js.github.io/learning-markdown/) or [Cloudflare Pages](https://learning-markdown.pages.dev/). In Chrome, use the **Install** icon in the address bar when it is offered, or the browser menu's **Install page as app** option. The **Contents → Install app** control can open the browser's installation prompt if available; otherwise it shows platform-specific instructions. Edge also supports installing a website as an app. On iOS, use the browser Share menu and **Add to Home Screen**.

The native Chrome install icon and banner are controlled by the browser, not by the page. The app does not suppress Chrome's native install promotion, but the browser might not display it on every visit or if the app is already installed.

A web manifest, local app icons and a service worker make the site eligible for installation. The production build keeps `manifest.json` at the application root so its icon paths resolve correctly on both GitHub Pages (a repository subpath) and Cloudflare Pages. After a successful online visit, cached app resources support offline sessions. **First-time installation, new versions and externally hosted images still require internet.**

If Chrome reports an icon download error, open **DevTools → Application → Manifest** and check that the icon URL does **not** contain a duplicated `/assets/assets/` path. A deployment or service-worker cache may still be serving an older build; compare the version and short Git revision in the application's footer.

Documents, progress and preferences are stored per browser profile using `localStorage`. They do **not** automatically sync across browsers or devices. Keep downloaded copies of important Markdown files.

## How it works

~~~mermaid
flowchart LR
    A["Markdown source<br/>textarea / CodeMirror 6"] --> B["Parser profiles<br/>Marked + optional extensions"]
    B --> C["Allowlist HTML sanitizer"]
    C --> D["Live Preview"]
    C --> E["Standalone HTML / print"]
    A --> F["Raw Markdown export"]
    A --> G["Local draft storage"]
    H["Lessons and validators"] --> A
    H --> D
    I["PWA service worker"] --> J["Cached application assets"]
~~~

- **Static client-side application.** Vite builds the app; no application backend is required for lessons, authoring or local exports.
- **Source is authoritative.** Preview and visual table operations feed changes back to the editable Markdown document; the source isn't replaced by a hidden rich-text document.
- **Rendering boundaries matter.** Bundled Marked handles the chosen syntax profile, optional extensions are explicit, and generated HTML is passed through the app's sanitizer. Mermaid rendering has separate safety checks.
- **Persistence is local.** Browser storage retains drafts, progress and preferences. Editor undo histories are session-scoped rather than guaranteed to survive a reload.
- **Offline build.** The postbuild script fingerprints the application cache, includes locally bundled production resources and fixes the published manifest link to the app root so icon paths work on both supported hosts.

## Repository layout

~~~text
learning-markdown/
├── index.html                 App shell, course controls and dialogs
├── css/                       Layout, themes, source editor and preview styles
├── js/
│   ├── app.js                 Initialization, navigation, exports
│   ├── core/                  State, sanitization, history, parsers, table operations
│   ├── data/                  Lessons, examples, templates and practice data
│   ├── i18n/                  EN / CS / UK / RO / RU
│   └── ui/                    Editors, preview, toolbars and dialogs
├── assets/                    SVG and PNG PWA icons
├── manifest.json, sw.js       Install and offline configuration
├── scripts/postbuild.mjs      Cache fingerprinting and PWA manifest path verification
├── tests/                     Node and Playwright regression suites
├── docs/                      Historical implementation notes
└── .github/workflows/         Deploy, UI, regression and conformance CI
~~~

## Getting started

**Requirements:** Node.js **22** or a compatible newer version and npm. GitHub Actions uses Node 22 to build and test the project.

~~~bash
git clone https://github.com/shafranek-js/learning-markdown.git
cd learning-markdown
npm install
npm run dev
~~~

Open the local address printed by Vite (normally `http://localhost:5173/`).

**Production build**

~~~bash
npm test
npm run build
npm run preview
~~~

The output lives in `dist/`. Serve that directory with a static HTTP server or deploy it to a static host. Do not open `index.html` directly from the source directory as a `file://` URL: module dependencies and service-worker behavior require HTTP(S).

## Scripts and tests

| Command | Purpose |
|---|---|
| `npm run dev` | Start Vite's local development server |
| `npm test` | Run the Node test suites for syntax, lessons, rendering, safety, tables, extensions and UI state |
| `npm run build` | Produce the static site in `dist/` (including the PWA postbuild step) |
| `npm run preview` | Preview the production build |
| `npm run test:e2e` | Run the Playwright browser UX suite |
| `npm run test:e2e:release` | Run the release-oriented Chromium/Firefox/WebKit smoke suite |

The README interface screenshot is a real browser capture, not generated artwork. After building and installing Chromium, refresh it with `node scripts/capture-readme.mjs` (writes `docs/images/readme-studio.png`).

Install the relevant Playwright browsers before running end-to-end tests locally:

~~~bash
npx playwright install --with-deps chromium
npm run test:e2e
~~~

The repository has separate GitHub Actions workflows for:
- **Deploy Learning Markdown to GitHub Pages** — `npm test`, Vite build and deployment on `main`.
- **Markdown browser UX QA** — Chromium scenarios on relevant changes.
- **Browser regression tests** — separate PR regression coverage.
- **Release cross-browser smoke** — Chromium, Firefox and WebKit.
- **Markdown upstream conformance audit** — syntax compatibility checks.

The curated compatibility tests and upstream conformance audit do **not** mean every parsing dialect is certified 100% compliant with every Markdown specification. Check the target platform for portability-sensitive content.

## Deployment

The documented public build is published to **[GitHub Pages](https://shafranek-js.github.io/learning-markdown/)** using [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). The workflow runs on pushes to `main`; GitHub Pages must be configured to use GitHub Actions as its source.

Vite uses relative asset paths for repository-subdirectory hosting. The application footer includes the version and short commit revision to identify an actual deployed build.

The project may also be hosted on other static providers, but deployment status and revision parity must be checked **separately** for each host.

### Live deployment verification

The [Live host parity workflow](.github/workflows/live-host-parity.yml) runs after a successful GitHub Pages deployment and can also be started manually. Using a **fresh Chromium browser with service workers blocked**, it checks the published [GitHub Pages](https://shafranek-js.github.io/learning-markdown/) and [Cloudflare Pages](https://learning-markdown.pages.dev/) builds against the **same exact Git revision**. It also checks the live Markdown editor/Preview, default-on Wrap text, and that the PWA's PNG icons are served with the correct MIME type. Cloudflare may take longer to publish than GitHub Pages, so the check retries before reporting a deployment mismatch.

A successful individual hosting deployment is not proof that the **other host** has the same build; only the parity check verifies both addresses.

## Known limitations

- **Advanced HTML is not universally portable.** GitHub and other Markdown hosts may sanitize custom classes, layouts and supported HTML structures differently.
- **Complex HTML tables are deliberately guarded.** Nested *leaf* tables can be edited in Live Preview while the enclosing table remains read-only. Successful leaf edits replace only that leaf's original HTML source range, preserving untouched outer formatting, attributes, sibling tables and media. Rich content that contains unmodeled metadata such as `title`, `data-*`, `aria-*`, `role`, `lang`, `dir` or inline styles stays source-only, rather than losing those attributes when an unrelated cell is edited. This check applies only to the table actually being edited, not its surrounding parent. If the selected table contains original HTML comments, raw-text elements, unsupported media or foreign content, visual editing is refused so these annotations cannot be silently dropped. Unrelated standalone tables remain editable. If nested source boundaries are ambiguous, visual editing is likewise refused instead of normalizing the document. Other unsupported or malformed structures remain read-only; direct source editing is always available.
- **Editor parity is still evolving.** CodeMirror Multi-cursor is optional; some legacy actions can behave differently between the two modes.
- **Offline is conditional.** The PWA works offline only after its resources have been successfully cached, and remote images still need connectivity.
- **Local-only persistence.** There is no automatic cloud sync or automatic backup across browsers/devices. Reloading does not guarantee preservation of the undo stack.
- **PDF uses browser printing.** Exact line wrapping, page breaks and fonts depend on browser/print settings. There is no DOCX export.
- **Certificates are educational**, not externally accredited.

## Documentation and roadmap

- [Implementation history](docs/IMPLEMENTATION_HISTORY.md) — archived feature-by-feature notes, not the authoritative current UI guide.
- [Issue #6: Advanced Formatting UX](https://github.com/shafranek-js/learning-markdown/issues/6) — visual table editing, editor parity and release verification.
- [Epic #1: Beyond Markdown](https://github.com/shafranek-js/learning-markdown/issues/1) — parent project roadmap.
- [Issues and change proposals](https://github.com/shafranek-js/learning-markdown/issues) — current work and bug reports.
- [CommonMark specification](https://spec.commonmark.org/) and [GitHub Flavored Markdown specification](https://github.github.com/gfm/) — upstream syntax references.

## Attribution and license

This application uses [Marked](https://marked.js.org/), [CodeMirror](https://codemirror.net/), [Mermaid](https://mermaid.js.org/), [highlight.js](https://highlightjs.org/) and other packages documented in [`package.json`](package.json). Each dependency retains its own license.

**Project source licensing:** `package.json` currently declares `UNLICENSED`, and the repository has no top-level LICENSE file. The source is publicly viewable, but it is **not** automatically offered under an open-source redistribution license. Contact the repository owner before reusing the project's own code beyond rights allowed by applicable law.
