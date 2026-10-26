// Localized labels for the editor-only soft-wrap preference. No Markdown source changes.
export const WRAP_TEXT_LABELS={
 en:{on:'Wrap: On',off:'Wrap: Off',help:'Wrap long lines to fit the editor width (display only)'},
 cs:{on:'Zalomení: Zap',off:'Zalomení: Vyp',help:'Zalamovat dlouhé řádky podle šířky editoru (pouze zobrazení)'},
 uk:{on:'Перенос: Увімк',off:'Перенос: Вимк',help:'Переносити довгі рядки за шириною редактора (лише відображення)'},
 ro:{on:'Rânduri: Da',off:'Rânduri: Nu',help:'Încadrează liniile lungi în lățimea editorului (doar afișare)'},
 ru:{on:'Перенос: Вкл',off:'Перенос: Выкл',help:'Переносить длинные строки по ширине редактора (только отображение)'}
};
export const getWrapTextLabels=lang=>WRAP_TEXT_LABELS[lang]||WRAP_TEXT_LABELS.en;
