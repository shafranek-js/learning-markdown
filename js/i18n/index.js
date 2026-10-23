import * as en from './en.js';
import * as cs from './cs.js';
import * as uk from './uk.js';
import * as ro from './ro.js';
import * as ru from './ru.js';
const ALL = {en,cs,uk,ro,ru};
export const LANGUAGES = Object.keys(ALL);
export const ui = lang => ALL[lang]?.ui ?? en.ui;
export const lessonTranslations = Object.fromEntries(
  Array.from({length:8},(_,i)=>[i+1,Object.fromEntries(LANGUAGES.map(l=>[l,ALL[l].lessonText[i+1]]))])
);
const extra = {
 en: { insert:"Insert",insertHint:"Insert this Markdown snippet at the current cursor position",print:'Print / Save PDF', name:'Your name', certLocked:'Complete all eight lessons to earn this certificate.', confirmReset:'Erase core Markdown drafts and progress? Advanced course data will be kept.', exportHTML:'Export HTML', editor:'Editor', guide:'Guide', noPreview:'No Markdown parser available.', progressSaved:'Progress saved locally.' },
 cs: { insert:"Vložit",insertHint:"Vložit ukázku Markdownu na pozici kurzoru",print:'Tisk / Uložit PDF',name:'Vaše jméno',certLocked:'K získání certifikátu dokončete všech osm lekcí.',confirmReset:'Smazat koncepty a postup základního kurzu? Pokročilý kurz zůstane zachován.',exportHTML:'Exportovat HTML',editor:'Editor',guide:'Průvodce',noPreview:'Knihovna Markdown není dostupná.',progressSaved:'Postup uložen lokálně.' },
 uk: { insert:"Вставити",insertHint:"Вставити фрагмент Markdown у позицію курсора",print:'Друк / PDF',name:"Ваше ім’я",certLocked:'Завершіть усі вісім уроків, щоб отримати диплом.',confirmReset:'Видалити чернетки та прогрес базового курсу? Додатковий курс збережеться.',exportHTML:'Експорт HTML',editor:'Редактор',guide:'Гід',noPreview:'Бібліотека Markdown недоступна.',progressSaved:'Прогрес збережено локально.' },
 ro: { insert:"Inserează",insertHint:"Inserează fragmentul Markdown la poziția cursorului",print:'Tipăriți / PDF',name:'Numele dvs.',certLocked:'Finalizați toate cele opt lecții pentru certificat.',confirmReset:'Ștergeți proiectele și progresul cursului de bază? Cursul avansat se păstrează.',exportHTML:'Export HTML',editor:'Editor',guide:'Ghid',noPreview:'Parserul Markdown este indisponibil.',progressSaved:'Progres salvat local.' },
 ru: { insert:"Вставить",insertHint:"Вставить этот фрагмент Markdown в позицию курсора",print:'Печать / PDF',name:'Ваше имя',certLocked:'Завершите все восемь уроков, чтобы получить сертификат.',confirmReset:'Удалить черновики и прогресс основного курса? Продвинутый курс сохранится.',exportHTML:'Экспорт HTML',editor:'Редактор',guide:'Гид',noPreview:'Парсер Markdown недоступен.',progressSaved:'Прогресс сохранён локально.' }
};
export const t = (lang,key) => ui(lang)[key] ?? extra[lang]?.[key] ?? extra.en[key] ?? key;
