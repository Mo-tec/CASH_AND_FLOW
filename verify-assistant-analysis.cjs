'use strict';
process.env.TZ='Africa/Dar_es_Salaam';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const core=require('./assistant-engine'),a=require('./assistant-analysis'),data=require('./assistant-data'),totals=require('./totals-data');
const now=new Date('2026-11-04T15:00:00+03:00'),categories=['DTF','Printing','Rent','Power'];
const row=(id,date,type,amount,category)=>({id,account:'business',date:date+'T12:00:00+03:00',type,amount,category});
const rows=[row('1','2026-11-04','income',30000,'DTF'),row('2','2026-11-04','income',20000,'Printing'),row('3','2026-11-04','expense',15000,'Rent'),row('4','2026-11-04','expense',5000,'Power'),row('5','2026-11-03','income',40000,'DTF'),row('6','2026-11-03','expense',10000,'Rent'),row('7','2026-10-31','income',10000,'Printing'),row('8','2026-10-31','expense',1000,'Power')];
const raw={version:2,records:rows,orders:[],inventory:[],settings:{categories,password:'NEVER CACHE',pin:'NEVER CACHE'},secrets:'NEVER CACHE'};
const cases=[
 ['Leo nimepata ngapi?','income_summary'],['Mapato yangu ya leo?','income_summary'],['Nimeingiza kiasi gani leo?','income_summary'],['Mauzo ya leo yakoje?','income_summary'],['How much did I earn today?','income_summary'],['Show revenue today','income_summary'],['MAPATOO   ya leo?','income_summary'],['Mauzo ya juzi?','income_summary'],
 ['Matumizi yangu ya leo?','expense_summary'],['Nimetumia kiasi gani leo?','expense_summary'],['What are my expenses today?','expense_summary'],['How much did I spend yesterday?','expense_summary'],['Gharama za wiki hii?','expense_summary'],['Nimelipa kiasi gani leo?','expense_summary'],
 ['Salio la leo?','balance'],['What is my balance today?','balance'],['Net cash flow today?','net_cash_flow'],['Tofauti ya mapato na matumizi leo?','net_cash_flow'],
 ['Biashara yangu iko vipi leo?','business_summary'],['Business summary this month','business_summary'],['Mfumo wangu ukoje?','business_summary'],
 ['Mapato ya DTF leo?','category_income'],['Income by category today','category_income'],['Matumizi ya Rent leo?','category_expense'],['Expenses by category this month','category_expense'],
 ['Ni category gani inaniletea mapato mengi leo?','top_income_category'],['Top income category today','top_income_category'],['Nimetumia pesa nyingi kwenye nini leo?','top_expense_category'],['Highest expense category this month','top_expense_category'],
 ['Linganisha mapato ya leo na jana','period_comparison'],['Compare income this week versus last week','period_comparison'],['Mwenendo wa mauzo wiki hii?','income_trend'],['Have sales increased today?','income_trend'],['Je matumizi yangu yameongezeka leo?','expense_trend'],['Expense trend this month','expense_trend'],
 ['Wastani wa mapato mwezi huu?','average_income'],['Average daily sales this week','average_income'],['Wastani wa matumizi mwezi huu?','average_expense'],['Average expenses this week','average_expense'],
 ['Siku yenye mauzo mengi mwezi huu?','best_income_day'],['Best sales day this week','best_income_day'],['Siku yenye matumizi mengi mwezi huu?','highest_expense_day'],['Highest expense day this week','highest_expense_day'],
 ['Asilimia ya matumizi dhidi ya mapato leo?','expense_ratio'],['Expense to income ratio today','expense_ratio'],['Business health check today','business_health'],['Biashara yangu inaendelea vizuri leo?','business_health'],
 ['Tahadhari za matumizi leo','expense_alerts'],['Expense alerts this week','expense_alerts'],['Mapendekezo ya kupunguza gharama mwezi huu','cost_reduction'],['How can I reduce costs this week?','cost_reduction'],['Nipunguze gharama gani leo?','cost_reduction']
];
for(const [q,id] of cases){const result=a.recognize(q,categories);assert.equal(result.intent,id,q);assert(result.confidence>=.7,q);const range=a.period(q,now);assert(a.answer(result,rows,range,'sw').text.length>0,q);}
for(const q of ['Wastani wa mapato na matumizi?','category gani?','What is the weather?','Mapato category UNKNOWN leo?','Average income and best sales day?','Hifadhi mapato DTF 1000 na nipe wastani?'])assert.equal(a.recognize(q,categories).intent,'clarify',q);
assert.equal(a.recognize('Mambo').intent,'greeting');
assert.equal(a.recognize('Hifadhi mapato DTF 1000',categories).intent,'create');
assert.equal(a.recognize('Nimeingiza 30000?',categories).intent,'income_summary');
for(const q of ['tarehe 13 hadi 16','2026-02-30','2026-11-20 hadi 2026-11-10','mapato leo mwezi huu','mapato hivi karibuni','last year'])assert.throws(()=>a.period(q,now),undefined,q);
assert.equal(a.period('mwaka huu',now).start,'2026-01-01');assert.equal(a.period('this year',now).end,'2026-11-04');
assert.equal(a.period('juzi',now).start,'2026-11-02');assert.equal(a.period('day before yesterday',now).start,'2026-11-02');
assert.equal(a.period('leo',new Date('2026-11-04T21:00:00Z')).start,'2026-11-05');
const custom=a.period('2026-11-03 hadi 2026-11-04',now),sum=a.calculate(rows,custom);assert.deepEqual([sum.income,sum.expense,sum.balance],[90000,30000,60000]);assert.equal(sum.average.income,45000);assert(Math.abs(sum.ratio-100/3)<1e-10);assert.equal(sum.best.income[0],'2026-11-04');
const four=a.period('compare 2026-11-03 to 2026-11-04 vs 2026-10-30 to 2026-10-31',now);assert.equal(four.previous.end,'2026-10-31');
assert.equal(a.period('compare income this month vs last month',now).previous.start,'2026-10-01');
assert.equal(a.calculate(rows,a.period('leo',now),'DTF').income,30000);assert.match(a.answer(a.recognize('Mapato ya DTF leo',categories),rows,a.period('leo',now)).text,/DTF/);
assert.match(a.answer(a.recognize('expense to income ratio today',categories),[row('x','2026-11-04','expense',100,'Rent')],a.period('today',now),'en').text,/income is zero/);
assert.match(a.answer(a.recognize('business health today'),[],a.period('today',now)).text,/Hakuna miamala/);
assert.match(a.answer(a.recognize('income trend today'),rows.filter(r=>r.date.startsWith('2026-11-04')),a.period('today',now),'en').text,/no comparison records/);
// Freeze existing Smart Entry code and adapter against the pre-upgrade backup.
const backup='backups/mo-ai-before-analysis-upgrade/';
assert.equal(fs.readFileSync('assistant-engine.js','utf8'),fs.readFileSync(backup+'assistant-engine.js','utf8'));
const cloudCode=fs.readFileSync('firebase-cloud.js','utf8'),oldCloud=fs.readFileSync(backup+'firebase-cloud.js','utf8');
const saving=code=>code.slice(code.indexOf('  async save(entries, expectedUid)'),code.indexOf(' async function initializeSync'));
assert.equal(saving(cloudCode),saving(oldCloud));
// Check actual dashboard periodRecords + sumBy functions, not an imitation.
const html=fs.readFileSync('index.html','utf8'),elements={period:{value:'custom'},dateFrom:{value:custom.start},dateTo:{value:custom.end}};
class TestDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return +now;}}
const dashboard={Date:TestDate,$:id=>elements[id]};vm.createContext(dashboard);
vm.runInContext(html.slice(html.indexOf('function periodRecords'),html.indexOf('function advancedRecords'))+html.slice(html.indexOf('function sumBy'),html.indexOf('function monthList')),dashboard);
assert.equal(dashboard.sumBy(dashboard.periodRecords(rows),'income'),sum.income);assert.equal(dashboard.sumBy(dashboard.periodRecords(rows),'expense'),sum.expense);
for(const mode of ['all','week','month','custom']){elements.period.value=mode;const range=a.period('dashboard',now,{dashboard:{mode,start:custom.start,end:custom.end,summaryStart:'2026-10-01'}}),actual=a.calculate(rows,range);const expected=mode==='all'?totals.summarize(rows,'business','2026-10-01',now):{income:dashboard.sumBy(dashboard.periodRecords(rows),'income'),expense:dashboard.sumBy(dashboard.periodRecords(rows),'expense')};assert.equal(actual.income,expected.income,mode);assert.equal(actual.expense,expected.expense,mode);}
const validRecord=r=>r&&typeof r.id==='string'&&r.account==='business'&&['income','expense'].includes(r.type)&&Number.isSafeInteger(r.amount)&&r.amount>0&&typeof r.category==='string'&&!Number.isNaN(Date.parse(r.date));
const storageMap=new Map(),storage={getItem:key=>storageMap.get(key)||null,setItem:(key,value)=>storageMap.set(key,value)};
let active='account-a',online=true,reads=0,writes=0;
const cloud={user:()=>active,source:async()=>{reads++;return {uid:active,raw};},save:()=>{writes++;throw Error('A question called save!');}};
const options={storage,cloud,device:()=>({raw}),online:()=>online,validRecord,now:()=>now};
async function run(){
 const reader=data.create(options),live=await reader.source('auto');assert.equal(live.origin,'cloud');assert.equal(reads,1);assert(!JSON.stringify([...storageMap]).includes('NEVER CACHE'));
 online=false;const restarted=data.create(options),cached=await restarted.source('auto');assert.equal(cached.origin,'cache');assert.deepEqual(cached.raw,live.raw);
 for(const [q] of cases){const recognition=a.recognize(q,categories),range=a.period(q,now);assert.deepEqual(a.answer(recognition,live.raw.records,range),a.answer(recognition,cached.raw.records,range),q);}
 active='account-b';await assert.rejects(()=>restarted.source('cloud'),/No account cache/);active=null;await assert.rejects(()=>restarted.source('cloud'),/Sign in/);active='account-a';
 online=true;await restarted.refresh();await restarted.refresh();const refreshed=await restarted.source('cloud');assert.equal(refreshed.raw.records.length,rows.length);assert.equal(new Set(refreshed.raw.records.map(r=>r.id)).size,rows.length);assert.equal(writes,0);
 const failing=data.create({...options,cloud:{...cloud,source:async()=>{throw Error('Permission denied');}}});await assert.rejects(()=>failing.source('cloud'),/Permission denied/);
 const race=data.create({...options,cloud:{...cloud,source:async()=>{active='account-b';return {uid:'account-a',raw};}}});await assert.rejects(()=>race.source('cloud'),/Account changed/);active='account-a';
 const quota=data.create({...options,storage:{...storage,setItem:()=>{throw Error('Quota');}}});assert.match((await quota.source('cloud')).notice,/storage failed/);
 storageMap.set(data.PREFIX+'account-a','broken');online=false;await assert.rejects(()=>restarted.source('cloud'),/unreadable/);
 await actualChat();await serviceWorker();
 console.log(`PASS ${cases.length} question variants across 20 analysis intents; ONLINE/OFFLINE identical answers; persisted cache/reopen, account isolation, reconnect without duplicates, safe failures, dashboard totals, dates and actual read-only submit path. Smart Entry/parser/save code unchanged.`);
}
async function actualChat(){
 const ui=fs.readFileSync('business-assistant.js','utf8');let saves=0;const elements={assistantForm:{},assistantInput:{value:''},assistantSource:{value:'device'},period:{value:'custom'},dateFrom:{value:'2026-11-03'},dateTo:{value:'2026-11-04'}};
 const messages=[];const ctx={window:{},analysis:a,engine:core,cloud:{user:()=>null,save:()=>{saves++;}},getCategories:()=>categories,el:id=>elements[id],clear(){},clearError(){},resizeInput(){},updateConnection(){},reportError(){},retrying:false,lastQuery:"",say:text=>messages.push(text),state(){},busy:false,generation:0,help:'Help',reader:{source:async()=>({raw,origin:'device'})},settings:()=>({lang:'en'}),dashboardContext:()=>({dashboard:{mode:'custom',start:'2026-11-03',end:'2026-11-04'}}),navigator:{onLine:false},Date:TestDate};
 vm.createContext(ctx);vm.runInContext(ui.slice(ui.indexOf(" el('assistantForm').onsubmit="),ui.indexOf(" panel.querySelectorAll")),ctx);
 for(const [q] of cases){elements.assistantInput.value=q;await elements.assistantForm.onsubmit({preventDefault(){}});assert.doesNotMatch(messages.at(-1),/Error:|clarify/i,q);}
 for(const q of ['Nimeingiza 30000?','Mapato 2026-11-03 hadi 2026-11-04?','Show income 2026-11-03 to 2026-11-04','Mambo','What is the weather?']){elements.assistantInput.value=q;await elements.assistantForm.onsubmit({preventDefault(){}});}assert.equal(saves,0);assert.match(messages.at(-1),/specify/);
}
async function serviceWorker(){const source=fs.readFileSync('sw.js','utf8'),handlers={},cached=new Map();let network=true;
 const cache={addAll:async files=>{for(const file of files){assert(fs.existsSync(file.replace('./','')),file);cached.set(file,{ok:true});}},add:async url=>{cached.set(url,{ok:true});},match:async req=>cached.get(typeof req==='string'?req:req.url),put:async(req,response)=>cached.set(req.url,response)};
 const context={self:{location:{origin:'https://app.test'},addEventListener:(name,fn)=>handlers[name]=fn},caches:{open:async()=>cache},URL,fetch:async()=>{if(!network)throw Error('offline');return {ok:true,clone(){return this;}}}};
 vm.createContext(context);vm.runInContext(source,context);let pending;handlers.install({waitUntil:p=>pending=p});await pending;network=false;
 for(const name of ['assistant-analysis.js','assistant-data.js','assistant-engine.js','business-assistant.js']){let result;handlers.fetch({request:{url:'https://app.test/'+name,method:'GET',mode:'cors'},respondWith:p=>result=p}); // Cache API resolves relative addAll keys in the browser; emulate that matching here.
  cached.set('https://app.test/'+name,cached.get('./'+name));assert(await result);}
 let sdk;handlers.fetch({request:{url:'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js',method:'GET'},respondWith:p=>sdk=p});assert(await sdk);
}
run().catch(error=>{console.error(error);process.exitCode=1;});
