'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const K=require('./assistant-knowledge'),R=require('./system-knowledge-registry'),A=require('./assistant-analysis'),E=require('./assistant-engine');
const cases=[
 ['MO AI, mfumo wangu una uwezo gani?','feature_list',null],
 ['Nielezee CASH AND FLOW.','system_overview',null],
 ['Nawezaje kuingiza mapato?','how_to_use','records'],
 ['Nawezaje kurekodi matumizi?','how_to_use','records'],
 ['Categories zinafanya kazi gani?','category_help','categories'],
 ['Nawezaje kuongeza category?','category_help','categories'],
 ['Dashboard inaonyesha nini?','feature_explanation','dashboard'],
 ['Nawezaje kuchagua tarehe?','how_to_use','dates'],
 ['Nawezaje kupata ripoti ya mwezi huu?','report_help','reports'],
 ['Nawezaje kupakua PDF?','report_help','reports'],
 ['Nawezaje kupata JSON backup?','backup_help','backup'],
 ['Nawezaje kurejesha backup?','backup_help','backup'],
 ['Notebook inatumika kufanya nini?','notebook_help','notebook'],
 ['Business Insights inanisaidiaje?','feature_explanation','insights'],
 ['Nawezaje kutumia Smart Entry?','how_to_use','entry'],
 ['MO AI ana uwezo gani?','feature_explanation','ai'],
 ['Mfumo wangu unafanya kazi bila internet?','offline_help','offline'],
 ['Data zangu zinahifadhiwa wapi?','feature_location','storage'],
 ['Firebase inafanya kazi gani?','feature_explanation','firebase'],
 ['Nawezaje kubadili Dark Mode?','settings_help','theme'],
 ['Nawezaje kubadili lugha?','settings_help','languages'],
 ['Kwa nini data hazionekani?','troubleshooting',null],
 ['Kwa nini hesabu hazilingani?','troubleshooting',null],
 ['Nawezaje kujua salio langu?','how_to_use','dashboard'],
 ['Nawezaje kuona matumizi ya category fulani?','category_help','categories'],
 ['Mfumo wangu una mipaka gani?','system_limitations',null],
 ['Nawezaje kufuta chat?','how_to_use','history'],
 ['Kufuta chat kunafuta miamala?','feature_explanation','history'],
 ['Nawezaje kusawazisha data?','how_to_use','firebase'],
 ['Nifanye nini nikikosa internet?','offline_help','offline']
];
for(const [q,intent,topic] of cases){const result=K.recognize(q);assert.equal(result?.intent,intent,q);if(topic)assert.equal(result.topic,topic,q);assert(K.answer(result).length>20,q);}
const variants=[
 ['How do I enter income?','how_to_use'],['How can I record expenses?','how_to_use'],['What does the dashboard show?','feature_explanation'],
 ['Where is Notebook?','feature_location'],['How do I download a monthly report?','report_help'],['How do I export a PDF?','report_help'],
 ['How can I restore JSON backup?','backup_help'],['Explain categories','category_help'],['How do I add a category?','category_help'],
 ['How do I change the language?','settings_help'],['How can I switch to dark theme?','settings_help'],
 ['Why is my PDF not downloading?','troubleshooting'],['Why are my records not showing?','troubleshooting'],['Why do totals mismatch?','troubleshooting'],
 ['What can I do without internet?','offline_help'],['What are the system limitations?','system_limitations'],
 ['How do I clear chat?','how_to_use'],['Does clearing chat delete transactions?','feature_explanation']
];
for(const [q,id] of variants){assert.equal(K.recognize(q)?.intent,id,q);const reply=K.answer(K.recognize(q));assert(reply.trim().length>0,q);}
for(const q of ['What are my expenses today?','What is my income this month?','Mapato yangu ya mwezi huu ni kiasi gani?','Kwa nini matumizi yangu yameongezeka?','How much did I earn today?','Compare income this month versus last month','Hifadhi mapato DTF 30000','Hifadhi matumizi Rent 1000','Futa rekodi zote'])assert.equal(K.recognize(q),null,q);
assert.equal(K.recognize('Nawezaje kuona mapato na ni kiasi gani leo?').kind,'clarify');
assert.equal(K.recognize('Kwa nini PDF haipakuliwi?').issue,'pdf');assert.equal(K.recognize('Kwa nini data hazionekani?').issue,'data');assert.equal(K.recognize('Kwa nini hesabu hazilingani?').issue,'totals');
assert.match(K.answer(K.recognize('Kwa nini PDF haipakuliwi?')),/siwezi|haijathibitishwa/i);
assert.match(K.answer(K.recognize('Nawezaje kutuma WhatsApp?')),/hakijaunganishwa/);
assert.match(K.answer(K.recognize('Nawezaje kutumia Notebook?'),{isAvailable:()=>false}),/hakipatikani/);
assert.match(K.answer(K.recognize('Data zangu zinahifadhiwa wapi?')),/localStorage.*Firebase/);
assert.match(K.answer(K.recognize('Kufuta chat kunafuta miamala?')),/^Hapana/);
assert.equal(K.recognize('How do I download PDF?').lang,'en');assert.equal(K.recognize('Nawezaje kupakua PDF?').lang,'sw');
assert.equal(R.schemaVersion,1);assert.equal(R.features.length,25);assert.equal(new Set(R.features.map(f=>f.id)).size,25);
for(const f of R.features){for(const key of ['id','name','description','capabilities','usageSteps','limitations','troubleshooting','route','available','functions','location','uiSelector'])assert(key in f,f.id+' '+key);assert(f.usageSteps.sw.length&&f.usageSteps.en.length&&f.limitations.sw.length&&f.limitations.en.length&&f.troubleshooting.length);for(const e of f.functions)assert(fs.readFileSync(e.file,'utf8').includes(e.anchor),f.id+' evidence '+e.file);}
const serialized=JSON.stringify(R);assert.doesNotMatch(serialized,/AIza[0-9A-Za-z_-]{25,}|sk-[0-9A-Za-z_-]{15,}|"password"\s*:|"apiKey"\s*:|"credential"\s*:/);
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');assert(html.includes("APP_VERSION='"+R.appVersion+"'"));assert(sw.includes("CACHE='"+R.assetVersion+"'"));assert(sw.includes("'./system-knowledge-registry.js'"));assert(sw.includes("'./assistant-knowledge.js'"));assert(html.indexOf('system-knowledge-registry.js')<html.indexOf('assistant-knowledge.js'));
const oldFinancial=fs.readFileSync('verify-assistant-analysis.cjs','utf8'),start=oldFinancial.indexOf('const cases=['),end=oldFinancial.indexOf('\n];',start);const financialContext={};vm.createContext(financialContext);vm.runInContext(oldFinancial.slice(start,end+3)+'\nthis.samples=cases;',financialContext);for(const [q] of financialContext.samples)assert.equal(K.recognize(q),null,'financial route '+q);
async function submit(question,{offline=true,missing=false}={}){
 const replies=[],errors=[];let reads=0,writes=0;const records=[{id:'1',account:'business',type:'income',amount:7000,category:'REAL CATEGORY',date:'2026-11-04T12:00:00+03:00'}],before=JSON.stringify(records);
 const elements={assistantForm:{},assistantInput:{value:question},assistantSource:{value:'auto'}};
 const context={window:{MotecAssistantKnowledge:K},document:{querySelector:()=>!missing},analysis:A,engine:E,cloud:{user:()=> 'owner',save:()=>writes++},getCategories:()=>['REAL CATEGORY'],el:id=>elements[id],clear(){},clearError(){},resizeInput(){},updateConnection(){},reportError:error=>errors.push(error),retrying:false,lastQuery:'',say:text=>replies.push(text),state(){},busy:false,generation:0,settings:()=>({lang:'sw'}),navigator:{onLine:!offline},reader:{source:async()=>{reads++;throw Error('System help must not read Firebase');}},saveSettings:()=>writes++,commitBusiness:()=>writes++};
 const source=fs.readFileSync('business-assistant.js','utf8');vm.createContext(context);vm.runInContext(source.slice(source.indexOf(" el('assistantForm').onsubmit="),source.indexOf(" panel.querySelectorAll")),context);
 await elements.assistantForm.onsubmit({preventDefault(){}});assert.equal(errors.length,0,question);assert.equal(reads,0,question);assert.equal(writes,0,question);assert.equal(JSON.stringify(records),before);assert(replies.length>=2);return replies.at(-1);
}
(async()=>{for(const [q] of [...cases,...variants]){const offline=await submit(q),online=await submit(q,{offline:false});assert.equal(offline,online,q);}assert.match(await submit('How do I download PDF?'),/Reports|PDF/);assert.match(await submit('Nawezaje kutumia Notebook?',{missing:true}),/hakipatikani/);console.log('PASS System Knowledge V1: all 30 requested intents, 18 English variants, 25 audited registry features/evidence, 52 preserved financial routes, offline/online identical system help with zero data reads/writes, troubleshooting uncertainty, unavailable features, version/cache agreement and no secrets.');})().catch(error=>{console.error(error);process.exitCode=1;});
