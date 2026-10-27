import {state} from '../core/state.js';

const BLOCKED={
 en:'Selected lines include a fenced code block or indented code. No formatting was applied.',
 cs:'Výběr obsahuje blok kódu. Formátování nebylo provedeno.',
 uk:'Виділення містить блок коду. Форматування не застосовано.',
 ro:'Selecția include un bloc de cod. Formatarea nu a fost aplicată.',
 ru:'Выделение содержит блок кода. Форматирование не применено.'
};

export function explainProtectedSourceFormatting(){
 window.alert(BLOCKED[state.lang]||BLOCKED.en);
}
