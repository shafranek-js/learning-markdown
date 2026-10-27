// Curated expansion pack: distinct tasks, structured inputs and evidence guardrails.
export const EXPANDED_PROMPTS=[
  {
    "id": "writing-technical-guide",
    "category": "Writing",
    "title": "Technical how-to guide",
    "description": "Create a verifiable procedural guide",
    "body": "# Role\nAct as a careful professional writer. Keep claims accurate and reader-oriented.\n\n# Objective\nCreate a verifiable procedural guide.\n\n# Inputs\n- **audience**: {{audience}}\n- **task**: {{task}}\n- **environment**: {{environment}}\n- **source_notes**: {{source_notes}}\n\n# Method\n1. List permissions and prerequisites before numbered actions.\n2. Give an observable result and a check after each important step.\n3. Explain errors and recovery paths without inventing undocumented commands.\n\n# Output format\n- Prerequisites\n- Procedure\n- Verification\n- Troubleshooting and open questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Observable checks turn instructions into test cases."
  },
  {
    "id": "writing-faq",
    "category": "Writing",
    "title": "Evidence-based FAQ",
    "description": "Answer likely questions without inventing policies",
    "body": "# Role\nAct as a careful professional writer. Keep claims accurate and reader-oriented.\n\n# Objective\nAnswer likely questions without inventing policies.\n\n# Inputs\n- **topic**: {{topic}}\n- **audience**: {{audience}}\n- **source_material**: {{source_material}}\n\n# Method\n1. Group likely questions by the reader's actual task.\n2. Answer concisely, then explain only what the supplied material supports.\n3. Label missing policy, pricing or date information as unverified.\n\n# Output format\n- Frequently asked questions\n- Facts still needing confirmation\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "The source boundary protects credibility."
  },
  {
    "id": "writing-newsletter",
    "category": "Writing",
    "title": "Newsletter edition",
    "description": "Build a digest from verified updates",
    "body": "# Role\nAct as a careful professional writer. Keep claims accurate and reader-oriented.\n\n# Objective\nBuild a digest from verified updates.\n\n# Inputs\n- **theme**: {{theme}}\n- **audience**: {{audience}}\n- **updates**: {{updates}}\n- **tone_and_length**: {{tone_and_length}}\n\n# Method\n1. Use a specific subject and two-line opening.\n2. Group updates into brief sections with useful takeaways.\n3. Include only supplied links, citations and deadlines.\n\n# Output format\n- Subject and preview text\n- Opening\n- News sections\n- Closing and next step\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A digest prioritizes decisions over filler."
  },
  {
    "id": "writing-video-script",
    "category": "Writing",
    "title": "Explainer video script",
    "description": "Coordinate narration and visuals",
    "body": "# Role\nAct as a careful professional writer. Keep claims accurate and reader-oriented.\n\n# Objective\nCoordinate narration and visuals.\n\n# Inputs\n- **topic**: {{topic}}\n- **audience**: {{audience}}\n- **duration**: {{duration}}\n- **facts**: {{facts}}\n\n# Method\n1. Start with a hook and a plain-language problem statement.\n2. Divide the explanation into paced, coherent segments.\n3. Use only supplied facts and flag claims requiring checking.\n\n# Output format\n- Script table: segment | approximate time | voiceover | suggested visual\n- Closing call to action\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Script tables connect words to scenes."
  },
  {
    "id": "coding-api-design",
    "category": "Coding",
    "title": "API contract design",
    "description": "Specify endpoints and errors before implementation",
    "body": "# Role\nAct as a senior software engineer. Explain assumptions and do not claim to have executed code.\n\n# Objective\nSpecify endpoints and errors before implementation.\n\n# Inputs\n- **feature**: {{feature}}\n- **clients**: {{clients}}\n- **api_conventions**: {{api_conventions}}\n\n# Method\n1. Identify resources, permissions and invariants.\n2. Define request/response examples, errors and validation.\n3. Consider idempotency, pagination and compatibility.\n\n# Output format\n- Endpoint table: method | path | auth | purpose\n- JSON examples\n- Error model\n- Open questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Contracts expose integration risks early."
  },
  {
    "id": "coding-sql-review",
    "category": "Coding",
    "title": "SQL result validation",
    "description": "Find row-loss and duplicate risks",
    "body": "# Role\nAct as a senior software engineer. Explain assumptions and do not claim to have executed code.\n\n# Objective\nFind row-loss and duplicate risks.\n\n# Inputs\n- **sql_dialect**: {{sql_dialect}}\n- **schema**: {{schema}}\n- **query**: {{query}}\n- **business_question**: {{business_question}}\n\n# Method\n1. Verify query grain and join cardinality against the schema.\n2. Check NULL behavior, filters, dates and aggregation.\n3. Propose diagnostic queries, not imaginary execution plans.\n\n# Output format\n- Findings by severity\n- Suggested corrected SQL\n- Row-count and join tests\n- Assumptions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Validating data grain comes before tuning."
  },
  {
    "id": "coding-postmortem",
    "category": "Coding",
    "title": "Blameless incident review",
    "description": "Document evidence, causes and prevention",
    "body": "# Role\nAct as a senior software engineer. Explain assumptions and do not claim to have executed code.\n\n# Objective\nDocument evidence, causes and prevention.\n\n# Inputs\n- **timeline**: {{timeline}}\n- **impact**: {{impact}}\n- **system_context**: {{system_context}}\n\n# Method\n1. Separate observed timestamps from inferred events.\n2. Distinguish root-cause hypotheses from established evidence.\n3. Suggest mitigations and prevention with observable validation.\n\n# Output format\n- Summary and customer impact\n- Timeline\n- Factors and evidence gaps\n- Action table\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Evidence and uncertainty support learning."
  },
  {
    "id": "coding-migration",
    "category": "Coding",
    "title": "Backward-compatible migration",
    "description": "Stage a risky change with rollback",
    "body": "# Role\nAct as a senior software engineer. Explain assumptions and do not claim to have executed code.\n\n# Objective\nStage a risky change with rollback.\n\n# Inputs\n- **current_system**: {{current_system}}\n- **target_system**: {{target_system}}\n- **contracts**: {{contracts}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Inventory dependencies and existing data contracts.\n2. Define reversible rollout stages with entry and exit criteria.\n3. Add reconciliation checks, monitoring and rollback triggers.\n\n# Output format\n- Migration phases\n- Data verification\n- Regression tests\n- Rollback plan\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Reversible stages lower delivery risk."
  },
  {
    "id": "analysis-kpi-design",
    "category": "Analysis",
    "title": "KPI framework",
    "description": "Define operational metrics and guardrails",
    "body": "# Role\nAct as an impartial analyst. Do not fabricate statistics or imply causation without evidence.\n\n# Objective\nDefine operational metrics and guardrails.\n\n# Inputs\n- **goal**: {{goal}}\n- **process**: {{process}}\n- **data_sources**: {{data_sources}}\n\n# Method\n1. Separate outcome metrics from leading indicators.\n2. Define each metric's grain, formula, owner and cadence.\n3. Identify instrumentation gaps and possible gaming.\n\n# Output format\n- Metric definition table\n- Driver tree\n- Data gaps\n- Guardrails\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Definitions make dashboards auditable."
  },
  {
    "id": "analysis-root-cause",
    "category": "Analysis",
    "title": "Root-cause hypotheses",
    "description": "Investigate with disconfirming evidence",
    "body": "# Role\nAct as an impartial analyst. Do not fabricate statistics or imply causation without evidence.\n\n# Objective\nInvestigate with disconfirming evidence.\n\n# Inputs\n- **symptom**: {{symptom}}\n- **scope**: {{scope}}\n- **evidence**: {{evidence}}\n\n# Method\n1. List confirmed observations and confounding factors.\n2. Offer competing plausible hypotheses ranked by evidence.\n3. Propose tests that could reject each hypothesis.\n\n# Output format\n- Observation summary\n- Hypotheses comparison table\n- Diagnostics\n- Uncertainty\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Disconfirming tests prevent premature conclusions."
  },
  {
    "id": "analysis-executive-brief",
    "category": "Analysis",
    "title": "Executive decision brief",
    "description": "Present trade-offs in one scannable page",
    "body": "# Role\nAct as an impartial analyst. Do not fabricate statistics or imply causation without evidence.\n\n# Objective\nPresent trade-offs in one scannable page.\n\n# Inputs\n- **decision**: {{decision}}\n- **evidence**: {{evidence}}\n- **stakeholders**: {{stakeholders}}\n- **deadline**: {{deadline}}\n\n# Method\n1. Lead with a conditional recommendation tied to evidence.\n2. Identify options, costs, dependencies and assumptions.\n3. Distinguish required decisions from suggested actions.\n\n# Output format\n- Recommendation\n- Why now\n- Alternatives and risks\n- Decision requested\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Decision-first writing respects reader time."
  },
  {
    "id": "analysis-experiment-plan",
    "category": "Analysis",
    "title": "Experiment plan",
    "description": "Predefine measurable success and stop rules",
    "body": "# Role\nAct as an impartial analyst. Do not fabricate statistics or imply causation without evidence.\n\n# Objective\nPredefine measurable success and stop rules.\n\n# Inputs\n- **hypothesis**: {{hypothesis}}\n- **population**: {{population}}\n- **intervention**: {{intervention}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Define primary outcomes and safety guardrails.\n2. Propose assignment, controls and plausible confounders.\n3. Explain statistical inputs needed rather than making up numbers.\n\n# Output format\n- Metrics\n- Method and validity threats\n- Stopping rule\n- Decision criteria\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A prespecified plan reduces cherry-picking."
  },
  {
    "id": "learning-socratic-tutor",
    "category": "Learning",
    "title": "Socratic tutor",
    "description": "Practice through one question at a time",
    "body": "# Role\nAct as a supportive expert tutor. Adapt explanations to the learner's level.\n\n# Objective\nPractice through one question at a time.\n\n# Inputs\n- **topic**: {{topic}}\n- **level**: {{level}}\n- **goal**: {{goal}}\n\n# Method\n1. Begin with one diagnostic question only.\n2. Wait for an answer, then provide a short hint or correction.\n3. Advance gradually; do not reveal the full solution prematurely.\n\n# Output format\n- First response: one focused question\n- After replies: feedback and the next question\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Interactive pacing encourages independent reasoning."
  },
  {
    "id": "learning-worked-problem",
    "category": "Learning",
    "title": "Worked example",
    "description": "Explain reasoning and give transfer practice",
    "body": "# Role\nAct as a supportive expert tutor. Adapt explanations to the learner's level.\n\n# Objective\nExplain reasoning and give transfer practice.\n\n# Inputs\n- **subject**: {{subject}}\n- **problem**: {{problem}}\n- **level**: {{level}}\n\n# Method\n1. Identify the given data and the unknown.\n2. Explain and justify each step, checking intermediate results.\n3. End with a related challenge and a separate answer key.\n\n# Output format\n- Knowns and unknowns\n- Worked solution\n- Common mistake\n- Practice and answer key\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Transfer practice checks understanding."
  },
  {
    "id": "learning-language-tutor",
    "category": "Learning",
    "title": "Conversation practice",
    "description": "Practice a target language with selective feedback",
    "body": "# Role\nAct as a supportive expert tutor. Adapt explanations to the learner's level.\n\n# Objective\nPractice a target language with selective feedback.\n\n# Inputs\n- **language**: {{language}}\n- **level**: {{level}}\n- **scenario**: {{scenario}}\n\n# Method\n1. Use the target language at the specified proficiency.\n2. Ask only one question per turn and wait for a reply.\n3. Correct at most two high-impact errors and offer a natural alternative.\n\n# Output format\n- Opening scenario question\n- After replies: concise corrections and next turn\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Focused feedback avoids overwhelming learners."
  },
  {
    "id": "learning-reading-plan",
    "category": "Learning",
    "title": "Active reading plan",
    "description": "Turn reading time into checkpoints",
    "body": "# Role\nAct as a supportive expert tutor. Adapt explanations to the learner's level.\n\n# Objective\nTurn reading time into checkpoints.\n\n# Inputs\n- **material**: {{material}}\n- **objective**: {{objective}}\n- **schedule**: {{schedule}}\n- **level**: {{level}}\n\n# Method\n1. Break the reading into realistic sessions.\n2. Attach a question and a recall check to each session.\n3. Avoid invented page or chapter references.\n\n# Output format\n- Session table\n- Key questions\n- Glossary plan\n- Adjustment rules\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Checkpoints make reading active."
  },
  {
    "id": "work-uat-matrix",
    "category": "Work",
    "title": "UAT matrix",
    "description": "Turn requirements into traceable acceptance tests",
    "body": "# Role\nAct as a detail-oriented business analyst. Separate approved decisions from recommendations.\n\n# Objective\nTurn requirements into traceable acceptance tests.\n\n# Inputs\n- **feature**: {{feature}}\n- **requirements**: {{requirements}}\n- **roles**: {{roles}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Map cases to requirement IDs without inventing expected behavior.\n2. Cover happy paths, invalid input, permissions and persistence.\n3. List test data, exit criteria and unresolved requirements.\n\n# Output format\n- UAT table: ID | requirement | steps | expected | priority\n- Data and environment\n- Open questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Traceability makes sign-off defensible."
  },
  {
    "id": "work-stakeholder-status",
    "category": "Work",
    "title": "Stakeholder status",
    "description": "Separate delivered work from planned milestones",
    "body": "# Role\nAct as a detail-oriented business analyst. Separate approved decisions from recommendations.\n\n# Objective\nSeparate delivered work from planned milestones.\n\n# Inputs\n- **project**: {{project}}\n- **progress**: {{progress}}\n- **risks**: {{risks}}\n- **stakeholders**: {{stakeholders}}\n- **period**: {{period}}\n\n# Method\n1. Lead with one truthful status sentence.\n2. Distinguish completed work, in-progress tasks and dependencies.\n3. Request decisions explicitly; never imply approval that did not occur.\n\n# Output format\n- Status\n- Done\n- Next\n- Risks and decisions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Clear status labels prevent misleading reports."
  },
  {
    "id": "work-process-controls",
    "category": "Work",
    "title": "Process control review",
    "description": "Map workflow weaknesses and evidence",
    "body": "# Role\nAct as a detail-oriented business analyst. Separate approved decisions from recommendations.\n\n# Objective\nMap workflow weaknesses and evidence.\n\n# Inputs\n- **workflow**: {{workflow}}\n- **target**: {{target}}\n- **requirements**: {{requirements}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Trace handoffs, approvals and exception paths.\n2. Identify missing controls and audit evidence.\n3. Rank improvements while noting compliance questions for specialists.\n\n# Output format\n- Gap table\n- Quick wins\n- Long-term controls\n- Questions for owners\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Evidence requirements make process gaps actionable."
  },
  {
    "id": "work-decision-record",
    "category": "Work",
    "title": "Decision record",
    "description": "Capture the reasons and triggers for revisiting a decision",
    "body": "# Role\nAct as a detail-oriented business analyst. Separate approved decisions from recommendations.\n\n# Objective\nCapture the reasons and triggers for revisiting a decision.\n\n# Inputs\n- **context**: {{context}}\n- **alternatives**: {{alternatives}}\n- **criteria**: {{criteria}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Describe known constraints and alternatives fairly.\n2. Separate the approved choice from a proposed choice.\n3. Document assumptions, risks and reversal triggers.\n\n# Output format\n- Decision status\n- Options and rationale\n- Risks\n- Follow-up triggers\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A decision record should be revisitable."
  },
  {
    "id": "research-plan",
    "category": "Research",
    "title": "Research strategy",
    "description": "Formulate answerable questions and source criteria",
    "body": "# Role\nAct as a research analyst. Cite only source details actually supplied and flag gaps.\n\n# Objective\nFormulate answerable questions and source criteria.\n\n# Inputs\n- **topic**: {{topic}}\n- **objective**: {{objective}}\n- **audience**: {{audience}}\n- **resources**: {{resources}}\n\n# Method\n1. Turn a broad topic into answerable questions.\n2. Specify source types, search terms and inclusion criteria.\n3. Explain what would support or refute each claim.\n\n# Output format\n- Research questions\n- Search plan\n- Evidence criteria\n- Synthesis method\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Search criteria belong before gathering evidence."
  },
  {
    "id": "research-evidence-matrix",
    "category": "Research",
    "title": "Evidence matrix",
    "description": "Map supplied sources to claims and gaps",
    "body": "# Role\nAct as a research analyst. Cite only source details actually supplied and flag gaps.\n\n# Objective\nMap supplied sources to claims and gaps.\n\n# Inputs\n- **claims**: {{claims}}\n- **sources**: {{sources}}\n- **scope**: {{scope}}\n\n# Method\n1. Break claims into independently checkable statements.\n2. Map supporting and contradictory supplied sources.\n3. Mark low-confidence evidence and missing documentation.\n\n# Output format\n- Claim | supporting source | contrary source | confidence | gap\n- Verification plan\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Claim-to-source mapping exposes uncertainty."
  },
  {
    "id": "research-literature-review",
    "category": "Research",
    "title": "Literature synthesis",
    "description": "Synthesize supplied paper summaries without fabricated citations",
    "body": "# Role\nAct as a research analyst. Cite only source details actually supplied and flag gaps.\n\n# Objective\nSynthesize supplied paper summaries without fabricated citations.\n\n# Inputs\n- **question**: {{question}}\n- **papers**: {{papers}}\n- **criteria**: {{criteria}}\n\n# Method\n1. Find convergent themes and genuine disagreements.\n2. Compare methods, populations and limitations.\n3. Use only provided authors, years and citations.\n\n# Output format\n- Source coverage\n- Themes\n- Disagreements\n- Limitations and future work\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Method differences qualify apparent consensus."
  },
  {
    "id": "research-factcheck",
    "category": "Research",
    "title": "Fact-check checklist",
    "description": "Build a verification plan rather than an unsupported verdict",
    "body": "# Role\nAct as a research analyst. Cite only source details actually supplied and flag gaps.\n\n# Objective\nBuild a verification plan rather than an unsupported verdict.\n\n# Inputs\n- **claim**: {{claim}}\n- **context**: {{context}}\n- **evidence**: {{evidence}}\n\n# Method\n1. Split the statement into discrete factual assertions.\n2. Identify suitable primary and independent sources.\n3. Mark what can and cannot be concluded from current evidence.\n\n# Output format\n- Claim | verification method | present evidence | status\n- Missing sources\n- Cautious rewrite\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Verification steps help avoid premature claims."
  },
  {
    "id": "design-journey-map",
    "category": "Design & UX",
    "title": "User journey map",
    "description": "Map goals, friction and evidence across stages",
    "body": "# Role\nAct as a UX researcher. Separate observed behavior from speculative design assumptions.\n\n# Objective\nMap goals, friction and evidence across stages.\n\n# Inputs\n- **product**: {{product}}\n- **persona_and_goal**: {{persona_and_goal}}\n- **research_notes**: {{research_notes}}\n- **scope**: {{scope}}\n\n# Method\n1. List user actions and goals in chronological stages.\n2. Distinguish observed friction from hypothesized frustration.\n3. Find the smallest research tasks to validate priorities.\n\n# Output format\n- Journey table: stage | action | goal | friction | evidence\n- Opportunities\n- Unknowns\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A journey map needs evidence, not invented personas."
  },
  {
    "id": "design-heuristic-audit",
    "category": "Design & UX",
    "title": "UX heuristic audit",
    "description": "Evaluate interface consistency and error recovery",
    "body": "# Role\nAct as a UX researcher. Separate observed behavior from speculative design assumptions.\n\n# Objective\nEvaluate interface consistency and error recovery.\n\n# Inputs\n- **flow**: {{flow}}\n- **users**: {{users}}\n- **observations**: {{observations}}\n\n# Method\n1. Check feedback, affordances, consistency and cognitive load.\n2. Describe each issue with supporting observations.\n3. Identify necessary screenshots and usability tests.\n\n# Output format\n- Issue | evidence | heuristic | severity | fix\n- Quick wins\n- Research dependencies\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Severity rationale prevents arbitrary priorities."
  },
  {
    "id": "design-accessibility-plan",
    "category": "Design & UX",
    "title": "Accessibility checklist",
    "description": "Plan manual and automated accessibility checks",
    "body": "# Role\nAct as a UX researcher. Separate observed behavior from speculative design assumptions.\n\n# Objective\nPlan manual and automated accessibility checks.\n\n# Inputs\n- **component**: {{component}}\n- **platforms**: {{platforms}}\n- **evidence**: {{evidence}}\n\n# Method\n1. Cover keyboard navigation, focus and status announcements.\n2. Consider contrast, zoom, motion and form errors.\n3. Distinguish likely concerns from tested failures.\n\n# Output format\n- Test case | procedure | expected\n- Coverage gaps\n- Assistive tech checks\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Accessibility claims require actual testing."
  },
  {
    "id": "design-usability-test",
    "category": "Design & UX",
    "title": "Usability study script",
    "description": "Plan neutral user tasks and observation questions",
    "body": "# Role\nAct as a UX researcher. Separate observed behavior from speculative design assumptions.\n\n# Objective\nPlan neutral user tasks and observation questions.\n\n# Inputs\n- **feature**: {{feature}}\n- **participants**: {{participants}}\n- **research_goals**: {{research_goals}}\n- **session_constraints**: {{session_constraints}}\n\n# Method\n1. Write non-leading scenarios and realistic tasks.\n2. Observe success, errors and recovery without steering participants.\n3. Plan ethical consent, note-taking and synthesis.\n\n# Output format\n- Introduction\n- Task prompts\n- Follow-up questions\n- Analysis plan\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Neutral prompts yield more reliable findings."
  },
  {
    "id": "career-tailor-cv",
    "category": "Career",
    "title": "CV improvement",
    "description": "Align real experience to a target job",
    "body": "# Role\nAct as a career coach. Preserve the candidate's real background and verified facts.\n\n# Objective\nAlign real experience to a target job.\n\n# Inputs\n- **job_description**: {{job_description}}\n- **experience**: {{experience}}\n- **format**: {{format}}\n\n# Method\n1. Identify matched competencies and genuine gaps.\n2. Rewrite summary and bullets using only supplied facts.\n3. Recommend keywords naturally without invented metrics or credentials.\n\n# Output format\n- Match matrix\n- Revised profile\n- Grounded bullets\n- Clarifying questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Truthful relevance beats fabricated achievements."
  },
  {
    "id": "career-mock-interview",
    "category": "Career",
    "title": "Mock interview",
    "description": "Practice realistic role-specific questions",
    "body": "# Role\nAct as a career coach. Preserve the candidate's real background and verified facts.\n\n# Objective\nPractice realistic role-specific questions.\n\n# Inputs\n- **role**: {{role}}\n- **requirements**: {{requirements}}\n- **background**: {{background}}\n- **focus**: {{focus}}\n\n# Method\n1. Ask one question per turn and wait for the answer.\n2. Give evidence-focused feedback on structure and relevance.\n3. Increase difficulty only as practice progresses.\n\n# Output format\n- First reply: interview question only\n- Later: feedback, example structure and next question\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Single-turn questions enable genuine practice."
  },
  {
    "id": "career-job-comparison",
    "category": "Career",
    "title": "Compare job offers",
    "description": "Assess opportunities against stated constraints",
    "body": "# Role\nAct as a career coach. Preserve the candidate's real background and verified facts.\n\n# Objective\nAssess opportunities against stated constraints.\n\n# Inputs\n- **opportunities**: {{opportunities}}\n- **priorities**: {{priorities}}\n- **constraints**: {{constraints}}\n- **unknowns**: {{unknowns}}\n\n# Method\n1. Separate verified offer details from assumptions.\n2. Compare remote policy, compensation, duties and growth on known information.\n3. List questions before making a final recommendation.\n\n# Output format\n- Role comparison table\n- Trade-offs\n- Recruiter questions\n- Conditional shortlist\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Unknown conditions should not become scores."
  },
  {
    "id": "career-recruiter-reply",
    "category": "Career",
    "title": "Recruiter response",
    "description": "Draft a factual and natural recruiter reply",
    "body": "# Role\nAct as a career coach. Preserve the candidate's real background and verified facts.\n\n# Objective\nDraft a factual and natural recruiter reply.\n\n# Inputs\n- **message**: {{message}}\n- **preferences**: {{preferences}}\n- **background**: {{background}}\n- **tone**: {{tone}}\n\n# Method\n1. Acknowledge the specific opportunity politely.\n2. Ask only relevant missing questions.\n3. Do not invent work eligibility, availability or salary.\n\n# Output format\n- Subject if needed\n- Concise reply\n- Open questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Verified facts keep outreach professional."
  },
  {
    "id": "marketing-positioning",
    "category": "Marketing",
    "title": "Value proposition",
    "description": "Create testable positioning hypotheses",
    "body": "# Role\nAct as a responsible marketing strategist. Do not invent testimonials, results or prices.\n\n# Objective\nCreate testable positioning hypotheses.\n\n# Inputs\n- **product**: {{product}}\n- **audience**: {{audience}}\n- **problem_evidence**: {{problem_evidence}}\n- **alternatives**: {{alternatives}}\n\n# Method\n1. Specify audience problem and supported benefits.\n2. Differentiate from alternatives without absolute superiority claims.\n3. Identify what customer evidence would validate the message.\n\n# Output format\n- Positioning statement\n- Three variants\n- Evidence required\n- Validation questions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Positioning should be testable, not inflated."
  },
  {
    "id": "marketing-segments",
    "category": "Marketing",
    "title": "Audience segmentation",
    "description": "Turn research notes into segment hypotheses",
    "body": "# Role\nAct as a responsible marketing strategist. Do not invent testimonials, results or prices.\n\n# Objective\nTurn research notes into segment hypotheses.\n\n# Inputs\n- **product**: {{product}}\n- **research**: {{research}}\n- **segments**: {{segments}}\n\n# Method\n1. Group audiences by needs and decisions rather than unsupported stereotypes.\n2. Mark evidence for and against each provisional segment.\n3. Write neutral interview questions to test fit.\n\n# Output format\n- Segment | goal | barrier | evidence | unknown\n- Validation interviews\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Personas are hypotheses until tested."
  },
  {
    "id": "marketing-landing-page",
    "category": "Marketing",
    "title": "Landing page outline",
    "description": "Draft benefit-driven but honest page copy",
    "body": "# Role\nAct as a responsible marketing strategist. Do not invent testimonials, results or prices.\n\n# Objective\nDraft benefit-driven but honest page copy.\n\n# Inputs\n- **product_and_audience**: {{product_and_audience}}\n- **benefit**: {{benefit}}\n- **proof**: {{proof}}\n- **cta**: {{cta}}\n\n# Method\n1. Use one clear headline and specific supporting benefits.\n2. Include only supplied testimonials, pricing and performance claims.\n3. Address likely objections and keep one primary call to action.\n\n# Output format\n- Hero copy\n- Benefits\n- Proof\n- FAQ\n- CTA\n- A/B hypotheses\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A single action reduces ambiguity."
  },
  {
    "id": "marketing-launch-plan",
    "category": "Marketing",
    "title": "Launch plan",
    "description": "Organize launch assets and checkpoints",
    "body": "# Role\nAct as a responsible marketing strategist. Do not invent testimonials, results or prices.\n\n# Objective\nOrganize launch assets and checkpoints.\n\n# Inputs\n- **product**: {{product}}\n- **audience**: {{audience}}\n- **timeline**: {{timeline}}\n- **channels**: {{channels}}\n\n# Method\n1. Map preparation, announcement and follow-up phases.\n2. Name approvals, dependencies and measurable signals.\n3. Mark budget, owners and dates TBD when unspecified.\n\n# Output format\n- Phase | deliverable | channel | owner | metric\n- Risks\n- Review cadence\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Dependencies make launch plans usable."
  },
  {
    "id": "productivity-week-plan",
    "category": "Productivity",
    "title": "Weekly planning",
    "description": "Balance goals against real available time",
    "body": "# Role\nAct as a practical planning partner. Avoid promising impossible capacity or invented estimates.\n\n# Objective\nBalance goals against real available time.\n\n# Inputs\n- **tasks**: {{tasks}}\n- **schedule**: {{schedule}}\n- **goals**: {{goals}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Identify the three outcomes with highest value.\n2. Respect fixed commitments and realistic effort.\n3. Recommend deferring tasks when capacity is insufficient.\n\n# Output format\n- Top priorities\n- Time blocks\n- Dependencies\n- Review checklist\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Planning must fit available capacity."
  },
  {
    "id": "productivity-task-breakdown",
    "category": "Productivity",
    "title": "Project task breakdown",
    "description": "Turn an objective into verifiable work items",
    "body": "# Role\nAct as a practical planning partner. Avoid promising impossible capacity or invented estimates.\n\n# Objective\nTurn an objective into verifiable work items.\n\n# Inputs\n- **objective**: {{objective}}\n- **resources**: {{resources}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Break work into small deliverables with explicit done criteria.\n2. Identify dependencies and the earliest unblocked action.\n3. Mark estimates as uncertain if unsupported.\n\n# Output format\n- ID | task | dependency | done when\n- Critical path\n- First step\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "A deliverable is more testable than a vague task."
  },
  {
    "id": "productivity-prioritization",
    "category": "Productivity",
    "title": "Prioritization matrix",
    "description": "Compare tasks against transparent criteria",
    "body": "# Role\nAct as a practical planning partner. Avoid promising impossible capacity or invented estimates.\n\n# Objective\nCompare tasks against transparent criteria.\n\n# Inputs\n- **tasks**: {{tasks}}\n- **goal**: {{goal}}\n- **criteria**: {{criteria}}\n- **constraints**: {{constraints}}\n\n# Method\n1. Explain impact, effort, urgency and prerequisites.\n2. Use qualitative categories unless numeric evidence exists.\n3. Show how ranking would change under different constraints.\n\n# Output format\n- Item | impact | effort | dependency | tier\n- Suggested order\n- Assumptions\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Transparent criteria enable debate and revision."
  },
  {
    "id": "productivity-retrospective",
    "category": "Productivity",
    "title": "Project retrospective",
    "description": "Translate reflection into controlled experiments",
    "body": "# Role\nAct as a practical planning partner. Avoid promising impossible capacity or invented estimates.\n\n# Objective\nTranslate reflection into controlled experiments.\n\n# Inputs\n- **project**: {{project}}\n- **observations**: {{observations}}\n- **context**: {{context}}\n\n# Method\n1. Separate actual outcomes from interpretations.\n2. Identify patterns without blaming individuals.\n3. Recommend small improvements with observable success signals.\n\n# Output format\n- Worked well\n- Challenges\n- Hypotheses\n- Next experiments table\n\n# Quality checks\n- Clearly distinguish established facts from assumptions.\n- Flag missing information and request confirmation rather than inventing it.\n- Use readable Markdown headings, lists, and tables as appropriate.",
    "tip": "Specific follow-ups make retrospectives useful."
  }
];
