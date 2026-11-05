'use strict';
(()=>{
 const engine=window.MotecAssistantEngine,cloud=window.motecAssistantCloud,analysis=window.MotecAssistantAnalysis;
 const panel=document.createElement('section');panel.id='businessAssistant';panel.className='panel';
 panel.innerHTML=`<div class="assistant-heading"><div><h2>MO AI</h2><span id="assistantConnection" role="status">Inathibitisha akaunti…</span></div><div class="assistant-tools"><button id="assistantNew" type="button" aria-label="Chat mpya" title="Chat mpya"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><details id="assistantHistory"><summary aria-label="Historia ya chat" title="Historia ya chat"><svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v5l3 2"/></svg></summary><div id="assistantHistoryList" aria-label="Chat zilizohifadhiwa"></div></details><button id="assistantClear" type="button" title="Futa chat hii pekee">Futa chat</button><details id="assistantOptions"><summary aria-label="Mipangilio ya MO AI" title="Mipangilio">•••</summary><div class="assistant-options"><label for="assistantSource">Chanzo cha data<select id="assistantSource"><option value="auto">Auto — Online / Offline</option><option value="device">Kifaa hiki</option><option value="cloud">Firebase / Cache ya akaunti</option></select></label><label class="assistant-auto"><input id="assistantAuto" type="checkbox"> Auto Save</label><p>Miamala huhifadhiwa baada ya kuthibitishwa. Auto Save huanza ikiwa imezimwa.</p></div></details></div></div>
 <div id="assistantError" role="status" hidden><span id="assistantErrorText"></span><button id="assistantRecover" type="button">Jaribu tena</button></div>
 <div id="assistantMessages" role="log" aria-live="polite" aria-label="Mazungumzo na MO AI"><div id="assistantWelcome"><span>MO TEC BUSINESS</span><h3>Nikusaidie nini leo?</h3><p>Uliza kuhusu biashara yako au andika muamala.</p></div></div>
 <div id="assistantSuggestions"><button type="button" data-question="Biashara yangu iko vipi leo?">Biashara leo</button><button type="button" data-question="Mapato yangu ya wiki hii?">Mapato ya wiki</button><button type="button" data-question="Nimetumia pesa nyingi kwenye nini mwezi huu?">Matumizi makubwa</button></div>
 <div id="assistantPreview" hidden></div>
 <form id="assistantForm"><label class="assistant-sr-only" for="assistantInput">Ujumbe kwa MO AI</label><textarea id="assistantInput" rows="1" maxlength="3000" required placeholder="Uliza MO AI chochote..." enterkeyhint="send"></textarea><button id="assistantSend" type="submit" aria-label="Tuma ujumbe" title="Tuma ujumbe"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5m-6 6 6-6 6 6"/></svg><span class="assistant-spinner" aria-hidden="true"></span></button></form>
 <p id="assistantStatus" role="status" aria-live="polite"></p><p id="assistantHistoryNotice" role="status" hidden></p>`;
 document.getElementById('ux-ai').append(panel);
 const apiMode=document.createElement('label');apiMode.textContent='Njia ya kujibu';
 const modeSelect=document.createElement('select');modeSelect.id='assistantMode';modeSelect.add(new Option('MO AI · Data na miamala (ndani)','local'));modeSelect.add(new Option('Model ya API - Biashara na hali ya app','api'));apiMode.append(modeSelect);panel.querySelector('.assistant-options').prepend(apiMode);
 const apiSettings=document.createElement('button');apiSettings.type='button';apiSettings.textContent='API Configuration';apiSettings.onclick=()=>{window.moneyManagerUI?.go('more',true);const p=document.getElementById('apiConfigPanel');p.open=true;p.scrollIntoView({block:'start'});};panel.querySelector('.assistant-options').append(apiSettings);
 const clearChat=panel.querySelector('#assistantClear');panel.querySelector('.assistant-options').append(clearChat);
 const cancelApi=document.createElement('button');cancelApi.type='button';cancelApi.textContent='Sitisha jibu';cancelApi.hidden=true;cancelApi.onclick=()=>window.motecApi?.cancel();panel.querySelector('#assistantForm').after(cancelApi);
 const el=id=>document.getElementById(id);let pending=null,busy=false,generation=0,lastQuery='',recovery='retry',retrying=false;
 let identityKnown=cloud.identity?cloud.identity().ready:true,conversationUid=cloud.user();
 let chatStore=null,boundOwner=null,unboundMessages=[],historyStandalone=false;
 const en=()=>((window.motecAssistantOwner?.language(settings().lang))||settings().lang)==='en';
 const scrollChat=()=>{const log=el('assistantMessages');log.scrollTo({top:log.scrollHeight,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 const renderMessage=(text,who='assistant',source,at)=>{
  el('assistantWelcome')?.remove();el('assistantSuggestions').hidden=true;
  const node=document.createElement('div');node.className='assistant-message '+who;if(at){node.dataset.time=new Date(at).toLocaleTimeString(en()?'en-GB':'sw-TZ',{timeZone:'Africa/Dar_es_Salaam',hour:'2-digit',minute:'2-digit'});node.title=new Date(at).toLocaleString('sw-TZ',{timeZone:'Africa/Dar_es_Salaam'});}
  const body=document.createElement('div');body.textContent=text.replace(/Tofauti ya mapato na matumizi/g,'Tofauti ya fedha');node.append(body);
  if(source){const meta=document.createElement('small');meta.textContent=source.origin==='device'?(en()?'Device records':'Data za kifaa'):source.origin==='cloud'?'Firebase':(en()?'Offline snapshot':'Nakala ya offline');if(source.origin==='cache')meta.textContent+=en()?' ? may be out of date':' ? huenda si ya sasa';if(source.notice?.includes('storage failed'))meta.textContent+=en()?' ? offline copy unavailable':' ? haijahifadhiwa offline';meta.title=(source.notice||'')+(source.fetchedAt?' · '+new Date(source.fetchedAt).toLocaleString('sw-TZ',{timeZone:'Africa/Dar_es_Salaam'}):'');node.append(meta);}
  el('assistantMessages').append(node);scrollChat();
 };
 const say=(text,who='assistant',source)=>{const at=new Date().toISOString(),active=chatStore?.active();if(who==='user'&&active&&active.day!==engine.day(at)){try{chatStore.newChat();}catch{historyNotice(en()?'History could not be saved.':'Historia haijahifadhiwa.');}el('assistantMessages').replaceChildren();}renderMessage(text,who,source,at);rememberMessage({role:who,text,at,source});};
 function updateConnection(){if(!identityKnown&&cloud.identity?.().ready){identityKnown=true;conversationUid=cloud.user();}const loading=cloud.identity&&!cloud.identity().ready;el('assistantConnection').textContent=loading?(en()?'Verifying account…':'Inathibitisha akaunti…'):navigator.onLine?(cloud.user()?'Online':en()?'Device mode':'Kifaa hiki'):'Offline';el('assistantConnection').dataset.online=String(navigator.onLine);bindHistory();}
 const state=value=>{busy=value;el('assistantNew').disabled=value;el('assistantHistoryList').querySelectorAll('button').forEach(b=>b.disabled=value);panel.setAttribute('aria-busy',String(value));el('assistantSend').disabled=value;el('assistantClear').disabled=value;el('assistantRecover').disabled=value;el('assistantStatus').textContent=value?(en()?'MO AI is thinking…':'MO AI inachakata…'):'';el('assistantPreview').querySelectorAll('button').forEach(b=>b.disabled=value);};
 function clear(){pending=null;el('assistantPreview').replaceChildren();el('assistantPreview').hidden=true;}
 function deviceSource(){
  if(businessLoadFailed||storageLoadFailed||ordersLoadFailed)throw Object.assign(Error('Device data could not be loaded.'),{code:'data/invalid'});
  const data=dataset();if(!Array.isArray(data.records)||!data.records.every(validRecord))throw Object.assign(Error('Invalid device transactions.'),{code:'data/invalid'});
  return {raw:JSON.parse(JSON.stringify({...data,settings:{...settings(),categories:getCategories()}}))};
 }
 const reader=window.MotecAssistantData.create({storage:localStorage,cloud,device:deviceSource,online:()=>navigator.onLine,validRecord});

 function historyNotice(message){el('assistantHistoryNotice').textContent=message;el('assistantHistoryNotice').hidden=!message;}
 function historyOwner(){
  if(cloud.identity&&!cloud.identity().ready&&!historyStandalone)return null;
  if(cloud.user())return 'uid:'+cloud.user();
  try{if(JSON.parse(localStorage.getItem('motec-cloud-sync-v1')||'null')?.uid||JSON.parse(localStorage.getItem('motec-assistant-device-owner-v1')||'null')?.uid)return null;}catch{return null;}
  return 'device';
 }
 function renderActiveHistory(reset=true){
  if(reset){clear();clearError();lastQuery='';el('assistantInput').value='';resizeInput();el('assistantAuto').checked=false;}el('assistantMessages').replaceChildren();
  const active=chatStore?.active();for(const message of active?.messages||[])renderMessage(message.text,message.role,message.source,message.at);
  el('assistantSuggestions').hidden=!!active?.messages.length;scrollChat();
 }
 function historyGroup(date){
  const today=engine.day(new Date()),previous=new Date(Date.parse(today+'T12:00:00Z')-86400000).toISOString().slice(0,10),week=new Date(Date.parse(today+'T12:00:00Z')-6*86400000).toISOString().slice(0,10);
  if(date===today)return en()?'Today':'Leo';if(date===previous)return en()?'Yesterday':'Jana';if(date>=week&&date<=today)return en()?'Previous 7 days':'Siku 7 zilizopita';
  return new Date(date+'T12:00:00+03:00').toLocaleDateString(en()?'en-GB':'sw-TZ',{timeZone:'Africa/Dar_es_Salaam',month:'long',year:'numeric'});
 }
 function renderHistoryList(){
  const list=el('assistantHistoryList');list.replaceChildren();
  const sessions=chatStore?.list()||[];
  if(!sessions.length){const empty=document.createElement('p');empty.textContent=historyOwner()?(en()?'No saved chats yet.':'Bado hakuna chat zilizohifadhiwa.'):(en()?'Sign in to view your chats.':'Ingia ili kuona chat zako.');list.append(empty);return;}
  let group='';
  for(const session of sessions){
   const label=historyGroup(session.day);if(label!==group){const heading=document.createElement('h3');heading.textContent=label;list.append(heading);group=label;}
   const button=document.createElement('button');button.type='button';button.className='assistant-history-item';button.dataset.historyId=session.id;button.disabled=busy;button.setAttribute('aria-current',session.active?'true':'false');
   const title=document.createElement('span');title.textContent=session.title;const when=document.createElement('small');when.textContent=new Date(session.createdAt).toLocaleString(en()?'en-GB':'sw-TZ',{timeZone:'Africa/Dar_es_Salaam',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});button.append(title,when);
   button.onclick=()=>{if(busy)return;if(historyOwner()!==boundOwner){bindHistory();return;}try{chatStore.select(session.id);historyNotice('');}catch{historyNotice(en()?'History could not be saved on this device.':'Historia haijahifadhiwa kwenye kifaa.');}renderActiveHistory();renderHistoryList();el('assistantHistory').open=false;};
   list.append(button);
  }
 }
 function bindHistory(){
  const owner=historyOwner();if(owner===boundOwner&&chatStore)return;
  const previous=boundOwner;boundOwner=owner;chatStore=null;
  if(!owner){if(previous)el('assistantMessages').replaceChildren();renderHistoryList();return;}
  chatStore=window.MotecAssistantHistory.create({storage:localStorage,owner});
  if(chatStore.loadError)historyNotice(en()?'Saved history could not be read. The original copy is preserved.':'Historia haisomeki. Nakala iliyopo imehifadhiwa bila kubadilishwa.');
  const queued=unboundMessages.filter(m=>m.generation===generation);unboundMessages=[];
  for(const message of queued){try{chatStore.append(message);}catch{historyNotice(en()?'History could not be saved. Check device storage.':'Historia haijahifadhiwa. Angalia nafasi ya kifaa.');}}
  renderActiveHistory(false);renderHistoryList();
 }
 function rememberMessage(message){
  const owner=historyOwner();
  if(!owner||owner!==boundOwner||!chatStore){unboundMessages.push({...message,generation});if(owner)bindHistory();else historyNotice(en()?'Chat history will save after account verification.':'Historia itahifadhiwa baada ya kuthibitisha akaunti.');return;}
  try{chatStore.append(message);historyNotice('');}catch{historyNotice(en()?'History could not be saved. Check device storage.':'Historia haijahifadhiwa. Angalia nafasi ya kifaa.');}
  renderHistoryList();
 }
 function startNewChat(){
  if(busy)return;bindHistory();
  try{chatStore?.newChat();historyNotice('');}catch{historyNotice(en()?'History could not be saved on this device.':'Historia haijahifadhiwa kwenye kifaa.');}
  unboundMessages=[];generation++;clear();clearError();lastQuery='';el('assistantMessages').replaceChildren();el('assistantSuggestions').hidden=false;el('assistantInput').value='';resizeInput();renderHistoryList();el('assistantHistory').open=false;el('assistantInput').focus();
 }
 el('assistantNew').onclick=startNewChat;
 el('assistantHistory').addEventListener('toggle',()=>{if(el('assistantHistory').open){el('assistantOptions').open=false;bindHistory();renderHistoryList();}});
 el('assistantHistory').querySelector('summary').addEventListener('click',event=>{if(busy)event.preventDefault();});
 el('assistantOptions').addEventListener('toggle',()=>{if(el('assistantOptions').open)el('assistantHistory').open=false;});

 function dashboardContext(){return {dashboard:{mode:el('period').value,start:el('dateFrom').value,end:el('dateTo').value,summaryStart:settings().summaryStart}};}
 function clearError(){el('assistantError').hidden=true;}
 function reportError(error){
  if(error.code==='api/error'){el('assistantErrorText').textContent=error.message;el('assistantRecover').textContent=en()?'Retry':'Jaribu tena';recovery='retry';el('assistantError').hidden=false;return;}
  const code=error.code||'',message=String(error.message||'');let text=en()?'Unable to read the data. Check your connection and retry.':'Data hazijapatikana. Angalia mtandao kisha jaribu tena.';recovery='retry';
  if(code==='auth/required'||/Sign in|Ingia.*kwanza/.test(message)){text=en()?'Sign in to the account that owns these records.':'Ingia kwenye akaunti inayomiliki data hizi.';recovery='signin';}
  else if(code==='auth/pending'){text=en()?'Account verification is still loading. Please retry shortly.':'Akaunti bado inathibitishwa. Jaribu tena baada ya muda mfupi.';}
  else if(code==='device/unverified'){text=en()?'Device records are not verified. Use Firebase or synchronize your account.':'Data za kifaa hazijathibitishwa. Tumia Firebase au sawazisha akaunti yako.';recovery='cloud';}
  else if(code==='auth/changed'){text=en()?'Account changed. Please send your question again.':'Akaunti imebadilika. Tuma swali tena.';}
  else if(code==='data/invalid'||code==='cache/invalid'){text=en()?'This copy could not be verified. Connect and read Firebase.':'Nakala hii haijathibitishwa. Unganisha mtandao kisha soma Firebase.';recovery='cloud';}
  else if(code==='cache/missing'){text=en()?'No offline copy for this account. Connect to load Firebase.':'Hakuna nakala ya offline ya akaunti hii. Unganisha mtandao usome Firebase.';recovery='cloud';}
  else if(/duplicate|tayari upo|imejirudia/i.test(message)){text=en()?'This transaction already exists. Review your records.':'Muamala huu tayari upo. Kagua rekodi zako.';}
  else if(/category|Taja mapato|kiasi|amount|kipengele/.test(message)){text=en()?'Check the category, amount and income/expense type before saving.':'Taja category halisi, kiasi sahihi na aina: mapato au matumizi.';}
  else if(/date|tarehe|period|kipindi|numeric/i.test(message)){text=en()?'Specify the period or full dates, for example 2026-11-01 to 2026-11-04.':'Taja kipindi au tarehe kamili, mfano 2026-11-01 hadi 2026-11-04.';}
  el('assistantErrorText').textContent=text;el('assistantRecover').textContent=recovery==='signin'?(en()?'Sign in':'Ingia Firebase'):recovery==='cloud'?(en()?'Use Firebase':'Tumia Firebase'):(en()?'Retry':'Jaribu tena');el('assistantError').hidden=false;
 }
 function resizeInput(){const field=el('assistantInput');field.style.height='auto';field.style.height=Math.min(field.scrollHeight,132)+'px';}
 el('assistantInput').addEventListener('input',resizeInput);
 el('assistantInput').addEventListener('keydown',event=>{if(event.key!=='Enter'||event.shiftKey||event.isComposing||event.keyCode===229)return;const desktop=matchMedia('(pointer:fine)').matches;if(desktop||!matchMedia('(pointer:coarse)').matches){event.preventDefault();if(!busy)el('assistantForm').requestSubmit();}});
 function sizeChat(){
  const height=window.visualViewport?.height||window.innerHeight,offset=window.visualViewport?.offsetTop||0;
  panel.style.setProperty('--assistant-viewport',Math.round(height)+'px');
  if(panel.getClientRects().length){const top=Math.max(12,panel.getBoundingClientRect().top-offset),nav=el('uxNav')?.offsetHeight||80;panel.style.height=Math.max(180,height-top-nav-14)+'px';}
  if(document.activeElement===el('assistantInput')&&matchMedia('(max-width:600px)').matches)requestAnimationFrame(()=>{const bottom=offset+height-(el('uxNav')?.offsetHeight||80)-12,send=el('assistantSend').getBoundingClientRect();if(send.bottom>bottom)window.scrollBy({top:send.bottom-bottom,behavior:'auto'});});
 }

 window.visualViewport?.addEventListener('resize',sizeChat);window.addEventListener('resize',sizeChat);
 el('assistantInput').addEventListener('focus',()=>{if(matchMedia('(max-width:600px)').matches)panel.scrollIntoView({block:'start',behavior:'auto'});sizeChat();});
 el('assistantClear').onclick=()=>{if(busy)return;bindHistory();try{chatStore?.removeActive();historyNotice('');}catch{historyNotice(en()?'History could not be removed from storage.':'Historia haijaweza kufutwa kwenye hifadhi.');}unboundMessages=[];renderHistoryList();clear();clearError();lastQuery='';el('assistantMessages').replaceChildren();el('assistantSuggestions').hidden=false;el('assistantInput').value='';resizeInput();el('assistantStatus').textContent=en()?'Chat cleared.':'Chat imefutwa.';el('assistantInput').focus();};
 el('assistantRecover').onclick=()=>{if(busy)return;if(recovery==='signin'){window.moneyManagerUI?.go('more',true);const cloudPanel=el('cloudPanel');if(cloudPanel){cloudPanel.open=true;cloudPanel.scrollIntoView({block:'start'});el('cloudEmail')?.focus();}return;}if(recovery==='cloud')el('assistantSource').value='cloud';if(lastQuery){retrying=true;el('assistantInput').value=lastQuery;el('assistantForm').requestSubmit();}};
 const help='Uliza mapato, matumizi, salio, categories, mwenendo au afya ya biashara. Taja leo, wiki, mwezi, mwaka au tarehe kamili. Kuongeza muamala: Hifadhi mapato CATEGORY 30000. Auto hutumia Firebase online na nakala ya akaunti offline.';
 async function save(){if(!pending)return;const draft=pending,token=generation;const result=await cloud.save(draft.entries,draft.uid);if(token!==generation)return;clear();say(result.cloud?(en()?'Transactions saved to Firebase.':'Miamala imehifadhiwa Firebase.'):(en()?'Saved on this device; Firebase confirmation is pending. Do not enter again.':'Imehifadhiwa kwenye kifaa; Firebase bado haijathibitisha. Usiingize tena.'));}
 function preview(){const box=el('assistantPreview');box.hidden=false;box.replaceChildren();const pre=document.createElement('pre');const sums=pending.entries.reduce((s,r)=>(s[r.type]+=r.amount,s),{income:0,expense:0});pre.textContent=pending.entries.map(r=>engine.day(r.date)+' · '+r.category+' · '+r.type+' · TSh '+r.amount.toLocaleString('en-US')).join('\n')+`\nMapato: TSh ${sums.income.toLocaleString('en-US')}\nMatumizi: TSh ${sums.expense.toLocaleString('en-US')}\nTofauti: TSh ${(sums.income-sums.expense).toLocaleString('en-US')}`;box.append(pre);
  const button=document.createElement('button');button.type='button';button.className='primary';button.textContent=en()?'Confirm save':'Thibitisha hifadhi';button.onclick=async()=>{if(busy)return;state(true);clearError();try{await save();}catch(e){reportError(e);}finally{state(false);}};box.append(button);const cancel=document.createElement('button');cancel.type='button';cancel.className='secondary';cancel.textContent=en()?'Cancel':'Ghairi';cancel.onclick=clear;box.append(cancel);scrollChat();
 }
 el('assistantForm').onsubmit=async event=>{event.preventDefault();if(busy)return;const text=el('assistantInput').value.trim();if(!text)return;clear();clearError();lastQuery=text;if(!retrying)say(text,'user');retrying=false;el('assistantInput').value='';resizeInput();state(true);const token=generation;
  try{
   const systemQuestion=window.MotecAssistantKnowledge?.recognize(text);
   if(el('assistantMode')?.value==='api'){
    if(!window.motecApi?.enabled())throw Object.assign(Error('Fungua API Configuration, ingia na uchague config inayotumika kwanza.'),{code:'api/error'});
    cancelApi.hidden=false;const selectedUser=cloud.user();let draft=null;
    try{const reply=await window.motecApi.answer(text,partial=>{if(token!==generation||cloud.user()!==selectedUser)return;if(!draft){draft=document.createElement('div');draft.className='assistant-message assistant';el('assistantMessages').append(draft);}draft.textContent=partial;scrollChat();},await window.motecBusinessContext.build(text,cloud));draft?.remove();if(token===generation&&cloud.user()===selectedUser)say(reply);}
    finally{draft?.remove();cancelApi.hidden=true;}
    return;
   }

   const learnedEngine=window.MotecAssistantLearnedKnowledge;
   if(learnedEngine&&!learnedEngine.protect(text,analysis.recognize(text,getCategories()),systemQuestion)){
    const learned=window.motecAssistantOwner?.learnedAnswer(text);
    if(learned?.status==='match'){say((en()?'From your saved knowledge:\n':'Kwa maarifa uliyohifadhi:\n')+learned.text);return;}
    if(learned?.status==='clarify'){if(learned.conflict){say(en()?'Your saved knowledge contains conflicting answers for this topic. Review My Knowledge.':'Maarifa uliyohifadhi yana majibu yanayokinzana kwa mada hii. Kagua Maarifa yangu.');return;}say((en()?'Which saved topic do you mean?\n':'Unamaanisha mada ipi kati ya hizi?\n')+learned.titles.map(title=>'• '+title).join('\n'));return;}
   }

   if(systemQuestion){
    const language=window.motecAssistantOwner?.language(systemQuestion.lang||settings().lang)||systemQuestion.lang||settings().lang;
    if(systemQuestion.needsData){
     const source=await reader.source(el('assistantSource').value);if(token!==generation||(source.uid&&source.uid!==cloud.user()))throw Object.assign(Error('Account changed.'),{code:'auth/changed'});
     say(window.MotecAssistantKnowledge.answer(systemQuestion,{lang:language,source}),'assistant',source);
    }else say(window.MotecAssistantKnowledge.answer(systemQuestion,{lang:language,isAvailable:feature=>!!document.querySelector(feature.uiSelector)}));
    return;
   }
   let recognized=analysis.recognize(text,getCategories()),kind=recognized.intent;if(kind==='greeting'){say(window.motecAssistantOwner?.greeting()||'Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo?');return;}if(kind==='help'){say(help);return;}const needsCategoryData=kind==='clarify'&&/Which saved category/.test(recognized.reason||'');if((kind==='clarify'||recognized.confidence<.7)&&!needsCategoryData){say(recognized.reason||'Fafanua swali. Unahitaji mapato, matumizi au salio?');return;}
   if(kind==='create'){
    if(cloud.ready)await cloud.ready();
    const source=await cloud.source();if(token!==generation||source.uid!==cloud.user())throw Object.assign(Error('Account changed.'),{code:'auth/changed'});
    const data=normalizeBackup(source.raw);
    const categories=source.raw.settings?.categories||getCategories();const entries=engine.parse(text,categories,data.records);
    if(entries.some(r=>data.records.some(old=>engine.key(old)===engine.key(r))))throw Error('Duplicate transaction.');
    pending={entries,uid:source.uid};preview();if(el('assistantAuto').checked&&!window.motecAssistantOwner?.requirePreview())await save();else say(en()?'Review the preview, then confirm.':'Kagua preview kisha thibitisha hifadhi.');
   }else{
    const source=await reader.source(el('assistantSource').value);if(token!==generation||(source.uid&&source.uid!==cloud.user()))throw Object.assign(Error('Account changed.'),{code:'auth/changed'});
    recognized=analysis.recognize(text,source.raw.settings.categories);if(recognized.intent==='clarify'||recognized.confidence<.7){say(recognized.reason||'Fafanua swali.');return;}
    const range=analysis.period(text,new Date(),{...dashboardContext(),category:recognized.entities.category}),reply=analysis.answer(recognized,source.raw.records,range,window.motecAssistantOwner?.language(settings().lang)||settings().lang);
    say(window.motecAssistantOwner?.format(reply.text)||reply.text,'assistant',source);
   }
  }catch(error){if(token===generation)reportError(error);}
  finally{state(false);updateConnection();}
 };
 panel.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>{el('assistantInput').value=b.dataset.question;el('assistantForm').requestSubmit();});
 window.addEventListener('motec:cloud-user-changed',()=>{const next=cloud.user();if(!identityKnown){identityKnown=true;conversationUid=next;updateConnection();return;}if(next!==conversationUid){generation++;unboundMessages=[];clear();clearError();lastQuery='';el('assistantMessages').replaceChildren();el('assistantAuto').checked=false;}conversationUid=next;updateConnection();});
 let refreshing=false;
 async function refreshCache(){updateConnection();if(refreshing||!navigator.onLine||!cloud.user())return;refreshing=true;try{await reader.refresh();}catch{/* Reading failures are shown once when the user requests data. */}finally{refreshing=false;updateConnection();}}
 window.addEventListener('online',refreshCache);window.addEventListener('offline',updateConnection);window.addEventListener('motec:cloud-ready',refreshCache);
 el('assistantSource').addEventListener('change',()=>{clearError();updateConnection();});
 new MutationObserver(()=>requestAnimationFrame(sizeChat)).observe(el('ux-ai'),{attributes:true,attributeFilter:['hidden']});
 sizeChat();updateConnection();refreshCache();
 Promise.resolve().then(()=>cloud.ready?.()).then(()=>bindHistory()).catch(()=>{if(!cloud.user()){historyStandalone=true;bindHistory();}});
})();
