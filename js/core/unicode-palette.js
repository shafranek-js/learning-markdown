// Offline, curated Unicode palette. The returned characters are inserted into
// the source verbatim; no assets, remote catalogues, or third-party scripts.
export const PALETTE_ITEMS=Object.freeze([
 // Symbols and copyright
 ['copyright','©','symbols','Copyright','авторское право'],
 ['registered','®','symbols','Registered trademark','товарный знак'],
 ['trademark','™','symbols','Trademark','торговая марка'],
 ['section','§','symbols','Section sign','параграф'],
 ['paragraph','¶','symbols','Paragraph sign','абзац'],
 ['bullet','•','symbols','Bullet','маркер'],
 ['ellipsis','…','symbols','Ellipsis','многоточие'],
 ['middot','·','symbols','Middle dot','точка'],
 ['dagger','†','symbols','Dagger','крестик'],
 ['double-dagger','‡','symbols','Double dagger','двойной крест'],
 ['check','✓','symbols','Check mark','галочка'],
 ['cross','✗','symbols','Cross mark','крестик'],
 ['star','★','symbols','Star','звезда'],
 ['hollow-star','☆','symbols','Outline star','звезда'],
 ['degree','°','symbols','Degree','градус'],
 ['micro','µ','symbols','Micro sign','микро'],
 ['prime','′','symbols','Prime','штрих'],
 ['double-prime','″','symbols','Double prime','двойной штрих'],
 // Currencies
 ['euro','€','currency','Euro','евро'],
 ['pound','£','currency','Pound sterling','фунт'],
 ['dollar','$','currency','Dollar','доллар'],
 ['yen','¥','currency','Yen','иена'],
 ['rupee','₹','currency','Rupee','рупия'],
 ['won','₩','currency','Won','вона'],
 ['koruna','Kč','currency','Czech koruna','крона'],
 ['hryvnia','₴','currency','Hryvnia','гривна'],
 // Mathematics
 ['plusminus','±','math','Plus or minus','плюс минус'],
 ['multiply','×','math','Multiplication','умножение'],
 ['divide','÷','math','Division','деление'],
 ['not-equal','≠','math','Not equal','не равно'],
 ['less-equal','≤','math','Less than or equal','меньше равно'],
 ['greater-equal','≥','math','Greater than or equal','больше равно'],
 ['approx','≈','math','Approximately','приблизительно'],
 ['infinity','∞','math','Infinity','бесконечность'],
 ['pi','π','math','Pi','пи'],
 ['omega','Ω','math','Omega','омега'],
 ['delta','Δ','math','Delta','дельта'],
 ['sqrt','√','math','Square root','корень'],
 ['sum','∑','math','Sum','сумма'],
 ['integral','∫','math','Integral','интеграл'],
 ['sup-two','²','math','Superscript two','квадрат'],
 ['sub-two','₂','math','Subscript two','нижний индекс'],
 ['fraction-half','½','math','One half','половина'],
 // Arrows and punctuation
 ['right','→','arrows','Right arrow','стрелка вправо'],
 ['left','←','arrows','Left arrow','стрелка влево'],
 ['up','↑','arrows','Up arrow','стрелка вверх'],
 ['down','↓','arrows','Down arrow','стрелка вниз'],
 ['leftright','↔','arrows','Left right arrow','двунаправленная стрелка'],
 ['double-right','⇒','arrows','Implies','следует'],
 ['double-left','⇐','arrows','Left double arrow','двойная стрелка'],
 ['em-dash','—','punctuation','Em dash','длинное тире'],
 ['en-dash','–','punctuation','En dash','короткое тире'],
 ['left-quote','«','punctuation','Left guillemet','кавычки'],
 ['right-quote','»','punctuation','Right guillemet','кавычки'],
 ['left-curly','“','punctuation','Left quotation mark','кавычки'],
 ['right-curly','”','punctuation','Right quotation mark','кавычки'],
 ['non-breaking-space',' ','punctuation','Nonbreaking space','неразрывный пробел'],
 // Emoticons and objects, all native Unicode
 ['joy','😂','emoji','Tears of joy','смех радость'],
 ['smile','😄','emoji','Smile','улыбка'],
 ['grinning','😀','emoji','Grinning face','улыбка'],
 ['wink','😉','emoji','Wink','подмигивание'],
 ['thinking','🤔','emoji','Thinking','думаю'],
 ['thumbsup','👍','emoji','Thumbs up','палец вверх'],
 ['thumbsdown','👎','emoji','Thumbs down','палец вниз'],
 ['heart','❤️','emoji','Red heart','сердце'],
 ['fire','🔥','emoji','Fire','огонь'],
 ['rocket','🚀','emoji','Rocket','ракета'],
 ['tada','🎉','emoji','Celebration','праздник'],
 ['warning','⚠️','emoji','Warning','предупреждение'],
 ['bulb','💡','emoji','Idea','идея'],
 ['memo','📝','emoji','Memo','заметка'],
 ['tent','⛺','emoji','Tent','палатка'],
 ['music','🎵','emoji','Music note','музыка'],
 ['coffee','☕','emoji','Coffee','кофе'],
 ['book','📖','emoji','Open book','книга'],
 ['clock','🕒','emoji','Clock','часы'],
 ['world','🌍','emoji','Earth','земля'],
 ['lock','🔒','emoji','Lock','замок']
].map(([id,char,category,name,ru])=>Object.freeze({id,char,category,name,ru})));
export const PALETTE_CATEGORIES=Object.freeze(['all','symbols','currency','math','arrows','punctuation','emoji']);
export const PALETTE_TRANSLATIONS={
 en:{title:'Unicode symbols & emoji',trigger:'Symbols',search:'Search symbols or names',all:'All',symbols:'Symbols',currency:'Currency',math:'Math',arrows:'Arrows',punctuation:'Punctuation',emoji:'Emoji',empty:'No matches',hint:'Enter inserts first match. Tab selects a result, Esc closes.',close:'Close',insert:'Insert',lesson:'Unicode, entities and escapes',lessonText:'Unicode: © € → π\nHTML entities: &copy; &euro; &rarr;\nEscaping Markdown: \\*literal asterisks\\*',count:n=>n+' results',shortcode:'Emoji shortcodes (optional, app-only)',shortcodeNote:'Not part of normative GFM/CommonMark. Applies only in GFM. Code spans and fenced code remain literal.',warning:'This document uses app-specific emoji shortcode expansion. Other Markdown processors may leave :shortcode: unexpanded. The .md source is unchanged. Download anyway?'},
 cs:{title:'Symboly Unicode a emoji',trigger:'Symboly',search:'Hledat symboly nebo názvy',all:'Vše',symbols:'Symboly',currency:'Měny',math:'Matematika',arrows:'Šipky',punctuation:'Interpunkce',emoji:'Emoji',empty:'Žádná shoda',hint:'Enter vloží první výsledek. Tab vybere symbol, Esc zavře.',close:'Zavřít',insert:'Vložit',lesson:'Unicode, entity a escapování',lessonText:'Unicode: © € → π\nHTML entity: &copy; &euro; &rarr;\nEscapování Markdownu: \\*doslovné hvězdičky\\*',count:n=>n+' výsledků',shortcode:'Emoji kódy (volitelné, pouze aplikace)',shortcodeNote:'Není součástí GFM/CommonMark. Pouze v režimu GFM. Kódové bloky se nemění.',warning:'Dokument používá volitelné emoji kódy. Jiné procesory je nemusí rozpoznat. Zdroj .md se nezmění. Stáhnout?'},
 uk:{title:'Символи Unicode та емодзі',trigger:'Символи',search:'Пошук символів і назв',all:'Усе',symbols:'Символи',currency:'Валюти',math:'Математика',arrows:'Стрілки',punctuation:'Пунктуація',emoji:'Емодзі',empty:'Нічого не знайдено',hint:'Enter вставляє перший символ, Tab обирає, Esc закриває.',close:'Закрити',insert:'Вставити',lesson:'Unicode, сутності та екранування',lessonText:'Unicode: © € → π\nHTML-сутності: &copy; &euro; &rarr;\nЕкранування Markdown: \\*буквальні зірочки\\*',count:n=>n+' результатів',shortcode:'Емодзі-коди (додаткове розширення)',shortcodeNote:'Не входить до GFM/CommonMark. Лише GFM; блоки коду не змінюються.',warning:'Документ використовує додаткові emoji-коди. Інші процесори можуть їх не розпізнати. Завантажити?'},
 ro:{title:'Simboluri Unicode și emoji',trigger:'Simboluri',search:'Caută simboluri sau nume',all:'Toate',symbols:'Simboluri',currency:'Valute',math:'Matematică',arrows:'Săgeți',punctuation:'Punctuație',emoji:'Emoji',empty:'Niciun rezultat',hint:'Enter inserează primul rezultat, Tab selectează, Esc închide.',close:'Închide',insert:'Inserează',lesson:'Unicode, entități și escapare',lessonText:'Unicode: © € → π\nEntități HTML: &copy; &euro; &rarr;\nEscapare Markdown: \\*asteriscuri literale\\*',count:n=>n+' rezultate',shortcode:'Coduri emoji (doar aplicația)',shortcodeNote:'Nu fac parte din GFM/CommonMark; numai în GFM. Codul rămâne literal.',warning:'Documentul utilizează coduri emoji suplimentare. Alte procesoare le pot lăsa literale. Descărcați?'},
 ru:{title:'Символы Unicode и emoji',trigger:'Символы',search:'Поиск символов и названий',all:'Все',symbols:'Символы',currency:'Валюты',math:'Математика',arrows:'Стрелки',punctuation:'Пунктуация',emoji:'Emoji',empty:'Ничего не найдено',hint:'Enter вставляет первый результат, Tab выбирает символ, Esc закрывает.',close:'Закрыть',insert:'Вставить',lesson:'Unicode, HTML-сущности и экранирование',lessonText:'Unicode: © € → π\nHTML-сущности: &copy; &euro; &rarr;\nЭкранирование Markdown: \\*буквальные звёздочки\\*',count:n=>n+' результатов',shortcode:'Emoji shortcodes (только приложение)',shortcodeNote:'Не входят в стандарты GFM/CommonMark; работают только в GFM. Кодовые блоки не преобразуются.',warning:'Документ использует нестандартные emoji-shortcodes. Другие Markdown-процессоры могут показать их как обычный текст. Исходный .md не изменится. Скачать?'}
};
export const paletteLabels=lang=>PALETTE_TRANSLATIONS[lang]||PALETTE_TRANSLATIONS.en;
const fold=s=>String(s||'').normalize('NFKD').replace(/\p{M}/gu,'').toLocaleLowerCase('en').trim();
export function searchPalette(search='',category='all',lang='en'){
 const labels=paletteLabels(lang),query=fold(search),terms=query.split(/\s+/).filter(Boolean);
 return PALETTE_ITEMS.filter(item=>(category==='all'||item.category===category)
  &&terms.every(term=>fold([item.id,item.name,item.ru,item.char,
   labels[item.category],PALETTE_TRANSLATIONS.en[item.category]].join(' ')).includes(term)));
}
export const EMOJI_SHORTCODES=Object.freeze({
 joy:'😂',smile:'😄',grinning:'😀',wink:'😉',thinking:'🤔',
 thumbsup:'👍',thumbsdown:'👎','+1':'👍','-1':'👎',heart:'❤️',
 fire:'🔥',rocket:'🚀',tada:'🎉',warning:'⚠️',bulb:'💡',memo:'📝',
 tent:'⛺',music:'🎵',coffee:'☕',book:'📖',clock:'🕒',earth:'🌍',lock:'🔒'
});
