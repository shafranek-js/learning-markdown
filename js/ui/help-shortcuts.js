// Document the application's OWN key bindings, not the browser's complete
// native editing keymap. Keep categories and localized labels in lockstep;
// tests compare this inventory with the actual key handlers.
export const HELP_SHORTCUT_SECTIONS=[
 {id:'files',rows:[
  ['new',['Ctrl+N']],['open',['Ctrl+O']],['save',['Ctrl+S']],['print',['Ctrl+P']]
 ]},
 {id:'editing',rows:[
  ['find',['Ctrl+F']],['replace',['Ctrl+H']],['select-all',['Ctrl+A']],
  ['undo',['Ctrl+Z']],['redo',['Ctrl+Y','Ctrl+Shift+Z']],
  ['bold',['Ctrl+B']],['italic',['Ctrl+I']],['link',['Ctrl+K']],
  ['heading',['Ctrl+1 … Ctrl+6']]
 ]},
 {id:'source',rows:[
  ['indent',['Tab']],['outdent',['Shift+Tab']],
  ['list-enter',['Enter']],['focus-mode',['Ctrl+M']]
 ]},
 {id:'multi',rows:[
  ['next',['Ctrl+D']],['all',['Ctrl+Shift+L']],
  ['line-ends',['Shift+Alt+I']],['above',['Ctrl+Alt+↑']],
  ['below',['Ctrl+Alt+↓']],['add-click',['Alt+Click']],
  ['column',['Alt+Shift+Drag']],['collapse',['Esc']]
 ]},
 {id:'tabs',rows:[
  ['rename',['F2']],['actions',['Shift+F10','Menu']],
  ['switch',['← / →']],['edges',['Home / End']]
 ]},
 {id:'search',rows:[
  ['next',['Enter']],['previous',['Shift+Enter']],['close',['Esc']]
 ]},
 {id:'tables',rows:[
  ['select',['Shift+Click']],['edit',['Enter / Space']],
  ['indent',['Tab']],['outdent',['Shift+Tab']],
  ['exit',['Enter']],['backspace',['Backspace']]
 ]},
 {id:'unicode',rows:[
  ['results',['↓']],['insert',['Enter']],
  ['navigate',['← / → / ↑ / ↓']],['close',['Esc']]
 ]},
 {id:'menus',rows:[
  ['open',['↓ / ↑']],['navigate',['↑ / ↓']],
  ['edges',['Home / End']],['dismiss',['Esc']],
  ['focus',['Tab / Shift+Tab']]
 ]}
];

