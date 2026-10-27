import {test,expect} from '@playwright/test';

// Measure visible glyphs, not only their boxes: otherwise gutter/text offsets
// can differ while the container widths still happen to match.
const geometry=async page=>page.evaluate(()=>{
 const root=document.querySelector('#editor-pane');
 const on=root.classList.contains('multi-cursor-active');
 const rect=node=>{
  const r=node.getBoundingClientRect();
  return {left:r.left,top:r.top,right:r.right,width:r.width,height:r.height};
 };
 const ink=node=>{
  const range=document.createRange();
  range.selectNodeContents(node);
  return rect(range);
 };
 if(!on){
  const backdrop=document.querySelector('#editor-highlight-backdrop');
  const wrappedLine=backdrop.querySelector('.editor-wrap-line');
  const style=getComputedStyle(backdrop);
  const backdropRect=rect(backdrop);
  const firstLine=wrappedLine?rect(wrappedLine):{
   left:backdropRect.left+parseFloat(style.paddingLeft),
   top:backdropRect.top+parseFloat(style.paddingTop)
  };
  const gutter=document.querySelector('#line-gutter');
  const number=gutter.querySelector('.editor-gutter-row');
  let numberInk;
  if(number)numberInk=ink(number);
  else{
   // Unwrapped mode renders line numbers as a newline-separated text node.
   const firstDigit=document.createRange();
   firstDigit.setStart(gutter.firstChild,0);
   firstDigit.setEnd(gutter.firstChild,1);
   numberInk=rect(firstDigit);
  }
  return {gutter:rect(gutter),number:numberInk,line:firstLine};
 }
 const numbers=[...document.querySelectorAll('#codemirror-mount .cm-lineNumbers .cm-gutterElement')];
 const number=numbers.find(node=>
  node.textContent.trim()==='1'&&
  getComputedStyle(node).visibility!=='hidden'&&
  node.getBoundingClientRect().height>0
 );
 if(!number)throw new Error('CodeMirror first visible line number not found');
 return {
  gutter:rect(document.querySelector('#codemirror-mount .cm-gutters')),
  number:ink(number),
  line:rect(document.querySelector('#codemirror-mount .cm-line'))
 };
});

const sameGeometry=(off,on)=>{
 expect(Math.abs(off.gutter.width-on.gutter.width)).toBeLessThan(1.5);
 expect(Math.abs(off.gutter.right-on.gutter.right)).toBeLessThan(1.5);
 expect(Math.abs(off.number.right-on.number.right)).toBeLessThan(2);
 expect(Math.abs(off.number.top-on.number.top)).toBeLessThan(2);
 expect(Math.abs(off.line.left-on.line.left)).toBeLessThan(2);
 expect(Math.abs(off.line.top-on.line.top)).toBeLessThan(2);
};

// CodeMirror finishes applying its saved viewport after the activation click.
// Compare settled geometry rather than the transient DOM positions that can
// briefly place the first visible gutter number a full line (or page) away.
// This still fails for persistent UI jumps after the layout has settled.
async function expectSettledGeometry(reference,page){
 await expect.poll(async()=>{
  const current=await geometry(page);
  return Math.abs(reference.gutter.width-current.gutter.width)<1.5&&
   Math.abs(reference.gutter.right-current.gutter.right)<1.5&&
   Math.abs(reference.number.right-current.number.right)<2&&
   Math.abs(reference.number.top-current.number.top)<2&&
   Math.abs(reference.line.left-current.line.left)<2&&
   Math.abs(reference.line.top-current.line.top)<2;
 },{timeout:5000}).toBe(true);
 sameGeometry(reference,await geometry(page));
}

