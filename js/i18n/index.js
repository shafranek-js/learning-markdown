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
 en: { print:'Print / Save PDF', name:'Your name', certLocked:'Complete all eight lessons to earn this certificate.', confirmReset:'Erase all course drafts and progress? This cannot be undone.', exportHTML:'Export HTML', editor:'Editor', guide:'Guide', noPreview:'No Markdown parser available.', progressSaved:'Progress saved locally.' },
 cs: { print:'Tisk / Uložit PDF',name:'Vaše jméno',certLocked:'K získání certifikátu dokončete všech osm lekcí.',confirmReset:'Opravdu smazat všechny koncepty a celý postup?',exportHTML:'Exportovat HTML',editor:'Editor',guide:'Průvodce',noPreview:'Knihovna Markdown není dostupná.',progressSaved:'Postup uložen lokálně.' },
 uk: { print:'Друк / PDF',name:"Ваше ім’я",certLocked:'Завершіть усі вісім уроків, щоб отримати диплом.',confirmReset:'Видалити всі чернетки й прогрес?',exportHTML:'Експорт HTML',editor:'Редактор',guide:'Гід',noPreview:'Бібліотека Markdown недоступна.',progressSaved:'Прогрес збережено локально.' },
 ro: { print:'Tipăriți / PDF',name:'Numele dvs.',certLocked:'Finalizați toate cele opt lecții pentru certificat.',confirmReset:'Ștergeți toate proiectele și progresul?',exportHTML:'Export HTML',editor:'Editor',guide:'Ghid',noPreview:'Parserul Markdown este indisponibil.',progressSaved:'Progres salvat local.' },
 ru: { print:'Печать / PDF',name:'Ваше имя',certLocked:'Завершите все восемь уроков, чтобы получить сертификат.',confirmReset:'Удалить все черновики и прогресс курса?',exportHTML:'Экспорт HTML',editor:'Редактор',guide:'Гид',noPreview:'Парсер Markdown недоступен.',progressSaved:'Прогресс сохранён локально.' }
};
export const t = (lang,key) => ui(lang)[key] ?? extra[lang]?.[key] ?? extra.en[key] ?? key;
