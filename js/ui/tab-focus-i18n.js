// Accessible, persistent Tab behavior guidance in all supported UI languages.
// The keyboard shortcut remains Ctrl+M on every OS (Cmd+M minimizes macOS windows).
const TEXT={
 en:{edit:'Tab: Indent',focus:'Tab: Focus',editHelp:'Tab inserts indentation. Press Ctrl+M to let Tab move focus through the page.',focusHelp:'Tab moves focus through the page. Press Ctrl+M to enable indentation again.'},
 cs:{edit:'Tab: Odsadit',focus:'Tab: Fokus',editHelp:'Tab odsazuje text. Ctrl+M přepne Tab na přesun zaměření po stránce.',focusHelp:'Tab přesouvá zaměření po stránce. Ctrl+M znovu zapne odsazování.'},
 uk:{edit:'Tab: Відступ',focus:'Tab: Фокус',editHelp:'Tab додає відступ. Ctrl+M перемикає Tab на навігацію сторінкою.',focusHelp:'Tab переміщує фокус сторінкою. Ctrl+M знову вмикає відступ.'},
 ro:{edit:'Tab: Indentare',focus:'Tab: Focus',editHelp:'Tab indentează textul. Ctrl+M schimbă Tab pentru navigarea între controale.',focusHelp:'Tab mută focalizarea între controale. Ctrl+M reactivează indentarea.'},
 ru:{edit:'Tab: Отступ',focus:'Tab: Фокус',editHelp:'Tab добавляет отступ. Ctrl+M переключает Tab на навигацию по элементам страницы.',focusHelp:'Tab переводит фокус между элементами. Ctrl+M снова включает отступы.'}
};
export function tabFocusLabels(lang){return TEXT[lang]||TEXT.en;}
