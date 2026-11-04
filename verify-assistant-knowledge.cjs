'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),K=require('./assistant-knowledge'),A=require('./assistant-analysis'),E=require('./assistant-engine');
const samples=[
 ['Mapato ni nini?','finance'],['What is cash flow?','finance'],['Ninawezaje kuchuja tarehe?','dates'],['How do I use date filters?','dates'],
 ['Dashboard inafanya nini?','dashboard'],['How does the dashboard work?','dashboard'],
 ['Ninawezaje kuweka mauzo kupitia chat?','entry'],['How do I use Smart Entry?','entry'],
 ['How do I record income?','records'],['Rekodi inafanyaje kazi?','records'],
 ['Oda zinafanyaje kazi?','orders'],['How can I print an order PDF?','orders'],
 ['Wateja wanafanyaje kazi?','customers'],['How do I use customers?','customers'],
 ['Naonaje stock?','stock'],['How does inventory work?','stock'],
 ['Business Insights ni nini?','insights'],['How do I use Business Insights?','insights'],
 ['Ninapataje ripoti PDF?','reports'],['How do I export a CSV report?','reports'],
 ['Ninawezaje kufanya backup?','backup'],['How do I restore JSON?','backup'],
 ['Firebase inafanyaje kazi?','firebase'],['How do I synchronize Firebase?','firebase'],
 ['Offline inafanyaje kazi?','offline'],['How can I use the app offline?','offline'],
 ['Nawezaje kubadili categories?','categories'],['How do I set a budget?','categories'],
 ['Notebook ni nini?','notebook'],['How can I upload a Notebook PDF?','notebook'],
 ['Naonaje historia ya chat?','history'],['How does chat history work?','history'],
 ['Maelekezo ya mmiliki yanafanyaje kazi?','owner'],['How do owner instructions work?','owner'],
 ['Ulinzi unafanyaje kazi?','security'],['How does verification work?','security'],
 ['Ninawezaje kubadili theme?','theme'],['How do I change the language?','languages']
];
for(const [question,topic] of samples){const match=K.recognize(question);assert.equal(match?.topic,topic,question);assert(K.answer(match).length>30);assert(K.answer(match,{lang:'en'}).length>30);}
assert.equal(K.topics.length,25);
for(const q of ['Unajua mfumo wangu wote?','Mfumo wangu una vipengele gani?','Msaada'])assert.equal(K.recognize(q).kind,'overview',q);
for(const q of ['Mapato ya leo?','Nimetumia pesa nyingi kwenye nini?','Mfumo wangu ukoje?','Hifadhi mapato DTF 30000','Hifadhi matumizi UMEME 1000','Futa rekodi zote'])assert.equal(K.recognize(q),null,q);
assert.equal(K.recognize('What can you do?').topic,'ai');
assert.equal(K.recognize('Nina categories gani?').needsData,true);
assert.match(K.answer({kind:'categories'},{source:{raw:{records:[],settings:{categories:['ACTUAL CATEGORY','SECOND']}}}}),/ACTUAL CATEGORY, SECOND/);
assert.doesNotMatch(K.context(),/gusa mara tano|five times|password123|apiKey/);
async function chat(question,{wrong=false}={}){
 const messages=[],errors=[];let reads=0,writes=0;
 const elements={assistantForm:{},assistantInput:{value:question},assistantSource:{value:'auto'}};
 const raw={records:[{id:'1',account:'business',type:'income',amount:7,category:'REAL',date:'2026-11-04T12:00:00+03:00'}],settings:{categories:['REAL']}};
 const ctx={document:{querySelector:()=>true},window:{MotecAssistantKnowledge:K},analysis:A,engine:E,cloud:{user:()=> 'A',save:()=>writes++},getCategories:()=>['REAL'],el:id=>elements[id],clear(){},clearError(){},resizeInput(){},updateConnection(){},reportError:error=>errors.push(error),retrying:false,lastQuery:'',say:message=>messages.push(message),state(){},busy:false,generation:0,help:'help',settings:()=>({lang:'sw'}),reader:{source:async()=>{reads++;return {uid:wrong?'B':'A',raw};}}};
 const source=fs.readFileSync('business-assistant.js','utf8');vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf(" el('assistantForm').onsubmit="),source.indexOf(" panel.querySelectorAll")),ctx);
 await elements.assistantForm.onsubmit({preventDefault(){}});assert.equal(writes,0);
 if(wrong){assert.equal(errors[0].code,'auth/changed');assert(!messages.some(text=>text.includes('REAL')));}
 else{assert.equal(errors.length,0);if(K.recognize(question).needsData)assert.equal(reads,1);else assert.equal(reads,0);}
 return messages;
}
(async()=>{for(const [q] of samples)await chat(q);const categories=await chat('Nina categories gani?');assert.match(categories.at(-1),/REAL/);await chat('Unaona data gani?');await chat('Nina categories gani?',{wrong:true});console.log('PASS system knowledge: 25 application areas, 38 Swahili/English workflow questions, no interception of financial/Smart Entry commands, verified real categories/source, zero writes and cross-account rejection.');})().catch(error=>{console.error(error);process.exitCode=1;});
