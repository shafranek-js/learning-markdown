import {LINKEDIN_PROMPT_SAMPLE} from '../data/lessons.js';
const FENCE = "```";
// Content migrated from the original HTML prototype.
export const ui = {
                courseTitle: "Învățăm Markdown: Formatarea textului fără complexitate",
                courseSubtitle: "Cel mai bun mod de a scrie, de a crea prompturi AI și documentație",
                contentsBtn: "Cuprins",
                guideBtn: "Ghid lecție",
                sandboxBtn: "Sandbox Prompt AI",
                cheatsheetBtn: "Ghid rapid",
                certBtn: "Certificat",
                splitView: "Împărțit",
                previewView: "Previzualizare",
                curriculumTitle: "Cuprinsul cursului",
                curriculumSub: "8 module interactive + Sandbox",
                resetAllBtn: "Resetează progresul",
                snippetsLabel: "Fragmente interactive",
                clickToInsert: "Click pentru inserare",
                tasksTitle: "Listă practică",
                tasksSubtitle: "Scrieți Markdown în editor — verificare automată:",
                solutionLabel: "💡 Exemplu de soluție:",
                applySolutionBtn: "Inserează soluția",
                hintBtn: "Indiciu",
                nextLessonBtn: "Următorul",
                liveEditorBadge: "editor live",
                clearBtn: "Șterge",
                previewHeader: "Previzualizare Live (GFM)",
                copyBtn: "Copiază",
                lessonCompleteMsg: "Toate sarcinile acestui modul sunt finalizate!",
                certHeader: "Certificat de absolvire",
                modulesLabel: "Module",
                tasksSolvedLabel: "Sarcini rezolvate",
                copyCertBtn: "Copiază certificatul în Markdown",
                moduleOf: (cur, tot) => `Modulul ${cur} din ${tot}`,
                completedOf: (done, tot) => `${done} din ${tot} finalizate`,
                statusDone: "✓ Finalizat",
                statusInProgress: "În curs",
                statsBar: (l, w, c) => `Rânduri: ${l} • Cuvinte: ${w} • Caractere: ${c}`,
                cursorBar: (r, c) => `Rând ${r}, Col ${c}`,
                historyBar: (p, t) => `Istoric: ${p}/${t}`,
                toastCopied: "Copiat în clipboard!",
                toastCleared: "Editor golit (Ctrl+Z pentru anulare)",
                toastSolution: "Soluție inserată în editor"
            };
