'use strict';
(()=>{
 const endpoint='https://cash-flow-ai.iyanimama186.workers.dev';
 const cloud=()=>window.motecAssistantCloud;
 let ready=false,owner=null,controller=null,panel=null,working=false,provider='AI';
 const el=id=>document.getElementById(id);
 const status=message=>{if(el('cloudApiStatus'))el('cloudApiStatus').textContent=message;};
 function showProvider(name){provider=name==='OpenRouter'?'OpenRouter':name==='Gemini'?'Gemini':'AI';el('cloudApiTitle').textContent=provider+' · Simu na PC';el('cloudApiTag').textContent=provider.toUpperCase()+' CLOUD';el('cloudApiModel').placeholder=provider==='OpenRouter'?'openrouter/free':'Chagua model ya free tier';el('cloudApiModel').maxLength=provider==='OpenRouter'?200:120;}
 function model(){return el('cloudApiModel')?.value.trim()||'';}
 function reset(){controller?.abort();controller=null;ready=false;owner=null;if(el('cloudApiState'))el('cloudApiState').textContent='Unganisha akaunti yako';}
 function identity(){if(el('cloudApiUid'))el('cloudApiUid').textContent=cloud()?.user()||'Ingia Firebase kwanza';}
 async function call(route,body={},signal){
  const expected=cloud()?.user();if(!expected)throw Error('Ingia Firebase kwenye app kwanza.');
  const token=await cloud().idToken();if(expected!==cloud()?.user())throw Error('Akaunti imebadilika. Jaribu tena.');
  const response=await fetch(endpoint+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),cache:'no-store',signal:signal||AbortSignal.timeout(65000)});
  if(expected!==cloud()?.user()){await response.body?.cancel();throw Error('Akaunti imebadilika. Jaribu tena.');}
  if(!response.ok){if(response.status===401||response.status===403)reset();let data;try{data=await response.json();}catch{throw Error('Worker haijasanidiwa. Hakikisha code mpya imewekwa na Deploy imekamilika.');}throw Error(data.error||'Worker imeshindwa kujibu.');}
  if(route==='chat')return response;
  return response.json();
 }
 async function run(fn){if(working)return;working=true;panel.setAttribute('aria-busy','true');panel.querySelectorAll('button').forEach(b=>b.disabled=true);try{await fn();}catch(e){status(e.message);}finally{working=false;panel.setAttribute('aria-busy','false');panel.querySelectorAll('button').forEach(b=>b.disabled=false);}}
 function mount(target){
  panel=target;
  panel.innerHTML=`<summary>API Configuration <span class="api-tag" id="cloudApiTag">AI CLOUD</span></summary>
   <div class="api-heading"><h3 id="cloudApiTitle">AI · Simu na PC</h3><p>Uchambuzi wa biashara na msaada wa app. Muhtasari wa data hutumwa kwa model unapouliza.</p></div>
   <p id="cloudApiState" class="api-muted">Unganisha akaunti yako</p>
   <div class="api-actions"><button id="cloudApiConnect" class="primary" type="button">Unganisha</button><button id="cloudApiSignIn" class="secondary" type="button">Ingia Firebase</button></div>
   <label>Model<input id="cloudApiModel" list="cloudApiModels" maxlength="120" placeholder="Chagua model ya free tier kutoka AI Studio"><datalist id="cloudApiModels"></datalist></label>
   <div class="api-actions"><button id="cloudApiList" class="secondary" type="button">Pata models</button><button id="cloudApiTest" class="secondary" type="button">Test Connection</button></div>
   <p id="cloudApiStatus" class="api-status" role="status" aria-live="polite"></p>
   <details class="api-help"><summary>Msaada wa kuunganisha</summary><p>Worker: <a href="${endpoint}/api/status" target="_blank" rel="noopener">Kagua hali</a></p><p>Cloudflare → Settings → Add variable → OWNER_UID. Nakili UID ya akaunti yako hapa:</p><code id="cloudApiUid" style="overflow-wrap:anywhere;user-select:all"></code><button id="cloudApiCopyUid" class="secondary" type="button">Nakili UID</button><p>OPENROUTER_API_KEY au GEMINI_API_KEY iwe Secret. Usiiweke kwenye app au GitHub. OpenRouter hutumia models za bure pekee. openrouter/free inaweza kuchagua model/provider tofauti kwa kila ombi; swali lako huenda kwa OpenRouter na provider anayochaguliwa. Free tier ina vikomo na inaweza kuchelewa.</p><button id="cloudApiLocal" class="secondary" type="button">Tumia API ya localhost</button></details>`;
  try{el('cloudApiModel').value=localStorage.getItem('motec-cloud-ai-model-v1')||'';}catch{/* Optional model preference. */}
  el('cloudApiModel').onchange=()=>{try{localStorage.setItem('motec-cloud-ai-model-v1',model());}catch{/* Optional preference. */}};
  el('cloudApiSignIn').onclick=()=>{window.moneyManagerUI?.go('more',true);const p=el('cloudPanel');if(p){p.open=true;p.scrollIntoView({block:'start'});el('cloudEmail')?.focus();}};
  el('cloudApiCopyUid').onclick=()=>run(async()=>{const uid=cloud()?.user();if(!uid)throw Error('Ingia Firebase kwanza.');await navigator.clipboard.writeText(uid);status('UID imenakiliwa. Iweke kama OWNER_UID kwenye Cloudflare.');});
  el('cloudApiLocal').onclick=()=>{sessionStorage.setItem('motec-api-mode','local');location.reload();};
  el('cloudApiConnect').onclick=()=>run(async()=>{
   reset();status('Inaunganisha…');await cloud()?.ready?.();identity();
   const response=await fetch(endpoint+'/api/status',{cache:'no-store',signal:AbortSignal.timeout(10000)});let data;
   try{data=await response.json();}catch{throw Error('Worker bado ina Hello World. Weka code mpya ya worker.mjs kisha Deploy.');}
   if(!response.ok||!['MO AI Gemini','MO AI Cloud'].includes(data.service))throw Error('Worker haijasanidiwa kwa MO AI.');
   showProvider(data.provider||'Gemini');
   if(!data.ownerConfigured)throw Error('Weka OWNER_UID kwenye Cloudflare. UID yako ipo ndani ya Msaada wa kuunganisha.');
   if(!data.configured)throw Error(`Weka ${provider==='OpenRouter'?'OPENROUTER_API_KEY':'GEMINI_API_KEY'} kama Secret kwenye Cloudflare.`);
   const config=await call('config');showProvider(config.provider||provider);if(config.model)el('cloudApiModel').value=config.model;
   owner=cloud().user();ready=true;el('cloudApiState').textContent=provider+' Cloud imeunganishwa';status(provider==='OpenRouter'?'Model ya bure imechaguliwa. Bonyeza Test Connection.':'Chagua model kisha Test Connection.');
  });
  el('cloudApiList').onclick=()=>run(async()=>{const data=await call('models');if(data.provider)showProvider(data.provider);el('cloudApiModels').replaceChildren(...data.models.map(id=>new Option(id,id)));status(`${data.models.length} models zimepatikana. `+(provider==='OpenRouter'?'Models za bure pekee.':'Hakiki free tier kwenye AI Studio.'));});
  el('cloudApiTest').onclick=()=>run(async()=>{const selected=model();if(!selected)throw Error('Weka model ID kwanza.');status('Inapima…');const result=await call('test',{model:selected});if(result.provider)showProvider(result.provider);owner=cloud().user();ready=true;el('cloudApiState').textContent=provider+' Cloud imeunganishwa';el('cloudApiModel').value=result.model;el('cloudApiModel').dispatchEvent(new Event('change'));status('Connection iko sawa · '+result.model+(result.servedModel&&result.servedModel!==result.model?' · Imejibu: '+result.servedModel:''));});
  window.motecApi={enabled:()=>ready&&owner===cloud()?.user()&&!!model(),cancel:()=>controller?.abort(),async answer(message,onDelta,context){
   if(controller)throw Object.assign(Error('Subiri ombi la sasa.'),{code:'api/error'});
   const expected=cloud()?.user(),control=new AbortController();controller=control;
   try{const response=await call('chat',{message,model:model(),context,ownerInstructions:window.motecAssistantOwner?.apiPrompt?.()||''},control.signal),reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',text='',done=false;
    const consume=line=>{if(!line.trim())return;const item=JSON.parse(line);if(item.error)throw Error(item.error);if(item.delta){text+=item.delta;if(expected!==cloud()?.user())throw Error('Akaunti imebadilika.');onDelta?.(text);}if(item.done)done=true;};
    while(true){const part=await reader.read();if(part.done)break;buffer+=decoder.decode(part.value,{stream:true});let i;while((i=buffer.indexOf('\n'))>=0){consume(buffer.slice(0,i));buffer=buffer.slice(i+1);}}
    buffer+=decoder.decode();if(buffer.trim())consume(buffer);if(!done)throw Error('Jibu halijakamilika. Jaribu tena.');return text;
   }catch(e){control.abort();throw Object.assign(Error(e.name==='AbortError'?'Jibu limesitishwa.':e.message),{code:'api/error'});}finally{if(controller===control)controller=null;}
  }};
  identity();window.addEventListener('motec:cloud-user-changed',()=>{reset();identity();});window.addEventListener('motec:cloud-ready',identity);
  el('lockAppBtn').addEventListener('click',reset);
  new MutationObserver(()=>{if(el('appShell').hidden)reset();}).observe(el('appShell'),{attributes:true,attributeFilter:['hidden']});
 }
 window.motecCloudApi={mount};
})();
