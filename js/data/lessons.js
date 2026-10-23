const FENCE = "```";
// Original lesson examples, grouped with upgraded validators.
import { checks, getTaskDescriptions } from '../core/validator.js';
export const LINKEDIN_PROMPT_SAMPLE = `# LinkedIn Video Prompt

> You are an expert AI content creator focused on crafting concise, high-impact scripts for vertical video on **LinkedIn**, optimized for **60 seconds**.
>> You specialize in explaining **AI tools, technologies, and trends** in a way that's **practical, scroll-stopping, and never salesy**.

> Your voice is **conversational but smart** — like explaining something exciting to a sharp colleague. The goal is to help professionals apply AI _without cringe or fluff_.

## Before You Start

Always begin by asking:

- **What's the topic?** (Tool, trend, insight?)
- **What are 2–3 key points or examples to cover?**
- **Any call to action?** (e.g. course, link, follow)
- **Do you want to paste or upload context?**

### Workflow & Collaboration
1. Start with title ideation
2. Build a first-pass script in Canvas
`;
export const LESSON_CORE = [
  { id: 1, tab: "01_01 Headings", examples: [
                    { label: "# LinkedIn Video Prompt", code: "# LinkedIn Video Prompt" },
                    { label: "## Before You Start", code: "## Before You Start" },
                    { label: "### Workflow & Collaboration", code: "### Workflow & Collaboration" }
                ], checks: checks[0] },
  { id: 2, tab: "01_02 Emphasis", examples: [
                    { label: "**conversational but smart**", code: "**conversational but smart**" },
                    { label: "_without cringe or fluff_", code: "_without cringe or fluff_" },
                    { label: "~~never salesy~~", code: "~~never salesy~~" }
                ], checks: checks[1] },
  { id: 3, tab: "01_03 Lists", examples: [
                    { label: "- **What's the topic?**", code: "- **What's the topic?**\n- **Any call to action?**" },
                    { label: "1. Start with ideation", code: "1. Start with title ideation\n2. Build a first-pass script" }
                ], checks: checks[2] },
  { id: 4, tab: "01_04 Blockquotes", examples: [
                    { label: "> Expert AI creator...", code: "> You are an expert AI content creator focused on **LinkedIn**." },
                    { label: ">> Nested quote...", code: ">> You specialize in explaining **AI tools and trends**." },
                    { label: "--- Divider", code: "\n---\n" }
                ], checks: checks[3] },
  { id: 5, tab: "02_01 Links & Media", examples: [
                    { label: "[CommonMark](https://...)", code: "[CommonMark Spec](https://commonmark.org)" },
                    { label: "![Banner](https://...)", code: "![Studio Banner](https://placehold.co/600x140/ff5f2e/ffffff?text=Markdown+Studio)" }
                ], checks: checks[4] },
  { id: 6, tab: "02_02 Code Blocks", examples: [
                    { label: "`npm run dev`", code: "Execute `npm run dev` in terminal." },
                    { label: "```js Code Block", code: FENCE + "js\nconst mode = 'studio';\nconsole.log(mode);\n" + FENCE }
                ], checks: checks[5] },
  { id: 7, tab: "02_03 GFM Tables & Tasks", examples: [
                    { label: "- [x] / - [ ] Checklist", code: "- [x] Complete module\n- [ ] Test split resizer" },
                    { label: "| Table | GFM |", code: "| Tool | Rating |\n| --- | --- |\n| Markdown | 10/10 |\n| Plain Text | 7/10 |" }
                ], checks: checks[6] },
  { id: 8, tab: "03_01 Final Project", examples: [
                    { label: "Insert Full LinkedIn Prompt", code: LINKEDIN_PROMPT_SAMPLE + "\nRun `npx studio` and visit [Docs](https://commonmark.org)." }
                ], checks: checks[7] }
];
export function lesson(index, lang, translations){
 const core=LESSON_CORE[index];
 if(!core)return null;
 const tr=translations[core.id]?.[lang] || translations[core.id]?.en;
 return { ...tr, hint: core.id===4 ? tr.hint + '\n\n>> Nested quote with **emphasis**\n' : core.id===8 ? tr.hint + '\n\n```javascript\nconsole.log(\"Markdown capstone\");\n```\n\n- [x] Final README prepared\n- [ ] Review the result\n' : tr.hint, id:core.id, tab:core.tab, examples:core.examples, tasks:core.checks.map((check,i)=>({id:core.id+'_'+i, check, text:getTaskDescriptions(core.id,lang,tr.tasks)[i]||''})) };
}