export const HELP_SHORTCUT_TEXT={
 en:{
  note:'These are application shortcuts and context-sensitive editing keys. Standard browser/CodeMirror copy, paste and navigation keys also work.',
  os:'On macOS, use Command instead of Ctrl for compatible shortcuts; Ctrl+M specifically uses Control. Alt is Option on Mac. Some system/browser shortcuts may take priority.',
  files:{title:'Files',hint:'Anywhere in the application',rows:['New Markdown tab','Open Markdown file','Download Markdown','Print / PDF']},
  editing:{title:'Editing and formatting',hint:'While editing Markdown source (Find/Replace also work from the Edit menu)',rows:['Find in source','Replace in source','Select all source text','Undo','Redo','Bold','Italic','Insert link','Heading levels 1 to 6']},
  source:{title:'Source editor',hint:'Tab focus mode is off unless you enable it',rows:['Indent selected lines / list item','Outdent selected lines / list item','Continue a Markdown list; empty item exits the list','Toggle Tab between indentation and keyboard focus navigation']},
  multi:{title:'Multi-cursor',hint:'Enable Multi-cursor first. Right-click the source editor for these actions; mouse gestures also work directly.',rows:['Select next occurrence','Select all matching occurrences','Put a cursor at the end of each selected line','Add cursor on the line above','Add cursor on the line below','Add a cursor with the mouse','Rectangular / column selection','Collapse to a single cursor']},
  tabs:{title:'Document tabs',hint:'Focus an open document tab',rows:['Rename tab','Open tab actions','Switch to previous / next tab','Go to first / last tab']},
  search:{title:'Find / Replace panel',hint:'Focus a search or replacement field',rows:['Find next match','Find previous match','Close the search panel']},
  tables:{title:'Visual table editor',hint:'Select a table in Preview; list commands apply inside a cell in Blocks mode',rows:['Extend selection to a rectangular cell region','Open selected cell for editing','Indent list item(s)','Outdent list item(s)','Exit an empty list item','Outdent an item from its start']},
  unicode:{title:'Unicode picker',hint:'In the Unicode search field or results grid',rows:['Move from search to the first result','Insert the first matching character','Navigate character results','Close the picker']},
  menus:{title:'Menus and dialogs',hint:'Focus a menu trigger or an open menu; dialog focus stays inside until closed',rows:['Open a focused menu','Move between menu items','Jump to first / last menu item','Close menu or dialog','Move keyboard focus']}
 },
 cs:{
  note:'Jde o zkratky aplikace a kontextové editační klávesy. Standardní zkratky pro kopírování, vložení a navigaci v prohlížeči a CodeMirroru fungují také.',
  os:'V macOS použijte u podporovaných zkratek Command místo Ctrl; Ctrl+M výslovně používá Control. Alt je na Macu Option. Některé zkratky může převzít systém či prohlížeč.',
  files:{title:'Soubor',hint:'Kdekoli v aplikaci',rows:['Nová karta Markdown','Otevřít soubor Markdown','Stáhnout Markdown','Tisk / PDF']},
  editing:{title:'Úpravy a formátování',hint:'Při úpravě zdroje Markdown (Najít/Nahradit je také v nabídce Úpravy)',rows:['Najít ve zdroji','Nahradit ve zdroji','Vybrat celý zdroj','Zpět','Znovu','Tučné','Kurzíva','Vložit odkaz','Nadpisy úrovní 1 až 6']},
  source:{title:'Editor zdroje',hint:'Režim přesunu fokusu klávesou Tab je ve výchozím stavu vypnutý',rows:['Odsadit označené řádky / položku seznamu','Zmenšit odsazení řádků / položky','Pokračovat v seznamu; prázdná položka jej ukončí','Přepnout Tab mezi odsazením a přesunem fokusu']},
  multi:{title:'Více kurzorů',hint:'Nejprve zapněte více kurzorů. Pravým kliknutím do editoru otevřete akce; gesta myší fungují i přímo.',rows:['Vybrat další výskyt','Vybrat všechny shodné výskyty','Kurzor na konec každého vybraného řádku','Přidat kurzor na řádek výše','Přidat kurzor na řádek níže','Přidat kurzor myší','Obdélníkový / sloupcový výběr','Přepnout na jediný kurzor']},
  tabs:{title:'Karty dokumentů',hint:'Fokus na otevřené kartě dokumentu',rows:['Přejmenovat kartu','Otevřít akce karty','Předchozí / další karta','První / poslední karta']},
  search:{title:'Panel Najít / Nahradit',hint:'Fokus na poli hledání nebo nahrazení',rows:['Další shoda','Předchozí shoda','Zavřít panel hledání']},
  tables:{title:'Vizuální editor tabulek',hint:'Vyberte tabulku v náhledu; seznamové klávesy platí uvnitř buňky v režimu Bloky',rows:['Rozšířit výběr na obdélníkovou oblast buněk','Otevřít vybranou buňku','Odsadit položky seznamu','Zmenšit odsazení položek','Opustit prázdnou položku seznamu','Zmenšit odsazení na začátku položky']},
  unicode:{title:'Výběr Unicode',hint:'V poli hledání Unicode nebo v mřížce výsledků',rows:['Přejít z hledání na první výsledek','Vložit první odpovídající znak','Procházet znaky ve výsledcích','Zavřít výběr']},
  menus:{title:'Nabídky a dialogy',hint:'Fokus na spouštěči nabídky nebo v otevřené nabídce; dialog drží fokus do zavření',rows:['Otevřít nabídku','Přecházet mezi položkami','První / poslední položka','Zavřít nabídku nebo dialog','Přesunout fokus']}
 },
 uk:{
  note:'Тут наведено клавіші застосунку та контекстні команди редагування. Стандартні команди копіювання, вставлення й навігації браузера та CodeMirror також працюють.',
  os:'У macOS для сумісних скорочень використовуйте Command замість Ctrl; Ctrl+M потребує саме Control. Alt на Mac — Option. Деякі скорочення може перехоплювати система або браузер.',
  files:{title:'Файл',hint:'Будь-де у застосунку',rows:['Нова вкладка Markdown','Відкрити файл Markdown','Завантажити Markdown','Друк / PDF']},
  editing:{title:'Редагування й форматування',hint:'Під час редагування вихідного Markdown (пошук і заміна є також у меню)',rows:['Знайти у вихідному тексті','Замінити у вихідному тексті','Виділити весь текст','Скасувати','Повторити','Жирний','Курсив','Вставити посилання','Заголовки рівнів 1–6']},
  source:{title:'Редактор вихідного тексту',hint:'Режим переходу фокусу клавішею Tab спочатку вимкнено',rows:['Збільшити відступ рядків / пункту списку','Зменшити відступ рядків / пункту','Продовжити список; порожній пункт виходить зі списку','Перемкнути Tab між відступом і переходом фокусу']},
  multi:{title:'Кілька курсорів',hint:'Спершу увімкніть кілька курсорів. Клацніть правою кнопкою в редакторі для команд; жести мишею також працюють.',rows:['Наступний збіг','Усі однакові збіги','Курсор наприкінці кожного виділеного рядка','Додати курсор вище','Додати курсор нижче','Додати курсор мишею','Прямокутне / стовпчикове виділення','Залишити один курсор']},
  tabs:{title:'Вкладки документів',hint:'Фокус на вкладці документа',rows:['Перейменувати вкладку','Відкрити дії вкладки','Попередня / наступна вкладка','Перша / остання вкладка']},
  search:{title:'Панель пошуку й заміни',hint:'Фокус у полі пошуку або заміни',rows:['Наступний збіг','Попередній збіг','Закрити панель пошуку']},
  tables:{title:'Візуальний редактор таблиць',hint:'Виберіть таблицю в перегляді; команди списків працюють у клітинці в режимі Блоки',rows:['Виділити прямокутну область клітинок','Відкрити клітинку для редагування','Збільшити відступ пунктів списку','Зменшити відступ пунктів','Вийти з порожнього пункту','Зменшити відступ на початку пункту']},
  unicode:{title:'Вибір Unicode',hint:'У полі пошуку Unicode або сітці результатів',rows:['Перейти від пошуку до першого результату','Вставити перший знайдений символ','Переміщатися результатами','Закрити вікно символів']},
  menus:{title:'Меню й діалоги',hint:'Фокус на кнопці меню або в меню; діалог зберігає фокус до закриття',rows:['Відкрити меню','Переміщатися пунктами','Перший / останній пункт','Закрити меню або діалог','Перемістити фокус']}
 },
 ro:{
  note:'Acestea sunt comenzile aplicației și tastele de editare contextuale. Comenzile standard de copiere, lipire și navigare din browser și CodeMirror rămân disponibile.',
  os:'Pe macOS, folosiți Command în loc de Ctrl pentru comenzile compatibile; Ctrl+M necesită Control. Alt este Option pe Mac. Unele combinații pot fi preluate de sistem sau browser.',
  files:{title:'Fișiere',hint:'Oriunde în aplicație',rows:['Filă Markdown nouă','Deschide fișier Markdown','Descarcă Markdown','Tipărire / PDF']},
  editing:{title:'Editare și formatare',hint:'În editorul sursă Markdown (Căutare/Înlocuire există și în meniu)',rows:['Caută în sursă','Înlocuiește în sursă','Selectează tot textul sursă','Anulează','Refă','Aldin','Cursiv','Inserează link','Titluri de nivel 1–6']},
  source:{title:'Editorul sursă',hint:'Modul de navigare cu Tab este dezactivat implicit',rows:['Indentează rândurile / elementul listei','Micșorează indentarea rândurilor / elementului','Continuă lista; ieși din elementul gol','Comută Tab între indentare și deplasarea focalizării']},
  multi:{title:'Cursoare multiple',hint:'Activează mai întâi Multi-cursor. Click dreapta în editor pentru acțiuni; gesturile cu mouse-ul funcționează și direct.',rows:['Selectează apariția următoare','Selectează toate aparițiile identice','Cursor la finalul fiecărui rând selectat','Adaugă cursor pe rândul de sus','Adaugă cursor pe rândul de jos','Adaugă cursor cu mouse-ul','Selecție dreptunghiulară / coloană','Revino la un singur cursor']},
  tabs:{title:'Filele documentelor',hint:'Focalizează o filă de document',rows:['Redenumește fila','Deschide acțiunile filei','Fila precedentă / următoare','Prima / ultima filă']},
  search:{title:'Panoul Căutare / Înlocuire',hint:'Focalizare în câmpul de căutare sau înlocuire',rows:['Următoarea potrivire','Potrivirea anterioară','Închide panoul']},
  tables:{title:'Editor vizual de tabele',hint:'Selectează un tabel în previzualizare; tastele listelor se aplică în celulă, modul Blocuri',rows:['Extinde selecția la o regiune dreptunghiulară','Deschide celula selectată','Indentează elementele listei','Micșorează indentarea elementelor','Ieși din elementul gol al listei','Micșorează indentarea de la începutul elementului']},
  unicode:{title:'Selector Unicode',hint:'În câmpul de căutare Unicode sau grila de rezultate',rows:['Din căutare la primul rezultat','Inserează primul caracter găsit','Navighează printre caractere','Închide selectorul']},
  menus:{title:'Meniuri și dialoguri',hint:'Focalizare pe butonul meniului sau în meniu; dialogul reține focalizarea',rows:['Deschide meniul','Navighează între opțiuni','Prima / ultima opțiune','Închide meniul sau dialogul','Mută focalizarea']}
 },
 ru:{
  note:'Здесь перечислены сочетания приложения и контекстные клавиши редактирования. Стандартные команды копирования, вставки и навигации браузера и CodeMirror также работают.',
  os:'В macOS для совместимых сочетаний используйте Command вместо Ctrl; для Ctrl+M нужна именно клавиша Control. Alt на Mac называется Option. Некоторые сочетания могут перехватываться системой или браузером.',
  files:{title:'Файлы',hint:'Работают в приложении',rows:['Новая вкладка Markdown','Открыть файл Markdown','Скачать Markdown','Печать / PDF']},
  editing:{title:'Редактирование и форматирование',hint:'При работе с исходным Markdown (поиск и замена также доступны через меню)',rows:['Найти в исходном тексте','Заменить в исходном тексте','Выделить весь исходный текст','Отменить','Повторить','Жирный','Курсив','Вставить ссылку','Заголовки уровней 1–6']},
  source:{title:'Редактор Markdown',hint:'По умолчанию Tab отвечает за отступ, пока не включена навигация по фокусу',rows:['Увеличить отступ выделенных строк / пункта списка','Уменьшить отступ строк / пункта списка','Продолжить список; пустой пункт завершает список','Переключить Tab между отступом и переходом по фокусу']},
  multi:{title:'Мультикурсор',hint:'Сначала включите Multi-cursor. Правый клик по редактору открывает эти действия; жесты мышью также работают.',rows:['Выделить следующее совпадение','Выделить все совпадения','Курсор в конце каждой выделенной строки','Добавить курсор строкой выше','Добавить курсор строкой ниже','Добавить курсор мышью','Прямоугольное / колоночное выделение','Оставить один курсор']},
  tabs:{title:'Вкладки документов',hint:'Сначала установите фокус на вкладку',rows:['Переименовать вкладку','Открыть действия вкладки','Переключить на соседнюю вкладку','Перейти к первой / последней вкладке']},
  search:{title:'Панель поиска и замены',hint:'Когда фокус находится в поле поиска или замены',rows:['Следующее совпадение','Предыдущее совпадение','Закрыть панель поиска']},
  tables:{title:'Визуальный редактор таблиц',hint:'Выберите таблицу в Preview; команды списков работают внутри ячейки в режиме Blocks',rows:['Выделить прямоугольную область ячеек','Открыть выбранную ячейку для редактирования','Увеличить отступ пунктов списка','Уменьшить отступ пунктов списка','Выйти из пустого пункта списка','Уменьшить отступ с начала пункта']},
  unicode:{title:'Палитра Unicode',hint:'Когда фокус в поиске символов или сетке результатов',rows:['Перейти от поиска к первому результату','Вставить первый найденный символ','Перемещаться по символам','Закрыть палитру']},
  menus:{title:'Меню и диалоги',hint:'Когда фокус на кнопке меню или внутри меню; диалог удерживает фокус до закрытия',rows:['Открыть меню','Перемещаться по пунктам','Первый / последний пункт','Закрыть меню или диалог','Переместить фокус']}
 }
};
export function helpShortcutSections(lang='en'){
 const text=HELP_SHORTCUT_TEXT[lang]||HELP_SHORTCUT_TEXT.en;
 return HELP_SHORTCUT_SECTIONS.map(({id,rows})=>({
  id,title:text[id].title,hint:text[id].hint,
  rows:rows.map(([key,keys],i)=>({id:id+'-'+key,label:text[id].rows[i],keys}))
 }));
}
