import {LINKEDIN_PROMPT_SAMPLE} from '../data/lessons.js';
const FENCE = "```";
// Content migrated from the original HTML prototype.
export const ui = {
                courseTitle: "Učíme se Markdown: Formátování textu bez složitostí",
                courseSubtitle: "Nejlepší způsob psaní, tvorby AI promptů a dokumentace",
                contentsBtn: "Obsah",
                guideBtn: "Průvodce lekcí",
                sandboxBtn: "AI Prompt Pískoviště",
                cheatsheetBtn: "Tahák",
                certBtn: "Certifikát",
                splitView: "Rozděleně",
                previewView: "Náhled",
                curriculumTitle: "Obsah kurzu",
                curriculumSub: "8 interaktivních modulů + Pískoviště",
                resetAllBtn: "Resetovat postup",
                snippetsLabel: "Interaktivní ukázky",
                clickToInsert: "Kliknutím vložíte",
                tasksTitle: "Praktický úkol",
                tasksSubtitle: "Pište Markdown do editoru — úkoly se ověřují automaticky:",
                solutionLabel: "💡 Ukázka řešení:",
                applySolutionBtn: "Vložit řešení",
                hintBtn: "Nápověda",
                nextLessonBtn: "Další",
                liveEditorBadge: "živý editor",
                clearBtn: "Vymazat",
                previewHeader: "Živý náhled (GFM)",
                copyBtn: "Kopírovat",
                lessonCompleteMsg: "Všechny úkoly této lekce jsou splněny!",
                certHeader: "Certifikát o absolvování",
                modulesLabel: "Moduly",
                tasksSolvedLabel: "Splněné úkoly",
                copyCertBtn: "Kopírovat certifikát v Markdownu",
                moduleOf: (cur, tot) => `Modul ${cur} z ${tot}`,
                completedOf: (done, tot) => `Splněno ${done} z ${tot}`,
                statusDone: "✓ Hotovo",
                statusInProgress: "Probíhá",
                statsBar: (l, w, c) => `Řádky: ${l} • Slova: ${w} • Znaky: ${c}`,
                cursorBar: (r, c) => `Řádek ${r}, Sl. ${c}`,
                historyBar: (p, t) => `Historie: ${p}/${t}`,
                toastCopied: "Zkopírováno do schránky!",
                toastCleared: "Editor vymazán (Ctrl+Z pro vrácení)",
                toastSolution: "Řešení vloženo do editoru"
            };
