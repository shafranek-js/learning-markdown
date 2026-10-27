import {state} from '../core/state.js';

const BLOCKED={
 en:'Selected lines include a fenced code block or indented code. No formatting was applied.',
 cs:'Výběr obsahuje blok kódu. Formátování nebylo provedeno.',
 uk:'Виділення містить блок коду. Форматування не застосовано.',
 ro:'Selecția include un bloc de cod. Formatarea nu a fost aplicată.',
 ru:'Выделение содержит блок кода. Форматирование не применено.'
};

const IMAGE_MULTILINE={
 en:'Image alt text must be on a single line. The selection was not changed.',
 cs:'Alternativní text obrázku musí být na jednom řádku. Výběr nebyl změněn.',
 uk:'Альтернативний текст зображення має бути в одному рядку. Виділення не змінено.',
 ro:'Textul alternativ al imaginii trebuie să fie pe un singur rând. Selecția nu a fost modificată.',
 ru:'Описание изображения должно быть в одной строке. Выделенный текст не изменён.'
};

export function explainImageSelectionFailure(reason){
 if(reason==='multiline')window.alert(IMAGE_MULTILINE[state.lang]||IMAGE_MULTILINE.en);
 else explainProtectedSourceFormatting();
}

export function explainProtectedSourceFormatting(){
 window.alert(BLOCKED[state.lang]||BLOCKED.en);
}