test('editor source and line numbers do not jump when Multi-cursor is toggled',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await document.fonts.ready;});
 const input=page.locator('#markdown-input');
 const source=['# Header','- Item one','- Item two','Ordinary **bold** words','Last line'].join('\n');
 await input.fill(source);
 await expect(page.locator('#editor-pane')).toHaveClass(/wrap-text-enabled/);
 const toggle=page.locator('#multi-cursor-toggle');
 const initial=await geometry(page);
 for(let i=0;i<3;i++){
  await toggle.click();
  await expect(page.locator('#editor-pane')).toHaveClass(/multi-cursor-active/);
  await expect(page.locator('#codemirror-mount .cm-line')).toHaveCount(5);
  sameGeometry(initial,await geometry(page));
  await toggle.click();
  await expect(page.locator('#editor-pane')).not.toHaveClass(/multi-cursor-active/);
  sameGeometry(initial,await geometry(page));
  await expect(input).toHaveValue(source);
 }
});

test('line-number gutter remains fixed across 3-digit line counts, wrapping and font resizing',async({page})=>{
 await page.goto('/');
 await page.evaluate(async()=>{await document.fonts.ready;});
 const input=page.locator('#markdown-input');
 const toggle=page.locator('#multi-cursor-toggle');
 const source=Array.from({length:115},(_,i)=>'Line '+(i+1)).join('\n');
 await input.fill(source);
 // Keep the first line in the viewport when the CodeMirror editor receives focus.
 await input.evaluate(el=>{el.setSelectionRange(0,0);el.scrollTop=0;});
 // The textarea mirrors its viewport into the syntax backdrop and gutter in
 // requestAnimationFrame. Do not measure the source before those layers catch
 // up: the textarea may be at line 1 while its gutter still shows line 115.
 await expect.poll(async()=>page.locator('#line-gutter').evaluate(el=>el.scrollTop),
  {timeout:3000}).toBe(0);
 await expect.poll(async()=>page.locator('#editor-highlight-backdrop').evaluate(el=>el.scrollTop),
  {timeout:3000}).toBe(0);
 const off=await geometry(page);
 await toggle.click();
 await expectSettledGeometry(off,page);
 const originalWidth=(await geometry(page)).gutter.width;
 await toggle.click();
 await page.locator('#wrap-text-toggle').click();
 await toggle.click();
 expect(Math.abs((await geometry(page)).gutter.width-originalWidth)).toBeLessThan(1.5);
 await toggle.click();
 const offNoWrap=await geometry(page);
 await toggle.click();
 await expectSettledGeometry(offNoWrap,page);
 await toggle.click();
 await page.locator('#font-inc-btn').click();
 const enlarged=await geometry(page);
 await toggle.click();
 await expectSettledGeometry(enlarged,page);
 await expect(input).toHaveValue(source);
});

test('switching editors keeps the current scroll position and source intact',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source=Array.from({length:120},(_,i)=>'Line '+(i+1)+' with readable text').join('\n');
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.scrollTop=300;});
 const offScroll=await input.evaluate(el=>el.scrollTop);
 expect(offScroll).toBeGreaterThan(200);
 await page.locator('#multi-cursor-toggle').click();
 // Let CodeMirror complete its deferred layout/scroll anchoring first.
 try{
  await expect.poll(async()=>{
   const onScroll=await page.locator('#codemirror-mount .cm-scroller').evaluate(el=>el.scrollTop);
   return Math.abs(onScroll-offScroll);
  },{timeout:3000}).toBeLessThan(3);
 }catch(error){
  const diagnostics=await page.evaluate(()=>{
   const metrics=el=>({
    scrollTop:el.scrollTop,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
    fontSize:getComputedStyle(el).fontSize,lineHeight:getComputedStyle(el).lineHeight
   });
   return {textarea:metrics(document.querySelector('#markdown-input')),
    codemirror:metrics(document.querySelector('#codemirror-mount .cm-scroller'))};
  });
  throw new Error('Editor scroll mismatch: '+JSON.stringify({offScroll,...diagnostics})+'\\n'+error.message);
 }
 await page.locator('#multi-cursor-toggle').click();
 const restoredScroll=await input.evaluate(el=>el.scrollTop);
 expect(Math.abs(restoredScroll-offScroll)).toBeLessThan(3);
 await expect(input).toHaveValue(source);
});
