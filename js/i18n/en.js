import {LINKEDIN_PROMPT_SAMPLE} from '../data/lessons.js';
const FENCE = "```";
// Content migrated from the original HTML prototype.
export const ui = {
                courseTitle: "Learning Markdown: Formatting Text without the Complexity",
                courseSubtitle: "The best way to write, prompt, and much more",
                contentsBtn: "Contents",
                guideBtn: "Lesson Guide",
                sandboxBtn: "AI Prompt Sandbox",
                cheatsheetBtn: "Cheat Sheet",
                certBtn: "Certificate",
                splitView: "Split",
                previewView: "Preview",
                curriculumTitle: "Course Contents",
                curriculumSub: "8 Interactive Modules + AI Prompt Sandbox",
                resetAllBtn: "Reset All Progress",
                snippetsLabel: "Interactive Snippets",
                clickToInsert: "Click to insert",
                tasksTitle: "Practice Checklist",
                tasksSubtitle: "Write Markdown in the editor — tasks verify automatically:",
                solutionLabel: "💡 Solution Example:",
                applySolutionBtn: "Insert Solution",
                hintBtn: "Hint",
                nextLessonBtn: "Next",
                liveEditorBadge: "live buffer",
                clearBtn: "Clear",
                previewHeader: "Live Preview (GFM)",
                copyBtn: "Copy",
                lessonCompleteMsg: "All tasks for this module are complete!",
                certHeader: "Certificate of Completion",
                modulesLabel: "Modules",
                tasksSolvedLabel: "Tasks Verified",
                copyCertBtn: "Copy Certificate Markdown",
                moduleOf: (cur, tot) => `Module ${cur} of ${tot}`,
                completedOf: (done, tot) => `${done} of ${tot} completed`,
                statusDone: "✓ Completed",
                statusInProgress: "In Progress",
                statsBar: (l, w, c) => `Lines: ${l} • Words: ${w} • Chars: ${c}`,
                cursorBar: (r, c) => `Ln ${r}, Col ${c}`,
                historyBar: (p, t) => `History: ${p}/${t}`,
                toastCopied: "Copied to clipboard!",
                toastCleared: "Editor cleared (Ctrl+Z to undo)",
                toastSolution: "Solution inserted (Ctrl+Z to undo)"
            };
