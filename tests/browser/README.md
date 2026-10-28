# Browser UX regression suites

The former `ux.spec.js` contained 169 independent Playwright scenarios. Its test bodies were extracted in original order and **without modification** into the suites below. Only imports were adjusted and two shared compatibility-panel helpers were moved into `support/compatibility.js`.

| Suite | Original test indices | Tests |
| --- | --- | ---: |
| `ux-foundations.spec.js` | 1–9 | 9 |
| `ux-advanced-formatting.spec.js` | 10–24 | 15 |
| `ux-curriculum-export.spec.js` | 25–35 | 11 |
| `ux-gfm-table-workflow.spec.js` | 36–52 | 17 |
| `ux-multicursor-basics.spec.js` | 53–65 | 13 |
| `ux-multicursor-navigation.spec.js` | 66–82 | 17 |
| `ux-dialect-extensions.spec.js` | 83–95 | 13 |
| `ux-rich-content.spec.js` | 96–112 | 17 |
| `ux-practice-labs.spec.js` | 113–122 | 10 |
| `ux-mermaid-preview.spec.js` | 123–132 | 10 |
| `ux-mermaid-export.spec.js` | 133–142 | 10 |
| `ux-table-rich-editor.spec.js` | 143–151 | 9 |
| `ux-table-media.spec.js` | 152–163 | 12 |
| `ux-table-list-editing.spec.js` | 164–169 | 6 |

**Total: 169 tests preserved.** The original monolithic file is available in Git history.

All `*.spec.js` files remain under `tests/browser` and are automatically collected by `npm run test:e2e`. No scenarios are skipped or disabled by this refactor. Do not delete an integration test solely because a unit test checks related behavior: browser workflow, accessible navigation and rendered-source integrity are separate contracts.

Test hygiene: add new tests beside their corresponding feature; keep critical sanitizer and preservation assertions; use independent browser contexts; and let pull-request Chromium CI and release cross-browser smoke serve different purposes.
