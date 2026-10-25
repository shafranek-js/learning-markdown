import {state,docKey} from '../core/state.js';
import {handleBlockListKeydown} from './table-list-keyboard.js';
import {formatBlockSelection} from './table-block-format.js';
import {convertBlockSelection} from './table-block-convert.js';
import {area,applyEdit} from './editor.js';
import {findEditableTables,getTableReadOnlyReason,editTableAt,previewTableCoordinates,getTableCellText,setTableCellText,tableSelectionBounds,getTableCellHTML,setTableCellHTML,getTableCellBlocks,setTableCellBlocks,getTableCellImage,setTableCellImage,getTableCellImageInsertion,insertTableCellImage} from '../core/table-operations.js';

const $=id=>document.getElementById(id);
const UI={
 en:{title:'Edit table',cell:'Cell',rows:'Rows',cols:'Columns',merge:'Merge / Split',style:'Style',close:'Close',
  invalid:'This table structure cannot be edited safely. The source remains unchanged.',
  select:'Shift+click another cell to select a rectangular area.',
  expanded:"Selection automatically includes entire merged cells.",
  ops:['Row above','Row below','Delete row','Column left','Column right','Delete column','Merge selection','Merge right','Merge down','Split cell','Blue cell','Mint cell','Sand cell','No borders','Borders']},
 cs:{title:'Upravit tabulku',cell:'Buňka',rows:'Řádky',cols:'Sloupce',merge:'Sloučit / Rozdělit',style:'Styl',close:'Zavřít',
  invalid:'Tuto strukturu tabulky nelze bezpečně upravit. Zdroj se nezměnil.',
  select:'Shift+kliknutí na další buňku vybere oblast.',
  expanded:"Výběr automaticky zahrnuje celé sloučené buňky.",
  ops:['Řádek nad','Řádek pod','Smazat řádek','Sloupec vlevo','Sloupec vpravo','Smazat sloupec','Sloučit výběr','Sloučit vpravo','Sloučit dolů','Rozdělit buňku','Modrá buňka','Mátová buňka','Žlutá buňka','Bez okrajů','Okraje']},
 uk:{title:'Редагувати таблицю',cell:'Клітинка',rows:'Рядки',cols:'Стовпці',merge:'Об’єднати / Розділити',style:'Стиль',close:'Закрити',
  invalid:'Не вдалося безпечно змінити структуру таблиці. Вихідний текст не змінено.',
  select:'Shift+клік по іншій клітинці виділяє прямокутну область.',
  expanded:"Виділення автоматично охоплює всі об’єднані клітинки повністю.",
  ops:['Рядок вище','Рядок нижче','Видалити рядок','Стовпець ліворуч','Стовпець праворуч','Видалити стовпець','Об’єднати вибране','Об’єднати праворуч','Об’єднати вниз','Розділити клітинку','Синя клітинка','М’ятна клітинка','Жовта клітинка','Без меж','Межі']},
 ro:{title:'Editează tabel',cell:'Celulă',rows:'Rânduri',cols:'Coloane',merge:'Îmbină / Separă',style:'Stil',close:'Închide',
  invalid:'Structura tabelului nu poate fi modificată în siguranță. Sursa rămâne neschimbată.',
  select:'Shift+clic pe o altă celulă selectează o zonă dreptunghiulară.',
  expanded:"Selecția include automat toate celulele îmbinate în întregime.",
  ops:['Rând deasupra','Rând dedesubt','Șterge rândul','Coloană stânga','Coloană dreapta','Șterge coloana','Îmbină selecția','Îmbină la dreapta','Îmbină în jos','Separă celula','Celulă albastră','Celulă mentă','Celulă galbenă','Fără borduri','Borduri']},
 ru:{title:'Изменить таблицу',cell:'Ячейка',rows:'Строки',cols:'Столбцы',merge:'Объединить / Разделить',style:'Оформление',close:'Закрыть',
  invalid:'Нельзя безопасно изменить эту структуру таблицы. Исходный код не изменён.',
  select:'Shift+клик по другой ячейке выделяет прямоугольную область.',
  expanded:"Выделение автоматически захватывает объединённые ячейки целиком.",
  ops:['Строка выше','Строка ниже','Удалить строку','Столбец слева','Столбец справа','Удалить столбец','Объединить выделение','Объединить вправо','Объединить вниз','Разделить ячейку','Синяя ячейка','Мятная ячейка','Жёлтая ячейка','Без границ','Границы']}
};
const CONTENT_TEXT={
 en:['Cell text','Save cell','Text only; existing markup is replaced.','Edit cell content'],
 cs:['Text buňky','Uložit buňku','Pouze text; původní formátování bude nahrazeno.','Upravit obsah buňky'],
 uk:['Текст клітинки','Зберегти клітинку','Лише текст; попередню розмітку буде замінено.','Редагувати вміст клітинки'],
 ro:['Textul celulei','Salvează celula','Doar text; formatarea anterioară se înlocuiește.','Editează conținutul'],
 ru:['Текст ячейки','Сохранить ячейку','Только текст; прежняя разметка ячейки будет заменена.','Изменить содержимое ячейки']
};
const RICH_TEXT={
 en:{rich:'Rich text',plain:'Plain text',hint:'Edit formatting safely; paste inserts plain text. Changes apply on Save.',bold:'Bold',italic:'Italic',underline:'Underline',code:'Code',unsupported:'This cell contains unsupported elements and is read-only in the visual editor.'},
 cs:{rich:'Formátovaný text',plain:'Prostý text',hint:'Formátujte bezpečně; vložený text se převede na prostý text. Změny uložíte tlačítkem Uložit.',bold:'Tučné',italic:'Kurzíva',underline:'Podtržení',code:'Kód',unsupported:'Tato buňka obsahuje nepodporované prvky a ve vizuálním editoru je pouze pro čtení.'},
 uk:{rich:'Форматований текст',plain:'Звичайний текст',hint:'Безпечне форматування; вставлений текст без розмітки. Для збереження натисніть кнопку.',bold:'Жирний',italic:'Курсив',underline:'Підкреслення',code:'Код',unsupported:'Ця клітинка містить непідтримувані елементи та доступна лише для перегляду.'},
 ro:{rich:'Text formatat',plain:'Text simplu',hint:'Formatare sigură; lipirea adaugă doar text. Salvați pentru a aplica.',bold:'Aldin',italic:'Cursiv',underline:'Subliniat',code:'Cod',unsupported:'Această celulă conține elemente neacceptate și poate fi doar vizualizată.'},
 ru:{rich:'Форматированный',plain:'Обычный текст',hint:'Безопасное форматирование; вставка — только текст. Изменения применяются после сохранения.',bold:'Жирный',italic:'Курсив',underline:'Подчёркнутый',code:'Код',unsupported:'Эта ячейка содержит неподдерживаемые элементы и доступна только для просмотра.'}
};
const READ_ONLY={
 en:{title:'Table is read-only',source:'The Markdown source was not changed. Edit this table directly in the source editor.',
  'unmapped':'The Preview table cannot be reliably matched to a Markdown source table.',
  'multiple-roots':'This HTML block has multiple table roots or extra content.',
  malformed:'The table has missing or mismatched HTML closing tags.',
  unsupported:'This table uses sections or attributes the visual editor cannot preserve.',
  'invalid-spans':'One or more table cell spans are invalid or out of range.',
  container:'This table contains nested tables. Select a cell in the innermost table instead.',
  'invalid-grid':'The table grid or its nested structure cannot be edited safely.'},
 cs:{title:'Tabulka je pouze pro čtení',source:'Zdroj Markdown zůstal beze změny. Tabulku upravte přímo ve zdrojovém editoru.',
  unmapped:'Tabulku v náhledu nelze spolehlivě přiřadit k tabulce ve zdroji Markdown.',
  'multiple-roots':'Tento blok HTML obsahuje více tabulek nebo další obsah.',
  malformed:'V tabulce chybějí uzavírací značky HTML nebo si neodpovídají.',
  unsupported:'Tabulka používá oddíly nebo atributy, které vizuální editor nedokáže zachovat.',
  'invalid-spans':'Některá sloučení buněk jsou neplatná nebo mimo povolený rozsah.',
  container:'Tato tabulka obsahuje vnořené tabulky. Vyberte buňku v nejvnitřnější tabulce.',
  'invalid-grid':'Mřížku tabulky nebo její vnořenou strukturu nelze bezpečně upravit.'},
 uk:{title:'Таблиця лише для читання',source:'Вихідний Markdown не змінено. Редагуйте таблицю безпосередньо у вихідному редакторі.',
  unmapped:'Неможливо надійно зіставити таблицю в попередньому перегляді з вихідним Markdown.',
  'multiple-roots':'Цей HTML-блок містить кілька таблиць або додатковий вміст.',
  malformed:'У таблиці відсутні або неправильно закриті HTML-теги.',
  unsupported:'Таблиця містить секції або атрибути, які візуальний редактор не може зберегти.',
  'invalid-spans':'Об’єднання деяких клітинок некоректні або перевищують допустимий діапазон.',
  container:'Ця таблиця містить вкладені таблиці. Виберіть клітинку найглибшої таблиці.',
  'invalid-grid':'Сітку таблиці або вкладену структуру неможливо безпечно редагувати.'},
 ro:{title:'Tabel doar pentru citire',source:'Sursa Markdown nu a fost modificată. Editați tabelul direct în editorul sursă.',
  unmapped:'Tabelul din previzualizare nu poate fi asociat în siguranță cu sursa Markdown.',
  'multiple-roots':'Acest bloc HTML conține mai multe tabele sau conținut suplimentar.',
  malformed:'Tabelul are etichete HTML de închidere lipsă sau incorecte.',
  unsupported:'Tabelul conține secțiuni sau atribute pe care editorul vizual nu le poate păstra.',
  'invalid-spans':'Unele celule îmbinate au dimensiuni nevalide sau depășesc limita.',
  container:'Acest tabel conține tabele imbricate. Selectați o celulă din tabelul cel mai interior.',
  'invalid-grid':'Grila tabelului sau structura sa imbricată nu poate fi editată în siguranță.'},
 ru:{title:'Таблица только для просмотра',source:'Исходный Markdown не изменён. Эту таблицу можно редактировать непосредственно в исходном редакторе.',
  unmapped:'Не удалось надёжно сопоставить таблицу в предпросмотре с исходным Markdown.',
  'multiple-roots':'В этом HTML-блоке несколько таблиц или есть дополнительное содержимое.',
  malformed:'В таблице отсутствуют или неправильно расположены закрывающие HTML-теги.',
  unsupported:'Таблица содержит секции или атрибуты, которые визуальный редактор не может сохранить.',
  'invalid-spans':'Некоторые объединения ячеек некорректны или выходят за допустимые пределы.',
  container:'Эта таблица содержит вложенные таблицы. Выберите ячейку самой внутренней таблицы.',
  'invalid-grid':'Структуру или вложенность таблицы нельзя безопасно изменить визуально.'}
};
const readonlyWords=()=>READ_ONLY[state.lang]||READ_ONLY.en;
const richWords=()=>RICH_TEXT[state.lang]||RICH_TEXT.en;
const BLOCK_TEXT={
 en:{mode:'Blocks',hint:'Edit paragraphs, lists and quotes safely. Paste inserts plain text; Save updates the cell. In a list: Tab indents, Shift+Tab outdents, Enter exits an empty item, and Backspace at the start outdents.',p:'Add paragraph',ul:'Add bullet list',ol:'Add numbered list',quote:'Add quote',pre:'Add code block',formatUnsupported:'This selection includes code or unsupported content. Nothing was changed; select text outside code blocks.',crossSelection:'Select items within one list to change their level. Mixed paragraph/list selections were left unchanged.',convertP:'Paragraphs',convertUl:'Bullets',convertOl:'Numbered',convertInvalid:'Select complete list items and paragraphs only. Nested lists and other blocks cannot be converted to paragraphs.',convertSame:'Selected blocks already use this format.',convertNested:'Nested lists can switch between bullets and numbering. Converting them into paragraphs is not yet supported.'},
 cs:{mode:'Bloky',hint:'Bezpečně upravujte odstavce, seznamy a citace. Vkládaný text je prostý; změny uložte. V seznamu: Tab odsadí, Shift+Tab zruší odsazení, Enter ukončí prázdnou položku a Backspace na začátku zmenší odsazení.',p:'Přidat odstavec',ul:'Přidat odrážky',ol:'Přidat číslovaný seznam',quote:'Přidat citaci',pre:'Přidat blok kódu',formatUnsupported:'Výběr obsahuje kód nebo nepodporovaný obsah. Nic se nezměnilo; vyberte text mimo bloky kódu.',crossSelection:'Pro změnu úrovně vyberte položky v jednom seznamu. Výběr přes odstavce a seznamy zůstal beze změny.',convertP:'Odstavce',convertUl:'Odrážky',convertOl:'Číslování',convertInvalid:'Vyberte celé položky seznamu a odstavce. Vnořené seznamy a další bloky nelze bezpečně převést na odstavce.',convertSame:'Vybrané bloky už tento formát mají.',convertNested:'Vnořené seznamy lze přepínat mezi odrážkami a číslováním. Převod na odstavce zatím není podporován.'},
 uk:{mode:'Блоки',hint:'Безпечно редагуйте абзаци, списки та цитати. Вставляється лише текст. У списку: Tab збільшує відступ, Shift+Tab зменшує, Enter завершує порожній пункт, Backspace на початку зменшує відступ.',p:'Додати абзац',ul:'Додати маркований список',ol:'Додати нумерований список',quote:'Додати цитату',pre:'Додати блок коду',formatUnsupported:'Виділення містить код або непідтримуваний вміст. Нічого не змінено; виберіть текст поза блоками коду.',crossSelection:'Щоб змінити рівень, виберіть елементи одного списку. Виділення між абзацами та списками не змінено.',convertP:'Абзаци',convertUl:'Маркери',convertOl:'Нумерація',convertInvalid:'Виберіть цілі пункти списку та абзаци. Вкладені списки й інші блоки неможливо безпечно перетворити на абзаци.',convertSame:'Вибрані блоки вже мають цей формат.',convertNested:'Вкладені списки можна перемикати між маркерами та нумерацією. Перетворення на абзаци поки не підтримується.'},
 ro:{mode:'Blocuri',hint:'Editați în siguranță paragrafe, liste și citate. Lipirea inserează doar text. În liste: Tab indentează, Shift+Tab revine, Enter iese dintr-un element gol, iar Backspace la început reduce indentarea.',p:'Adaugă paragraf',ul:'Adaugă listă cu marcatori',ol:'Adaugă listă numerotată',quote:'Adaugă citat',pre:'Adaugă bloc de cod',formatUnsupported:'Selecția conține cod sau conținut incompatibil. Nimic nu a fost modificat; selectați text în afara blocurilor de cod.',crossSelection:'Pentru indentare, selectați elemente dintr-o singură listă. Selecția peste paragrafe și liste nu a fost modificată.',convertP:'Paragrafe',convertUl:'Marcatori',convertOl:'Numerotare',convertInvalid:'Selectați elemente complete din liste și paragrafe. Listele imbricate și alte blocuri nu pot fi transformate în siguranță în paragrafe.',convertSame:'Blocurile selectate au deja acest format.',convertNested:'Listele imbricate pot fi comutate între marcatori și numerotare. Conversia în paragrafe nu este încă acceptată.'},
 ru:{mode:'Блоки',hint:'Редактируйте абзацы, списки и цитаты. Вставка добавляет только текст; изменения применяются после сохранения. В списке: Tab — увеличить отступ, Shift+Tab — уменьшить, Enter — выйти из пустого пункта, Backspace в начале — уменьшить отступ.',p:'Добавить абзац',ul:'Добавить маркированный список',ol:'Добавить нумерованный список',quote:'Добавить цитату',pre:'Добавить блок кода',formatUnsupported:'В выделении есть код или неподдерживаемое содержимое. Ничего не изменено; выделите текст вне блоков кода.',crossSelection:'Для изменения уровня выделите пункты одного списка. Выделение между абзацами и списками оставлено без изменений.',convertP:'В абзацы',convertUl:'В маркеры',convertOl:'В нумерацию',convertInvalid:'Выделите целые пункты списка и абзацы. Вложенные списки и другие блоки нельзя безопасно преобразовать в абзацы.',convertSame:'Выделенные блоки уже имеют этот формат.',convertNested:'Вложенные списки можно переключать между маркерами и нумерацией. Преобразование в абзацы пока не поддерживается.'}
};
const blockWords=()=>BLOCK_TEXT[state.lang]||BLOCK_TEXT.en;
const IMAGE_TEXT={
 en:{title:'Image properties',url:'Image URL (HTTPS)',alt:'Alternative text',decorative:'Decorative image (empty alt)',width:'Width (px)',height:'Height (px)',save:'Save image',hint:'Edit this image without replacing the cell text. External images need internet when exported.',invalid:'Enter a valid HTTPS image URL, alt text (unless decorative), and dimensions of 1–1600 px.',insertTitle:"Insert image",add:"Add image",cancel:"Cancel image",insert:"Insert image",insertHint:"Insert a new image after the cell content without replacing its text.",gfmHint:"GFM images stay portable; pixel dimensions are unavailable.",unsaved:"Save the current cell edits before inserting an image."},
 cs:{title:'Vlastnosti obrázku',url:'URL obrázku (HTTPS)',alt:'Alternativní text',decorative:'Dekorativní obrázek (prázdný alt)',width:'Šířka (px)',height:'Výška (px)',save:'Uložit obrázek',hint:'Upravte obrázek bez změny textu buňky. Externí obrázky v exportu vyžadují internet.',invalid:'Zadejte platnou HTTPS adresu, alternativní text a rozměry 1–1600 px.',insertTitle:"Vložit obrázek",add:"Přidat obrázek",cancel:"Zrušit obrázek",insert:"Vložit obrázek",insertHint:"Vložit nový obrázek za obsah buňky bez nahrazení textu.",gfmHint:"Obrázky GFM zůstávají přenosné; rozměry v pixelech nejsou dostupné.",unsaved:"Před vložením obrázku uložte aktuální úpravy buňky."},
 uk:{title:'Властивості зображення',url:'URL зображення (HTTPS)',alt:'Альтернативний текст',decorative:'Декоративне зображення (порожній alt)',width:'Ширина (px)',height:'Висота (px)',save:'Зберегти зображення',hint:'Редагуйте зображення, не змінюючи текст клітинки. Для зовнішніх зображень потрібен інтернет.',invalid:'Вкажіть коректну HTTPS-адресу, альтернативний текст та розміри 1–1600 px.',insertTitle:"Вставити зображення",add:"Додати зображення",cancel:"Скасувати зображення",insert:"Вставити зображення",insertHint:"Додати зображення після вмісту клітинки без заміни тексту.",gfmHint:"Зображення GFM залишаються сумісними; розміри в пікселях недоступні.",unsaved:"Збережіть зміни клітинки перед вставленням зображення."},
 ro:{title:'Proprietăți imagine',url:'URL imagine (HTTPS)',alt:'Text alternativ',decorative:'Imagine decorativă (alt gol)',width:'Lățime (px)',height:'Înălțime (px)',save:'Salvează imaginea',hint:'Editați imaginea fără a înlocui textul celulei. Imaginile externe necesită internet la export.',invalid:'Introduceți o adresă HTTPS, text alternativ și dimensiuni 1–1600 px.',insertTitle:"Inserează imagine",add:"Adaugă imagine",cancel:"Anulează imaginea",insert:"Inserează imagine",insertHint:"Adăugați o imagine după conținutul celulei, fără a înlocui textul.",gfmHint:"Imaginile GFM rămân portabile; dimensiunile în pixeli nu sunt disponibile.",unsaved:"Salvați modificările celulei înainte de inserarea imaginii."},
 ru:{title:'Свойства изображения',url:'URL изображения (HTTPS)',alt:'Альтернативный текст',decorative:'Декоративное изображение (пустой alt)',width:'Ширина (пикс.)',height:'Высота (пикс.)',save:'Сохранить изображение',hint:'Изменение изображения не заменяет текст ячейки. Внешние изображения требуют интернета при экспорте.',invalid:'Нужны корректный HTTPS-адрес, альтернативный текст и размеры от 1 до 1600 пикселей.',insertTitle:"Вставить изображение",add:"Добавить изображение",cancel:"Отменить вставку",insert:"Вставить изображение",insertHint:"Изображение добавляется после содержимого ячейки без замены её текста.",gfmHint:"Изображения в GFM остаются переносимыми; размеры в пикселях недоступны.",unsaved:"Сначала сохраните изменения текста ячейки."}
};
const imageWords=()=>IMAGE_TEXT[state.lang]||IMAGE_TEXT.en;


