// Optional processor-specific features. Never redefine normative Markdown modes.
export const EXTENSIONS=Object.freeze({
 softbreaks:Object.freeze({id:'softbreaks',category:'app',modes:Object.freeze(['gfm']),option:Object.freeze({breaks:true})})
});
const LANG='en|cs|uk|ro|ru';
export const validDocumentKey=key=>new RegExp('^(?:sandbox|lesson_[1-8]|advanced_[1-7])_(?:'+LANG+')$').test(key);
export function normalizeExtensionSettings(data){
 const out=Object.create(null);
 if(!data||typeof data!=='object'||Array.isArray(data))return out;
 for(const [key,options] of Object.entries(data)){
  if(!validDocumentKey(key)||!options||typeof options!=='object'||Array.isArray(options))continue;
  if(options.softbreaks===true)out[key]={softbreaks:true};
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
 en:{title:'Optional processor extension',label:'Soft line breaks (app-only)',off:'Off (standard GFM)',on:'On (this document)',note:'Not normative GFM; active only in GFM. Your Markdown source stays unchanged.',unavailable:'Only available in GFM; your choice is saved.',matrix:'Portability matrix',feature:'Feature',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'This app',headings:'Headings and emphasis',tables:'Tables and task lists',breaks:'Extra soft line breaks',html:'HTML/CSS presets',footnotes:'Footnotes (#11 pending)',yes:'Yes',no:'No',varies:'Varies',planned:'Planned',warning:'App-only line break rendering is enabled. Other Markdown processors may display single newlines differently. Your .md source will remain unchanged. Download anyway?'},
 cs:{title:'Volitelné rozšíření procesoru',label:'Měkké konce řádků (jen aplikace)',off:'Vypnuto (GFM standard)',on:'Zapnuto (tento dokument)',note:'Není součástí GFM; pouze v režimu GFM. Zdroj Markdownu se nemění.',unavailable:'Jen v GFM; nastavení je uložené.',matrix:'Matice přenositelnosti',feature:'Funkce',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Tato aplikace',headings:'Nadpisy a zvýraznění',tables:'Tabulky a úkoly',breaks:'Další měkké zlomy',html:'HTML/CSS předvolby',footnotes:'Poznámky pod čarou (#11 čeká)',yes:'Ano',no:'Ne',varies:'Různé',planned:'Plánováno',warning:'Tento dokument používá vlastní zalamování řádků. Jiné procesory jej mohou zobrazit jinak. Zdroj .md se nezmění. Stáhnout?'},
 uk:{title:'Додаткове розширення процесора',label:'М’які переноси (лише застосунок)',off:'Вимкнено (стандарт GFM)',on:'Увімкнено (цей документ)',note:'Не входить у GFM; лише в режимі GFM. Markdown не змінюється.',unavailable:'Лише GFM; вибір збережено.',matrix:'Матриця сумісності',feature:'Функція',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Цей застосунок',headings:'Заголовки й виділення',tables:'Таблиці й завдання',breaks:'Додаткові переноси',html:'Шаблони HTML/CSS',footnotes:'Виноски (#11 очікується)',yes:'Так',no:'Ні',varies:'Залежить',planned:'Планується',warning:'Включено нестандартні переноси. Інші процесори можуть показувати їх інакше. Markdown не зміниться. Завантажити?'},
 ro:{title:'Extensie opțională',label:'Rânduri noi simple (doar aplicația)',off:'Oprit (GFM standard)',on:'Pornit (acest document)',note:'Nu este GFM normativ; doar în modul GFM. Sursa nu se schimbă.',unavailable:'Doar GFM; setarea rămâne salvată.',matrix:'Matrice de portabilitate',feature:'Funcție',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Această aplicație',headings:'Titluri și evidențiere',tables:'Tabele și sarcini',breaks:'Rânduri noi suplimentare',html:'Șabloane HTML/CSS',footnotes:'Note de subsol (#11 viitor)',yes:'Da',no:'Nu',varies:'Depinde',planned:'Planificat',warning:'Acest document activează rânduri noi specifice aplicației. Alte procesoare le pot reda diferit. Sursa .md rămâne neschimbată. Descărcați?'},
 ru:{title:'Дополнительное расширение',label:'Мягкие переносы (только приложение)',off:'Выключено (стандартный GFM)',on:'Включено (этот документ)',note:'Не входит в нормативный GFM; только для режима GFM. Markdown не изменяется.',unavailable:'Только для GFM; выбор сохранён.',matrix:'Матрица совместимости',feature:'Возможность',core:'CommonMark',gfm:'GFM',github:'GitHub.com',app:'Это приложение',headings:'Заголовки и выделение',tables:'Таблицы и списки задач',breaks:'Дополнительные переносы',html:'Шаблоны HTML/CSS',footnotes:'Сноски (#11 ещё не реализованы)',yes:'Да',no:'Нет',varies:'Зависит',planned:'В планах',warning:'В документе включены нестандартные переносы строк. Другие процессоры могут отображать их иначе. Исходный .md сохранится без изменений. Скачать?'}
};
export const extensionText=lang=>EXTENSION_TEXT[lang]||EXTENSION_TEXT.en;
