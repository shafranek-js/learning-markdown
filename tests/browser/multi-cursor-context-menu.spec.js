import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';
import {undo,redo} from './support/history-actions.js';

const menu=page=>page.locator('#multi-cursor-context-menu');
const action=(page,key)=>menu(page).locator('[data-multi-cursor-action="'+key+'"]');
const editor=page=>page.locator('#codemirror-mount .cm-content');
const input=page=>page.locator('#markdown-input');
const count=page=>page.locator('#multi-cursor-count');
async function enable(page,source){
 await page.goto('/');
 await input(page).fill(source);
 await page.locator('#multi-cursor-toggle').click();
 await expect(editor(page)).toBeVisible();
 await editor(page).click();
}
async function rightClickAtChar(page,lineIndex,column){
 const coords=await page.locator('#codemirror-mount .cm-line').nth(lineIndex)
  .evaluate((line,column)=>{
   const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);
   let node=walker.nextNode(),remaining=column;
   while(node&&remaining>node.textContent.length){
    remaining-=node.textContent.length;node=walker.nextNode();
   }
   const box=line.getBoundingClientRect();
   if(!node)return {x:box.left+3,y:box.top+box.height/2};
   const range=document.createRange();
   range.setStart(node,Math.min(remaining,node.textContent.length));
   range.collapse(true);
   const at=range.getBoundingClientRect();
   return {x:at.left+1,y:at.top+(at.height||box.height)/2};
  },column);
 await page.mouse.click(coords.x,coords.y,{button:'right'});
}
async function invoke(page,key,line=0,column=0){
 await rightClickAtChar(page,line,column);
 await expect(menu(page)).toBeVisible();
 await action(page,key).click();
 await expect(menu(page)).toBeHidden();
}

test('right-click menu appears only in Multi-cursor mode with eight real shortcut actions',async({page})=>{
 await page.goto('/');
 await input(page).fill('First\nSecond');
 await input(page).click({button:'right'});
 await expect(menu(page)).toHaveCount(0);
 await page.locator('#multi-cursor-toggle').click();
 await rightClickAtChar(page,0,2);
 await expect(menu(page)).toBeVisible();
 expect(await menu(page).locator('[role="menuitem"]').count()).toBe(8);
 for(const [id,shortcut] of [
  ['next','Ctrl+D'],['all','Ctrl+Shift+L'],
  ['line-ends','Shift+Alt+I'],['above','Ctrl+Alt+↑'],
  ['below','Ctrl+Alt+↓'],['add-click','Alt+Click'],
  ['column','Alt+Shift+Drag'],['collapse','Esc']
 ]){
  await expect(action(page,id)).toContainText(shortcut);
 }
 await page.keyboard.press('Escape');
 await expect(menu(page)).toBeHidden();
 await expect(editor(page)).toBeFocused();
 await expect(input(page)).toHaveValue('First\nSecond');
 await page.locator('#multi-cursor-toggle').click();
 await expect(menu(page)).toBeHidden();
 await input(page).click({button:'right'});
 await expect(menu(page)).toBeHidden();
});

test('menu Select next, Select all, and Collapse perform the same CodeMirror actions as shortcuts',async({page})=>{
 const source='sun sun sun\nsun';
 await enable(page,source);
 await page.keyboard.press('Control+Home');
 await invoke(page,'next');
 await expect(count(page)).toContainText('1');
 await invoke(page,'all');
 await expect(count(page)).toContainText('4');
 await expect(input(page)).toHaveValue(source);
 await invoke(page,'collapse');
 await expect(count(page)).toContainText('1');
 await expect(input(page)).toHaveValue(source);
 await page.keyboard.insertText('!');
 await expect(input(page)).toHaveValue('sun! sun sun\nsun');
 await undo(page);
 await expect(input(page)).toHaveValue(source);
});

test('Add cursor here respects right-click coordinates, selections and Undo history',async({page})=>{
 const source='alpha\nbravo\ncharlie';
 await enable(page,source);
 await page.keyboard.press('Control+Home');
 await invoke(page,'add-click',2,0);
 await expect(count(page)).toContainText('2');
 await expect(input(page)).toHaveValue(source);
 await page.keyboard.insertText('!');
 await expect(input(page)).toHaveValue('!alpha\nbravo\n!charlie');
 await undo(page);
 await expect(input(page)).toHaveValue(source);
 await redo(page);
 await expect(input(page)).toHaveValue('!alpha\nbravo\n!charlie');
});

