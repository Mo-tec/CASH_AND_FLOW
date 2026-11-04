const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8');
const text=html.slice(html.indexOf('const i18n='),html.indexOf('function settings()'));
const context={};vm.createContext(context);vm.runInContext(text+'\nthis.translations=i18n',context);
const keys=[...new Set([...html.matchAll(/data-i18n(?:-placeholder)?="([^"]+)"/g)].map(x=>x[1]))];
for(const lang of ['sw','en','zh']){
 const missing=keys.filter(key=>context.translations[lang][key]===undefined);
 console.log(lang+' translation keys: '+keys.length+', missing: '+(missing.join(', ')||'none'));
}
const js=['business.js','ux.js','workspace.js','notebook-notes.js','developer-tools.js','firebase-cloud.js','reports.js','luxury.js','fold-ui.js','ui-icons.js'].map(file=>fs.readFileSync(file,'utf8')).join('\n');
const inline=html.slice(html.indexOf('<script>'),html.indexOf('</script>'));
const buttons=[...html.matchAll(/<button\b[^>]*\bid="([^"]+)"[^>]*>/g)].map(x=>({id:x[1],tag:x[0]}));
const unreferenced=buttons.filter(({id,tag})=>!id.includes('${')&&!tag.includes('type="submit"')&&!js.includes(`'${id}'`)&&!inline.includes(`'${id}'`));
console.log('Static buttons: '+buttons.length+', unreferenced IDs: '+(unreferenced.map(x=>x.id).join(', ')||'none'));
if(unreferenced.length)process.exitCode=1;
for(const [file,start,end,name] of [
 ['ui-language.js','const copy=','const extras=','copy'],
 ['ui-language.js','const extras=','const cloudMessages','extras'],
 ['reports.js','const words =','const w =','words'],
 ['notebook-notes.js','const labels=','function n(','labels'],
 ['ux.js','const words=','const w=','words']
]){
 const source=fs.readFileSync(file,'utf8'),part=source.slice(source.indexOf(start),source.indexOf(end));
 const scope={};vm.createContext(scope);vm.runInContext(part+`\nthis.dictionary=${name}`,scope);
 const baseline=Object.keys(scope.dictionary.sw).sort().join('|');
 const missing=['en','zh'].filter(lang=>Object.keys(scope.dictionary[lang]).sort().join('|')!==baseline);
 if(name==='extras')for(const lang of ['en','zh'])if(Object.keys(scope.dictionary[lang].metrics).sort().join('|')!==Object.keys(scope.dictionary.sw.metrics).sort().join('|'))missing.push(lang+' metrics');
 console.log(file+' language parity: '+(missing.length?'MISMATCH '+missing.join(', '):'PASS'));
 if(missing.length)process.exitCode=1;
}
const uiSource=fs.readFileSync('ui-language.js','utf8');
const dialogs=uiSource.slice(uiSource.indexOf('const dialogText='),uiSource.indexOf('function updateDialog()'));
const dialogScope={};vm.createContext(dialogScope);vm.runInContext(dialogs+'\nthis.dialogText=dialogText',dialogScope);
const dialogParity=Object.keys(dialogScope.dialogText.en).sort().join('|')===Object.keys(dialogScope.dialogText.zh).sort().join('|');
console.log('Dialog language parity: '+(dialogParity?'PASS':'MISMATCH'));if(!dialogParity)process.exitCode=1;