export const lessonText = {
1: {
                    title: "Titluri și ierarhia documentului",
                    subtitle: "Structurarea textului cu simbolul #",
                    theory: `<p>Titlurile definesc structura oricărui document. Nivelul titlului (1–6) este dat de numărul de simboluri <code>#</code> la începutul rândului, urmate de un spațiu.</p>`,
                    initial: "# Ghid Markdown\n\nAdăugați mai jos titluri de la H2 la H6 (##, ###, ####, #####, ######):\n\n",
                    hint: "# Ghid Markdown\n\n## Avantaje principale\n\n### Scriere rapidă",
                    tasks: ["Creați un titlu de nivelul 1 (`# Text`)", "Adăugați un titlu de nivelul 2 (`## Text`)", "Adăugați un titlu de nivelul 3 (`### Text`)"]
                },
2: {
                    title: "Text îngroșat, cursiv și tăiat",
                    subtitle: "Evidențierea ideilor principale",
                    theory: `<p>Înconjurați cuvintele cu simboluri pereche: <code>**îngroșat (bold)**</code>, <code>*cursiv*</code> sau <code>_cursiv_</code> și <code>~~tăiat~~</code>.</p>`,
                    initial: "Formatarea textului în Markdown se face rapid în timp ce tastați.\n\n",
                    hint: "Folosesc un format **rapid** și _modern_ în locul editoarelor ~~învechite~~.",
                    tasks: ["Evidențiați un cuvânt **bold** (`**cuvânt**`)", "Scrieți un cuvânt *cursiv* (`*cuvânt*` sau `_cuvânt_`)", "Tăiați un cuvânt cu o linie (`~~cuvânt~~`)"]
                },
3: {
                    title: "Liste marcate și numerotate",
                    subtitle: "Organizarea pașilor și ideilor",
                    theory: `<p>Începeți rândul cu cratimă și spațiu <code>- Element</code> sau cu număr <code>1. Pas</code>.</p>`,
                    initial: "### Elemente necesare:\n\n### Pași de urmat:\n\n",
                    hint: "### Elemente necesare:\n- Cafea proaspătă\n- Lapte\n\n### Pași de urmat:\n1. Prepară espresso\n2. Adaugă laptele",
                    tasks: ["Creați o listă marcată cu cel puțin 2 elemente (`- Element`)", "Creați o listă numerotată cu cel puțin 2 pași (`1. Pas`)"]
                },
4: {
                    title: "Citate și separatoare (Blockquotes)",
                    subtitle: "Evidențierea instrucțiunilor și notelor importante",
                    theory: `<p>Începeți rândul cu <code>&gt;</code> pentru un citat și folosiți trei cratime <code>---</code> pe un rând liber pentru o linie orizontală.</p>`,
                    initial: `# LinkedIn Video Prompt\n\n> Ești un creator expert de conținut AI pentru **LinkedIn**.\n\nAdaugă un separator orizontal (---) mai jos:\n\n`,
                    hint: `# LinkedIn Video Prompt\n\n> Ești un creator expert de conținut AI pentru **LinkedIn**.\n\n---\n\n## Înainte de a începe`,
                    tasks: ["Creați un bloc de citat (`> Text citat`)", "Adăugați un separator orizontal (`---`)"]
                },
5: {
                    title: "Linkuri și imagini",
                    subtitle: "Conectarea paginilor web și a ilustrațiilor",
                    theory: `<p>Folosiți <code>[Text](https://...)</code> pentru linkuri și <code>![Descriere](https://...)</code> pentru imagini.</p>`,
                    initial: "Resurse utile și imagine de copertă:\n\n",
                    hint: "Consultați [documentația oficială](https://commonmark.org)\n\n![Banner](https://placehold.co/600x140/ff5f2e/ffffff?text=Markdown+Studio)",
                    tasks: ["Creați un link `[Text](https://...)`", "Inserați o imagine `![Descriere](https://...)`"]
                },
6: {
                    title: "Cod în linie și blocuri de cod",
                    subtitle: "Formatarea comenzilor și scripturilor",
                    theory: `<p>Folosiți backtick simplu <code>\`npm start\`</code> pentru cod în linie și backtick triplu <code>${FENCE}</code> pentru blocuri de cod.</p>`,
                    initial: "Pentru a porni serverul, rulați comanda:\n\n",
                    hint: "Rulați `npm start` în terminal.\n\n" + FENCE + "js\nconsole.log('Hello Markdown');\n" + FENCE,
                    tasks: ["Adăugați cod în linie (`` `comandă` ``)", "Creați un bloc de cod cu backtick triplu (`" + FENCE + "`)"]
                },
7: {
                    title: "Tabele și liste de sarcini (GFM)",
                    subtitle: "Standardul extins GitHub Flavored Markdown",
                    theory: `<p>Folosiți <code>- [x] Finalizat</code> și <code>- [ ] De făcut</code> pentru sarcini și <code>| --- | --- |</code> pentru tabele.</p>`,
                    initial: "### Plan de lansare:\n\n### Comparație:\n\n",
                    hint: "### Plan de lansare:\n- [x] Scrie codul\n- [ ] Testează aplicația\n\n### Comparație:\n| Format | Viteză |\n| --- | --- |\n| Markdown | Ridicată |",
                    tasks: ["Creați o sarcină finalizată (`- [x] Sarcină`)", "Creați o sarcină activă (`- [ ] Sarcină`)", "Construiți un tabel (`| --- | --- |`)"]
                },
8: {
                    title: "Proiect Final: Prompt AI & README.md",
                    subtitle: "Combinarea tuturor tehnicilor Markdown",
                    theory: `<p>Combinați titlurile (<code>#</code>, <code>##</code>, <code>###</code>), textul îngroșat, citatul, lista, codul și un link!</p>`,
                    initial: "# Titlul proiectului\n\nDescrieți proiectul sau promptul AI mai jos:\n\n",
                    hint: LINKEDIN_PROMPT_SAMPLE + "\nRulați `npm start` și vizitați [Documentația](https://commonmark.org).\n",
                    tasks: [
                        "Titluri de 3 niveluri (`#`, `##`, `###`)",
                        "Text **îngroșat** (`**text**`)",
                        "Bloc de citat (`> Citat`)",
                        "Listă cu cel puțin 2 elemente",
                        "Cod în linie (`` `cod` ``) și link (`[Text](https://...)`)"
                    ]
                }
};
