'use strict';
(()=>{
 const panel=document.createElement('details');panel.id='apiConfigPanel';panel.className='panel';
 let mode;try{mode=sessionStorage.getItem('motec-api-mode');}catch{/* Default by host. */}
 if(window.motecCloudApi&&(mode==='cloud'||mode!=='local'&&location.hostname==='mo-tec.github.io')){document.getElementById('ux-more').append(panel);window.motecCloudApi.mount(panel);return;}
 panel.innerHTML=`<summary>API Configuration <span class="api-tag">MO AI</span></summary>
 <div class="api-heading"><h3>Unganisha AI yako</h3><p>Chagua provider, weka key na model.</p></div>
 <p id="apiAvailability" class="api-muted" role="status">Inasubiri kukagua connection.</p>
 <div id="apiBackendHelp" class="api-backend-help" hidden><p>Ili kuweka nywila, fungua app kupitia server ya API.</p><code>node serve.cjs</code><div class="api-actions"><a href="http://127.0.0.1:4173/">Fungua app ya API ↗</a><button id="apiReconnect" class="secondary" type="button">Jaribu tena</button></div></div>
 <form id="apiLogin" class="api-auth"><h4 id="apiAuthTitle">Nywila ya API</h4><label><span id="apiPasswordLabel">Nywila</span><input id="apiPassword" type="password" minlength="12" maxlength="256" autocomplete="current-password" placeholder="Angalau herufi au namba 12" required disabled></label><label id="apiConfirmWrap" hidden>Thibitisha nywila<input id="apiPasswordConfirm" type="password" minlength="12" maxlength="256" autocomplete="new-password" placeholder="Andika nywila ileile tena" disabled></label><button class="primary" type="submit" id="apiLoginButton" disabled>Inasubiri connection</button></form>
 <div id="apiEditor" hidden><div class="api-toolbar"><h4>Providers zako</h4><div class="api-actions"><button id="apiNew" class="secondary" type="button">+ Ongeza</button><button id="apiLock" class="secondary" type="button">Funga</button></div></div>
 <div class="api-grid api-selectors"><label>Inayotumika<select id="apiActive"><option value="">Injini ya ndani pekee</option></select></label>
 <label>Config<select id="apiProfiles"><option value="">Config mpya</option></select></label></div>
 <form id="apiProfileForm"><div class="api-grid">
 <label>Jina<input id="apiName" maxlength="60" required placeholder="Mf. AI ya haraka"></label>
 <label>Provider / Protocol<select id="apiProtocol"><option value="compatible">OpenAI-compatible / Custom</option><option value="anthropic">Anthropic Messages</option><option value="gemini">Gemini GenerateContent</option><option value="ollama">Ollama ya ndani</option></select></label>
 <label class="api-wide">Base URL<input id="apiBase" type="url" required placeholder="https://provider.example/v1"></label>
 <label class="api-wide">API Key <span id="apiKeyHint"></span><input id="apiKey" type="password" maxlength="4096" autocomplete="off" spellcheck="false" placeholder="Weka API key"></label>
 <label class="api-wide api-check"><input id="apiShowKey" type="checkbox"> Onyesha key</label>
 <label class="api-wide">Model<input id="apiModel" list="apiModelList" maxlength="160" required placeholder="Andika model ID ya provider"><datalist id="apiModelList"></datalist></label>
 <label class="api-wide api-check"><input id="apiActivate" type="checkbox"> Tumia config hii</label>
 </div><details class="api-advanced"><summary>Mipangilio ya ziada</summary><div class="api-grid">
 <label>Timeout · sekunde<input id="apiTimeout" type="number" min="5" max="120" value="45" required></label>
 <label>Output tokens<input id="apiTokens" type="number" min="64" max="8192" value="1024" required></label>
 <label>Requests / siku (UTC)<input id="apiDaily" type="number" min="1" max="1000" value="100" required></label>
 </div><div class="api-actions"><button id="apiModels" class="secondary" type="button">Pata models</button><button id="apiDelete" class="secondary api-danger" type="button">Futa config</button></div><p class="api-muted">Hifadhi kabla ya kupima au kupata models. Test inaweza kutozwa na provider.</p></details>
 <div class="api-actions api-footer"><button class="primary" type="submit">Hifadhi</button><button id="apiTest" class="secondary" type="button">Test Connection</button></div></form>
 <p id="apiUsage" class="api-muted"></p></div>
 <details class="api-help"><summary>Msaada na usalama</summary><p>Password hii ni tofauti na PIN ya app. Keys huhifadhiwa kwa usimbaji fiche kwenye server. API hupokea swali unaloandika pekee.</p><p>Inahitaji backend ya localhost; GitHub Pages pekee haitoshi. Vikomo vya fedha huwekwa kwa provider.</p></details>
 <p id="apiStatus" class="api-status" role="status" aria-live="polite"></p>`;
 document.getElementById('ux-more').append(panel);
 const cloudSwitch=document.createElement('button');cloudSwitch.type='button';cloudSwitch.className='secondary';cloudSwitch.textContent='Gemini Cloud · Simu na PC';cloudSwitch.onclick=()=>{sessionStorage.setItem('motec-api-mode','cloud');location.reload();};panel.querySelector('.api-heading').append(cloudSwitch);
 const el=id=>document.getElementById(id);let token='',config={profiles:[],selected:null,usage:{}},configured=null,checked=false,working=false,controller=null;
 const status=text=>{el('apiStatus').textContent=text;};
 function authView(){
  el('apiLogin').hidden=!!token;
  el('apiPassword').disabled=!checked;el('apiPasswordConfirm').disabled=!checked;
  el('apiLoginButton').disabled=!checked;el('apiBackendHelp').hidden=checked;
  const setup=configured===false;
  el('apiConfirmWrap').hidden=!setup;el('apiPasswordConfirm').required=setup;
  el('apiPassword').autocomplete=setup?'new-password':'current-password';
  el('apiAuthTitle').textContent=!checked?'Nywila ya API':setup?'Tengeneza nywila':'Karibu tena';
  el('apiPasswordLabel').textContent=setup?'Nywila mpya':'Nywila yako';
  el('apiLoginButton').textContent=!checked?'Inasubiri connection':setup?'Tengeneza nywila':'Ingia';
 }
 async function checkBackend(){
  const response=await fetch('api/status',{cache:'no-store',signal:AbortSignal.timeout(5000)});
  if(!response.ok)throw Error('Backend haipatikani.');
  const data=await response.json();if(typeof data.configured!=='boolean')throw Error('Backend haipatikani.');
  configured=data.configured;checked=true;authView();
  el('apiAvailability').textContent=configured?'API Settings zinalindwa kwa password.':'Hatua ya kwanza: linda API zako kwa password.';
 }
 async function call(route,body={},signal){
  const response=await fetch('api/'+route,{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),cache:'no-store',signal:signal||AbortSignal.timeout(150000)});
  if(response.status===401){lock(false);throw Error('Session imeisha au password si sahihi. Ingia tena.');}
  if(route==='chat'&&response.ok)return response;
  let data;try{data=await response.json();}catch{throw Error('Backend haipatikani. Endesha node serve.cjs kisha fungua localhost.');}if(!response.ok)throw Error(data.error||'Ombi limeshindikana.');return data;
 }
 function lock(notify=true){controller?.abort();controller=null;token='';config={profiles:[],selected:null,usage:{}};el('apiEditor').hidden=true;authView();el('apiKey').value='';el('apiPassword').value='';el('apiPasswordConfirm').value='';el('apiKeyHint').textContent='';if(notify)status('Session imefungwa.');}
 function fill(id=''){
  const p=config.profiles.find(x=>x.id===id);el('apiProfiles').value=p?.id||'';
  for(const [field,key,value]of [['apiName','name',''],['apiProtocol','protocol','compatible'],['apiBase','baseUrl',''],['apiModel','model',''],['apiTimeout','timeout',45],['apiTokens','maxTokens',1024],['apiDaily','dailyLimit',100]])el(field).value=p?.[key]??value;
  el('apiKey').value='';el('apiKey').type='password';el('apiShowKey').checked=false;el('apiKeyHint').textContent=p?.keyHint?'('+p.keyHint+')':'';el('apiKey').placeholder=p?.hasKey?'Tupu hubakiza key iliyohifadhiwa':'Weka API key';el('apiActivate').checked=p?p.id===config.selected:!config.selected;
  el('apiModelList').replaceChildren();for(const id of ['apiTest','apiModels','apiDelete'])el(id).disabled=!p;
  const u=p&&config.usage[p.id];el('apiUsage').textContent=u?`Matumizi: ${u.count}/${p.dailyLimit} requests · ${u.day} UTC`:'';
 }
 function render(next,id){config=next;for(const select of [el('apiProfiles'),el('apiActive')]){select.replaceChildren(new Option(select.id==='apiActive'?'Injini ya ndani pekee':'Config mpya',''));for(const p of config.profiles)select.add(new Option(p.name+' · '+p.model,p.id));}el('apiActive').value=config.selected||'';fill(id);}
 async function run(fn){if(working)return;working=true;panel.setAttribute('aria-busy','true');const buttons=[...panel.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);try{await fn();}catch(e){status(e.name==='AbortError'?'Ombi limeghairiwa.':e.message);}finally{working=false;panel.setAttribute('aria-busy','false');buttons.forEach(b=>b.disabled=false);el('apiLoginButton').disabled=!checked;for(const id of ['apiTest','apiModels','apiDelete'])el(id).disabled=!el('apiProfiles').value;}}
 function connect(){return run(async()=>{el('apiAvailability').textContent='Inakagua connection…';try{await checkBackend();status('');}catch{checked=false;configured=null;authView();el('apiAvailability').textContent='Server ya API haijaunganishwa. Sehemu ya nywila ipo hapa chini.';}});}
 el('apiReconnect').onclick=connect;
 panel.addEventListener('toggle',()=>{if(panel.open&&!checked)connect();});
 el('apiLogin').onsubmit=e=>{e.preventDefault();run(async()=>{
  const prior=configured;
  try{await checkBackend();}catch{checked=false;configured=null;authView();throw Error('Backend haipatikani. Endesha node serve.cjs kisha fungua localhost.');}
  if(prior!==configured){status(configured?'Password tayari imetengenezwa. Ingia kwa password yako.':'Tengeneza password mpya na uithibitishe.');return;}
  if(configured===false){
   if(!el('apiPasswordConfirm').value){el('apiPasswordConfirm').focus();throw Error('Rudia password kwenye sehemu ya uthibitisho.');}
   if(el('apiPassword').value!==el('apiPasswordConfirm').value){el('apiPasswordConfirm').focus();throw Error('Password ya uthibitisho haifanani. Andika password ileile kwenye sehemu zote mbili.');}
  }
  try{const data=await call('login',{password:el('apiPassword').value});token=data.token;}finally{el('apiPassword').value='';el('apiPasswordConfirm').value='';}
  configured=true;authView();render(await call('config'));el('apiEditor').hidden=false;el('apiAvailability').textContent='Umeunganishwa kwa usalama.';status('');
 });};
 el('apiNew').onclick=()=>{fill();status('Config mpya.');};el('apiProfiles').onchange=()=>fill(el('apiProfiles').value);
 el('apiShowKey').onchange=()=>{el('apiKey').type=el('apiShowKey').checked?'text':'password';};
 el('apiProtocol').onchange=()=>{const urls={compatible:'',anthropic:'https://api.anthropic.com/v1',gemini:'https://generativelanguage.googleapis.com/v1beta',ollama:'http://127.0.0.1:11434/v1'};el('apiBase').value=urls[el('apiProtocol').value];if(el('apiProtocol').value==='ollama')el('apiKey').value='';};
 el('apiProfileForm').onsubmit=e=>{e.preventDefault();run(async()=>{const body={id:el('apiProfiles').value||undefined,name:el('apiName').value,protocol:el('apiProtocol').value,baseUrl:el('apiBase').value,model:el('apiModel').value,apiKey:el('apiKey').value,timeout:Number(el('apiTimeout').value),maxTokens:Number(el('apiTokens').value),dailyLimit:Number(el('apiDaily').value),activate:el('apiActivate').checked};try{const next=await call('save',body);render(next,body.id||next.profiles.at(-1).id);status('Config imehifadhiwa kwa usimbaji fiche kwenye server.');}finally{el('apiKey').value='';}});};
 el('apiActive').onchange=()=>run(async()=>{try{render(await call('select',{id:el('apiActive').value||null}),el('apiProfiles').value);status('Config inayotumika imebadilishwa.');}catch(e){el('apiActive').value=config.selected||'';throw e;}});
 el('apiDelete').onclick=()=>{if(!confirm('Futa config hii pamoja na key yake kwenye server?'))return;run(async()=>{render(await call('delete',{id:el('apiProfiles').value}));status('Config imefutwa.');});};
 for(const [button,route]of [['apiTest','test'],['apiModels','models']])el(button).onclick=()=>run(async()=>{status('Inaunganisha…');const data=await call(route,{id:el('apiProfiles').value});if(data.models){el('apiModelList').replaceChildren(...data.models.map(id=>new Option(id,id)));status(`${data.models.length} models zimepatikana. Chagua au andika jina la model.`);}else status(`Connection iko sawa · ${data.model} · ${data.ms} ms`);const id=el('apiProfiles').value;const next=await call('config');config.usage=next.usage;const p=config.profiles.find(x=>x.id===id),u=config.usage[id];if(u)el('apiUsage').textContent=`Matumizi: ${u.count}/${p.dailyLimit} requests · ${u.day} UTC`;});
 el('apiLock').onclick=()=>run(async()=>{try{await call('logout');}finally{lock();}});
 window.motecApi={enabled:()=>!!token&&!!config.selected,cancel:()=>controller?.abort(),async answer(message,onDelta){if(controller)throw Error('Subiri ombi la sasa.');controller=new AbortController();try{const response=await call('chat',{message},controller.signal),reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',text='',done=false;const consume=line=>{if(!line.trim())return;const item=JSON.parse(line);if(item.error)throw Error(item.error);if(item.delta){text+=item.delta;onDelta?.(text);}if(item.done)done=true;};while(true){const chunk=await reader.read();if(chunk.done)break;buffer+=decoder.decode(chunk.value,{stream:true});let i;while((i=buffer.indexOf('\n'))>=0){consume(buffer.slice(0,i));buffer=buffer.slice(i+1);}}buffer+=decoder.decode();if(buffer.trim())consume(buffer);if(!done)throw Error('Connection imekatika kabla ya jibu kukamilika.');return text;}catch(e){throw Object.assign(Error(e.name==='AbortError'?'Umesitisha jibu.':e.message),{code:'api/error'});}finally{controller=null;}}};
 function revoke(){const prior=token;lock(false);if(prior)fetch('api/logout',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+prior},body:'{}'}).catch(()=>{});}
 window.addEventListener('motec:cloud-user-changed',revoke);
 document.getElementById('lockAppBtn').addEventListener('click',revoke);
 new MutationObserver(()=>{if(document.getElementById('appShell').hidden)revoke();}).observe(document.getElementById('appShell'),{attributes:true,attributeFilter:['hidden']});
})();
