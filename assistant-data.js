'use strict';
(function(root){
 const PREFIX='motec-assistant-read-cache-v1:', OWNER='motec-assistant-device-owner-v1';
 const fail=(code,message)=>Object.assign(new Error(message),{code});
 const canonical=records=>JSON.stringify(records.map(r=>[r.id,r.account,r.type,r.amount,r.category,r.date]).sort((a,b)=>a[0].localeCompare(b[0])));
 async function digest(records){const bytes=new TextEncoder().encode(canonical(records)),hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');}
 function create({storage,cloud,device,online,validRecord,now=()=>new Date()}){
  const uid=()=>cloud.user();
  const ready=async(mode)=>{
   if(!cloud.ready)return;
   try{await cloud.ready();}catch(error){
    // Standalone, never-associated device records do not require an online SDK.
    const owned=stored('motec-cloud-sync-v1')?.uid||stored(OWNER)?.uid;
    if((mode==='auto'||mode==='device')&&!uid()&&!owned&&error.code!=='auth/pending')return;
    if(owned&&!uid()&&error.code!=='auth/pending')throw fail('auth/required','Sign in to the account that owns this device data.');
    throw error;
   }
  };
  function clean(raw){
   if(!raw||!Array.isArray(raw.records)||!raw.records.every(validRecord)||new Set(raw.records.map(r=>r.id)).size!==raw.records.length)throw fail('data/invalid','Invalid analysis dataset.');
   const records=raw.records.map(r=>({id:r.id,account:r.account,type:r.type,amount:r.amount,category:r.category,date:r.date}));
   const categories=[...new Set([...(Array.isArray(raw.settings?.categories)?raw.settings.categories.filter(c=>typeof c==='string'):[]),...records.map(r=>r.category)])];
   return {version:2,records,orders:[],inventory:[],settings:{categories}};
  }
  function stored(key){try{return JSON.parse(storage.getItem(key)||'null');}catch{throw fail('cache/invalid','Cache is unreadable.');}}
  function cached(expected){
   if(!expected)throw fail('auth/required','Sign in to read account cache.');
   const cache=stored(PREFIX+expected);
   if(!cache)throw fail('cache/missing','No account cache. Connect first.');
   if(cache.version!==1||cache.uid!==expected||!Number.isFinite(Date.parse(cache.fetchedAt)))throw fail('cache/invalid','Invalid cache.');
   return {raw:clean(cache.raw),uid:expected,origin:'cache',fetchedAt:cache.fetchedAt,complete:cache.complete===true,notice:'Snapshot ya mwisho; data mpya huenda hazipo.'};
  }
  async function fresh(){
   await ready();const expected=uid();if(!expected)throw fail('auth/required','Sign in to Firebase first.');
   const source=await cloud.source();if(uid()!==expected||source.uid!==expected)throw fail('auth/changed','Account changed.');
   const raw=clean(source.raw),fetchedAt=now().toISOString();let notice='';
   try{storage.setItem(PREFIX+expected,JSON.stringify({version:1,uid:expected,fetchedAt,complete:true,raw}));}catch{notice='Cache storage failed; offline copy unavailable.';}
   return {raw,uid:expected,origin:'cloud',fetchedAt,complete:true,notice};
  }
  async function local(){
   const expected=uid(),value=await device(),raw=clean(value.raw);
   if(uid()!==expected)throw fail('auth/changed','Account changed.');
   const marker=stored('motec-cloud-sync-v1'),proof=stored(OWNER);
   if(marker!==null&&(!marker||typeof marker!=='object'||typeof marker.uid!=='string'||!marker.uid))throw fail('cache/invalid','Invalid device ownership marker.');
   if(proof!==null&&(!proof||proof.version!==1||typeof proof.uid!=='string'||typeof proof.hash!=='string'||!proof.uid||!/^[a-f0-9]{64}$/.test(proof.hash)))throw fail('cache/invalid','Invalid device ownership proof.');
   if(!expected){
    if(marker?.uid||proof?.uid)throw fail('auth/required','Sign in to the account that owns this device data.');
    return {raw,origin:'device',complete:false,notice:'Data za kifaa hiki pekee.'};
   }
   const hash=await digest(raw.records);
   if(uid()!==expected)throw fail('auth/changed','Account changed.');
   let verified=proof?.uid===expected&&proof.hash===hash;
   if(!verified&&cloud.verifyLocal)verified=await cloud.verifyLocal(raw.records);
   if(uid()!==expected)throw fail('auth/changed','Account changed.');
   if(!verified&&online()){
    const remote=await fresh();verified=canonical(remote.raw.records)===canonical(raw.records);
   }
   if(uid()!==expected)throw fail('auth/changed','Account changed.');
   // Never authorize a snapshot that changed while verification was in flight.
   const current=clean((await device()).raw);
   if(canonical(current.records)!==canonical(raw.records))throw fail('data/changed','Device data changed. Retry.');
   if(!verified)throw fail('device/unverified','Device data is not verified for this account.');
   try{storage.setItem(OWNER,JSON.stringify({version:1,uid:expected,hash}));}catch{/* Read can proceed; verification will be repeated next time. */}
   return {raw,uid:expected,origin:'device',complete:false,notice:'Data zilizothibitishwa za kifaa hiki.'};
  }
  async function source(mode='auto'){
   await ready(mode);
   if(mode==='device')return local();
   if(mode==='auto'&&!uid())return local();
   if(!online()){
    if(mode==='auto'&&!storage.getItem(PREFIX+uid()))return local();
    return cached(uid());
   }
   return fresh();
  }
  return {source,refresh:fresh,cached};
 }
 const api={create,PREFIX,OWNER,canonical,digest};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantData=api;
})(typeof window==='undefined'?globalThis:window);
