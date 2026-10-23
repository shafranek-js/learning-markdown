// Only explicitly defined utility classes are permitted in generated document HTML.
export const ADVANCED_PRESETS=Object.freeze({
 color:Object.freeze(['ink','red','blue','green','purple']),
 background:Object.freeze(['yellow','mint','rose','sky']),
 font:Object.freeze(['sans','serif','mono']),
 size:Object.freeze(['small','normal','large','xlarge']),
 align:Object.freeze(['left','center','right','justify']),
 indent:Object.freeze(['none','small','medium','large']),
 spacing:Object.freeze(['compact','normal','relaxed','double'])
});
export const ADVANCED_ALLOWED_CLASSES=new Set(Object.entries(ADVANCED_PRESETS)
 .flatMap(([group,values])=>values.map(value=>'af-'+group+'-'+value))
 .concat('af-page-break'));
export const presetClass=(group,value)=>{
 if(!Object.hasOwn(ADVANCED_PRESETS,group)||!ADVANCED_PRESETS[group].includes(value))return null;
 return 'af-'+group+'-'+value;
};
export function filterAdvancedClasses(input=''){
 return [...new Set(String(input).trim().split(/\s+/).filter(x=>ADVANCED_ALLOWED_CLASSES.has(x)))].join(' ');
}
