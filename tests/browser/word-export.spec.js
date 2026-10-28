import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {inflateRawSync} from 'node:zlib';
import {setAppLanguage} from './support/settings.js';

// Minimal ZIP central-directory reader: verify the generated file is native
// DOCX/OOXML and inspect semantics without adding a test-only dependency.
function entry(buffer,target){
 let eocd=-1;
 for(let i=buffer.length-22;i>=Math.max(0,buffer.length-65557);i--){
  if(buffer.readUInt32LE(i)===0x06054b50){eocd=i;break;}
 }
 if(eocd<0)throw new Error('Missing ZIP end-of-central-directory');
 const count=buffer.readUInt16LE(eocd+10);
 let pos=buffer.readUInt32LE(eocd+16);
 for(let i=0;i<count;i++){
  if(buffer.readUInt32LE(pos)!==0x02014b50)throw new Error('Corrupt ZIP directory');
  const method=buffer.readUInt16LE(pos+10),size=buffer.readUInt32LE(pos+20);
  const filenameLength=buffer.readUInt16LE(pos+28);
  const extraLength=buffer.readUInt16LE(pos+30);
  const commentLength=buffer.readUInt16LE(pos+32);
  const offset=buffer.readUInt32LE(pos+42);
  const name=buffer.toString('utf8',pos+46,pos+46+filenameLength);
  if(name===target){
   if(buffer.readUInt32LE(offset)!==0x04034b50)throw new Error('Corrupt ZIP entry');
   const start=offset+30+buffer.readUInt16LE(offset+26)+buffer.readUInt16LE(offset+28);
   const data=buffer.subarray(start,start+size);
   if(method===0)return data.toString('utf8');
   if(method===8)return inflateRawSync(data).toString('utf8');
   throw new Error('Unknown ZIP compression '+method);
  }
  pos+=46+filenameLength+extraLength+commentLength;
 }
 throw new Error('DOCX entry not found: '+target);
}
const exportWord=async page=>{
 const promised=page.waitForEvent('download');
 await page.locator('#file-menu-trigger').click();
 await page.locator('#file-menu [data-file-action="export-word"]').click();
 const download=await promised;
 const buffer=await readFile(await download.path());
 expect(buffer.subarray(0,2).toString()).toBe('PK');
 expect(entry(buffer,'[Content_Types].xml')).toContain('wordprocessingml');
 return {download,documentXml:entry(buffer,'word/document.xml'),stylesXml:entry(buffer,'word/styles.xml'),relationsXml:entry(buffer,'word/_rels/document.xml.rels')};
};

test('Export Word creates real editable DOCX headings, list, table, hyperlink and inline formatting',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const markdown='# Release checklist\n\nText with **bold** and *italic*, [help](https://example.com).\n\n- First\n- Second\n\n| Code | State |\n|---|---|\n| 42 | Ready |\n';
 await editor.fill(markdown);
 const result=await exportWord(page);
 expect(result.download.suggestedFilename()).toMatch(/\.docx$/i);
 expect(result.documentXml).toMatch(/w:pStyle[^>]+Heading1/);
 expect(result.documentXml).toContain('<w:tbl');
 expect(result.documentXml).toContain('<w:hyperlink');
 expect(result.documentXml).toContain('<w:b');
 expect(result.documentXml).toContain('<w:i');
 expect(result.documentXml).toContain('Release checklist');
 expect(result.documentXml).toContain('Ready');
 expect(result.relationsXml).toContain('https://example.com');
 await expect(editor).toHaveValue(markdown);
});

test('Word export keeps active Sandbox filename, Unicode, and works from narrow mobile File menu',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 const tab=page.locator('#document-tab-list [role="tab"]').first();
 page.once('dialog',d=>d.accept('Poznámky.md'));
 await tab.dblclick();
 const editor=page.locator('#markdown-input');
 const markdown='# Čeština\n\nУкраїнська **текст** — română.';
 await editor.fill(markdown);
 const result=await exportWord(page);
 expect(result.download.suggestedFilename()).toBe('Poznámky.docx');
 expect(result.documentXml).toContain('Čeština');
 expect(result.documentXml).toContain('Українська');
 await expect(editor).toHaveValue(markdown);
});

test('Word export does not silently omit blocked remote images or execute unsafe HTML',async({page})=>{
 await page.route('https://example.com/screenshot.png',route=>route.abort());
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const markdown='# Screenshot\n\n![Diagram](https://example.com/screenshot.png)\n\n<script>alert("unsafe")</script>';
 await editor.fill(markdown);
 page.once('dialog',dialog=>dialog.accept());
 const result=await exportWord(page);
 expect(result.documentXml).toContain('Diagram');
 expect(result.documentXml).toContain('screenshot.png');
 expect(result.documentXml).not.toContain('unsafe');
 await expect(editor).toHaveValue(markdown);
});

test('Word export preserves checked and unchecked GFM task meaning as editable text',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const markdown='## Tasks\n\n- [x] Approved\n- [ ] Pending\n';
 await editor.fill(markdown);
 await expect(page.locator('#markdown-preview input[type="checkbox"]')).toHaveCount(2);
 const {documentXml}=await exportWord(page);
 expect(documentXml).toContain('Approved');
 expect(documentXml).toContain('Pending');
 // Explicit Word text marks, not HTML inputs or lost checked state.
 expect(documentXml).toMatch(/(?:☑|&#(?:x2611|9745);)/i);
 expect(documentXml).toMatch(/(?:☐|&#(?:x2610|9744);)/i);
 await expect(editor).toHaveValue(markdown);
});