test('Column selection to click coordinates replaces exactly the chosen columns',async({page})=>{
 const source='alpha\nbravo\ncharm';
 await enable(page,source);
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('ArrowRight');
 await page.keyboard.press('ArrowRight');
 await invoke(page,'column',2,4);
 await expect(count(page)).toContainText('3');
 await expect(input(page)).toHaveValue(source);
 await page.keyboard.insertText('#');
 await expect(input(page)).toHaveValue('al#a\nbr#o\nch#m');
 await undo(page);
 await expect(input(page)).toHaveValue(source);
});

test('menu Add cursor below/above and selected-line ends preserve source',async({page})=>{
 const source='One\nTwo\nThree';
 await enable(page,source);
 await page.keyboard.press('Control+Home');
 await invoke(page,'below');
 await expect(count(page)).toContainText('2');
 await expect(input(page)).toHaveValue(source);
 await invoke(page,'collapse');
 await page.keyboard.press('Control+End');
 await invoke(page,'above');
 await expect(count(page)).toContainText('2');
 await invoke(page,'collapse');
 await page.keyboard.press('Control+a');
 await invoke(page,'line-ends');
 await expect(count(page)).toContainText('3');
 await page.keyboard.insertText('!');
 await expect(input(page)).toHaveValue('One!\nTwo!\nThree!');
});

test('Shift+F10 opens accessible menu; keyboard navigation executes actions, Escape only dismisses',async({page})=>{
 await enable(page,'red red red');
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+d');
 await page.keyboard.press('Control+Shift+l');
 await expect(count(page)).toContainText('3');
 await editor(page).press('Shift+F10');
 await expect(menu(page)).toBeVisible();
 await expect(action(page,'next')).toBeFocused();
 await page.keyboard.press('End');
 await expect(action(page,'collapse')).toBeFocused();
 await page.keyboard.press('Escape');
 await expect(menu(page)).toBeHidden();
 await expect(count(page)).toContainText('3');
 await editor(page).press('Shift+F10');
 await page.keyboard.press('End');
 await page.keyboard.press('Enter');
 await expect(menu(page)).toBeHidden();
 await expect(count(page)).toContainText('1');
});

test('context menu labels follow all five languages, fit mobile viewport and close on mode switch',async({page})=>{
 await page.setViewportSize({width:360,height:780});
 await enable(page,Array.from({length:35},(_,i)=>'Line '+(i+1)).join('\n'));
 for(const [language,heading] of [
  ['en','Multi-cursor actions'],['cs','Akce více kurzorů'],
  ['uk','Дії кількох курсорів'],['ro','Acțiuni cu mai multe cursoare'],
  ['ru','Действия мультикурсора']
 ]){
  await setAppLanguage(page,language);
  await editor(page).focus();
  await editor(page).press('Shift+F10');
  await expect(menu(page)).toBeVisible();
  await expect(menu(page)).toHaveAttribute('aria-label',heading);
  await expect(action(page,'add-click')).toBeVisible();
  const rect=await menu(page).boundingBox();
  expect(rect.x).toBeGreaterThanOrEqual(0);
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.x+rect.width).toBeLessThanOrEqual(361);
  expect(rect.y+rect.height).toBeLessThanOrEqual(781);
  await page.keyboard.press('Escape');
 }
 await editor(page).press('Shift+F10');
 await expect(menu(page)).toBeVisible();
 await page.locator('#multi-cursor-toggle').click();
 await expect(menu(page)).toBeHidden();
 await expect(input(page)).toHaveValue(Array.from({length:35},(_,i)=>'Line '+(i+1)).join('\n'));
});

test('closing context menu by an outside click never changes the Markdown or cursor count',async({page})=>{
 const source='One\nTwo\nThree';
 await enable(page,source);
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Control+Alt+ArrowDown');
 await expect(count(page)).toContainText('2');
 await rightClickAtChar(page,2,1);
 await expect(menu(page)).toBeVisible();
 await page.locator('#preview-pane-title').click();
 await expect(menu(page)).toBeHidden();
 await expect(input(page)).toHaveValue(source);
 await expect(count(page)).toContainText('2');
});
