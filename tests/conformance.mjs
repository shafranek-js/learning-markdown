import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {join} from 'node:path';
(async function audit() {
 const SOURCES=[
  {id:'commonmark',label:'CommonMark 0.31.2',url:'https://raw.githubusercontent.com/commonmark/commonmark-spec/0.31.2/spec.txt',gfm:false},
  {id:'gfm',label:'GFM 0.29 (pinned cmark-gfm)',url:'https://raw.githubusercontent.com/github/cmark-gfm/27d942c8b0a62d192f616e5bf3578f4b6a89e180/test/spec.txt',gfm:true}
 ];
 function parseSpec(input) {
  const lines=input.replace(/\r\n?/g,'\n').match(/[^\n]*\n|[^\n]+$/g)||[];
  const fence='`'.repeat(32),examples=[];
  let state=0,md=[],html=[],section='',start=0;
  for(let i=0;i<lines.length;i++){
   const line=lines[i],trim=line.trim();
   if(trim===fence+' example' && state===0){state=1;md=[];html=[];start=i+1;continue;}
   if(trim==='.' && state===1){state=2;continue;}
   if(trim===fence && state===2){
    examples.push({number:examples.length+1,section,startLine:start,markdown:md.join('').replaceAll('→','\t'),expected:html.join('').replaceAll('→','\t')});
    state=0;continue;
   }
   if(state===1)md.push(line);
   else if(state===2)html.push(line);
   else if(state===0&&/^#+ /.test(line))section=line.replace(/^#+ /,'').trim();
  }
  if(state!==0||examples.length<600)throw Error('Official spec fixture parsing failed: '+examples.length);
  return examples;
 }
 const context={};
 runInNewContext(await readFile(new URL('../vendor/marked.js',import.meta.url),'utf8'),context);
 if(typeof context.marked?.parse!=='function')throw Error('Bundled marked.js parser not found');
 const out=[];
 for(const source of SOURCES){
  const res=await fetch(source.url,{signal:AbortSignal.timeout(45000)});
  if(!res.ok)throw Error('Cannot fetch '+source.url+' (HTTP '+res.status+')');
  const spec=await res.text();
  if(spec.length<100000||spec.length>2000000)throw Error('Unexpected upstream spec length');
  const cases=parseSpec(spec),failures=[],totalBySection=new Map(),passesBySection=new Map();
  let passed=0;
  for(const item of cases){
   let html='',error='';
   try{html=context.marked.parse(item.markdown,{gfm:source.gfm,pedantic:false,breaks:false,headerIds:false,mangle:false});}
   catch(e){error=String(e);}
   const ok=!error&&html.replace(/\r\n?/g,'\n')===item.expected.replace(/\r\n?/g,'\n');
   totalBySection.set(item.section,(totalBySection.get(item.section)||0)+1);
   if(ok){passed++;passesBySection.set(item.section,(passesBySection.get(item.section)||0)+1);}
   else failures.push({...item,actual:html,error});
  }
  out.push({name:source.label,source:source.url,total:cases.length,passed,failed:failures.length,
   percent:Math.round(passed*10000/cases.length)/100,
   sections:[...totalBySection].map(([name,total])=>({name,total,passed:passesBySection.get(name)||0})),failures});
 }
 const dir='conformance-report';await mkdir(dir,{recursive:true});
 const report={generatedAt:new Date().toISOString(),parser:'Bundled marked.js (without HTML sanitizer)',comparison:'Strict raw HTML equality (no HTML normalization)',note:'Informational only. Benign serialization differences also count as mismatches. Not a certification.',datasets:out};
 await writeFile(join(dir,'report.json'),JSON.stringify(report,null,2));
 const md=['# Upstream Markdown specification audit','','**Informational, not a release gate.** Compares unsanitized parser HTML to official expected HTML; attribute/serialization differences count as mismatches.','','| Dataset | Exact matches | Total examples | Exact-match rate |','| --- | ---: | ---: | ---: |',
 ...out.map(x=>'| '+x.name+' | '+x.passed+' | '+x.total+' | '+x.percent+'% |'),'','## Results by section',''];
 for(const data of out){
  md.push('### '+data.name,'','| Section | Matched | Total |','| --- | ---: | ---: |',...data.sections.map(x=>'| '+x.name.replaceAll('|','\\|')+' | '+x.passed+' | '+x.total+' |'),'','First ten deviations:','');
  for(const f of data.failures.slice(0,10))md.push('- Example '+f.number+', '+f.section+', spec line '+f.startLine);
  md.push('');
 }
 const markdown=md.join('\n');
 await writeFile(join(dir,'report.md'),markdown);
 if(process.env.GITHUB_STEP_SUMMARY)await writeFile(process.env.GITHUB_STEP_SUMMARY,markdown+'\n',{flag:'a'});
 for(const x of out)console.log(x.name+': '+x.passed+'/'+x.total+' exact HTML matches ('+x.percent+'%)');
 console.log('Full details: conformance-report/report.json');
})().catch(error=>{console.error(error);process.exitCode=1;});
