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
  const line=document.querySelector('#editor-highlight-backdrop .editor-wrap-line');
  const number=document.querySelector('#line-gutter .editor-gutter-row');
  return {
   gutter:rect(document.querySelector('#line-gutter')),
   number:ink(number),
   line:rect(line)
  };
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

test('editor source and line numbers do not jump when Multi-cursor is toggled',async({page})=>{
 await page.goto('/');
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
 const input=page.locator('#markdown-input');
 const toggle=page.locator('#multi-cursor-toggle');
 const source=Array.from({length:115},(_,i)=>'Line '+(i+1)).join('\n');
 await input.fill(source);
 const off=await geometry(page);
 await toggle.click();
 sameGeometry(off,await geometry(page));
 const originalWidth=(await geometry(page)).gutter.width;
 await toggle.click();
 await page.locator('#wrap-text-toggle').click();
 await toggle.click();
 expect(Math.abs((await geometry(page)).gutter.width-originalWidth)).toBeLessThan(1.5);
 await toggle.click();
 const offNoWrap=await geometry(page);
 await toggle.click();
 sameGeometry(offNoWrap,await geometry(page));
 await toggle.click();
 await page.locator('#font-inc-btn').click();
 const enlarged=await geometry(page);
 await toggle.click();
 sameGeometry(enlarged,await geometry(page));
 await expect(input).toHaveValue(source);
});
