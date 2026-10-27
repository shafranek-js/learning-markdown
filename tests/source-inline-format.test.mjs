import assert from 'node:assert/strict';
import {sourceInlineWrapChanges,formatSourceInlineSelection} from '../js/core/source-inline-format.js';
import {sourceSelectionTouchesFencedCode} from '../js/core/source-line-format.js';

{
 const src='Before plain After',start=src.indexOf('plain'),end=start+5;
 const wrapped=formatSourceInlineSelection(src,start,end,'**','**','bold text');
 assert.deepEqual(wrapped,{text:'Before **plain** After',start:start+2,end:end+2});
 assert.equal(wrapped.text.slice(wrapped.start,wrapped.end),'plain');
 const repeated=formatSourceInlineSelection(wrapped.text,wrapped.start,wrapped.end,'**','**','bold text');
 assert.equal(repeated.text,src);
 assert.equal(repeated.text.slice(repeated.start,repeated.end),'plain');
 const unwrapped=formatSourceInlineSelection(wrapped.text,start,start+'**plain**'.length,'**','**','bold text');
 assert.equal(unwrapped.text,src);
 assert.equal(unwrapped.text.slice(unwrapped.start,unwrapped.end),'plain');
}
{
 const tick=String.fromCharCode(96);
 const cases=[['_','_', '_word_', 'word'],['~~','~~','~~word~~','word'],
  [tick,tick,tick+'word'+tick,'word'],['<u>','</u>','<u>word</u>','<u><u>word</u></u>']];
 for(const [prefix,suffix,selected,expected] of cases){
  const result=formatSourceInlineSelection(selected,0,selected.length,prefix,suffix,'text');
  assert.equal(result.text,expected,prefix);
 }
}
{
 const formatted=formatSourceInlineSelection('Start ',6,6,'**','**','bold text');
 assert.equal(formatted.text,'Start **bold text**');
 assert.equal(formatted.text.slice(formatted.start,formatted.end),'bold text');
}
{
 const text='Alpha Beta Gamma';
 const ranges=[{from:0,to:5},{from:6,to:10},{from:11,to:16}];
 const edits=sourceInlineWrapChanges(text,ranges,'_','_','italic');
 assert.equal(edits.length,3);
 assert.deepEqual(edits.map(e=>e.insert),['_Alpha_','_Beta_','_Gamma_']);
 assert.equal(edits.reduceRight((s,e)=>s.slice(0,e.from)+e.insert+s.slice(e.to),text),
  '_Alpha_ _Beta_ _Gamma_');
}
{
 const text='Ahead\n~~~js\nconst code = 1;\n~~~\nAfter';
 const inCode=text.indexOf('const');
 const out=text.indexOf('Ahead');
 assert.equal(sourceSelectionTouchesFencedCode(text,[{from:inCode,to:inCode+5}]),true);
 assert.equal(formatSourceInlineSelection(text,inCode,inCode+5,'**','**','bold'),null);
 assert.equal(sourceInlineWrapChanges(text,[
  {from:out,to:out+5},{from:inCode,to:inCode+5}
 ],'_','_','italic'),null);
 assert.equal(sourceSelectionTouchesFencedCode(text,[{from:out,to:out+5}]),false);
 assert.equal(sourceSelectionTouchesFencedCode(text,[{from:0,to:text.indexOf('~~~js')}]),false);
 assert.equal(sourceSelectionTouchesFencedCode(text,[{from:text.indexOf('After'),to:text.length}]),false);
}
assert.equal(formatSourceInlineSelection('Text',3,2,'**','**','bold'),null);
assert.equal(sourceInlineWrapChanges('Text',[{from:0,to:0}],'','','bold'),null);

// Both equivalent CommonMark delimiters are recognized, whether the entire
// wrapper or just the inner word is selected.
for(const [kind,markup,word] of [
 ['**','__Bold__','Bold'],
 ['_','*Italic*','Italic'],
 ['**','**Bold**','Bold'],
 ['_','_Italic_','Italic']
]){
 const action=kind==='**'?'bold':'italic';
 for(const start of [0,markup.indexOf(word)]){
  const end=start===0?markup.length:start+word.length;
  const changed=formatSourceInlineSelection(markup,start,end,kind,kind,action);
  assert.equal(changed.text,word,markup+' selected at '+start);
  assert.equal(changed.text.slice(changed.start,changed.end),word);
 }
}
// Strong underscores are not a removable single-underscore italic wrapper.
{
 const full=formatSourceInlineSelection('__Bold__',0,8,'_','_','italic');
 assert.equal(full.text,'___Bold___');
 const interior=formatSourceInlineSelection('__Bold__',2,6,'_','_','italic');
 assert.equal(interior.text,'__*Bold*__');
 const repeated=formatSourceInlineSelection(interior.text,interior.start,interior.end,'_','_','italic');
 assert.equal(repeated.text,'__Bold__');
}
// Intraword underscores are not emphasis and must not be removed by Italic.
{
 const identifier='some_file_name';
 const start=identifier.indexOf('file');
 const updated=formatSourceInlineSelection(identifier,start,start+4,'_','_','italic');
 assert.equal(updated.text,'some_*file*_name');
 assert.equal(updated.text.slice(updated.start,updated.end),'file');
 const roundtrip=formatSourceInlineSelection(updated.text,updated.start,updated.end,'_','_','italic');
 assert.equal(roundtrip.text,identifier);
}
{
 const escaped='\\*Escaped*';
 const selected=formatSourceInlineSelection(escaped,1,escaped.length,'_','_','italic');
 assert.equal(selected.text,'\\_*Escaped*_');
}
// Do not strip whitespace-padded punctuation which is not a valid marker pair.
{
 const padded=formatSourceInlineSelection('* padded *',0,10,'_','_','italic');
 assert.equal(padded.text,'_* padded *_');
}
// Multi-cursor operations can contain different, equivalent Markdown styles.
{
 const text='__A__ *B*';
 const ranges=[{from:0,to:5},{from:6,to:9}];
 const changes=sourceInlineWrapChanges(text,ranges,'**','**','bold');
 assert.equal(changes[0].insert,'A');
 assert.equal(changes[1].insert,'***B***');
}

console.log('Inline Markdown toolbar formatting: passed');
