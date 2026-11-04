'use strict';
// Owner-published facts/FAQs; retrieved as text, never interpreted as commands.
(function(root){
 const PREFIX='motec-assistant-learned-v1:';
 const aliases=[
 ['hours','saa','ratiba','muda'],['open','opening','fungua','kufungua','tunafungua','mnafungua','inafunguliwa','hufunguliwa','nafunguaje'],
 ['close','closing','funga','kufunga','tunafunga','mnafunga','inafungwa','hufungwa'],
 ['location','address','located','where','anwani','mahali','wapi','mtaa','tuko','mnapatikana','tunapatikana','ipo'],['price','prices','pricing','bei'],
 ['service','services','huduma'],['contact','contacts','mawasiliano','simu','phone','namba'],
 ['payment','payments','malipo','kulipa','nalipaje','ninalipaje','mnalipewaje'],['return','returns','refund','kurudisha','marejesho'],
 ['delivery','deliver','usafirishaji','kupeleka','mnapeleka','mnasafirisha']
 ];
 const lookup=new Map(aliases.flatMap(group=>group.map(word=>[word,group[0]])));
 const stop=new Set('a an the is are do does can i we you your my our this that what how when which please tell me provide providing offer accept accepted mnatoa mnapokea and or of to for in at on about ni na ya za wa la vya vyetu yako yetu zenu wenu kwenu hii hiki mimi wewe je nini ngapi gani zipi kwa kwenye kuhusu tafadhali nieleze nisaidie biashara business duka shop store kampuni kazi'.split(' '));
 function normalized(value){return String(value).normalize('NFKC').toLowerCase().replace(/m-pesa/g,'mpesa').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
 function tokens(value){return [...new Set(normalized(value).split(' ').filter(w=>w&&w.length<=80&&!stop.has(w)).map(w=>lookup.get(w)||w))];}
 function parse(text){
  if(typeof text!=='string'||text.length>30000)throw Error('Maarifa yasizidi herufi 30,000.');
  const entries=[];let question=null,answer=[];
  function add(title,body){title=title.trim();body=body.trim();if(!body)return;if(body.length>6000)throw Error('Tenga maarifa marefu katika mada ndogo.');entries.push({id:String(entries.length+1),title:title.slice(0,200)||body.slice(0,100),body});}
  function flush(){if(question!==null){const body=answer.join('\n').trim();if(!body)throw Error('Swali linahitaji Jibu kabla ya kuhifadhi.');add(question,body);question=null;answer=[];}}
  let prose=[];
  function proseFlush(){const body=prose.join('\n').trim();if(body){const colon=body.indexOf(':');add(colon>=0&&colon<150?body.slice(0,colon):body.split(/[.!?\n]/)[0],body);}prose=[];}
  for(const line of text.replace(/\r\n/g,'\n').split('\n')){
   const q=line.match(/^\s*(?:swali|question|q)\s*:\s*(.+)$/i),a=line.match(/^\s*(?:jibu|answer|a)\s*:\s*(.*)$/i);
   if(q){proseFlush();flush();question=q[1];continue;}
   if(a){if(question===null)throw Error('Weka Swali kabla ya Jibu.');answer.push(a[1]);continue;}
   if(question!==null){if(!line.trim()&&answer.join('').trim()){flush();continue;}answer.push(line);continue;}
   if(!line.trim()){proseFlush();continue;}prose.push(line);
  }
  proseFlush();flush();if(entries.length>200)throw Error('Tumia mada zisizozidi 200.');return entries;
 }
 function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let previous=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));previous=old;}}return row[b.length];}
 function match(question,entries){
  const original=tokens(question);if(original.every(w=>/^\d+$/.test(w))||!original.length||!entries.length)return {status:'none',confidence:0};
  const dictionary=[...new Set(entries.flatMap(e=>[...tokens(e.title),...tokens(e.body)]))];
  let corrected=false;const query=original.map(word=>{if(dictionary.includes(word)||word.length<5||/^\d+$/.test(word))return word;const candidates=dictionary.filter(w=>Math.abs(w.length-word.length)<=1&&distance(w,word)===1);if(candidates.length===1){corrected=true;return candidates[0];}return word;});
  const scored=entries.map(entry=>{const title=new Set(tokens(entry.title)),body=new Set(tokens(entry.body));let hits=0,score=0;for(const word of query){if(title.has(word)){hits++;score+=1;}else if(body.has(word)){hits++;score+=.7;}}score=score/query.length*(corrected?.9:1);if(query.length>1&&hits<2)score=0;if(query.length===1&&!title.has(query[0]))score=body.has(query[0])&&query[0].length>=4?.78:0;return {...entry,score};}).sort((a,b)=>b.score-a.score);
  const best=scored[0];if(!best||best.score<.72)return {status:'none',confidence:best?.score||0};
  const alternative=scored[1];if(alternative&&alternative.score>=.72&&best.score-alternative.score<.12&&best.body!==alternative.body)return {status:'clarify',confidence:best.score,conflict:normalized(best.title)===normalized(alternative.title),titles:[best.title,alternative.title]};
  return {status:'match',confidence:best.score,title:best.title,text:best.body};
 }
 function protect(question,recognition,system){
  const q=normalized(question);
  if(/^(?:(?:leo|today) )?(?:hifadhi|save|ingiza|add|futa|delete|update|rekodi|record|badili|badilisha|tuma|send|ongeza|ondoa)\b/.test(q))return true;
  if(system&&system.kind!=='clarify')return true;
  if(recognition&&['create','greeting','help'].includes(recognition.intent))return true;
  if(/\b(mapato|matumizi|mauzo|salio|gharama|faida|deni|madeni|income|expenses?|costs?|profit|debt|revenue|sales|balance|cashflow)\b|cash flow/.test(normalized(question)))return true;
  if(recognition&&recognition.intent!=='clarify'&&recognition.intent!=='unknown'&&recognition.intent!=='business_summary')return true;
  if(recognition?.intent==='business_summary'&&!/saa|hours|ratiba|fungua|funguliwa|funga|opening|closing|bei|price|contact|mawasiliano|namba|phone|address|anwani|wapi|location|mahali|service|huduma|policy|sera|delivery|jina|name|inaitwa/.test(q))return true;
  return /(?:biashara|business).*(?:vipi|ikoje|vizuri|performance|summary|health)|mfumo wangu.*(?:ukoje|vipi)/.test(q);
 }
 function create({storage,owner,isCurrent=()=>true,canEdit=()=>false,now=()=>new Date()}){
  if(typeof owner!=='string'||!owner)throw Error('Knowledge owner is required.');
  const key=PREFIX+encodeURIComponent(owner);
  function current(){if(!isCurrent())throw Error('Akaunti imebadilika.');}
  function read(){current();const raw=storage.getItem(key);if(raw===null)return {text:'',entries:[],updatedAt:null};const data=JSON.parse(raw);if(data.version!==1||data.owner!==owner||typeof data.text!=='string'||!Number.isFinite(Date.parse(data.updatedAt)))throw Error('Maarifa yaliyohifadhiwa hayasomeki.');return {text:data.text,entries:parse(data.text),updatedAt:data.updatedAt};}
  function save(text){current();if(!canEdit())throw Error('Fungua panel ya mmiliki kwanza.');read();const entries=parse(text),record={version:1,owner,text,updatedAt:now().toISOString()};storage.setItem(key,JSON.stringify(record));return {count:entries.length,updatedAt:record.updatedAt};}
  function search(question){const data=read();return {...match(question,data.entries),updatedAt:data.updatedAt};}
  return {read,save,search,key};
 }
 const api={PREFIX,parse,tokens,match,protect,create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantLearnedKnowledge=api;
})(typeof window==='undefined'?globalThis:window);