export const lessonText = {
1: {
                    title: "Headings & Document Hierarchy",
                    subtitle: "Structuring text and AI prompts with # symbols",
                    theory: `<p>Headings organize your documents and AI prompts into clear sections. The level (<code>H1</code> to <code>H6</code>) corresponds to the number of hash marks <code>#</code> at the start of a line followed by a space:</p>
                    <p>Practice all six levels: <code>#</code>, <code>##</code>, <code>###</code>, <code>####</code>, <code>#####</code>, and <code>######</code>. Use the <strong>H1–H6</strong> toolbar buttons or <strong>Ctrl+1…Ctrl+6</strong>.</p>`,
                    initial: "# LinkedIn Video Prompt\n\nAdd headings H2 through H6 below (##, ###, ####, #####, ######):\n\n",
                    hint: "# LinkedIn Video Prompt\n\n## Before You Start\n\n### Workflow & Collaboration",
                    tasks: ["Create a Level 1 Heading (`# Title`)", "Add a Level 2 Heading (`## Section`)", "Add a Level 3 Heading (`### Subsection`)"]
                },
2: {
                    title: "Bold, Italic & Strikethrough",
                    subtitle: "Highlighting key concepts without touching the mouse",
                    theory: `<p>Wrap words with asterisks or underscores to emphasize key phrases:</p>
                    <ul class="list-disc pl-4 space-y-1">
                        <li><code>**bold text**</code> — two asterisks on each side.</li>
                        <li><code>*italic*</code> or <code>_italic_</code> — single asterisk or underscore.</li>
                        <li><code>~~strikethrough~~</code> — two tildes on each side.</li>
                    </ul>`,
                    initial: "Your voice is conversational — help professionals apply AI without cringe.\n\n",
                    hint: "Your voice is **conversational but smart** — help professionals apply AI _without cringe_ or ~~outdated fluff~~.",
                    tasks: ["Make a word **bold** (`**word**`)", "Make a phrase *italic* (`*word*` or `_word_`)", "Add ~~strikethrough~~ (`~~word~~`)"]
                },
3: {
                    title: "Bullet & Numbered Lists",
                    subtitle: "Organizing steps and key points",
                    theory: `<p>Start lines with <code>- </code> for bullet lists, or <code>1. </code>, <code>2. </code> for ordered workflows.</p>`,
                    initial: "### Key Questions:\n\n### Workflow Steps:\n\n",
                    hint: "### Key Questions:\n- What's the topic?\n- Any call to action?\n\n### Workflow Steps:\n1. Start with title ideation\n2. Build a first-pass script",
                    tasks: ["Create a bullet list with at least 2 items (`- Item`)", "Create a numbered list with at least 2 items (`1. Step`)"]
                },
4: {
                    title: "Blockquotes & Dividers",
                    subtitle: "Framing AI persona instructions & visual breaks",
                    theory: `<p>Start a line with <code>&gt;</code> to create a blockquote, or <code>&gt;&gt;</code> for a nested quote (just like in the LinkedIn Video Prompt!). Add <code>---</code> on an empty line for a horizontal divider.</p>`,
                    initial: `# LinkedIn Video Prompt\n\n> You are an expert AI content creator focused on crafting concise, high-impact scripts for vertical video on **LinkedIn**, optimized for **60 seconds**.\n\nAdd a nested quote (>> ) or horizontal rule (---) below:\n\n`,
                    hint: `# LinkedIn Video Prompt\n\n> You are an expert AI content creator focused on **LinkedIn**.\n>> You specialize in explaining **AI tools and trends**.\n\n---\n\n## Before You Start`,
                    tasks: ["Add a blockquote (`> Quote text`)", "Add a horizontal divider line (`---`)"]
                },
5: {
                    title: "Links & Images",
                    subtitle: "Connecting external resources and visuals",
                    theory: `<p>Use <code>[Label](https://...)</code> for links and prefix with an exclamation mark <code>![Alt](https://...)</code> for images.</p>`,
                    initial: "Reference materials and banner image:\n\n",
                    hint: "Read the [CommonMark Spec](https://commonmark.org)\n\n![Course Banner](https://placehold.co/600x140/ff5f2e/ffffff?text=Markdown+Studio)",
                    tasks: ["Insert a hyperlink `[Text](https://...)`", "Embed an image `![Alt](https://...)`"]
                },
6: {
                    title: "Inline Code & Code Blocks",
                    subtitle: "Formatting commands, JSON outputs, and snippets",
                    theory: `<p>Wrap short commands in single backticks <code>\`npm start\`</code> and multi-line code blocks in triple backticks <code>${FENCE}</code>.</p>`,
                    initial: "Run the development server in terminal:\n\n",
                    hint: "Run `npm run dev` in terminal.\n\n" + FENCE + "js\nconst prompt = 'Markdown Pro';\nconsole.log(prompt);\n" + FENCE,
                    tasks: ["Add inline code with single backticks (`` `code` ``)", "Add a fenced code block with triple backticks (`" + FENCE + "`)"]
                },
7: {
                    title: "Tables & Task Lists (GFM)",
                    subtitle: "GitHub Flavored Markdown checklists and data grids",
                    theory: `<p>Create interactive checklists with <code>- [x] Done</code> and <code>- [ ] Todo</code>. Build tables using pipes <code>|</code> and a header divider <code>| --- | --- |</code>.</p>`,
                    initial: "### Sprint Tasks:\n\n### Model Comparison:\n\n",
                    hint: "### Sprint Tasks:\n- [x] Draft video prompt\n- [ ] Record 60s take\n\n### Model Comparison:\n| Feature | Status |\n| --- | --- |\n| GFM Tables | Ready |\n| Split Drag | Ready |",
                    tasks: ["Create a completed task (`- [x] Task`)", "Create an open task (`- [ ] Task`)", "Build a table with `| --- | --- |`"]
                },
8: {
                    title: "Final Project: Complete AI Prompt & README",
                    subtitle: "Combining all Markdown techniques in one document",
                    theory: `<p>Combine headings (<code>#</code>, <code>##</code>, <code>###</code>), bold emphasis, a blockquote, a list, inline code, and a link to earn your certificate!</p>`,
                    initial: LINKEDIN_PROMPT_SAMPLE + "\nRun `npx markdown-studio` or visit [Documentation](https://commonmark.org).\n",
                    hint: LINKEDIN_PROMPT_SAMPLE + "\nRun `npx markdown-studio` or visit [Documentation](https://commonmark.org).\n",
                    tasks: [
                        "Use all 3 heading levels (`#`, `##`, `###`)",
                        "Highlight key terms in **bold** (`**text**`)",
                        "Include a blockquote (`> Quote`)",
                        "Include a list with at least 2 items",
                        "Include inline code (`` `code` ``) and a link (`[Text](https://...)`)"
                    ]
                }
};
