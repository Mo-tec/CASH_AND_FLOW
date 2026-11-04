'use strict';
(function(root){
 const PREFIX='motec-assistant-owner-v1:',ITERATIONS=210000;
 const defaults=()=>({language:'auto',style:'standard',requirePreview:false,greeting:''});
 function runtime(value){if(!value||!['auto','sw','en'].includes(value.language)||!['brief','standard'].includes(value.style)||typeof value.requirePreview!=='boolean'||typeof value.greeting!=='string'||value.greeting.length>300)throw Error('Maelekezo yaliyohifadhiwa si sahihi.');return {...value};}
 function compile(text){
  if(typeof text!=='string'||text.length>12000)throw Error('Prompt isizidi herufi 12,000.');
  const preferences=defaults(),applied=[],unsupported=[];
  for(const line of text.split(/\n/).map(s=>s.trim()).filter(Boolean)){
   const q=line.toLowerCase().normalize('NFKC');let recognized=false;
   if(/^(lugha|language)\s*:\s*(sw|kiswahili|swahili)\s*$/i.test(line)||/jibu kwa kiswahili|respond in swahili/.test(q)){preferences.language='sw';recognized=true;}
   if(/^(lugha|language)\s*:\s*(en|english|kiingereza)\s*$/i.test(line)||/jibu kwa kiingereza|respond in english/.test(q)){preferences.language='en';recognized=true;}
   if(/^(lugha|language)\s*:\s*auto\s*$/i.test(line)){preferences.language='auto';recognized=true;}
   if(/^(majibu|responses)\s*:\s*(mafupi|brief|concise)\s*$/i.test(line)||/kwa ufupi|majibu mafupi|keep (?:answers|responses) (?:short|brief)/.test(q)){preferences.style='brief';recognized=true;}
   if(/^(majibu|responses)\s*:\s*(kawaida|standard)\s*$/i.test(line)){preferences.style='standard';recognized=true;}
   const greeting=line.match(/^(?:salamu|greeting)\s*:\s*(.*)$/i);if(greeting){if(greeting[1].length>300)throw Error('Salamu isizidi herufi 300.');preferences.greeting=greeting[1];recognized=true;}
   if(/^(preview)\s*:\s*(lazima|required)\s*$/i.test(line)||/(?:onyesha|onesha).*preview.*kabla|preview.*kabla ya kuhifadhi|always require.*preview/.test(q)){preferences.requirePreview=true;recognized=true;}
   if(/tumia data halisi|usibuni takwimu|usi(?:fute|badilishe) data|omba ufafanuzi|use (?:real|verified) data/.test(q)){applied.push('Ulinzi wa data na validation tayari hutekelezwa na mfumo.');recognized=true;}
   if(!recognized)unsupported.push(line);
  }
  applied.push('Lugha: '+preferences.language,'Majibu: '+preferences.style,'Preview: '+(preferences.requirePreview?'lazima':'mpangilio wa sasa'));
  if(preferences.greeting)applied.push('Salamu maalumu imewekwa.');
  return {preferences,applied:[...new Set(applied)],unsupported};
 }
 const bytesTo64=bytes=>{let text='';for(const b of bytes)text+=String.fromCharCode(b);return btoa(text);};
 const from64=text=>Uint8Array.from(atob(text),c=>c.charCodeAt(0));
 function create({storage,owner,crypto=root.crypto,now=()=>Date.now(),isCurrent=()=>true}){
  if(typeof owner!=='string'||!owner)throw Error('Owner is required.');
  const key=PREFIX+encodeURIComponent(owner),rateKey=key+':attempts';let sessionKey=null,revision=0;
  function current(){if(!isCurrent())throw Error('Akaunti imebadilika. Fungua sehemu ya mmiliki tena.');}
  function read(){const raw=storage.getItem(key);if(!raw)return null;const c=JSON.parse(raw);if(c.version!==1||c.owner!==owner||c.iterations!==ITERATIONS||typeof c.salt!=='string'||typeof c.iv!=='string'||typeof c.cipher!=='string'||from64(c.salt).length!==16||from64(c.iv).length!==12)throw Error('Hifadhi ya maelekezo haisomeki.');runtime(c.runtime);return c;}
  function check(){current();const raw=JSON.parse(storage.getItem(rateKey)||'{"count":0,"until":0}');if(raw.until>now())throw Error('Jaribio limezuiwa kwa muda. Subiri dakika moja.');}
  function failed(){let raw;try{raw=JSON.parse(storage.getItem(rateKey)||'{}');}catch{raw={};}const count=(Number(raw.count)||0)+1;storage.setItem(rateKey,JSON.stringify(count>=5?{count:0,until:now()+60000}:{count,until:0}));}
  function password(value){if(typeof value!=='string'||value.length<8||value.length>256)throw Error('Password iwe na herufi/namba 8 hadi 256.');}
  async function derive(value,salt){const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(value),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:ITERATIONS,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
  async function encrypted(value,ckey,salt){const iv=crypto.getRandomValues(new Uint8Array(12)),compiled=compile(value),payload=new TextEncoder().encode(JSON.stringify({owner,prompt:value,preferences:compiled.preferences})),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},ckey,payload);return {version:1,owner,iterations:ITERATIONS,salt:bytesTo64(salt),iv:bytesTo64(iv),cipher:bytesTo64(new Uint8Array(cipher)),runtime:compiled.preferences,updatedAt:new Date(now()).toISOString()};}
  async function initialize(value,prompt=''){
   check();password(value);if(read())throw Error('Password ya mmiliki tayari imewekwa.');const rev=revision,salt=crypto.getRandomValues(new Uint8Array(16)),ckey=await derive(value,salt),record=await encrypted(prompt,ckey,salt);current();if(revision!==rev)throw Error('Sehemu ya mmiliki imefungwa.');storage.setItem(key,JSON.stringify(record));sessionKey=ckey;storage.removeItem(rateKey);return {prompt,preferences:record.runtime};
  }
  async function unlock(value){
   check();password(value);const c=read();if(!c)throw Error('Weka password kwanza.');const rev=revision;
   const ckey=await derive(value,from64(c.salt));let payload;
   try{payload=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:from64(c.iv)},ckey,from64(c.cipher))));if(payload.owner!==owner||typeof payload.prompt!=='string'||JSON.stringify(compile(payload.prompt).preferences)!==JSON.stringify(c.runtime))throw Error('Invalid payload');}
   catch{failed();throw Error('Password si sahihi au maelekezo yameharibika.');}
   current();if(revision!==rev)throw Error('Sehemu ya mmiliki imefungwa.');sessionKey=ckey;storage.removeItem(rateKey);return {prompt:payload.prompt,preferences:runtime(payload.preferences)};
  }
  async function save(text){
   current();if(!sessionKey)throw Error('Fungua sehemu ya mmiliki kwanza.');const c=read(),rev=revision,ckey=sessionKey;const record=await encrypted(text,ckey,from64(c.salt));current();if(revision!==rev||sessionKey!==ckey)throw Error('Sehemu ya mmiliki imefungwa.');storage.setItem(key,JSON.stringify(record));return compile(text);
  }
  return {initialize,unlock,save,lock(){sessionKey=null;revision++;},exists:()=>!!read(),preferences:()=>read()?.runtime||defaults(),recordKey:key,check,failed};
 }
 function format(text,preferences){
  if(preferences.style!=='brief')return text;
  const seen=new Set();return text.split('\n').map(line=>line.replace(/^((?:Kagua|Review) .+?\))\. .+$/,'$1.')).filter(line=>{const key=line.trim();if(seen.has(key))return false;seen.add(key);return true;}).join('\n');
 }
 const api={PREFIX,defaults,compile,create,format};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantPolicy=api;
})(typeof window==='undefined'?globalThis:window);