export const lessonText = {
1: {
                    title: "Nadpisy a hierarchie dokumentu",
                    subtitle: "Strukturování textu pomocí symbolů #",
                    theory: `<p>Nadpisy určují strukturu každého dokumentu nebo AI promptu. Úroveň nadpisu (1 až 6) je dána počtem křížků <code>#</code> na začátku řádku následovaných mezerou.</p>`,
                    initial: "# Průvodce Markdownem\n\nNíže doplňte nadpisy úrovní H2 až H6 (##, ###, ####, #####, ######):\n\n",
                    hint: "# Průvodce Markdownem\n\n## Hlavní výhody\n\n### Rychlé psaní",
                    tasks: ["Vytvořte nadpis 1. úrovně (`# Text`)", "Přidejte nadpis 2. úrovně (`## Text`)", "Přidejte nadpis 3. úrovně (`### Text`)"]
                },
2: {
                    title: "Tučné písmo, kurzíva a přeškrtnutí",
                    subtitle: "Zvýraznění důležitých pojmů v textu",
                    theory: `<p>Obalte slova hvězdičkami nebo podtržítky: <code>**tučně**</code>, <code>*kurzíva*</code> nebo <code>_kurzíva_</code> a <code>~~přeškrtnuté~~</code>.</p>`,
                    initial: "Markdown umožňuje rychlé formátování textu přímo při psaní.\n\n",
                    hint: "Používám **rychlý** a _moderní_ formát místo ~~zastaralých~~ editorů.",
                    tasks: ["Zvýrazněte slovo **tučně** (`**slovo**`)", "Napište slovo *kurzívou* (`*slovo*` nebo `_slovo_`)", "Přeškrtněte slovo (`~~slovo~~`)"]
                },
3: {
                    title: "Odrážkové a číslované seznamy",
                    subtitle: "Uspořádání bodů a postupů",
                    theory: `<p>Začněte řádek pomlčkou a mezerou <code>- Bod</code> pro odrážky, nebo číslem <code>1. Krok</code> pro číslovaný seznam.</p>`,
                    initial: "### Nákupní seznam:\n\n### Postup přípravy:\n\n",
                    hint: "### Nákupní seznam:\n- Čerstvá káva\n- Ovesné mléko\n\n### Postup přípravy:\n1. Připravit espresso\n2. Наpěnit mléko",
                    tasks: ["Vytvořte odrážkový seznam alespoň o 2 bodech (`- Bod`)", "Vytvořte číslovaný seznam alespoň o 2 krocích (`1. Krok`)"]
                },
4: {
                    title: "Citace a oddělovače (Blockquotes)",
                    subtitle: "Zvýraznění myšlenek a instrukcí pro AI",
                    theory: `<p>Začněte řádek symbolem <code>&gt;</code> pro citaci (nebo <code>&gt;&gt;</code> pro vnořenou citaci). Tři pomlčky <code>---</code> na samostatném řádku vytvoří vodorovnou čáru.</p>`,
                    initial: `# LinkedIn Video Prompt\n\n> Jste expertní tvůrce AI obsahu pro **LinkedIn**.\n\nDoplňte vodorovný oddělovač (---) níže:\n\n`,
                    hint: `# LinkedIn Video Prompt\n\n> Jste expertní tvůrce AI obsahu pro **LinkedIn**.\n\n---\n\n## Než začnete`,
                    tasks: ["Vytvořte blok citace (`> Text citace`)", "Přidejte vodorovný oddělovač (`---`)"]
                },
5: {
                    title: "Odkazy a obrázky",
                    subtitle: "Propojení webových stránek a médií",
                    theory: `<p>Pro odkaz použijte <code>[Text](https://...)</code> a pro obrázek přidejte na začátek vykřičník <code>![Popis](https://...)</code>.</p>`,
                    initial: "Užitečné zdroje a ilustrace:\n\n",
                    hint: "Přečtěte si [dokumentaci CommonMark](https://commonmark.org)\n\n![Banner](https://placehold.co/600x140/ff5f2e/ffffff?text=Markdown+Studio)",
                    tasks: ["Vytvořte odkaz `[Text](https://...)`", "Vložte obrázek `![Popis](https://...)`"]
                },
6: {
                    title: "Řádkový kód a bloky kódu",
                    subtitle: "Formátování příkazů terminálu a skriptů",
                    theory: `<p>Krátké příkazy uzavřete do zpětných апоstrofů <code>\`npm start\`</code> a víceřádkové bloky do trojitých <code>${FENCE}</code>.</p>`,
                    initial: "Spusťte server příkazem v terminálu:\n\n",
                    hint: "Spusťte `npm start` v terminálu.\n\n" + FENCE + "js\nconsole.log('Hello Markdown');\n" + FENCE,
                    tasks: ["Přidejte řádkový kód (`` `příkaz` ``)", "Vytvořte blok kódu přes trojité apostrofy (`" + FENCE + "`)"]
                },
7: {
                    title: "Tabulky a úkolovníky (GFM)",
                    subtitle: "Rozšířený standard GitHub Flavored Markdown",
                    theory: `<p>Úkolovníky pište pomocí <code>- [x] Hotovo</code> a <code>- [ ] Úkol</code>. Tabulky oddělujte svislítky <code>|</code> a řádkem <code>| --- | --- |</code>.</p>`,
                    initial: "### Plán vydání:\n\n### Srovnání:\n\n",
                    hint: "### Plán vydání:\n- [x] Napsat dokumentaci\n- [ ] Otestovat nasazení\n\n### Srovnání:\n| Formát | Rychlost |\n| --- | --- |\n| Markdown | Vysoká |",
                    tasks: ["Vytvořte splněný úkol (`- [x] Úkol`)", "Vytvořte otevřený úkol (`- [ ] Úkol`)", "Sestavte tabulku s hlavičkou (`| --- | --- |`)"]
                },
8: {
                    title: "Závěrečný projekt: Kompletní AI Prompt & README",
                    subtitle: "Spojení všech technik Markdownu v jednom dokumentu",
                    theory: `<p>Zkombinujte nadpisy (<code>#</code>, <code>##</code>, <code>###</code>), tučné písmo, citaci, seznam, řádkový kód a odkaz!</p>`,
                    initial: "# Název projektu\n\nPopište svůj projekt nebo AI prompt pomocí všech prvků Markdownu:\n\n",
                    hint: LINKEDIN_PROMPT_SAMPLE + "\nSpusťte `npm start` a navštivte [Web projektu](https://commonmark.org).\n",
                    tasks: [
                        "Použijte 3 úrovně nadpisů (`#`, `##`, `###`)",
                        "Zvýrazněte text **tučně** (`**text**`)",
                        "Přidejte blok citace (`> Citace`)",
                        "Vytvořte seznam alespoň o 2 položkách",
                        "Přidejte řádkový kód (`` `kód` ``) a odkaz (`[Text](https://...)`)"
                    ]
                }
};
