// Progressive Web App installation: native browser prompt, with platform-specific manual fallback.
const COPY={
 en:{install:'Install app',installed:'App installed',title:'Install Learning Markdown',intro:'If your browser does not offer an install prompt, use its menu instead.',steps:['In Chrome, open the three-dot menu.','Choose Cast, save and share → Install page as app (or select Install in the address bar).','In Edge, choose Apps → Install this site as an app. On iPhone or iPad, use Share → Add to Home Screen.'],close:'Close'},
 cs:{install:'Nainstalovat aplikaci',installed:'Aplikace je nainstalována',title:'Instalace Learning Markdown',intro:'Pokud prohlížeč nenabídne instalaci automaticky, použijte jeho nabídku.',steps:['V Chromu otevřete nabídku se třemi tečkami.','Vyberte Odeslat, uložit a sdílet → Nainstalovat stránku jako aplikaci (nebo ikonu instalace v adresním řádku).','V Edge vyberte Aplikace → Nainstalovat tento web jako aplikaci. Na iPhonu či iPadu použijte Sdílet → Přidat na plochu.'],close:'Zavřít'},
 uk:{install:'Встановити застосунок',installed:'Застосунок встановлено',title:'Встановити Learning Markdown',intro:'Якщо браузер не пропонує встановлення автоматично, скористайтеся меню.',steps:['У Chrome відкрийте меню з трьома крапками.','Виберіть Транслювати, зберегти й поділитися → Встановити сторінку як застосунок (або значок встановлення в адресному рядку).','В Edge виберіть Програми → Встановити цей сайт як застосунок. На iPhone чи iPad: Поділитися → На початковий екран.'],close:'Закрити'},
 ro:{install:'Instalează aplicația',installed:'Aplicație instalată',title:'Instalează Learning Markdown',intro:'Dacă browserul nu oferă instalarea, folosește meniul browserului.',steps:['În Chrome, deschide meniul cu trei puncte.','Alege Distribuie, salvează și trimite → Instalează pagina ca aplicație (sau pictograma de instalare din bara de adrese).','În Edge, alege Aplicații → Instalează acest site ca aplicație. Pe iPhone sau iPad: Partajare → Adaugă pe ecranul principal.'],close:'Închide'},
 ru:{install:'Установить приложение',installed:'Приложение установлено',title:'Установка Learning Markdown',intro:'Если браузер не предлагает установку автоматически, используйте его меню.',steps:['В Chrome откройте меню с тремя точками.','Выберите Трансляция, сохранение и отправка → Установить страницу как приложение (или значок установки в адресной строке).','В Edge выберите Приложения → Установить этот сайт как приложение. На iPhone или iPad: Поделиться → На экран «Домой».'],close:'Закрыть'}
};
let deferredPrompt=null,installed=false,getLanguage=()=> 'en';
const $=id=>document.getElementById(id);
const isStandalone=()=>Boolean(window.matchMedia?.('(display-mode: standalone)').matches||navigator.standalone===true);
export function renderInstallAppLanguage(lang='en'){
 const words=COPY[lang]||COPY.en,ready=installed||isStandalone();
 const button=$('install-app-btn');
 if(!button)return;
 button.textContent=ready?words.installed:words.install;
 button.disabled=ready;
 button.setAttribute('aria-label',button.textContent);
 $('install-app-help-title').textContent=words.title;
 $('install-app-help-intro').textContent=words.intro;
 const steps=$('install-app-help-steps');steps.replaceChildren();
 for(const line of words.steps){const li=document.createElement('li');li.textContent=line;steps.appendChild(li);}
 $('install-app-help-close').textContent=words.close;
}
function showHelp(){
 const dialog=$('install-app-help');
 if(!dialog.open)dialog.showModal();
}
export function initInstallApp(language){
 getLanguage=language;
 const button=$('install-app-btn'),dialog=$('install-app-help');
 button.addEventListener('click',async()=>{
  if(!deferredPrompt){showHelp();return;}
  const prompt=deferredPrompt;deferredPrompt=null;
  try{
   await prompt.prompt();
   await prompt.userChoice;
  }catch(error){
   console.warn('Install prompt unavailable:',error);
   showHelp();
  }finally{renderInstallAppLanguage(getLanguage());}
 });
 $('install-app-help-close').addEventListener('click',()=>dialog.close());
 window.addEventListener('beforeinstallprompt',event=>{
  // Allow Chrome to show its native install UI (including address-bar promotion).
  // Keep the event for an optional user-initiated install from our Contents menu.
  // preventDefault() would suppress the browser's own install promotion.
  deferredPrompt=event;
  renderInstallAppLanguage(getLanguage());
 });
 window.addEventListener('appinstalled',()=>{
  installed=true;deferredPrompt=null;
  if(dialog.open)dialog.close();
  renderInstallAppLanguage(getLanguage());
 });
 renderInstallAppLanguage(getLanguage());
}
