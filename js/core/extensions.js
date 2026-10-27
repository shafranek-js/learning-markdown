// Optional processor-specific features. Never redefine normative Markdown modes.
export const EXTENSIONS=Object.freeze({
 softbreaks:Object.freeze({id:'softbreaks',category:'app',modes:Object.freeze(['gfm']),option:Object.freeze({breaks:true})}),
 footnotes:Object.freeze({id:'footnotes',category:'github-platform',modes:Object.freeze(['gfm']),option:Object.freeze({})}),
 headingIds:Object.freeze({id:'headingIds',category:'app',modes:Object.freeze(['gfm']),option:Object.freeze({})}),
 definitionLists:Object.freeze({id:'definitionLists',category:'app',modes:Object.freeze(['gfm']),option:Object.freeze({})}),
 emojiShortcodes:Object.freeze({id:'emojiShortcodes',category:'app',modes:Object.freeze(['gfm']),option:Object.freeze({})})
});
const LANG='en|cs|uk|ro|ru';
export const validDocumentKey=key=>typeof key==='string'&&(/^(?:sandbox|lesson_[1-8]|advanced_[1-7])_(?:en|cs|uk|ro|ru)$/.test(key)||/^sandbox_doc_(?:en|cs|uk|ro|ru)_tab_[a-z0-9_-]{4,64}$/.test(key));
export function normalizeExtensionSettings(data){
 const out=Object.create(null);
 if(!data||typeof data!=='object'||Array.isArray(data))return out;
 for(const [key,options] of Object.entries(data)){
  if(!validDocumentKey(key)||!options||typeof options!=='object'||Array.isArray(options))continue;
  const selected={};
  if(options.softbreaks===true)selected.softbreaks=true;
  if(options.footnotes===true)selected.footnotes=true;
  if(options.headingIds===true)selected.headingIds=true;
  if(options.definitionLists===true)selected.definitionLists=true;
  if(options.emojiShortcodes===true)selected.emojiShortcodes=true;
  if(Object.keys(selected).length)out[key]=selected;
 }
 return out;
}
export const extensionEnabled=(settings,key,dialect,id)=>
 Object.hasOwn(EXTENSIONS,id)&&validDocumentKey(key)&&
 EXTENSIONS[id].modes.includes(dialect)&&settings?.[key]?.[id]===true;
