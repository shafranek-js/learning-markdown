import {state,save} from '../core/state.js';
const $=id=>document.getElementById(id);
const COPY={
 en:{start:'Beyond Markdown',progress:'Advanced course',certificate:'Beyond Markdown — Certificate of Completion',
  subtitle:'Advanced HTML & CSS Formatting',name:'Recipient',locked:'Complete all seven advanced lessons to unlock this certificate.',
  download:'Download printable HTML',copy:'Copy certificate Markdown',close:'Close',print:'Print / Save PDF',congrats:'Seven advanced lessons completed'},
 cs:{start:'Nad rámec Markdownu',progress:'Pokročilý kurz',certificate:'Nad rámec Markdownu — Certifikát',
  subtitle:'Pokročilé formátování HTML a CSS',name:'Jméno',locked:'K získání certifikátu dokončete všech sedm pokročilých lekcí.',
  download:'Stáhnout HTML k tisku',copy:'Kopírovat certifikát Markdown',close:'Zavřít',print:'Tisk / Uložit PDF',congrats:'Sedm lekcí úspěšně dokončeno'},
 uk:{start:'Поза Markdown',progress:'Додатковий курс',certificate:'Поза Markdown — Сертифікат',
  subtitle:'Розширене форматування HTML і CSS',name:'Ім’я',locked:'Для отримання сертифіката завершіть усі сім уроків.',
  download:'Завантажити HTML для друку',copy:'Копіювати сертифікат Markdown',close:'Закрити',print:'Друк / Зберегти PDF',congrats:'Усі сім уроків завершено'},
 ro:{start:'Dincolo de Markdown',progress:'Curs avansat',certificate:'Dincolo de Markdown — Certificat',
  subtitle:'Formatare avansată HTML și CSS',name:'Nume',locked:'Finalizați toate cele șapte lecții avansate pentru a obține certificatul.',
  download:'Descarcă HTML pentru tipărire',copy:'Copiază certificatul Markdown',close:'Închide',print:'Tipărește / Salvează PDF',congrats:'Șapte lecții avansate finalizate'},
 ru:{start:'За пределами Markdown',progress:'Продвинутый курс',certificate:'За пределами Markdown — Сертификат',
  subtitle:'Расширенное форматирование HTML и CSS',name:'Получатель',locked:'Для получения сертификата завершите все семь продвинутых уроков.',
  download:'Скачать HTML для печати',copy:'Скопировать сертификат Markdown',close:'Закрыть',print:'Печать / Сохранить PDF',congrats:'Все семь уроков завершены'}
};
export const advancedCertLabels=(lang)=>COPY[lang]||COPY.en;
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
export const advancedComplete=()=>state.completedAdvancedLessons.length===7;
export function advancedCertificateHTML(name,lang){
 const t=advancedCertLabels(lang),safeName=escape(name.trim()||'Markdown Student');
 const date=new Intl.DateTimeFormat(lang==='uk'?'uk-UA':lang==='cs'?'cs-CZ':lang==='ru'?'ru-RU':lang==='ro'?'ro-RO':'en-US',{year:'numeric',month:'long',day:'numeric'}).format(new Date());
 return '<!DOCTYPE html><html lang="'+lang+'"><head><meta charset="utf-8"><title>'+escape(t.certificate)+'</title>'
 +'<meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:Georgia,serif;background:#eee;margin:0;padding:32px;color:#1f2937}.paper{max-width:850px;margin:auto;background:white;border:8px double #b38b38;padding:64px 42px;text-align:center;box-shadow:0 15px 35px #0002}h1{font-size:32px}p{font-size:19px;line-height:1.6}.name{font-size:30px;font-weight:bold;border-bottom:1px solid #b38b38;padding:24px 0;color:#1b3255}.badge{font-size:48px}.muted{color:#64748b;font-size:15px}.tools{text-align:center;margin:20px}.tools button{padding:12px 18px;cursor:pointer}@media print{body{background:white;padding:0}.paper{box-shadow:none;margin:0;max-width:none;min-height:90vh;break-inside:avoid}.tools{display:none}}'
 +'</style></head><body><div class="tools"><p>'+escape(t.print)+' — Ctrl+P</p></div><main class="paper"><div class="badge">🏅</div><p class="muted">Learning Markdown</p><h1>'+escape(t.certificate)+'</h1><p>'+escape(t.subtitle)+'</p><div class="name">'+safeName+'</div><p>'+escape(t.congrats)+'</p><p><strong>7 / 7</strong></p><p class="muted">'+escape(date)+'</p></main></body></html>';
}
export function renderAdvancedCertificate(){
 const locale=advancedCertLabels(state.lang),num=state.completedAdvancedLessons.length,done=advancedComplete();
 $('advanced-course-button-text').textContent=locale.start;
 $('advanced-progress-label').textContent=locale.progress+': '+num+' / 7';
 $('advanced-cert-btn').textContent='🏅 '+locale.certificate;
 $('advanced-cert-top-btn').title=locale.certificate;
 $('advanced-cert-top-btn').setAttribute('aria-label',locale.certificate);
 $('advanced-cert-heading').textContent=locale.certificate;
 $('advanced-cert-description').textContent=locale.subtitle;
 $('advanced-cert-count').textContent=num+' / 7';
 $('advanced-cert-name-label').textContent=locale.name;
 $('advanced-cert-name').value=state.name||'';
 $('advanced-cert-locked').textContent=done?'':locale.locked;
 $('download-advanced-cert').textContent=locale.download;
 $('copy-advanced-cert').textContent=locale.copy;
 $('close-advanced-certificate-btn').setAttribute('aria-label',locale.close);
 $('download-advanced-cert').disabled=!done;
 $('copy-advanced-cert').disabled=!done;
}
export function openAdvancedCertificate(){renderAdvancedCertificate();$('advanced-certificate-modal').classList.remove('hidden');$('close-advanced-certificate-btn').focus();}
export function initAdvancedCertificate(){
 $('advanced-cert-btn').addEventListener('click',openAdvancedCertificate);
 $('advanced-cert-top-btn').addEventListener('click',openAdvancedCertificate);
 $('close-advanced-certificate-btn').addEventListener('click',()=>$('advanced-certificate-modal').classList.add('hidden'));
 $('advanced-certificate-modal').addEventListener('click',e=>{if(e.target===$('advanced-certificate-modal'))$('advanced-certificate-modal').classList.add('hidden');});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')$('advanced-certificate-modal').classList.add('hidden');});
 $('advanced-cert-name').addEventListener('input',e=>{state.name=e.target.value;save();});
 $('download-advanced-cert').addEventListener('click',()=>{
  if(!advancedComplete())return;
  const blob=new Blob([advancedCertificateHTML(state.name,state.lang)],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Beyond-Markdown-Certificate.html';document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),5000);
 });
 $('copy-advanced-cert').addEventListener('click',async()=>{
  if(!advancedComplete())return;
  const t=advancedCertLabels(state.lang);
  const source='# '+t.certificate+'\n\n**'+t.name+':** '+(state.name||'Markdown Student')+'\n\n**'+t.congrats+'**\n\n7 / 7';
  try{await navigator.clipboard.writeText(source);}
  catch{const input=document.createElement('textarea');input.value=source;document.body.append(input);input.select();document.execCommand('copy');input.remove();}
 });
 $('advanced-course-btn').addEventListener('click',()=>{
  // app owns course navigation; click a visible lesson's nav button via a custom event.
  document.dispatchEvent(new CustomEvent('advanced-course-open'));
 });
}
