const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const e=require('./assistant-engine');const now=new Date('2026-11-04T22:30:00Z');
for(const text of ['Mambo','mambo!','HABARI','Hello','Hi'])assert.equal(e.intent(text),'greeting');
assert.equal(e.intent('Mambo ya mapato ya leo?'),'income');
assert.equal(e.day(now),'2026-11-05');
for(const q of ['Mapato ya leo?','Leo nimepata ngapi?','How much did I earn today?'])assert.equal(e.intent(q),'income');
for(const [q,type] of [['Matumizi ya leo?','expense'],['Balance today?','balance'],['Nimetumia pesa nyingi kwenye nini?','category'],['Je matumizi yameongezeka?','trend'],['Biashara yangu iko vipi leo?','performance'],['Tell me a joke','unknown'],['Help','help']])assert.equal(e.intent(q),type);
for(const [q,start,end] of [['leo','2026-11-05','2026-11-05'],['jana','2026-11-04','2026-11-04'],['juzi','2026-11-03','2026-11-03'],['wiki hii','2026-11-02','2026-11-05'],['wiki iliyopita','2026-10-26','2026-11-01'],['mwezi huu','2026-11-01','2026-11-05'],['mwezi uliopita','2026-10-01','2026-10-31'],['2026-11-13 hadi 2026-11-16','2026-11-13','2026-11-16']]){const r=e.period(q,now);assert.equal(r.start,start);assert.equal(r.end,end);}
for(const q of ['tarehe 13 hadi 16','from 10 to 20','2026-02-30','2026-11-20 hadi 2026-11-10','November 13'])assert.throws(()=>e.period(q,now));
const cats=[{name:'Tshirt Printing',type:'income'},{name:'DTF',type:'income'},{name:'Binafsi',type:'expense'},{name:'Wife',type:'expense'}];
const rows=e.parse('Leo nimeingiza na nimetoa Tshirt Printing 30000, DTF 20000, Binafsi 26000 na Wife 49000.',cats,[],now);
const range=e.period('leo',now),sum=e.summarize(rows,range);assert.equal(sum.income,50000);assert.equal(sum.expense,75000);assert.equal(sum.balance,-25000);assert.equal(sum.top.expense[0][0],'Wife');
assert.equal(e.parse('Hifadhi mapato DTF 20,000 na matumizi Binafsi 1000',cats,[],now).length,2);
for(const q of ['Hifadhi mapato Unknown 1000','Hifadhi mapato DTF -1000','Hifadhi mapato DTF 2.5','Hifadhi mapato DTF 1000 na nonsense','Hifadhi mapato DTF 1000 na DTF 1000','Hifadhi mapato DTF 9007199254740992'])assert.throws(()=>e.parse(q,cats,[],now));
assert.throws(()=>e.parse('Leo nimeingiza na nimetoa DTF 1000',['DTF'],[],now),/Taja/);
assert.throws(()=>e.parse('Hifadhi DTF 1000 na matumizi Binafsi 2000',cats.map(c=>c.name),[],now),/Taja/);
assert.equal(e.summarize([],range).count,0);assert.match(e.response('performance',e.summarize([],range),sum,range),/Hakuna miamala/);
const zero=e.summarize([{...rows[0],amount:1,type:'expense'}],range);assert.match(e.response('performance',sum,zero,range,'en'),/zero baseline/);
assert.equal(e.summarize([{...rows[0],date:'2026-11-04T20:59:59Z'},{...rows[0],date:'2026-11-04T21:00:00Z'}],range).count,1);
// Exercise the actual authenticated save adapter without any production access.
const source=fs.readFileSync('firebase-cloud.js','utf8');
async function adapter({duplicate=false,offline=false,failed=false,stale=false,changed=false}={}){
 let commits=0,renders=0;const entry=rows[0];
 const context={window:{MotecAssistantEngine:e,motecReportCloud:{source:async()=>({raw:{records:duplicate?[entry]:[]}}),user:()=> 'test'}},
 waitForAuth:async()=>{},requireUser:()=>({uid:changed?'other':'test'}),active:true,navigator:{onLine:!offline},normalizeBackup:x=>x,records:stale?[entry]:duplicate?[entry]:[],randomId:()=> 'test-id',validRecord:()=>true,
 commitBusiness:()=>commits++,render:()=>renders++,clearTimeout(){},timer:null,uploadSnapshot:async()=>{if(failed)throw Error('Network failure');}};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' window.motecAssistantCloud ='),source.indexOf(' async function initializeSync')),context);
 context.window.motecAssistantCloud.source=context.window.motecReportCloud.source;
 if(duplicate||offline||stale||changed){await assert.rejects(()=>context.window.motecAssistantCloud.save([entry],'test'));assert.equal(commits,0);}
 else{const result=await context.window.motecAssistantCloud.save([entry],'test');assert.equal(result.cloud,!failed);assert.equal(commits,1);assert.equal(renders,1);}
}
async function chat({text='Mapato ya leo?',mode='device',bad=false,empty=false}={}){
 const ui=fs.readFileSync('business-assistant.js','utf8'),messages=[],errors=[];let reads=0;
 const elements={assistantForm:{},assistantInput:{value:text},assistantSource:{value:mode},period:{value:'all'},dateFrom:{value:''},dateTo:{value:''}};
 const today=e.day(new Date()),raw={version:2,records:empty?[]:[{...rows[0],date:today+'T12:00:00+03:00',amount:12345}],orders:[],inventory:[],settings:{categories:cats.map(c=>c.name)}};
 const ctx={window:{},engine:e,analysis:require('./assistant-analysis'),cloud:{user:()=>mode==='cloud'?'test':null},getCategories:()=>cats.map(c=>c.name),
 el:id=>elements[id],clear(){},clearError(){},resizeInput(){},updateConnection(){},reportError:error=>errors.push(error.message),retrying:false,lastQuery:'',say:message=>messages.push(message),state(){},busy:false,generation:0,help:'Help',
 settings:()=>({lang:'sw'}),dashboardContext:()=>({}),reader:{source:async()=>{if(mode==='cloud'){reads++;throw Error('Test cloud unavailable');}if(bad)throw Error('Device data could not be loaded.');return {raw,origin:'device'};}}};
 vm.createContext(ctx);vm.runInContext(ui.slice(ui.indexOf(" el('assistantForm').onsubmit="),ui.indexOf(" panel.querySelectorAll")),ctx);
 await elements.assistantForm.onsubmit({preventDefault(){}});
 if(e.intent(text)==='greeting'){assert.equal(messages.at(-1),'Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo?');assert.equal(reads,0);}
 else if(mode==='cloud'){assert.equal(reads,1);assert.match(errors.at(-1),/Test cloud unavailable/);}
 else if(bad)assert.match(errors.at(-1),/Device data could not be loaded/);
 else{assert.equal(reads,0);assert.match(messages.at(-1),empty?/Hakuna miamala/:/12,345/);}
}
(async()=>{for(const opts of [{},{duplicate:true},{offline:true},{failed:true},{stale:true},{changed:true}])await adapter(opts);
 for(const opts of [{},{text:'Mambo'},{mode:'cloud'},{bad:true},{empty:true}])await chat(opts);
 console.log('PASS assistant intents, dates/timezone, summaries, categories, trends, multi-entry, ambiguity, duplicates, empty data, auth/stale snapshot protection, Firebase failures, offline device answers and greetings (fixtures only).');})().catch(error=>{console.error(error);process.exitCode=1;});
