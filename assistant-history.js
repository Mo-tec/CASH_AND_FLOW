'use strict';
// Local chat archives only. Restoring history never invokes analysis or transaction saving.
(function(root){
 const PREFIX='motec-assistant-history-v1:';
 const day=value=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Dar_es_Salaam',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
 const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
 function create({storage,owner,now=()=>new Date(),id=()=>globalThis.crypto.randomUUID()}){
  if(typeof owner!=='string'||!owner)throw Error('History owner is required.');
  const key=PREFIX+encodeURIComponent(owner);let state={version:1,owner,activeId:null,sessions:[]},blocked=false;
  function load(){
   let raw;try{raw=storage.getItem(key);}catch{blocked=true;throw Error('History storage unavailable.');}
   if(raw===null)return;
   try{const data=JSON.parse(raw);if(data.version!==1||data.owner!==owner||!Array.isArray(data.sessions)||!data.sessions.every(s=>s&&typeof s.id==='string'&&typeof s.title==='string'&&validTime(s.createdAt)&&validTime(s.updatedAt)&&/^\d{4}-\d{2}-\d{2}$/.test(s.day)&&Array.isArray(s.messages)&&s.messages.every(m=>m&&typeof m.id==='string'&&['user','assistant'].includes(m.role)&&typeof m.text==='string'&&validTime(m.at)&&(!m.source||(['device','cloud','cache'].includes(m.source.origin)&&(m.source.notice===undefined||typeof m.source.notice==='string')&&(m.source.fetchedAt===undefined||validTime(m.source.fetchedAt))&&(m.source.complete===undefined||typeof m.source.complete==='boolean'))))&&new Set(s.messages.map(m=>m.id)).size===s.messages.length)||new Set(data.sessions.map(s=>s.id)).size!==data.sessions.length||(data.activeId!==null&&!data.sessions.some(s=>s.id===data.activeId)))throw Error('Invalid history.');state=data;}
   catch{blocked=true;throw Error('History is unreadable; original copy preserved.');}
  }
  function persist(){if(blocked)throw Error('History is unreadable; original copy preserved.');storage.setItem(key,JSON.stringify(state));}
  const clone=value=>JSON.parse(JSON.stringify(value));
  function active(){return clone(state.sessions.find(s=>s.id===state.activeId)||null);}
  function append({role,text,at=now().toISOString(),source}){
   if(!['user','assistant'].includes(role)||typeof text!=='string'||!validTime(at))throw Error('Invalid message.');
   let session=state.sessions.find(s=>s.id===state.activeId);
   if(!session||(role==='user'&&session.day!==day(at))){
    session={id:id(),title:role==='user'?text.replace(/\s+/g,' ').trim().slice(0,64):'Mazungumzo',createdAt:at,updatedAt:at,day:day(at),messages:[]};state.sessions.push(session);state.activeId=session.id;
   }
   const message={id:id(),role,text,at};
   if(source&&['device','cloud','cache'].includes(source.origin))message.source={origin:source.origin,...(validTime(source.fetchedAt)?{fetchedAt:source.fetchedAt}:{}),...(typeof source.notice==='string'?{notice:source.notice.slice(0,1000)}:{}),complete:source.complete===true};
   session.messages.push(message);session.updatedAt=at;persist();return clone(message);
  }
  function list(){return state.sessions.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(s=>({id:s.id,title:s.title,day:s.day,createdAt:s.createdAt,updatedAt:s.updatedAt,count:s.messages.length,active:s.id===state.activeId}));}
  function select(sessionId){if(!state.sessions.some(s=>s.id===sessionId))throw Error('History not found.');state.activeId=sessionId;persist();return active();}
  function newChat(){state.activeId=null;persist();}
  function removeActive(){state.sessions=state.sessions.filter(s=>s.id!==state.activeId);state.activeId=null;persist();}
  let loadError=null;try{load();}catch(error){loadError=error;}
  return {append,list,active,select,newChat,removeActive,key,loadError};
 }
 const api={create,PREFIX,day};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantHistory=api;
})(typeof window==='undefined'?globalThis:window);