const GROUPS=[
 {key:'rows',items:['row-above','row-below','delete-row']},
 {key:'cols',items:['column-left','column-right','delete-column']},
 {key:'merge',items:['merge','merge-right','merge-down','split']},
 {key:'style',items:['cell-blue','cell-mint','cell-sand','borderless','outline']}
];
let selected=null;
let readonlyState=null;
function labels(){return UI[state.lang]||UI.en;}
function clearSelection(){
 selected=null;
 readonlyState=null;
 $('table-edit-bar').hidden=true;
 $('table-edit-bar').removeAttribute('data-readonly');
 $('table-edit-bar').setAttribute('role','toolbar');
 $('table-edit-readonly-message').hidden=true;
 document.querySelectorAll('#markdown-preview .table-edit-selected').forEach(c=>c.classList.remove('table-edit-selected'));
}
function renderReadonlyNotice(){
 if(!readonlyState)return;
 const words=readonlyWords();
 $('table-edit-title').textContent=words.title;
 $('table-edit-bar').setAttribute('role','region');
 $('table-edit-bar').setAttribute('aria-label',words.title);
 $('table-edit-status').textContent='';
 $('table-edit-readonly-message').textContent=(words[readonlyState.reason]||words['invalid-grid'])+' '+words.source;
}
function showReadonlyNotice(reason){
 clearSelection();
 readonlyState={reason,doc:docKey(),source:area().value};
 const bar=$('table-edit-bar');
 bar.dataset.readonly='true';
 $('table-edit-readonly-message').hidden=false;
 bar.hidden=false;
 renderReadonlyNotice();
}
function showCellMode(){
 if(!selected)return;
 const source=area().value,index=selected.tableIndex,row=selected.row,col=selected.col;
 const inline=getTableCellHTML(source,index,row,col);
 const blocks=getTableCellBlocks(source,index,row,col);
 const image=getTableCellImage(source,index,row,col);
 const insertable=image===null?getTableCellImageInsertion(source,index,row,col):null;
 const inserting=Boolean(selected.insertingImage)&&insertable!==null;
 const imageActive=image!==null||inserting;
 const eligible=blocks!==null;
 const unsupported=!eligible&&!imageActive&&findEditableTables(source)[index]?.type!=='gfm';
 const richActive=eligible&&Boolean(selected.richMode);
 const blockActive=richActive&&Boolean(selected.blockMode);
 const addButton=$('table-edit-image-add');
 addButton.hidden=!insertable;
 addButton.setAttribute('aria-pressed',String(inserting));
 addButton.textContent=inserting?imageWords().cancel:imageWords().add;
 $('table-edit-image-title').textContent=inserting?imageWords().insertTitle:imageWords().title;
 $('table-edit-image-save').textContent=inserting?imageWords().insert:imageWords().save;
 for(const key of ['width','height']){
  const control=$('table-edit-image-'+key);
  const gfm=inserting&&insertable.format==='gfm';
  control.closest('label').hidden=gfm;
  control.disabled=gfm;
 }
 $('table-edit-mode').hidden=!eligible||imageActive;
 $('table-edit-content-form').hidden=imageActive;
 $('table-edit-image-form').hidden=!imageActive;
 $('table-edit-content-input').hidden=richActive;
 $('table-edit-rich-panel').hidden=!richActive;
 $('table-edit-block-actions').hidden=!blockActive;
 $('table-edit-rich-choice').disabled=inline===null;
 $('table-edit-rich-choice').setAttribute('aria-pressed',String(richActive&&!blockActive));
 $('table-edit-block-choice').setAttribute('aria-pressed',String(blockActive));
 $('table-edit-plain-choice').setAttribute('aria-pressed',String(!richActive));
 $('table-edit-content-label').htmlFor=richActive?'table-edit-rich-content':'table-edit-content-input';
 $('table-edit-content-warning').textContent=inserting?
  (insertable.format==='gfm'?imageWords().gfmHint:imageWords().insertHint):
  image!==null?imageWords().hint:unsupported?richWords().unsupported:
  blockActive?blockWords().hint:richActive?richWords().hint:(CONTENT_TEXT[state.lang]||CONTENT_TEXT.en)[2];
}
function refreshCellText(){
 if(!selected)return;
 const source=area().value,index=selected.tableIndex,row=selected.row,col=selected.col;
 const text=getTableCellText(source,index,row,col);
 const inline=getTableCellHTML(source,index,row,col);
 const blocks=getTableCellBlocks(source,index,row,col);
 const image=getTableCellImage(source,index,row,col);
 $('table-edit-content-input').value=text??'';
 const entry=findEditableTables(source)[index];
 const readonly=text===null||(entry?.type!=='gfm'&&blocks===null);
 $('table-edit-content-input').disabled=readonly;
 $('table-edit-content-save').disabled=readonly;
 if(blocks!==null)$('table-edit-rich-content').innerHTML=blocks;
 else if(inline!==null)$('table-edit-rich-content').innerHTML=inline;
 else $('table-edit-rich-content').replaceChildren();
 selected.pendingRichHTML=undefined;
 if(image||selected.insertingImage){
  const values=image||{url:'',alt:'',decorative:false,width:'',height:''};
  $('table-edit-image-url').value=values.url;
  $('table-edit-image-alt').value=values.alt;
  $('table-edit-image-decorative').checked=values.decorative;
  $('table-edit-image-alt').disabled=values.decorative;
  $('table-edit-image-width').value=values.width;
  $('table-edit-image-height').value=values.height;
 }
 showCellMode();
}
function toggleImageInsertion(){
 if(!selected)return;
 const source=area().value,index=selected.tableIndex,row=selected.row,col=selected.col;
 if(!getTableCellImageInsertion(source,index,row,col))return;
 if(!selected.insertingImage){
  const current=selected.blockMode?getTableCellBlocks(source,index,row,col):
   selected.richMode?getTableCellHTML(source,index,row,col):getTableCellText(source,index,row,col);
  const draft=selected.richMode?$('table-edit-rich-content').innerHTML:$('table-edit-content-input').value;
  if(current!==draft){
   $('table-edit-message').textContent=imageWords().unsaved;
   return;
  }
 }
 selected.insertingImage=!selected.insertingImage;
 $('table-edit-message').textContent='';
 if(selected.insertingImage){
  $('table-edit-image-url').value='';
  $('table-edit-image-alt').value='';
  $('table-edit-image-width').value='';
  $('table-edit-image-height').value='';
  $('table-edit-image-decorative').checked=false;
  $('table-edit-image-alt').disabled=false;
 }
 showCellMode();
 (selected.insertingImage?$('table-edit-image-url'):
  selected.richMode?$('table-edit-rich-content'):$('table-edit-content-input')).focus();
}
function setCellMode(mode){
 if(!selected)return;
 const source=area().value,index=selected.tableIndex,row=selected.row,col=selected.col;
 if(mode==='rich'&&getTableCellHTML(source,index,row,col)===null)return;
 if(mode==='blocks'&&getTableCellBlocks(source,index,row,col)===null)return;
 const current=selected.blockMode?'blocks':selected.richMode?'rich':'plain';
 if(mode===current)return;
 const editor=$('table-edit-rich-content'),input=$('table-edit-content-input');
 if(mode==='plain'){
  selected.pendingRichHTML=editor.innerHTML;
  input.value=editor.textContent;
 }else if(current==='plain'){
  const previous=selected.pendingRichHTML;
  if(previous!==undefined){
   const doc=new DOMParser().parseFromString(previous,'text/html');
   if(doc.body.textContent===input.value)editor.innerHTML=previous;
   else editor.textContent=input.value;
  }else editor.textContent=input.value;
 }
 selected.richMode=mode!=='plain';
 selected.blockMode=mode==='blocks';
 showCellMode();
 (mode==='plain'?input:editor).focus();
}
function saveCell(){
 if(!selected)return;
 const before=findEditableTables(area().value)[selected.tableIndex];
 if(!before||before.raw!==selected.raw){clearSelection();return;}
 const richMode=Boolean(selected.richMode),blockMode=richMode&&Boolean(selected.blockMode);
 const value=richMode?$('table-edit-rich-content').innerHTML:$('table-edit-content-input').value;
 const args=[area().value,selected.tableIndex,selected.row,selected.col];
 const current=blockMode?getTableCellBlocks(...args):richMode?getTableCellHTML(...args):getTableCellText(...args);
 if(value===current)return;
 const edit=blockMode?setTableCellBlocks(...args,value):
  richMode?setTableCellHTML(...args,value):setTableCellText(...args,value);
 if(!edit){$('table-edit-message').textContent=labels().invalid;return;}
 selected.raw=findEditableTables(edit.text)[selected.tableIndex]?.raw||'';
 $('table-edit-message').textContent='';
 applyEdit(edit.text,edit.start,edit.start,{focus:false});
 syncTableEditorPreview();
 refreshCellText();
}
function saveImage(){
 if(!selected)return;
 const source=area().value,entry=findEditableTables(source)[selected.tableIndex];
 if(!entry||entry.raw!==selected.raw){clearSelection();return;}
 const args=[source,selected.tableIndex,selected.row,selected.col];
 const current=getTableCellImage(...args);
 const inserting=current===null&&selected.insertingImage&&getTableCellImageInsertion(...args);
 if(!current&&!inserting)return;
 const options={
  url:$('table-edit-image-url').value.trim(),
  alt:$('table-edit-image-alt').value,
  decorative:$('table-edit-image-decorative').checked,
  width:$('table-edit-image-width').value,
  height:$('table-edit-image-height').value
 };
 if(!inserting&&Object.entries(options).every(([key,value])=>value===current[key]))return;
 const edit=inserting?insertTableCellImage(...args,options):setTableCellImage(...args,options);
 if(!edit){$('table-edit-message').textContent=imageWords().invalid;return;}
 selected.raw=findEditableTables(edit.text)[selected.tableIndex]?.raw||'';
 selected.insertingImage=false;
 $('table-edit-message').textContent='';
 applyEdit(edit.text,edit.start,edit.start,{focus:false});
 syncTableEditorPreview();
 refreshCellText();
}
function insertRichNodes(nodes){
 const editor=$('table-edit-rich-content'),selection=window.getSelection();
 const range=selection?.rangeCount?selection.getRangeAt(0):null;
 if(!range||!editor.contains(range.commonAncestorContainer))return false;
 range.deleteContents();
 const fragment=document.createDocumentFragment();
 for(const node of nodes)fragment.append(node);
 const last=fragment.lastChild;
 range.insertNode(fragment);
 if(last){range.setStartAfter(last);range.collapse(true);selection.removeAllRanges();selection.addRange(range);}
 editor.focus();return true;
}
function wrapRichSelection(tag){
 if(!selected?.richMode)return;
 const editor=$('table-edit-rich-content'),selection=window.getSelection();
 if(!selection?.rangeCount)return;
 const range=selection.getRangeAt(0);
 if(range.collapsed||!editor.contains(range.commonAncestorContainer))return;
 if(selected.blockMode){
  const result=formatBlockSelection(editor,tag,selection);
  if(!result.ok){
   if(result.reason!=='no-selection')$('table-edit-message').textContent=blockWords().formatUnsupported;
   return;
  }
  $('table-edit-message').textContent='';
  editor.focus();
  return;
 }
 const node=document.createElement(tag);
 node.append(range.extractContents());
 range.insertNode(node);
 range.selectNodeContents(node);range.collapse(false);
 selection.removeAllRanges();selection.addRange(range);
 editor.focus();
}
function convertSelectedBlocks(target){
 if(!selected?.blockMode)return;
 const editor=$('table-edit-rich-content'),selection=window.getSelection();
 const result=convertBlockSelection(editor,target,selection);
 if(!result.ok){
  $('table-edit-message').textContent=result.reason==='already-formatted'?
   blockWords().convertSame:result.reason==='nested-to-paragraph'?
   blockWords().convertNested:blockWords().convertInvalid;
  return;
 }
 $('table-edit-message').textContent='';
 editor.focus();
}
function appendBlock(kind){
 if(!selected?.blockMode)return;
 const editor=$('table-edit-rich-content');
 let block,focus;
 if(kind==='ul'||kind==='ol'){
  block=document.createElement(kind);
  focus=document.createElement('li');focus.append(document.createElement('br'));block.append(focus);
 }else if(kind==='quote'){
  block=document.createElement('blockquote');
  focus=document.createElement('p');focus.append(document.createElement('br'));block.append(focus);
 }else if(kind==='pre'){
  block=document.createElement('pre');
  focus=document.createElement('code');focus.textContent=' ';block.append(focus);
 }else{
  block=document.createElement('p');focus=block;block.append(document.createElement('br'));
 }
 editor.append(block);
 const range=document.createRange();
 range.selectNodeContents(focus);range.collapse(true);
 const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
 editor.focus();
}
function pastePlainText(text){
 const normalized=String(text).replace(/\r\n?/g,'\n').slice(0,2000);
 const segments=normalized.split('\n'),nodes=[];
 segments.forEach((line,i)=>{
  if(i)nodes.push(document.createElement('br'));
  if(line)nodes.push(document.createTextNode(line));
 });
 insertRichNodes(nodes);
}
function highlight(){
 const preview=$('markdown-preview');
 preview.querySelectorAll('.table-edit-selected').forEach(cell=>cell.classList.remove('table-edit-selected'));
 if(!selected)return;
 const tables=[...preview.querySelectorAll('table')];
 const table=tables[selected.tableIndex];
 if(!table)return clearSelection();
 const bounds=tableSelectionBounds(area().value,selected.tableIndex,selected);
 if(!bounds)return clearSelection();
 const cells=[...table.querySelectorAll('th,td')];
 for(const cell of cells){
  const p=previewTableCoordinates(table,cell);
  if(!p)continue;
  if(p.row<=bounds.r1&&p.row+p.rs-1>=bounds.r0&&
     p.col<=bounds.c1&&p.col+p.cs-1>=bounds.c0)cell.classList.add('table-edit-selected');
 }
 const l=labels();
 const other=selected.other||{row:selected.row,col:selected.col};
 const expanded=bounds.r0!==Math.min(selected.row,other.row)||
  bounds.r1!==Math.max(selected.row,other.row)||
  bounds.c0!==Math.min(selected.col,other.col)||
  bounds.c1!==Math.max(selected.col,other.col);
 $('table-edit-status').textContent=l.cell+' '+(bounds.r0+1)+', '+(bounds.c0+1)+
  (selected.other?' → '+(bounds.r1+1)+', '+(bounds.c1+1):'')+
  (expanded?' · '+l.expanded:'');
 $('table-edit-bar').hidden=false;
}
export function syncTableEditorPreview(){
 const tables=[...$('markdown-preview').querySelectorAll('table')],sourceTables=findEditableTables(area().value);
 for(const table of tables)for(const cell of table.querySelectorAll('td,th'))cell.tabIndex=0;
 if(readonlyState&&(readonlyState.doc!==docKey()||readonlyState.source!==area().value))clearSelection();
 if(tables.length!==sourceTables.length){
  if(selected)clearSelection();
  return;
 }
 if(!selected)return;
 if(selected.doc!==docKey()||!tables[selected.tableIndex]||sourceTables[selected.tableIndex]?.raw!==selected.raw)return clearSelection();
 highlight();
}
function chooseCell(event){
 const cell=event.target.closest?.('th,td');
 if(!cell||event.target.closest('input,button,a'))return;
 const table=cell.closest('table');if(!table||!$('markdown-preview').contains(table))return;
 const tables=[...$('markdown-preview').querySelectorAll('table')],index=tables.indexOf(table);
 const sourceTables=findEditableTables(area().value);
 if(index<0)return;
 if(sourceTables.length!==tables.length)return showReadonlyNotice('unmapped');
 const reason=getTableReadOnlyReason(area().value,index);
 if(reason)return showReadonlyNotice(reason);
 const coords=previewTableCoordinates(table,cell);
 if(!coords)return showReadonlyNotice('invalid-grid');
 if(readonlyState)clearSelection();
 if(event.shiftKey&&selected?.doc===docKey()&&selected.tableIndex===index){
  selected.other={row:coords.row,col:coords.col};
 }else{
  const html=getTableCellHTML(area().value,index,coords.row,coords.col);
  const blocks=getTableCellBlocks(area().value,index,coords.row,coords.col);
  const image=getTableCellImage(area().value,index,coords.row,coords.col);
  const blockMode=blocks!==null&&/<(?:p|div|ul|ol|li|blockquote|pre|h[2-4])\b/i.test(blocks);
  selected={tableIndex:index,doc:docKey(),row:coords.row,col:coords.col,other:null,
   raw:sourceTables[index].raw,imageMode:image!==null,insertingImage:false,blockMode,richMode:blockMode||
    (html!==null&&/<(?:strong|b|em|i|u|s|del|sup|sub|mark|code|span|a|br)\b/i.test(html))};
 }
 highlight();
 refreshCellText();
}
function applyOperation(op){
 if(!selected)return;
 const existing=findEditableTables(area().value)[selected.tableIndex];
 if(!existing||existing.raw!==selected.raw){clearSelection();return;}
 const edit=editTableAt(area().value,selected.tableIndex,op,selected);
 if(!edit){$('table-edit-message').textContent=labels().invalid;return;}
 const old=selected;old.other=null;old.row=0;old.col=0;
 old.raw=findEditableTables(edit.text)[old.tableIndex]?.raw||'';
 const caret=Math.min(edit.text.length,edit.start);
 $('table-edit-message').textContent='';
 applyEdit(edit.text,caret,caret,{focus:false});
 syncTableEditorPreview();
 refreshCellText();
}
export function renderTableEditorLanguage(){
 const l=labels(),bar=$('table-edit-bar');if(!bar)return;
 $('table-edit-title').textContent=l.title;
 $('table-edit-close').setAttribute('aria-label',l.close);
 bar.setAttribute('aria-label',readonlyState?readonlyWords().title:l.title);
 if(readonlyState)renderReadonlyNotice();
 $('table-edit-hint').textContent=l.select;
 const content=CONTENT_TEXT[state.lang]||CONTENT_TEXT.en;
 $('table-edit-content-label').textContent=content[0];
 $('table-edit-content-save').textContent=content[1];
 $('table-edit-content-warning').textContent=content[2];
 const rich=richWords();
 $('table-edit-rich-choice').textContent=rich.rich;
 $('table-edit-plain-choice').textContent=rich.plain;
 const block=blockWords();
 const media=imageWords();
 $('table-edit-image-title').textContent=media.title;
 for(const [name,key] of [['url','url'],['alt','alt'],['width','width'],['height','height']]){
  const label=$('table-edit-image-'+name+'-label');
  label.textContent=media[key];
 }
 $('table-edit-image-decorative-label').textContent=media.decorative;
 $('table-edit-image-save').textContent=media.save;
 $('table-edit-block-choice').textContent=block.mode;
 for(const kind of ['p','ul','ol','quote','pre']){
  const button=$('table-edit-block-'+kind);
  button.textContent=block[kind];button.setAttribute('aria-label',block[kind]);
 }
 for(const kind of ['p','ul','ol']){
  const button=$('table-edit-convert-'+kind);
  const label=block['convert'+kind[0].toUpperCase()+kind.slice(1)];
  button.textContent=label;button.setAttribute('aria-label',label);
 }
 for(const [key,label] of Object.entries({bold:rich.bold,italic:rich.italic,underline:rich.underline,code:rich.code})){
  const button=$('table-edit-rich-'+key);
  button.title=label;button.setAttribute('aria-label',label);
 }
 $('table-edit-rich-content').setAttribute('aria-label',rich.rich);
 if(selected)showCellMode();
 $('table-edit-content-input').setAttribute('aria-label',content[3]);
 GROUPS.forEach(({key,items})=>{
  const select=$('table-edit-'+key);
  const prior=select.value;
  select.replaceChildren(new Option(l[key],''),...items.map((op,i)=>{
   const n=GROUPS.flatMap(g=>g.items).indexOf(op);
   return new Option(l.ops[n],op);
  }));
  select.value=items.includes(prior)?prior:'';
  select.setAttribute('aria-label',l[key]);
 });
 if(selected)highlight();
}
export function initTableEditor(){
 const bar=document.createElement('div');bar.id='table-edit-bar';bar.className='table-edit-bar';bar.hidden=true;
 bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Edit table');
 bar.innerHTML='<div class="table-edit-heading"><strong id="table-edit-title"></strong>'
  +'<span id="table-edit-status" aria-live="polite"></span><button id="table-edit-close" type="button">✕</button></div>'
  +'<p id="table-edit-readonly-message" role="status" aria-live="polite" hidden></p>'
  +'<div class="table-edit-actions"></div>'
  +'<div id="table-edit-mode" class="table-edit-mode" role="group" hidden><button type="button" id="table-edit-rich-choice" aria-pressed="false"></button><button type="button" id="table-edit-block-choice" aria-pressed="false"></button><button type="button" id="table-edit-plain-choice" aria-pressed="true"></button></div>'
  +'<button id="table-edit-image-add" class="table-edit-image-add" type="button" aria-pressed="false" hidden></button>'
  +'<form id="table-edit-content-form" class="table-edit-content-form"><label id="table-edit-content-label" for="table-edit-content-input"></label><input id="table-edit-content-input" type="text" maxlength="2000" autocomplete="off">'
  +'<div id="table-edit-rich-panel" hidden><div class="table-edit-rich-actions" role="toolbar" aria-label="Rich cell formatting">'
  +'<button type="button" id="table-edit-rich-bold"><strong>B</strong></button><button type="button" id="table-edit-rich-italic"><em>I</em></button><button type="button" id="table-edit-rich-underline"><u>U</u></button><button type="button" id="table-edit-rich-code"><code>&lt;/&gt;</code></button></div>'
  +'<div id="table-edit-block-actions" class="table-edit-block-actions" hidden>'+['p','ul','ol','quote','pre'].map(kind=>'<button type="button" id="table-edit-block-'+kind+'"></button>').join('')+'<span class="table-edit-convert-separator" aria-hidden="true"></span>'+['p','ul','ol'].map(kind=>'<button type="button" id="table-edit-convert-'+kind+'"></button>').join('')+'</div>'
  +'<div id="table-edit-rich-content" contenteditable="true" role="textbox" aria-multiline="true" spellcheck="true"></div></div>'
  +'<button id="table-edit-content-save" type="submit"></button></form>'
  +'<form id="table-edit-image-form" class="table-edit-image-form" hidden>'
  +'<strong id="table-edit-image-title"></strong>'
  +'<label><span id="table-edit-image-url-label"></span><input id="table-edit-image-url" type="url" required maxlength="2048" autocomplete="off"></label>'
  +'<label><span id="table-edit-image-alt-label"></span><input id="table-edit-image-alt" maxlength="400" autocomplete="off"></label>'
  +'<label class="table-edit-image-decorative"><input id="table-edit-image-decorative" type="checkbox"><span id="table-edit-image-decorative-label"></span></label>'
  +'<label><span id="table-edit-image-width-label"></span><input id="table-edit-image-width" type="number" min="1" max="1600"></label>'
  +'<label><span id="table-edit-image-height-label"></span><input id="table-edit-image-height" type="number" min="1" max="1600"></label>'
  +'<button type="submit" id="table-edit-image-save"></button></form>'
  +'<p id="table-edit-content-warning"></p><p id="table-edit-hint"></p><p id="table-edit-message" role="status" aria-live="polite"></p>';
 const actions=bar.querySelector('.table-edit-actions');
 for(const {key} of GROUPS){
  const select=document.createElement('select');select.id='table-edit-'+key;
  select.addEventListener('change',()=>{
   if(select.value)applyOperation(select.value);
   select.value='';
  });actions.append(select);
 }
 document.body.append(bar);
 $('table-edit-close').addEventListener('click',clearSelection);
 $('table-edit-content-form').addEventListener('submit',e=>{e.preventDefault();saveCell();});
 $('table-edit-image-form').addEventListener('submit',e=>{e.preventDefault();saveImage();});
 $('table-edit-image-add').addEventListener('click',toggleImageInsertion);
 $('table-edit-image-decorative').addEventListener('change',()=>{
  const decorative=$('table-edit-image-decorative').checked;
  $('table-edit-image-alt').disabled=decorative;
  if(decorative)$('table-edit-image-alt').value='';
 });
 $('table-edit-rich-choice').addEventListener('click',()=>setCellMode('rich'));
 $('table-edit-plain-choice').addEventListener('click',()=>setCellMode('plain'));
 $('table-edit-block-choice').addEventListener('click',()=>setCellMode('blocks'));
 for(const kind of ['p','ul','ol','quote','pre']){
  $('table-edit-block-'+kind).addEventListener('click',()=>appendBlock(kind));
 }
 for(const kind of ['p','ul','ol']){
  const button=$('table-edit-convert-'+kind);
  button.addEventListener('pointerdown',event=>event.preventDefault());
  button.addEventListener('click',()=>convertSelectedBlocks(kind));
 }
 for(const [kind,tag] of Object.entries({bold:'strong',italic:'em',underline:'u',code:'code'})){
  const btn=$('table-edit-rich-'+kind);
  btn.addEventListener('pointerdown',e=>e.preventDefault());
  btn.addEventListener('click',()=>wrapRichSelection(tag));
 }
 const editor=$('table-edit-rich-content');
 editor.addEventListener('keydown',event=>{
  if(!selected?.blockMode)return;
  let unsupported=false;
  const handled=handleBlockListKeydown(editor,event,window.getSelection(),()=>{
   unsupported=true;
   $('table-edit-message').textContent=blockWords().crossSelection;
  });
  if(handled&&!unsupported)$('table-edit-message').textContent='';
 });
 editor.addEventListener('paste',event=>{
  event.preventDefault();
  pastePlainText(event.clipboardData?.getData('text/plain')||'');
 });
 editor.addEventListener('drop',event=>event.preventDefault());
 editor.addEventListener('beforeinput',event=>{
  if(!selected?.blockMode&&(event.inputType==='insertParagraph'||event.inputType==='insertLineBreak')){
   event.preventDefault();insertRichNodes([document.createElement('br')]);
  }
 });
 $('markdown-preview').addEventListener('click',chooseCell);
 $('markdown-preview').addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&/^(TD|TH)$/.test(e.target.tagName)){
   e.preventDefault();chooseCell({target:e.target,shiftKey:e.shiftKey});
   if(e.key==='Enter'&&!readonlyState){
    const focusTarget=!$('table-edit-image-form').hidden?$('table-edit-image-url'):
     !$('table-edit-rich-panel').hidden?$('table-edit-rich-content'):$('table-edit-content-input');
    focusTarget.focus();
   }
  }
 });
 renderTableEditorLanguage();
}
