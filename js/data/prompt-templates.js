// Original offline Markdown templates. No AI requests or external services.
import {EXPANDED_PROMPTS} from './prompt-templates-expanded.js';
export const PROMPT_CATEGORIES=["Writing","Coding","Analysis","Learning","Work","Research","Design & UX","Career","Marketing","Productivity"];
const CORE_PROMPTS=[
  {
    "id": "writing-blog",
    "category": "Writing",
    "title": "Blog post",
    "description": "Draft a structured blog post",
    "body": "# Role\nWrite as an editor for {{audience}}.\n\n# Task\nWrite about {{topic}} with the context below.\n{{context}}\n\n# Requirements\n- Markdown headings and concrete examples\n- Flag claims needing external verification\n- Keep a {{tone}} voice\n\n# Output\nA {{length}} blog post.",
    "tip": "A structured role, context and output make text prompts clearer."
  },
  {
    "id": "writing-edit",
    "category": "Writing",
    "title": "Clarity editor",
    "description": "Improve a draft without changing its facts",
    "body": "# Task\nEdit the following draft for clarity and grammar:\n{{draft}}\n\n# Constraints\n- Preserve all facts, names and numbers\n- Maintain a {{tone}} voice\n- Explain substantive edits separately\n\n# Output\n## Revised text\n## Summary of changes",
    "tip": "A structured role, context and output make text prompts clearer."
  },
  {
    "id": "writing-social",
    "category": "Writing",
    "title": "Professional social post",
    "description": "Write a natural social media update",
    "body": "# Task\nWrite a concise post announcing {{announcement}}.\n\n# Audience\n{{audience}}\n\n# Style\n- Conversational, without marketing clichés\n- No decorative emoji\n- Include a concrete insight\n- Target length: {{length}}\n\n# Output\nReturn the post in Markdown.",
    "tip": "A structured role, context and output make text prompts clearer."
  },
  {
    "id": "writing-outline",
    "category": "Writing",
    "title": "Content outline",
    "description": "Plan sections before writing",
    "body": "# Topic\n{{topic}}\n\n# Audience\n{{audience}}\n\n# Scope\n{{scope}}\n\n# Deliverables\n- Title and one-sentence thesis\n- H2 headings with H3 subtopics\n- Unanswered research questions\n- Closing takeaway",
    "tip": "A structured role, context and output make text prompts clearer."
  },
  {
    "id": "coding-review",
    "category": "Coding",
    "title": "Code review",
    "description": "Review correctness and security",
    "body": "# Role\nYou are an experienced code reviewer.\n\n# Stack\n{{stack}}\n\n# Code\n~~~\n{{code}}\n~~~\n\n# Review\n- Defects and security risks with evidence\n- Distinguish verified defects from hypotheses\n- Minimal patches and tests\n\n# Output\n| Severity | Location | Issue | Fix | Test |\n|---|---|---|---|---|",
    "tip": "Code fences, constraints and tests keep technical output actionable."
  },
  {
    "id": "coding-debug",
    "category": "Coding",
    "title": "Debugging plan",
    "description": "Diagnose an issue methodically",
    "body": "# Problem\n{{problem}}\n\n# Environment\n{{environment}}\n\n# Reproduction\n{{steps}}\n\n# Task\n1. Rank plausible causes by evidence.\n2. Provide diagnostics for each.\n3. Propose the smallest reversible fix.\n4. Suggest regression tests and rollback.\n\nDo not invent logs or measurements.",
    "tip": "Code fences, constraints and tests keep technical output actionable."
  },
  {
    "id": "coding-tests",
    "category": "Coding",
    "title": "Test case generator",
    "description": "Derive traceable tests",
    "body": "# Feature\n{{feature}}\n\n# Acceptance criteria\n{{criteria}}\n\n# Output\n| ID | Setup | Steps | Expected | Priority |\n|---|---|---|---|---|\n\nInclude positive, negative and boundary cases.\nMark unclear requirements as open questions.",
    "tip": "Code fences, constraints and tests keep technical output actionable."
  },
  {
    "id": "coding-refactor",
    "category": "Coding",
    "title": "Safe refactoring plan",
    "description": "Improve code while preserving behavior",
    "body": "# Component\n{{component}}\n\n# Stack\n{{stack}}\n\n# Current behavior\n{{behavior}}\n\n# Constraints\n- Preserve public APIs and stored data\n- Keep changes reviewable and reversible\n\n# Output\n1. Refactoring phases\n2. Proposed changes\n3. Regression tests\n4. Rollback plan",
    "tip": "Code fences, constraints and tests keep technical output actionable."
  },
  {
    "id": "analysis-document",
    "category": "Analysis",
    "title": "Document analysis",
    "description": "Extract findings, gaps and uncertainty",
    "body": "# Role\nAct as an impartial analyst.\n\n# Document\n{{document}}\n\n# Task\n- Summarize the central argument\n- Separate evidence from assumptions\n- Identify contradictions and missing data\n- Suggest practical next steps\n\n# Output\n## Summary\n## Key findings\n## Uncertainties\n## Recommendations\n\nDo not invent citations.",
    "tip": "Explicit evidence and uncertainty avoid overstating conclusions."
  },
  {
    "id": "analysis-options",
    "category": "Analysis",
    "title": "Compare alternatives",
    "description": "Decide against transparent criteria",
    "body": "# Decision\n{{decision}}\n\n# Options\n{{options}}\n\n# Criteria\n{{criteria}}\n\n# Constraints\n{{constraints}}\n\n# Output\n- Markdown comparison table\n- Trade-offs and uncertainties\n- Conditional recommendation with assumptions\n\nDo not present subjective scores as measured facts.",
    "tip": "Explicit evidence and uncertainty avoid overstating conclusions."
  },
  {
    "id": "analysis-dataset",
    "category": "Analysis",
    "title": "Dataset analysis plan",
    "description": "Investigate data quality before conclusions",
    "body": "# Dataset\n{{dataset_description}}\n\n# Question\n{{question}}\n\n# Fields\n{{columns}}\n\n# Task\n1. Check grain, nulls, duplicates and outliers.\n2. Propose suitable summary metrics.\n3. Suggest charts with named axes.\n4. Distinguish observations from hypotheses.",
    "tip": "Explicit evidence and uncertainty avoid overstating conclusions."
  },
  {
    "id": "analysis-risks",
    "category": "Analysis",
    "title": "Risk register",
    "description": "Build a trackable risk table",
    "body": "# Project\n{{project}}\n\n# Background\n{{background}}\n\n# Output\n| Risk | Likelihood | Impact | Early signal | Mitigation | Owner |\n|---|---|---|---|---|---|\n\nExplain uncertainty and use TBD for unknown owners.",
    "tip": "Explicit evidence and uncertainty avoid overstating conclusions."
  },
  {
    "id": "learning-concept",
    "category": "Learning",
    "title": "Explain a concept",
    "description": "Teach with examples and practice",
    "body": "# Role\nTeach {{topic}} to a learner at {{level}} level.\n\n# Goal\n{{goal}}\n\n# Structure\n1. Plain-language explanation\n2. Worked example\n3. Misconception and correction\n4. Two practice questions\n5. Separate answer key",
    "tip": "Explanation, practice and feedback support effective study."
  },
  {
    "id": "learning-flashcards",
    "category": "Learning",
    "title": "Flashcards",
    "description": "Turn notes into active-recall cards",
    "body": "# Notes\n{{notes}}\n\n# Task\nMake {{count}} independent flashcards.\n\n- One concept per card\n- Include hints and counterexamples\n- Flag unsupported answers\n\n# Output\n| Question | Answer | Hint |\n|---|---|---|",
    "tip": "Explanation, practice and feedback support effective study."
  },
  {
    "id": "learning-plan",
    "category": "Learning",
    "title": "Study plan",
    "description": "Plan realistic practice milestones",
    "body": "# Skill\n{{skill}}\n\n# Current level\n{{level}}\n\n# Available time\n{{time}}\n\n# Goal\n{{goal}}\n\n# Output\n- Weekly Markdown checklist\n- Short daily practice tasks\n- Measurable self-assessment\n- Adjustment plan if progress slows",
    "tip": "Explanation, practice and feedback support effective study."
  },
  {
    "id": "learning-quiz",
    "category": "Learning",
    "title": "Knowledge quiz",
    "description": "Check understanding with an answer key",
    "body": "# Topic\n{{topic}}\n\n# Source material\n{{material}}\n\n# Task\nWrite {{count}} questions mixing recall and application.\n\n# Output\n## Questions\nNumbered list without answers.\n\n## Answer key\nExplain each answer using the material.",
    "tip": "Explanation, practice and feedback support effective study."
  },
  {
    "id": "work-meeting",
    "category": "Work",
    "title": "Meeting notes",
    "description": "Turn a meeting into decisions and actions",
    "body": "# Notes\n{{notes}}\n\n# Output\n## Decisions\n## Action items\n| Action | Owner | Due date | Status |\n|---|---|---|---|\n## Open questions\n\nUse TBD when an owner or date is unknown.",
    "tip": "Action-oriented Markdown sections clarify deliverables and ownership."
  },
  {
    "id": "work-requirements",
    "category": "Work",
    "title": "Functional requirements",
    "description": "Write testable product requirements",
    "body": "# Feature\n{{feature}}\n\n# Users\n{{users}}\n\n# Objective\n{{objective}}\n\n# Output\n1. Scope and exclusions\n2. Numbered functional requirements\n3. Given/When/Then acceptance criteria\n4. Edge cases and permissions\n5. Open questions",
    "tip": "Action-oriented Markdown sections clarify deliverables and ownership."
  },
  {
    "id": "work-email",
    "category": "Work",
    "title": "Professional email",
    "description": "Draft a concise factual request",
    "body": "# Purpose\n{{purpose}}\n\n# Recipient/context\n{{recipient_context}}\n\n# Must include\n{{details}}\n\n# Tone\n{{tone}}\n\n# Output\n- Subject line\n- Concise email body\n- Clear next step\n\nDo not invent names or commitments.",
    "tip": "Action-oriented Markdown sections clarify deliverables and ownership."
  },
  {
    "id": "work-procedure",
    "category": "Work",
    "title": "Process checklist",
    "description": "Create a repeatable procedure",
    "body": "# Process\n{{process}}\n\n# Audience\n{{audience}}\n\n# Inputs\n{{inputs}}\n\n# Output\n## Prerequisites\n## Numbered steps\n## Exceptions and errors\n## Completion checklist\n\nDo not assume access to unavailable systems.",
    "tip": "Action-oriented Markdown sections clarify deliverables and ownership."
  }
];
// Preserve all original IDs and their positions for existing favorites.
export const BUILTIN_PROMPTS=[...CORE_PROMPTS,...EXPANDED_PROMPTS];
