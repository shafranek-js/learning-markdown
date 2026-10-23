export const MULTI_CURSOR_TEXT={
 en:{on:'Multi-cursor: ON',off:'Multi-cursor',help:'Alt+Click: another cursor · Ctrl+D: next occurrence · Ctrl+Alt+↑/↓: cursor above/below · Alt+Shift+Drag: column selection',cursors:'Cursors'},
 cs:{on:'Více kurzorů: ZAP',off:'Více kurzorů',help:'Alt+klik: další kurzor · Ctrl+D: další výskyt · Ctrl+Alt+↑/↓: kurzor nahoru/dolů · Alt+Shift+tažení: sloupcový výběr',cursors:'Kurzory'},
 uk:{on:'Мультикурсор: УВІМК',off:'Мультикурсор',help:'Alt+клік: додати курсор · Ctrl+D: наступний збіг · Ctrl+Alt+↑/↓: курсор вище/нижче · Alt+Shift+перетягування: прямокутне виділення',cursors:'Курсори'},
 ro:{on:'Multi-cursor: ON',off:'Multi-cursor',help:'Alt+clic: cursor nou · Ctrl+D: următoarea apariție · Ctrl+Alt+↑/↓: cursor sus/jos · Alt+Shift+tragere: selecție dreptunghiulară',cursors:'Cursoare'},
 ru:{on:'Мультикурсор: ВКЛ',off:'Мультикурсор',help:'Alt+клик: ещё один курсор · Ctrl+D: следующее совпадение · Ctrl+Alt+↑/↓: курсор выше/ниже · Alt+Shift+перетаскивание: выделение столбцом',cursors:'Курсоров'}
};
export const getMultiCursorLabels=lang=>MULTI_CURSOR_TEXT[lang]||MULTI_CURSOR_TEXT.en;