export function changeExtension(settings,key,id,on){
 const safe=normalizeExtensionSettings(settings);
 if(!validDocumentKey(key)||!Object.hasOwn(EXTENSIONS,id))return safe;
 if(on===true)safe[key]={...(safe[key]||{}),[id]:true};
 else if(safe[key]){delete safe[key][id];if(!Object.keys(safe[key]).length)delete safe[key];}
 return safe;
}
export function parserExtensionOptions(settings,key,dialect){
 const options={};
 for(const feature of Object.values(EXTENSIONS))
  if(extensionEnabled(settings,key,dialect,feature.id))Object.assign(options,feature.option);
 return options;
}
export const EXTENSION_TEXT={
 en:{title:'Optional processor extension',label:'Soft line breaks (app-only)',off:'Off (standard GFM)',on:'On (this document)',note:'Not normative GFM; active only in GFM. Your Markdown source stays unchanged.',unavailable:'Only available in GFM; your choice is saved.',matrix:'Portability matrix',feature:'Feature',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'This app',headings:'Headings and emphasis',tables:'Tables and task lists',breaks:'Extra soft line breaks',html:'HTML/CSS presets',footnotes:'Footnotes (opt-in, GitHub.com)',yes:'Yes',no:'No',varies:'Varies',planned:'Planned',warning:'App-only line break rendering is enabled. Other Markdown processors may display single newlines differently. Your .md source will remain unchanged. Download anyway?'},
 cs:{title:'Volitelné rozšíření procesoru',label:'Měkké konce řádků (jen aplikace)',off:'Vypnuto (GFM standard)',on:'Zapnuto (tento dokument)',note:'Není součástí GFM; pouze v režimu GFM. Zdroj Markdownu se nemění.',unavailable:'Jen v GFM; nastavení je uložené.',matrix:'Matice přenositelnosti',feature:'Funkce',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Tato aplikace',headings:'Nadpisy a zvýraznění',tables:'Tabulky a úkoly',breaks:'Další měkké zlomy',html:'HTML/CSS předvolby',footnotes:'Poznámky pod čarou (volitelné)',yes:'Ano',no:'Ne',varies:'Různé',planned:'Plánováno',warning:'Tento dokument používá vlastní zalamování řádků. Jiné procesory jej mohou zobrazit jinak. Zdroj .md se nezmění. Stáhnout?'},
 uk:{title:'Додаткове розширення процесора',label:'М’які переноси (лише застосунок)',off:'Вимкнено (стандарт GFM)',on:'Увімкнено (цей документ)',note:'Не входить у GFM; лише в режимі GFM. Markdown не змінюється.',unavailable:'Лише GFM; вибір збережено.',matrix:'Матриця сумісності',feature:'Функція',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Цей застосунок',headings:'Заголовки й виділення',tables:'Таблиці й завдання',breaks:'Додаткові переноси',html:'Шаблони HTML/CSS',footnotes:'Виноски (опційно)',yes:'Так',no:'Ні',varies:'Залежить',planned:'Планується',warning:'Включено нестандартні переноси. Інші процесори можуть показувати їх інакше. Markdown не зміниться. Завантажити?'},
 ro:{title:'Extensie opțională',label:'Rânduri noi simple (doar aplicația)',off:'Oprit (GFM standard)',on:'Pornit (acest document)',note:'Nu este GFM normativ; doar în modul GFM. Sursa nu se schimbă.',unavailable:'Doar GFM; setarea rămâne salvată.',matrix:'Matrice de portabilitate',feature:'Funcție',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Această aplicație',headings:'Titluri și evidențiere',tables:'Tabele și sarcini',breaks:'Rânduri noi suplimentare',html:'Șabloane HTML/CSS',footnotes:'Note de subsol (opțional)',yes:'Da',no:'Nu',varies:'Depinde',planned:'Planificat',warning:'Acest document activează rânduri noi specifice aplicației. Alte procesoare le pot reda diferit. Sursa .md rămâne neschimbată. Descărcați?'},
 ru:{title:'Дополнительное расширение',label:'Мягкие переносы (только приложение)',off:'Выключено (стандартный GFM)',on:'Включено (этот документ)',note:'Не входит в нормативный GFM; только для режима GFM. Markdown не изменяется.',unavailable:'Только для GFM; выбор сохранён.',matrix:'Матрица совместимости',feature:'Возможность',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Это приложение',headings:'Заголовки и выделение',tables:'Таблицы и списки задач',breaks:'Дополнительные переносы',html:'Шаблоны HTML/CSS',footnotes:'Сноски (по выбору)',yes:'Да',no:'Нет',varies:'Зависит',planned:'В планах',warning:'В документе включены нестандартные переносы строк. Другие процессоры могут отображать их иначе. Исходный .md сохранится без изменений. Скачать?'}
};
export const extensionText=lang=>EXTENSION_TEXT[lang]||EXTENSION_TEXT.en;


export const FOOTNOTE_TEXT={
 en:{heading:"Footnotes",ref:"Footnote",back:"Back to reference",exercise:"Practice: reference one note twice",pending:"Not yet complete",done:"Complete",label:'Footnotes (GitHub.com extension, opt-in)',sample:'Insert footnote example',
  note:'Not normative GFM. Numbered notes, repeated references, backlinks; only available in GFM.',
  warning:'This document uses opt-in footnotes. GitHub.com supports them, but plain GFM / CommonMark processors may not. The .md source remains unchanged. Download anyway?'},
 cs:{heading:"Poznámky pod čarou",ref:"Poznámka",back:"Zpět na odkaz",exercise:"Cvičení: odkažte dvakrát na jednu poznámku",pending:"Ještě nesplněno",done:"Splněno",label:'Poznámky pod čarou (volitelně pro GitHub.com)',sample:'Vložit příklad poznámky',
  note:'Není součástí GFM. Číslované poznámky a zpětné odkazy pouze v režimu GFM.',
  warning:'Dokument obsahuje volitelné poznámky pod čarou. GitHub.com je podporuje, čisté GFM/CommonMark nikoli. Zdroj .md se nemění. Stáhnout?'},
 uk:{heading:"Виноски",ref:"Виноска",back:"Назад до посилання",exercise:"Вправа: двічі послатися на jednu виноску",pending:"Ще не виконано",done:"Виконано",label:'Виноски (GitHub.com, необов’язково)',sample:'Додати приклад виноски',
  note:'Не входять до GFM. Нумерація та зворотні посилання лише у режимі GFM.',
  warning:'Документ містить додаткові виноски. GitHub.com підтримує їх, базові GFM/CommonMark — ні. Джерело .md не зміниться. Завантажити?'},
 ro:{heading:"Note de subsol",ref:"Nota",back:"Înapoi la referință",exercise:"Exercițiu: referiți aceeași notă de două ori",pending:"Încă incomplet",done:"Complet",label:'Note de subsol (GitHub.com, opțional)',sample:'Inserează un exemplu de notă',
  note:'Nu fac parte din GFM normativ. Numerotare și referințe înapoi doar în GFM.',
  warning:'Documentul folosește note de subsol opționale. GitHub.com le acceptă, GFM/CommonMark simplu nu. Sursa .md rămâne intactă. Descărcați?'},
 ru:{heading:"Сноски",ref:"Сноска",back:"Вернуться к упоминанию",exercise:"Упражнение: сослаться на одну сноску дважды",pending:"Не выполнено",done:"Выполнено",label:'Сноски (GitHub.com, по выбору)',sample:'Вставить пример сноски',
  note:'Не входят в стандарт GFM. Нумерация и обратные ссылки работают только в режиме GFM.',
  warning:'Документ использует дополнительные сноски. GitHub.com их поддерживает, базовые GFM/CommonMark — нет. Исходный .md не меняется. Скачать?'}
};
export const footnoteText=lang=>FOOTNOTE_TEXT[lang]||FOOTNOTE_TEXT.en;


export const DEFINITION_TEXT={
 en:{label:'Definition lists (app-only, opt-in)',note:'Not normative GFM or CommonMark; enabled only in GFM. Basic HTML definition lists work in every mode.',sample:'Insert Markdown definition example',html:'Insert semantic HTML list',practice:'Practice: term and two definitions',done:'Complete',pending:'Add a term and at least two definitions.',warning:'This document uses an app-specific definition list syntax. Other Markdown processors may display the colon lines literally. Original .md source is preserved. Download anyway?',htmlWarning:'Some Markdown platforms filter semantic HTML definition lists.'},
 cs:{label:'Seznam definic (jen aplikace, volitelně)',note:'Není součástí GFM nebo CommonMark. Funguje jen v GFM; HTML seznamy fungují všude.',sample:'Vložit příklad Markdown definic',html:'Vložit sémantický HTML seznam',practice:'Cvičení: termín a dvě definice',done:'Hotovo',pending:'Přidejte termín a dvě definice.',warning:'Dokument používá vlastní syntaxi definic. Jiné procesory mohou řádky s dvojtečkou zobrazovat doslova. Zdroj .md se nemění. Stáhnout?',htmlWarning:'Některé platformy filtrují sémantický HTML seznam definic.'},
 uk:{label:'Списки визначень (лише застосунок)',note:'Не входять у GFM/CommonMark. Доступні лише у GFM; HTML-списки працюють у всіх режимах.',sample:'Вставити приклад Markdown',html:'Вставити семантичний HTML-список',practice:'Вправа: термін і два визначення',done:'Виконано',pending:'Додайте термін та два визначення.',warning:'Документ використовує додатковий синтаксис списків визначень. Інші процесори можуть показати двокрапку як текст. Завантажити?',htmlWarning:'Деякі платформи фільтрують семантичні HTML-списки.'},
 ro:{label:'Liste de definiții (doar aplicația)',note:'Nu sunt GFM/CommonMark normativ. Disponibile doar în GFM; HTML funcționează în orice mod.',sample:'Inserează exemplu Markdown',html:'Inserează listă HTML semantică',practice:'Exercițiu: termen și două definiții',done:'Complet',pending:'Adăugați un termen și două definiții.',warning:'Documentul folosește sintaxă de definiții specifică aplicației. Alte procesoare pot afișa liniile cu două puncte literal. Descărcați?',htmlWarning:'Unele platforme filtrează listele HTML semantice.'},
 ru:{label:'Списки определений (только приложение)',note:'Не часть стандартов GFM и CommonMark. Markdown-синтаксис работает только в режиме GFM; HTML-список доступен во всех режимах.',sample:'Вставить пример Markdown',html:'Вставить семантический HTML-список',practice:'Упражнение: термин и два определения',done:'Выполнено',pending:'Добавьте термин и два определения.',warning:'Документ использует нестандартный синтаксис списков определений. Другие Markdown-процессоры могут отображать строки с двоеточием как текст. Скачать .md?',htmlWarning:'Некоторые Markdown-платформы могут удалять HTML-списки определений.'}
};
export const definitionText=lang=>DEFINITION_TEXT[lang]||DEFINITION_TEXT.en;
).test(key);
export function normalizeExtensionSettings(data){
 const out=Object.create(null);
 if(!data||typeof data!=='object'||Array.isArray(data))return out;
 for(const [key,options] of Object.entries(data)){
  if(!validDocumentKey(key)||!options||typeof options!=='object'||Array.isArray(options))continue;
  const selected={};
  if(options.softbreaks===true)selected.softbreaks=true;
  if(options.footnotes===true)selected.footnotes=true;
  if(options.headingIds===true)selected.headingIds=true;
  if(options.definitionLists===true)selected.definitionLists=true;
  if(options.emojiShortcodes===true)selected.emojiShortcodes=true;
  if(Object.keys(selected).length)out[key]=selected;
 }
 return out;
}
export const extensionEnabled=(settings,key,dialect,id)=>
 Object.hasOwn(EXTENSIONS,id)&&validDocumentKey(key)&&
 EXTENSIONS[id].modes.includes(dialect)&&settings?.[key]?.[id]===true;
export function changeExtension(settings,key,id,on){
 const safe=normalizeExtensionSettings(settings);
 if(!validDocumentKey(key)||!Object.hasOwn(EXTENSIONS,id))return safe;
 if(on===true)safe[key]={...(safe[key]||{}),[id]:true};
 else if(safe[key]){delete safe[key][id];if(!Object.keys(safe[key]).length)delete safe[key];}
 return safe;
}
export function parserExtensionOptions(settings,key,dialect){
 const options={};
 for(const feature of Object.values(EXTENSIONS))
  if(extensionEnabled(settings,key,dialect,feature.id))Object.assign(options,feature.option);
 return options;
}
export const EXTENSION_TEXT={
 en:{title:'Optional processor extension',label:'Soft line breaks (app-only)',off:'Off (standard GFM)',on:'On (this document)',note:'Not normative GFM; active only in GFM. Your Markdown source stays unchanged.',unavailable:'Only available in GFM; your choice is saved.',matrix:'Portability matrix',feature:'Feature',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'This app',headings:'Headings and emphasis',tables:'Tables and task lists',breaks:'Extra soft line breaks',html:'HTML/CSS presets',footnotes:'Footnotes (opt-in, GitHub.com)',yes:'Yes',no:'No',varies:'Varies',planned:'Planned',warning:'App-only line break rendering is enabled. Other Markdown processors may display single newlines differently. Your .md source will remain unchanged. Download anyway?'},
 cs:{title:'Volitelné rozšíření procesoru',label:'Měkké konce řádků (jen aplikace)',off:'Vypnuto (GFM standard)',on:'Zapnuto (tento dokument)',note:'Není součástí GFM; pouze v režimu GFM. Zdroj Markdownu se nemění.',unavailable:'Jen v GFM; nastavení je uložené.',matrix:'Matice přenositelnosti',feature:'Funkce',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Tato aplikace',headings:'Nadpisy a zvýraznění',tables:'Tabulky a úkoly',breaks:'Další měkké zlomy',html:'HTML/CSS předvolby',footnotes:'Poznámky pod čarou (volitelné)',yes:'Ano',no:'Ne',varies:'Různé',planned:'Plánováno',warning:'Tento dokument používá vlastní zalamování řádků. Jiné procesory jej mohou zobrazit jinak. Zdroj .md se nezmění. Stáhnout?'},
 uk:{title:'Додаткове розширення процесора',label:'М’які переноси (лише застосунок)',off:'Вимкнено (стандарт GFM)',on:'Увімкнено (цей документ)',note:'Не входить у GFM; лише в режимі GFM. Markdown не змінюється.',unavailable:'Лише GFM; вибір збережено.',matrix:'Матриця сумісності',feature:'Функція',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Цей застосунок',headings:'Заголовки й виділення',tables:'Таблиці й завдання',breaks:'Додаткові переноси',html:'Шаблони HTML/CSS',footnotes:'Виноски (опційно)',yes:'Так',no:'Ні',varies:'Залежить',planned:'Планується',warning:'Включено нестандартні переноси. Інші процесори можуть показувати їх інакше. Markdown не зміниться. Завантажити?'},
 ro:{title:'Extensie opțională',label:'Rânduri noi simple (doar aplicația)',off:'Oprit (GFM standard)',on:'Pornit (acest document)',note:'Nu este GFM normativ; doar în modul GFM. Sursa nu se schimbă.',unavailable:'Doar GFM; setarea rămâne salvată.',matrix:'Matrice de portabilitate',feature:'Funcție',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Această aplicație',headings:'Titluri și evidențiere',tables:'Tabele și sarcini',breaks:'Rânduri noi suplimentare',html:'Șabloane HTML/CSS',footnotes:'Note de subsol (opțional)',yes:'Da',no:'Nu',varies:'Depinde',planned:'Planificat',warning:'Acest document activează rânduri noi specifice aplicației. Alte procesoare le pot reda diferit. Sursa .md rămâne neschimbată. Descărcați?'},
 ru:{title:'Дополнительное расширение',label:'Мягкие переносы (только приложение)',off:'Выключено (стандартный GFM)',on:'Включено (этот документ)',note:'Не входит в нормативный GFM; только для режима GFM. Markdown не изменяется.',unavailable:'Только для GFM; выбор сохранён.',matrix:'Матрица совместимости',feature:'Возможность',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Это приложение',headings:'Заголовки и выделение',tables:'Таблицы и списки задач',breaks:'Дополнительные переносы',html:'Шаблоны HTML/CSS',footnotes:'Сноски (по выбору)',yes:'Да',no:'Нет',varies:'Зависит',planned:'В планах',warning:'В документе включены нестандартные переносы строк. Другие процессоры могут отображать их иначе. Исходный .md сохранится без изменений. Скачать?'}
};
export const extensionText=lang=>EXTENSION_TEXT[lang]||EXTENSION_TEXT.en;


export const FOOTNOTE_TEXT={
 en:{heading:"Footnotes",ref:"Footnote",back:"Back to reference",exercise:"Practice: reference one note twice",pending:"Not yet complete",done:"Complete",label:'Footnotes (GitHub.com extension, opt-in)',sample:'Insert footnote example',
  note:'Not normative GFM. Numbered notes, repeated references, backlinks; only available in GFM.',
  warning:'This document uses opt-in footnotes. GitHub.com supports them, but plain GFM / CommonMark processors may not. The .md source remains unchanged. Download anyway?'},
 cs:{heading:"Poznámky pod čarou",ref:"Poznámka",back:"Zpět na odkaz",exercise:"Cvičení: odkažte dvakrát na jednu poznámku",pending:"Ještě nesplněno",done:"Splněno",label:'Poznámky pod čarou (volitelně pro GitHub.com)',sample:'Vložit příklad poznámky',
  note:'Není součástí GFM. Číslované poznámky a zpětné odkazy pouze v režimu GFM.',
  warning:'Dokument obsahuje volitelné poznámky pod čarou. GitHub.com je podporuje, čisté GFM/CommonMark nikoli. Zdroj .md se nemění. Stáhnout?'},
 uk:{heading:"Виноски",ref:"Виноска",back:"Назад до посилання",exercise:"Вправа: двічі послатися на jednu виноску",pending:"Ще не виконано",done:"Виконано",label:'Виноски (GitHub.com, необов’язково)',sample:'Додати приклад виноски',
  note:'Не входять до GFM. Нумерація та зворотні посилання лише у режимі GFM.',
  warning:'Документ містить додаткові виноски. GitHub.com підтримує їх, базові GFM/CommonMark — ні. Джерело .md не зміниться. Завантажити?'},
 ro:{heading:"Note de subsol",ref:"Nota",back:"Înapoi la referință",exercise:"Exercițiu: referiți aceeași notă de două ori",pending:"Încă incomplet",done:"Complet",label:'Note de subsol (GitHub.com, opțional)',sample:'Inserează un exemplu de notă',
  note:'Nu fac parte din GFM normativ. Numerotare și referințe înapoi doar în GFM.',
  warning:'Documentul folosește note de subsol opționale. GitHub.com le acceptă, GFM/CommonMark simplu nu. Sursa .md rămâne intactă. Descărcați?'},
 ru:{heading:"Сноски",ref:"Сноска",back:"Вернуться к упоминанию",exercise:"Упражнение: сослаться на одну сноску дважды",pending:"Не выполнено",done:"Выполнено",label:'Сноски (GitHub.com, по выбору)',sample:'Вставить пример сноски',
  note:'Не входят в стандарт GFM. Нумерация и обратные ссылки работают только в режиме GFM.',
  warning:'Документ использует дополнительные сноски. GitHub.com их поддерживает, базовые GFM/CommonMark — нет. Исходный .md не меняется. Скачать?'}
};
export const footnoteText=lang=>FOOTNOTE_TEXT[lang]||FOOTNOTE_TEXT.en;


export const DEFINITION_TEXT={
 en:{label:'Definition lists (app-only, opt-in)',note:'Not normative GFM or CommonMark; enabled only in GFM. Basic HTML definition lists work in every mode.',sample:'Insert Markdown definition example',html:'Insert semantic HTML list',practice:'Practice: term and two definitions',done:'Complete',pending:'Add a term and at least two definitions.',warning:'This document uses an app-specific definition list syntax. Other Markdown processors may display the colon lines literally. Original .md source is preserved. Download anyway?',htmlWarning:'Some Markdown platforms filter semantic HTML definition lists.'},
 cs:{label:'Seznam definic (jen aplikace, volitelně)',note:'Není součástí GFM nebo CommonMark. Funguje jen v GFM; HTML seznamy fungují všude.',sample:'Vložit příklad Markdown definic',html:'Vložit sémantický HTML seznam',practice:'Cvičení: termín a dvě definice',done:'Hotovo',pending:'Přidejte termín a dvě definice.',warning:'Dokument používá vlastní syntaxi definic. Jiné procesory mohou řádky s dvojtečkou zobrazovat doslova. Zdroj .md se nemění. Stáhnout?',htmlWarning:'Některé platformy filtrují sémantický HTML seznam definic.'},
 uk:{label:'Списки визначень (лише застосунок)',note:'Не входять у GFM/CommonMark. Доступні лише у GFM; HTML-списки працюють у всіх режимах.',sample:'Вставити приклад Markdown',html:'Вставити семантичний HTML-список',practice:'Вправа: термін і два визначення',done:'Виконано',pending:'Додайте термін та два визначення.',warning:'Документ використовує додатковий синтаксис списків визначень. Інші процесори можуть показати двокрапку як текст. Завантажити?',htmlWarning:'Деякі платформи фільтрують семантичні HTML-списки.'},
 ro:{label:'Liste de definiții (doar aplicația)',note:'Nu sunt GFM/CommonMark normativ. Disponibile doar în GFM; HTML funcționează în orice mod.',sample:'Inserează exemplu Markdown',html:'Inserează listă HTML semantică',practice:'Exercițiu: termen și două definiții',done:'Complet',pending:'Adăugați un termen și două definiții.',warning:'Documentul folosește sintaxă de definiții specifică aplicației. Alte procesoare pot afișa liniile cu două puncte literal. Descărcați?',htmlWarning:'Unele platforme filtrează listele HTML semantice.'},
 ru:{label:'Списки определений (только приложение)',note:'Не часть стандартов GFM и CommonMark. Markdown-синтаксис работает только в режиме GFM; HTML-список доступен во всех режимах.',sample:'Вставить пример Markdown',html:'Вставить семантический HTML-список',practice:'Упражнение: термин и два определения',done:'Выполнено',pending:'Добавьте термин и два определения.',warning:'Документ использует нестандартный синтаксис списков определений. Другие Markdown-процессоры могут отображать строки с двоеточием как текст. Скачать .md?',htmlWarning:'Некоторые Markdown-платформы могут удалять HTML-списки определений.'}
};
export const definitionText=lang=>DEFINITION_TEXT[lang]||DEFINITION_TEXT.en;
