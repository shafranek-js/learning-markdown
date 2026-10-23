import {state} from '../core/state.js';
import {makeFigureSnippet,makePortableImage} from '../core/figures.js';

const $=id=>document.getElementById(id);
const DICT={
 en:{title:'Insert image / figure',trigger:'Figure / Image',description:'Sized HTML is optional and platform-dependent. Regular Markdown images are more portable.',url:'Image URL (HTTPS)',alt:'Alternative text (required)',decorative:'Decorative image (empty alt)',width:'Image width',custom:'Custom width (1–1600 px)',natural:'Keep natural aspect ratio',height:'Image height (1–1600 px)',caption:'Caption (optional)',external:'Externally hosted images require internet in exported HTML/PDF. No remote image is embedded.',cancel:'Cancel',markdown:'Portable Markdown',insert:'Insert HTML figure',error:{url:'Enter a valid HTTPS image URL.',alt:'Alternative text is required unless decorative.',width:'Choose a width from 1 to 1600 px.',height:'Choose a height from 1 to 1600 px.',length:'Text is too long.'}},
 cs:{title:'Vložit obrázek / popisek',trigger:'Obrázek / popisek',description:'HTML rozměry nejsou vždy přenositelné. Běžný obrázek Markdown je kompatibilnější.',url:'URL obrázku (HTTPS)',alt:'Alternativní text (povinný)',decorative:'Dekorativní obrázek (prázdný alt)',width:'Šířka obrázku',custom:'Vlastní šířka (1–1600 px)',natural:'Zachovat původní poměr stran',height:'Výška obrázku (1–1600 px)',caption:'Popisek (volitelný)',external:'Vzdálené obrázky v exportovaném HTML/PDF vyžadují internet.',cancel:'Zrušit',markdown:'Přenosný Markdown',insert:'Vložit HTML obrázek',error:{url:'Zadejte platnou HTTPS adresu.',alt:'Alternativní text je povinný kromě dekorací.',width:'Šířka musí být 1 až 1600 px.',height:'Výška musí být 1 až 1600 px.',length:'Text je příliš dlouhý.'}},
 uk:{title:'Вставити зображення з підписом',trigger:'Зображення / підпис',description:'HTML-розміри можуть бути непереносимими. Стандартний Markdown сумісніший.',url:'URL зображення (HTTPS)',alt:'Альтернативний текст (обов’язково)',decorative:'Декоративне зображення (порожній alt)',width:'Ширина зображення',custom:'Власна ширина (1–1600 px)',natural:'Зберігати природні пропорції',height:'Висота зображення (1–1600 px)',caption:'Підпис (необов’язково)',external:'Зовнішні зображення потребують інтернету в експортованому HTML/PDF.',cancel:'Скасувати',markdown:'Звичайний Markdown',insert:'Вставити HTML-рисунок',error:{url:'Вкажіть коректний HTTPS URL.',alt:'Потрібен альтернативний текст, крім декоративних.',width:'Ширина від 1 до 1600 px.',height:'Висота від 1 до 1600 px.',length:'Завеликий текст.'}},
 ro:{title:'Inserează imagine / legendă',trigger:'Imagine / legendă',description:'Dimensiunile HTML pot varia pe alte platforme. Markdown standard este mai portabil.',url:'URL imagine (HTTPS)',alt:'Text alternativ (obligatoriu)',decorative:'Imagine decorativă (alt gol)',width:'Lățime imagine',custom:'Lățime personalizată (1–1600 px)',natural:'Păstrează proporțiile naturale',height:'Înălțime (1–1600 px)',caption:'Legendă (opțional)',external:'Imaginile externe necesită internet în HTML/PDF exportat.',cancel:'Anulează',markdown:'Markdown portabil',insert:'Inserează figură HTML',error:{url:'Introduceți URL HTTPS valid.',alt:'Textul alternativ este obligatoriu, exceptând decorațiile.',width:'Lățime între 1 și 1600 px.',height:'Înălțime între 1 și 1600 px.',length:'Text prea lung.'}},
 ru:{title:'Вставить изображение с подписью',trigger:'Изображение / подпись',description:'Размеры и подпись HTML могут не поддерживаться другими Markdown-платформами. Обычная Markdown-картинка переносимее.',url:'Адрес изображения (HTTPS)',alt:'Альтернативный текст (обязателен)',decorative:'Декоративное изображение (пустой alt)',width:'Ширина изображения',custom:'Своя ширина (1–1600 px)',natural:'Сохранять исходные пропорции',height:'Высота (1–1600 px)',caption:'Подпись (необязательно)',external:'Изображения по внешним ссылкам требуют интернета при просмотре экспортированного HTML/PDF.',cancel:'Отмена',markdown:'Обычный Markdown',insert:'Вставить HTML-фигуру',error:{url:'Введите правильную HTTPS-ссылку.',alt:'Нужен альтернативный текст, кроме декоративных изображений.',width:'Ширина должна быть от 1 до 1600 px.',height:'Высота должна быть от 1 до 1600 px.',length:'Текст слишком длинный.'}}
};
const words=()=>DICT[state.lang]||DICT.en;
let insert=()=>{};
export function renderFigureLanguage(){
 if(!$('figure-dialog-title'))return;
 const w=words();
 for(const [id,label] of Object.entries({
 'figure-dialog-title':w.title,'figure-description':w.description,
 'figure-url-label':w.url,'figure-alt-label':w.alt,
 'figure-decorative-label':w.decorative,'figure-width-label':w.width,
 'figure-width-custom-label':w.custom,'figure-natural-label':w.natural,
 'figure-height-label':w.height,'figure-caption-label':w.caption,
 'figure-external-warning':w.external,'figure-cancel':w.cancel,
 'figure-markdown':w.markdown,'figure-insert':w.insert,
 'figure-dialog-trigger':w.trigger
 }))$(id).textContent=label;
}
export function initFigureDialog({insertSnippet}){
 insert=insertSnippet;
 const dialog=$('figure-dialog'),trigger=$('figure-dialog-trigger');
 const preset=$('figure-width-preset'),custom=$('figure-width-custom');
 const natural=$('figure-natural'),height=$('figure-height');
 const decorative=$('figure-decorative'),alt=$('figure-alt');
 trigger.addEventListener('click',()=>{
  $('figure-error').textContent='';
  renderFigureLanguage();
  dialog.showModal();
  $('figure-url').focus();
 });
 for(const id of ['figure-cancel','figure-cancel-top'])
  $(id).addEventListener('click',()=>dialog.close());
 preset.addEventListener('change',()=>{
  custom.disabled=preset.value!=='custom';
  if(!custom.disabled)custom.focus();
 });
 natural.addEventListener('change',()=>{height.disabled=natural.checked;});
 decorative.addEventListener('change',()=>{
  alt.disabled=decorative.checked;
  alt.required=!decorative.checked;
  if(decorative.checked)alt.value='';
 });
 $('figure-form').addEventListener('submit',event=>{
  event.preventDefault();
  const width=preset.value==='custom'?custom.value:preset.value;
  const image={
   url:$('figure-url').value,alt:alt.value,decorative:decorative.checked,width,
   height:natural.checked?null:height.value,caption:$('figure-caption').value
  };
  const format=event.submitter?.dataset.format||'html';
  const result=format==='markdown'?makePortableImage(image):makeFigureSnippet(image);
  if(result.error){
   $('figure-error').textContent=words().error[result.error]||words().error.url;
   return;
  }
  dialog.close();
  insert('\n\n'+result.html+'\n\n');
 });
 renderFigureLanguage();
}
