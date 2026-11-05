'use strict';
(()=>{
 const P=window.MotecAssistantPolicy,cloud=window.motecAssistantCloud,panel=document.getElementById('businessAssistant');
 const dialog=document.createElement('dialog');dialog.id='assistantOwnerDialog';dialog.setAttribute('aria-label','Maelekezo ya Mmiliki wa MO AI');document.body.append(dialog);
 let preferences=P.defaults(),scopeKey=null,vault=null,opening=false,epoch=0,timer=null,standalone=false,taps=0,lastTap=0,unlockedOwner=null;
 const el=id=>document.getElementById(id);
 function scope(){
  if(cloud.identity&&!cloud.identity().ready&&!standalone)return null;
  if(cloud.user())return 'uid:'+cloud.user();
  try{if(JSON.parse(localStorage.getItem('motec-cloud-sync-v1')||'null')?.uid||JSON.parse(localStorage.getItem('motec-assistant-device-owner-v1')||'null')?.uid)return null;}catch{return null;}
  return 'device';
 }
 function makeVault(owner){return P.create({storage:localStorage,owner,isCurrent:()=>scope()===owner});}
 function apply(){const owner=scope();scopeKey=owner;preferences=P.defaults();if(owner){try{preferences=makeVault(owner).preferences();}catch{/* Never run malformed preferences. */}}const auto=el('assistantAuto');auto.disabled=preferences.requirePreview;if(preferences.requirePreview)auto.checked=false;window.dispatchEvent(new Event('motec:owner-policy-changed'));}
 function close(){unlockedOwner=null;epoch++;clearTimeout(timer);vault?.lock();vault=null;if(dialog.open)dialog.close();dialog.replaceChildren();}
 function shell(title){dialog.innerHTML='<div class="assistant-owner-heading"><h2></h2><button type="button" id="ownerClose" aria-label="Funga">×</button></div><div id="ownerBody"></div><p id="ownerStatus" role="status"></p>';dialog.querySelector('h2').textContent=title;el('ownerClose').onclick=close;}
 function status(text){if(el('ownerStatus'))el('ownerStatus').textContent=text;}
 function priorLock(){const dev=localStorage.getItem('motec-developer-lock-v1');if(dev){const c=JSON.parse(dev);if(typeof c.salt!=='string'||typeof c.hash!=='string')throw Error('Kufuli ya Developer haisomeki.');return {...c,label:'Password ya Developer'};}const config=authConfig();return config?.type==='pin'?{...config,label:'PIN/password ya app'}:null;}
 async function existingOwner(password,lock){if(!lock)return;if(await secretDigest(password,fromBase64Url(lock.salt))!==lock.hash){vault.failed();throw Error('Uthibitisho wa mmiliki si sahihi.');}}

 function knowledgeStore(owner,editable=false){
  return window.MotecAssistantLearnedKnowledge.create({storage:localStorage,owner,isCurrent:()=>scope()===owner,canEdit:()=>editable&&!!vault&&unlockedOwner===owner});
 }
 function addKnowledgeEditor(){
  const owner=scope(),original=Array.from(el('ownerBody').childNodes),promptView=document.createElement('div'),knowledgeView=document.createElement('section'),tabs=document.createElement('div');
  promptView.id='ownerPromptView';knowledgeView.id='ownerKnowledgeView';knowledgeView.hidden=true;tabs.className='owner-tabs';tabs.setAttribute('role','tablist');
  const promptTab=document.createElement('button'),knowledgeTab=document.createElement('button');promptTab.type=knowledgeTab.type='button';promptTab.id='ownerPromptTab';knowledgeTab.id='ownerKnowledgeTab';promptTab.textContent='Maelekezo';knowledgeTab.textContent='Maarifa yangu';promptTab.setAttribute('role','tab');knowledgeTab.setAttribute('role','tab');
  function select(learn){promptView.hidden=learn;knowledgeView.hidden=!learn;promptTab.setAttribute('aria-selected',String(!learn));knowledgeTab.setAttribute('aria-selected',String(learn));}
  promptTab.onclick=()=>select(false);knowledgeTab.onclick=()=>select(true);tabs.append(promptTab,knowledgeTab);
  for(const node of original)promptView.append(node);el('ownerBody').replaceChildren(tabs,promptView,knowledgeView);select(false);
  knowledgeView.innerHTML='<form id="ownerKnowledgeForm"><label for="ownerKnowledge">Taarifa au maswali na majibu ambayo MO AI atumie</label><textarea id="ownerKnowledge" rows="9" maxlength="30000" placeholder="Swali: Mnafungua saa ngapi?&#10;Jibu: Tunafungua saa 2 asubuhi.&#10;&#10;Swali: Bei ya huduma fulani ni kiasi gani?&#10;Jibu: Andika bei yako halisi hapa."></textarea><p class="note">Andika kwa maneno yako; tenga mada kwa mstari wazi. Muundo wa Swali/Jibu husaidia kupata jibu sahihi. Majibu hutoka kwenye maandishi haya, si kutengeneza data mpya.</p><p class="note">Maarifa haya yatatumika kwenye chat ya akaunti hii na yanahifadhiwa kwenye browser hii kama taarifa za kujibu. Hayana usiri sawa na prompt iliyosimbwa: usiweke passwords, API keys au taarifa usizotaka zionekane kwenye majibu. Hayabadilishi hesabu, permissions au uwezo wa kuendesha commands.</p><p id="ownerKnowledgeCount" role="status"></p><button class="primary" id="ownerKnowledgeSave" type="submit">Hifadhi na tumia maarifa</button></form>';
  const store=knowledgeStore(owner,true);try{el('ownerKnowledge').value=store.read().text;}catch{status('Maarifa yaliyohifadhiwa hayasomeki; nakala ya awali haijabadilishwa.');el('ownerKnowledgeSave').disabled=true;return;}
  function preview(){try{const entries=window.MotecAssistantLearnedKnowledge.parse(el('ownerKnowledge').value);el('ownerKnowledgeCount').textContent='Mada zinazotambulika: '+entries.length;el('ownerKnowledgeSave').disabled=false;el('ownerKnowledgeSave').textContent='Hifadhi na tumia maarifa';}catch(error){el('ownerKnowledgeCount').textContent=error.message;el('ownerKnowledgeSave').disabled=true;}}
  el('ownerKnowledge').addEventListener('input',preview);preview();const token=epoch;
  el('ownerKnowledgeForm').onsubmit=event=>{event.preventDefault();if(token!==epoch)return;try{const saved=store.save(el('ownerKnowledge').value);el('ownerKnowledgeSave').textContent='Maarifa yamehifadhiwa';status('Mada '+saved.count+' zimehifadhiwa. MO AI sasa anaweza kuzipata bila kubadilisha code.');}catch(error){status(error.message);}};
 }
 function apiPrompt(){
  const owner=scope();if(!owner)return '';
  const value=localStorage.getItem('motec-api-instructions-v1:'+owner)||'';
  if(value.length>12000)throw Error('Prompt ya API imezidi herufi 12000.');return value;
 }
 function addApiPromptEditor(){
  const owner=scope(),token=epoch,view=document.createElement('section'),tab=document.createElement('button');
  view.id='ownerApiPromptView';view.hidden=true;tab.type='button';tab.id='ownerApiPromptTab';tab.textContent='Prompt ya API';tab.setAttribute('role','tab');tab.setAttribute('aria-selected','false');
  view.innerHTML='<form id="ownerApiPromptForm"><label for="ownerApiPrompt">Maelekezo yako kwa Model ya API</label><textarea id="ownerApiPrompt" rows="16" maxlength="12000" spellcheck="false"></textarea><p class="note">Bandika prompt yako hapa. Itatumwa kwa OpenRouter/Gemini pamoja na kila swali la API. Hii ni prompt ya kushirikisha model, tofauti na maelekezo ya siri yaliyosimbwa. Usiiwekee passwords au API keys. Huhifadhiwa kwenye browser hii kwa akaunti hii, bila usimbaji, na haisawazishwi kwenye vifaa vingine.</p><p class="note">Huongoza lugha, mtindo na uchambuzi; haiongezi data ambayo haijatumwa, internet tools, uwezo wa offline wa model, au ruhusa ya kubadilisha miamala. Prompt tupu hutumia mwongozo wa kawaida.</p><button class="primary" type="submit">Hifadhi prompt ya API</button><button class="secondary" id="ownerApiPromptLock" type="button">Funga sehemu hii</button><p id="ownerApiPromptStatus" role="status"></p></form>';
  el('ownerBody').append(view);const tabs=el('ownerBody').querySelector('.owner-tabs');tabs.append(tab);
  const otherTabs=[el('ownerPromptTab'),el('ownerKnowledgeTab')];for(const other of otherTabs)other.addEventListener('click',()=>{view.hidden=true;tab.setAttribute('aria-selected','false');});
  tab.onclick=()=>{el('ownerPromptView').hidden=true;el('ownerKnowledgeView').hidden=true;for(const other of otherTabs)other.setAttribute('aria-selected','false');view.hidden=false;tab.setAttribute('aria-selected','true');};
  try{el('ownerApiPrompt').value=apiPrompt();}catch(error){el('ownerApiPromptStatus').textContent=error.message;}
  el('ownerApiPromptLock').onclick=close;
  el('ownerApiPromptForm').onsubmit=event=>{event.preventDefault();if(token!==epoch||scope()!==owner||unlockedOwner!==owner||!vault)return;try{const text=el('ownerApiPrompt').value.trim();if(text.length>12000)throw Error('Kikomo ni herufi 12000.');localStorage.setItem('motec-api-instructions-v1:'+owner,text);el('ownerApiPromptStatus').textContent='Prompt imehifadhiwa. Itatumika kuanzia swali linalofuata la API.';}catch(error){el('ownerApiPromptStatus').textContent=error.message;}};
 }
 function learnedAnswer(text){
  const owner=scope();if(!owner)return null;
  try{return knowledgeStore(owner).search(text);}catch{return {status:'unavailable'};}
 }

 function showEditor(prompt){
  shell('Maelekezo ya Mmiliki wa MO AI');
  el('ownerBody').innerHTML='<form id="ownerInstructionsForm"><label for="ownerPrompt">Mwongozo wako wa kudumu</label><textarea id="ownerPrompt" rows="9" maxlength="12000" spellcheck="false" autocomplete="off"></textarea><p class="note">Maelekezo yanayotumika sasa: lugha, ufupi wa majibu, salamu na preview. Maelekezo mengine hutunzwa lakini hayatekelezwi kiotomatiki. Prompt haiwezi kufuta data, kupita validation au kufungua akaunti nyingine.</p><details><summary>Mfano wa prompt</summary><pre>Lugha: sw\nMajibu: mafupi\nSalamu: Karibu MO TEC BUSINESS. Nikusaidie nini leo?\nPreview: lazima</pre></details><div id="ownerApplied"></div><div class="actions"><button class="primary" type="submit">Hifadhi maelekezo</button><button class="secondary" id="ownerLock" type="button">Funga sehemu hii</button></div></form><p class="note">Hifadhi hii ni ya kifaa/browser hii. Prompt imesimbwa kwa password; si ruhusa ya seva. Mipangilio inayotekelezwa inaweza kuonekana kwenye code ya kifaa. Usitumie prompt kuhifadhi API keys au passwords nyingine.</p>';
  el('ownerPrompt').value=prompt;
  if(window.MotecAssistantKnowledge){const map=document.createElement('details'),heading=document.createElement('summary'),content=document.createElement('pre');heading.textContent='Ramani ya mfumo ambayo MO AI inafahamu';content.textContent=window.MotecAssistantKnowledge.context('sw');map.append(heading,content);el('ownerApplied').before(map);}
el('ownerLock').onclick=close;
  function preview(){try{const compiled=P.compile(el('ownerPrompt').value),box=el('ownerApplied');box.replaceChildren();for(const item of compiled.applied){const line=document.createElement('p');line.textContent=item;box.append(line);}if(compiled.unsupported.length){const line=document.createElement('p');line.className='warning';line.textContent='Maelekezo '+compiled.unsupported.length+' hayajatafsiriwa na engine ya sasa; hayatatekelezwa kiotomatiki.';box.append(line);}}catch(error){status(error.message);}}
  el('ownerPrompt').addEventListener('input',()=>{el('ownerInstructionsForm').querySelector('[type=submit]').textContent='Hifadhi maelekezo';preview();});preview();
  addKnowledgeEditor();addApiPromptEditor();
  const token=epoch;timer=setTimeout(close,300000);
  el('ownerInstructionsForm').onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector('[type=submit]');button.disabled=true;try{await vault.save(el('ownerPrompt').value);if(epoch!==token)return;apply();preview();button.textContent='Imehifadhiwa';status('Maelekezo yamehifadhiwa. Mipangilio inayotambuliwa inaanza kutumika sasa.');}catch(error){if(epoch===token)status(error.message);}finally{button.disabled=false;}};
 }
 async function open(){
  if(opening||panel.getAttribute('aria-busy')==='true')return;opening=true;const token=epoch;
  try{
   try{await cloud.ready?.();}catch(error){if(cloud.user())throw error;standalone=true;}
   const owner=scope();if(!owner)throw Error('Ingia kwenye akaunti yako kwanza ili kufungua maelekezo yake.');
   if(epoch!==token)return;vault=makeVault(owner);const exists=vault.exists(),prior=exists?null:priorLock();
   shell(exists?'Mmiliki: ingia':'Mmiliki: weka password');
   el('ownerBody').innerHTML='<form id="ownerLogin">'+(!exists&&prior?'<label>'+prior.label+'<input name="existing" type="password" autocomplete="off" required></label>':'')+'<label>Password ya maelekezo<input name="password" type="password" minlength="8" maxlength="256" autocomplete="'+(exists?'current-password':'new-password')+'" required></label>'+(!exists?'<label>Rudia password<input name="repeat" type="password" minlength="8" maxlength="256" autocomplete="new-password" required></label><p class="note">Weka password yako kabla ya kushirikisha kifaa. Ukiisahau, prompt iliyosimbwa haiwezi kufunguliwa bila password hiyo. Hii hailindi ruhusa za Firebase.</p>':'')+'<button class="primary" type="submit">'+(exists?'Fungua maelekezo':'Weka password')+'</button></form>';
   if(!dialog.open)dialog.showModal();
   const loginEpoch=epoch;
   el('ownerLogin').onsubmit=async event=>{event.preventDefault();const button=event.target.querySelector('button');button.disabled=true;try{
    const form=new FormData(event.target),password=form.get('password');vault.check();if(!exists){if(password!==form.get('repeat'))throw Error('Password hazifanani.');await existingOwner(form.get('existing'),prior);}
    const result=exists?await vault.unlock(password):await vault.initialize(password,'');
    event.target.reset();if(epoch!==loginEpoch)return;unlockedOwner=owner;showEditor(result.prompt);
   }catch(error){if(epoch===loginEpoch)status(error.message);}finally{button.disabled=false;}};
  }catch(error){if(epoch===token){shell('Maelekezo ya Mmiliki');status(error.message==='Authentication is still loading.'?'Akaunti bado inathibitishwa. Jaribu tena baada ya muda mfupi.':error.message);if(!dialog.open)dialog.showModal();}}
  finally{opening=false;}
 }
 const heading=panel.querySelector('.assistant-heading h2');heading.tabIndex=0;heading.setAttribute('role','button');heading.setAttribute('aria-label','Maelekezo ya Mmiliki: gusa mara tano au tumia Enter');heading.addEventListener('click',()=>{const now=Date.now();taps=now-lastTap<1500?taps+1:1;lastTap=now;if(taps===5){taps=0;open();}});heading.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}});
 dialog.addEventListener('input',()=>{if(vault&&unlockedOwner){clearTimeout(timer);timer=setTimeout(close,300000);}});
 dialog.addEventListener('pointerdown',()=>{if(vault&&unlockedOwner){clearTimeout(timer);timer=setTimeout(close,300000);}});
 dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('close',()=>{if(dialog.childElementCount)close();});
 window.addEventListener('motec:cloud-user-changed',()=>{if(dialog.open||vault)close();apply();});window.addEventListener('motec:cloud-ready',apply);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)close();});
 el('lockAppBtn')?.addEventListener('click',close);new MutationObserver(()=>{if(el('appShell').hidden)close();}).observe(el('appShell'),{attributes:true,attributeFilter:['hidden']});
 window.motecAssistantOwner={learnedAnswer,apiPrompt,language:fallback=>{if(scope()!==scopeKey)apply();return preferences.language==='auto'?fallback:preferences.language;},greeting:()=>{if(scope()!==scopeKey)apply();return preferences.greeting;},requirePreview:()=>{if(scope()!==scopeKey)apply();return preferences.requirePreview;},format:text=>P.format(text,preferences)};
 apply();
})();
