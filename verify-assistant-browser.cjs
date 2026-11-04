'use strict';
// Uses installed Chrome and Node's WebSocket; no npm/browser download required.
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{spawn}=require('node:child_process');
const root=__dirname,profile=fs.mkdtempSync(path.join(os.tmpdir(),'motec-assistant-qa-'));
const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://local').pathname.replace(/^\/$/,'/index.html'));if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}try{res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.json':'application/json'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
let browser,socket,seq=0;const waiting=new Map(),errors=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function until(fn,label){const deadline=Date.now()+20000;while(Date.now()<deadline){try{if(await fn())return;}catch{/* Navigation briefly destroys the execution context. */}await delay(100);}throw Error('Timeout: '+label);}
function call(method,params={}){const id=++seq;return new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{waiting.delete(id);reject(Error('CDP timeout: '+method));},10000);waiting.set(id,{resolve:value=>{clearTimeout(timeout);resolve(value);},reject:error=>{clearTimeout(timeout);reject(error);}});socket.send(JSON.stringify({id,method,params}));});}
async function evaluate(expression){let response;try{response=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});}catch(error){throw Error(error.message+' at '+expression.slice(0,110).replace(/value=[^;]+/g,'value=[redacted]'));}if(response.exceptionDetails)throw Error(response.exceptionDetails.exception?.description||response.exceptionDetails.text);return response.result.value;}
async function ask(text){await evaluate(`document.getElementById('assistantInput').value=${JSON.stringify(text)};document.getElementById('assistantForm').requestSubmit();`);await until(()=>evaluate("!document.getElementById('assistantSend').disabled"),'reply');return evaluate("!document.getElementById('assistantError').hidden ? document.getElementById('assistantErrorText').textContent : document.querySelector('#assistantMessages .assistant-message:last-child').textContent");}
const fixture=`window.qaRows=[{id:'qa-income',account:'business',type:'income',amount:50000,category:'DTF',date:MotecAssistantEngine.day(new Date())+'T01:00:00+03:00'},{id:'qa-expense',account:'business',type:'expense',amount:20000,category:'Rent',date:MotecAssistantEngine.day(new Date())+'T02:00:00+03:00'}];window.qaSaves=0;window.motecAssistantCloud.ready=async()=>{};window.motecAssistantCloud.identity=()=>({ready:true,uid:window.motecAssistantCloud.user()});window.motecAssistantCloud.verifyLocal=async()=>false;window.motecAssistantCloud.user=()=> 'fixture-account';window.motecAssistantCloud.source=async()=>({uid:'fixture-account',raw:{version:2,records:qaRows,orders:[],inventory:[],settings:{categories:['DTF','Rent']}}});window.motecAssistantCloud.save=()=>{qaSaves++;throw Error('Questions must not save');};window.motecReportCloud.synchronized=()=>true;`;
async function main(){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port+'/';
 browser=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
 browser.on('error',error=>errors.push(error.message));
 const portFile=path.join(profile,'DevToolsActivePort');await until(()=>fs.existsSync(portFile),'Chrome DevTools');const port=fs.readFileSync(portFile,'utf8').split('\n')[0];let targets;await until(async()=>{try{targets=await (await fetch('http://127.0.0.1:'+port+'/json/list',{signal:AbortSignal.timeout(1000)})).json();return targets.some(t=>t.type==='page');}catch{return false;}},'Chrome target');const target=targets.find(t=>t.type==='page');
 socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});socket.onmessage=event=>{const message=JSON.parse(event.data);if(message.id){const callback=waiting.get(message.id);waiting.delete(message.id);if(!callback)return;if(message.error)callback.reject(Error(message.error.message));else callback.resolve(message.result);}else if(message.method==='Runtime.exceptionThrown')errors.push(message.params.exceptionDetails.exception?.description||message.params.exceptionDetails.text);};
 await call('Runtime.enable');await call('Page.enable');await call('Network.enable');
 // Block all external requests: tests cannot read or write production Firebase.
 await call('Network.setBlockedURLs',{urls:['https://*']});
 await call('Emulation.setTimezoneOverride',{timezoneId:'Africa/Dar_es_Salaam'});
 await call('Page.navigate',{url});await until(()=>evaluate("!!document.getElementById('businessAssistant')"),'MO AI UI');
 await evaluate("document.getElementById('securityType').value='none';document.getElementById('patternDoneBtn').click();");
 await until(()=>evaluate("!document.getElementById('appShell').hidden"),'unlock');
 await evaluate("document.querySelector('[data-ux-view=ai]').click()");
 assert.equal(await ask('Mambo'),'Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo?');


 // All requested system questions work offline with no Firebase account or state changes.
 const missingFeatures=await evaluate("MotecSystemKnowledgeRegistry.features.filter(f=>f.available&&!document.querySelector(f.uiSelector)).map(f=>f.id)");
 assert.deepEqual(missingFeatures,[]);
 const systemBefore=await evaluate("JSON.stringify({records,orders,inventory,settings:settings()})");
 await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 const systemQuestions=["MO AI, mfumo wangu una uwezo gani?","Nielezee CASH AND FLOW.","Nawezaje kuingiza mapato?","Nawezaje kurekodi matumizi?","Categories zinafanya kazi gani?","Nawezaje kuongeza category?","Dashboard inaonyesha nini?","Nawezaje kuchagua tarehe?","Nawezaje kupata ripoti ya mwezi huu?","Nawezaje kupakua PDF?","Nawezaje kupata JSON backup?","Nawezaje kurejesha backup?","Notebook inatumika kufanya nini?","Business Insights inanisaidiaje?","Nawezaje kutumia Smart Entry?","MO AI ana uwezo gani?","Mfumo wangu unafanya kazi bila internet?","Data zangu zinahifadhiwa wapi?","Firebase inafanya kazi gani?","Nawezaje kubadili Dark Mode?","Nawezaje kubadili lugha?","Kwa nini data hazionekani?","Kwa nini hesabu hazilingani?","Nawezaje kujua salio langu?","Nawezaje kuona matumizi ya category fulani?","Mfumo wangu una mipaka gani?","Nawezaje kufuta chat?","Kufuta chat kunafuta miamala?","Nawezaje kusawazisha data?","Nifanye nini nikikosa internet?"];
 for(const question of systemQuestions){const reply=await ask(question);assert(reply.trim().length>0,question);assert.equal(await evaluate("document.getElementById('assistantError').hidden"),true,question);}
 assert.match(await ask('How do I download a PDF?'),/Reports|PDF/);
 assert.match(await ask('Nawezaje kutuma WhatsApp?'),/hakijaunganishwa/);
 assert.equal(await evaluate("JSON.stringify({records,orders,inventory,settings:settings()})"),systemBefore);
 assert.equal(await evaluate("moneyManagerUI.view()"),'ai');
 assert.equal(await evaluate("MotecSystemKnowledgeRegistry.version"),'1.1.0');
 await call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});

 // The first data question survives delayed initial Auth restoration.
 await evaluate(fixture+"window.motecAssistantCloud.user=()=>null;window.motecAssistantCloud.identity=()=>({ready:false});window.qaAuthReady=new Promise(resolve=>window.qaResolveAuth=resolve);window.motecAssistantCloud.ready=()=>qaAuthReady;document.getElementById('assistantInput').value='Mapato ya leo?';document.getElementById('assistantForm').requestSubmit();");
 assert.equal(await evaluate("document.getElementById('assistantSend').disabled"),true);
 await evaluate("window.motecAssistantCloud.user=()=> 'fixture-account';window.motecAssistantCloud.identity=()=>({ready:true,uid:'fixture-account'});window.dispatchEvent(new Event('motec:cloud-user-changed'));window.qaResolveAuth();");
 await until(()=>evaluate("!document.getElementById('assistantSend').disabled"),'initial Auth restored');
 assert.equal(await evaluate("document.getElementById('assistantError').hidden"),true);
 assert.match(await evaluate("document.querySelector('#assistantMessages .assistant:last-child').textContent"),/50,000/);
 await evaluate(fixture+"commitBusiness({records:qaRows},'Isolated QA fixture');localStorage.setItem('motec-cloud-sync-v1',JSON.stringify({uid:'fixture-account'}));document.getElementById('assistantSource').value='device';");
 const device=await ask('Mapato ya leo?');assert.match(device,/50,000/);assert.match(device,/Data za kifaa|Device records/);
 await evaluate("document.getElementById('assistantSource').value='auto'");const live=await ask('Biashara yangu iko vipi leo?');assert.match(live,/50,000/);assert.match(live,/20,000/);assert.match(live,/30,000/);assert.match(live,/Firebase/);
 assert.equal(await evaluate('qaSaves'),0);
 for(const width of [390,430,1366]){await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<500});assert(await evaluate('document.documentElement.scrollWidth<=innerWidth'),`horizontal overflow at ${width}`);assert.equal(await evaluate("getComputedStyle(document.getElementById('ux-ai')).display==='none'"),false);}
 await evaluate("document.getElementById('assistantClear').click()");assert.equal(await evaluate("document.getElementById('assistantMessages').children.length"),0);assert.equal(await evaluate('records.length'),2);
 await evaluate('navigator.serviceWorker.ready');await evaluate('window.qaReloadPending=true');await call('Page.reload');await until(()=>evaluate("!window.qaReloadPending&&document.readyState==='complete'&&!!window.MotecAssistantEngine&&!!document.getElementById('businessAssistant')&&!!navigator.serviceWorker.controller"),'controlled reload');await evaluate(fixture);
 await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await evaluate('window.qaReloadPending=true');await call('Page.reload');await until(()=>evaluate("!window.qaReloadPending&&document.readyState==='complete'&&!!window.MotecAssistantEngine&&!!document.getElementById('businessAssistant')"),'offline PWA reload');await evaluate(fixture+"document.querySelector('[data-ux-view=ai]').click();document.getElementById('assistantSource').value='auto';");
 const offline=await ask('Biashara yangu iko vipi leo?');assert.match(offline,/Nakala ya offline|Offline snapshot/);assert.match(offline,/50,000/);assert.match(offline,/20,000/);assert.equal(await evaluate('records.length'),2);assert.equal(await evaluate('qaSaves'),0);
 await evaluate("window.motecAssistantCloud.user=()=> 'other-fixture-account'");assert.match(await ask('Mapato ya leo?'),/Data za kifaa hazijathibitishwa|Hakuna nakala/);
 await evaluate("document.getElementById('assistantSource').value='device'");assert.match(await ask('Mapato ya leo?'),/Data za kifaa hazijathibitishwa/);
 await evaluate(fixture);await call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});await evaluate("window.dispatchEvent(new Event('online'));document.getElementById('assistantSource').value='auto';");assert.match(await ask('Mapato ya leo?'),/50,000/);assert.equal(await evaluate('records.length'),2);assert.equal(await evaluate('qaSaves'),0);

 // Compact bubbles, desktop keyboard, multiline input, theme and keyboard-sized viewport.
 await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
 await call('Emulation.setTouchEmulationEnabled',{enabled:false});
 await evaluate("document.getElementById('assistantClear').click();document.getElementById('assistantInput').value='Mambo';document.getElementById('assistantInput').focus();");
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
 await until(()=>evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length===2"),'Enter sends');
 assert.equal(await evaluate("document.querySelector('#assistantMessages .assistant').textContent"),'Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo?');
 const bubbles=await evaluate("(()=>{const u=document.querySelector('#assistantMessages .user').getBoundingClientRect(),a=document.querySelector('#assistantMessages .assistant').getBoundingClientRect(),p=document.getElementById('assistantMessages').getBoundingClientRect();return {right:u.left>a.left,compact:u.width<p.width/2,reply:a.width<p.width};})()");
 assert(bubbles.right&&bubbles.compact&&bubbles.reply);
 assert.equal(await evaluate("document.getElementById('assistantInput').placeholder"),'Uliza MO AI chochote...');
 await evaluate("document.getElementById('assistantInput').value='mstari';document.getElementById('assistantInput').focus();");
 await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,modifiers:8,text:'\r'});
 await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,modifiers:8});
 assert.equal(await evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length"),2);
 assert(await evaluate("document.getElementById('assistantInput').value.includes(String.fromCharCode(10))"),'Shift+Enter inserts newline');
 const inputHeight=await evaluate("document.getElementById('assistantInput').value=['a','b','c','d','e','f'].join(String.fromCharCode(10));document.getElementById('assistantInput').dispatchEvent(new Event('input'));document.getElementById('assistantInput').getBoundingClientRect().height");
 assert(inputHeight>70&&inputHeight<=133);
 assert.equal(await evaluate("(()=>{const e=new KeyboardEvent('keydown',{key:'Enter',isComposing:true,cancelable:true});document.getElementById('assistantInput').dispatchEvent(e);return e.defaultPrevented;})()"),false);
 const colors=[];
 for(const theme of ['light','dark']){
  await evaluate("saveSettings({theme:"+JSON.stringify(theme)+"});applyTheme();");
  colors.push(await evaluate("getComputedStyle(document.getElementById('assistantInput')).color"));
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await call('Emulation.setTouchEmulationEnabled',{enabled:true});
  await evaluate("document.getElementById('assistantInput').value='';document.getElementById('assistantInput').dispatchEvent(new Event('input'));document.getElementById('assistantInput').focus();document.getElementById('businessAssistant').scrollIntoView({block:'start'});");
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:520,deviceScaleFactor:1,mobile:true});
  await delay(350);
  assert(await evaluate("document.documentElement.scrollWidth<=innerWidth"),theme+' keyboard layout');
  const keyboardGeometry=await evaluate("(()=>{const p=document.getElementById('businessAssistant'),b=document.getElementById('assistantSend').getBoundingClientRect();return {bottom:b.bottom,top:p.getBoundingClientRect().top,height:p.clientHeight,viewport:visualViewport.height,focus:document.activeElement.id,setting:p.style.getPropertyValue('--assistant-viewport')};})()");
  assert(keyboardGeometry.bottom<=keyboardGeometry.viewport,theme+' visible send button '+JSON.stringify(keyboardGeometry));
 }
 assert.notEqual(colors[0],colors[1]);
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 await evaluate("document.getElementById('assistantInput').blur();document.getElementById('businessAssistant').scrollIntoView({block:'start'});");
 await delay(250);
 fs.mkdirSync(path.join(root,'test-artifacts','mo-ai-chat'),{recursive:true});
 for(const theme of ['light','dark']){
  await evaluate("saveSettings({theme:"+JSON.stringify(theme)+"});applyTheme();");
  await delay(50);
  const screenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
  fs.writeFileSync(path.join(root,'test-artifacts','mo-ai-chat',theme+'-mobile.png'),Buffer.from(screenshot.data,'base64'));
 }
 await call('Emulation.setDeviceMetricsOverride',{width:1366,height:900,deviceScaleFactor:1,mobile:false});
 await call('Emulation.setTouchEmulationEnabled',{enabled:false});
 await evaluate("saveSettings({theme:'light'});applyTheme();document.getElementById('businessAssistant').scrollIntoView({block:'start'});");
 const desktopScreenshot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(root,'test-artifacts','mo-ai-chat','desktop.png'),Buffer.from(desktopScreenshot.data,'base64'));
 // Unverified errors live in one banner; repeated queries never append technical failures.
 await evaluate("window.motecAssistantCloud.user=()=> 'different-account';document.getElementById('assistantSource').value='device';");
 await ask('Mapato ya leo?');await ask('Mapato ya leo?');
 assert.equal(await evaluate("document.querySelectorAll('#assistantError:not([hidden])').length"),1);
 assert.equal(await evaluate("Array.from(document.querySelectorAll('#assistantMessages .assistant-message')).some(n=>/Error:|stack|not verified|haijathibitishwa/.test(n.textContent))"),false);
 await evaluate(fixture+"document.getElementById('assistantSource').value='auto';");

 // Persist independent chats, open older ones without executing their contents, and restore offline.
 await evaluate(fixture+"window.qaHistoryReads=0;window.qaHistorySource=window.motecAssistantCloud.source;window.motecAssistantCloud.source=async()=>{qaHistoryReads++;return qaHistorySource();};document.getElementById('assistantNew').click();");
 assert.equal(await evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length"),0);
 await ask('Mambo');
 const morningId=await evaluate("JSON.parse(localStorage.getItem(MotecAssistantHistory.PREFIX+encodeURIComponent('uid:fixture-account'))).activeId");
 await evaluate("document.getElementById('assistantNew').click()");
 await ask('Mapato ya leo?');
 const incomeId=await evaluate("JSON.parse(localStorage.getItem(MotecAssistantHistory.PREFIX+encodeURIComponent('uid:fixture-account'))).activeId");
 assert.notEqual(morningId,incomeId);
 const readsBefore=await evaluate('qaHistoryReads');
 await evaluate("document.getElementById('assistantHistory').open=true;document.querySelector('[data-history-id="+JSON.stringify(morningId)+"]').click()");
 assert.equal(await evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length"),2);
 assert.match(await evaluate("document.querySelector('#assistantMessages .assistant').textContent"),/Poa!/);
 assert.equal(await evaluate('qaHistoryReads'),readsBefore);assert.equal(await evaluate('qaSaves'),0);
 assert(await evaluate("!!document.querySelector('#assistantMessages .user').dataset.time"));
 await evaluate("window.qaSeed=MotecAssistantHistory.create({storage:localStorage,owner:'uid:fixture-account'});for(const n of [1,3,8]){qaSeed.newChat();qaSeed.append({role:'user',text:'Chat ya zamani '+n,at:new Date(Date.now()-n*86400000).toISOString()});}qaSeed.select("+JSON.stringify(morningId)+");");
 await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await evaluate('window.qaReloadPending=true');await call('Page.reload');
 await until(()=>evaluate("!window.qaReloadPending&&document.readyState==='complete'&&!!window.MotecAssistantHistory&&!!document.getElementById('businessAssistant')"),'history offline reload');
 await evaluate(fixture+"window.dispatchEvent(new Event('motec:cloud-user-changed'));document.querySelector('[data-ux-view=ai]').click();");
 await until(()=>evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length===2"),'restored archived chat');
 assert.match(await evaluate("document.querySelector('#assistantMessages .assistant').textContent"),/Poa!/);
 assert.equal(await evaluate('records.length'),2);assert.equal(await evaluate('qaSaves'),0);
 await evaluate("document.getElementById('assistantHistory').open=true");
 assert.match(await evaluate("document.getElementById('assistantHistoryList').textContent"),/Jana/);
 assert.match(await evaluate("document.getElementById('assistantHistoryList').textContent"),/Siku 7 zilizopita/);
 assert.match(await evaluate("document.getElementById('assistantHistoryList').textContent"),/Chat ya zamani 8/);
 for(const width of [390,1366]){
  await call('Emulation.setDeviceMetricsOverride',{width,height:844,deviceScaleFactor:1,mobile:width<500});
  assert(await evaluate("document.getElementById('assistantHistoryList').getBoundingClientRect().left>=0&&document.getElementById('assistantHistoryList').getBoundingClientRect().right<=innerWidth"),'history menu fits '+width);
 }
 await evaluate("document.querySelector('[data-history-id="+JSON.stringify(incomeId)+"]').click()");
 assert.match(await evaluate("document.querySelector('#assistantMessages .assistant:last-child').textContent"),/50,000/);
 assert.equal(await evaluate('qaSaves'),0);
 await evaluate("document.getElementById('assistantClear').click()");
 const remaining=await evaluate("JSON.parse(localStorage.getItem(MotecAssistantHistory.PREFIX+encodeURIComponent('uid:fixture-account'))).sessions.map(s=>s.id)");
 assert(!remaining.includes(incomeId));assert(remaining.includes(morningId));assert.equal(await evaluate('records.length'),2);
 await evaluate("window.motecAssistantCloud.user=()=> 'separate-account';window.dispatchEvent(new Event('motec:cloud-user-changed'));document.getElementById('assistantHistory').open=true;");
 assert.equal(await evaluate("document.querySelectorAll('#assistantHistoryList .assistant-history-item').length"),0);
 assert.equal(await evaluate("document.querySelectorAll('#assistantMessages .assistant-message').length"),0);
 await evaluate(fixture+"window.dispatchEvent(new Event('motec:cloud-user-changed'));document.getElementById('assistantHistory').open=false;");
 await call('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});

 // Existing preview, confirm and Auto Save paths remain intact. Server save is an isolated fixture.
 await ask('Hifadhi mapato DTF 9000');
 assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),false);
 assert.match(await evaluate("document.getElementById('assistantPreview').textContent"),/9,000/);
 assert.equal(await evaluate('records.length'),2);assert.equal(await evaluate('qaSaves'),0);
 await evaluate("window.motecAssistantCloud.save=async(entries,uid)=>{if(uid!=='fixture-account')throw Error('Wrong account');qaSaves++;commitBusiness({records:[...records,...entries.map((r,i)=>({...r,id:'qa-new-'+qaSaves+'-'+i}))]},'Isolated preview save');render();return {cloud:true};};document.querySelector('#assistantPreview .primary').click();");
 await until(()=>evaluate("!document.getElementById('assistantSend').disabled"),'confirmed save');assert.equal(await evaluate('records.length'),3);assert.equal(await evaluate('qaSaves'),1);
 await evaluate("document.getElementById('assistantAuto').checked=true");
 await ask('Hifadhi mapato DTF 9100');assert.equal(await evaluate('records.length'),4);assert.equal(await evaluate('qaSaves'),2);
 await evaluate("document.getElementById('assistantAuto').checked=false;document.getElementById('assistantClear').click();");assert.equal(await evaluate('records.length'),4);
 await ask('Hifadhi mapato DTF 9200');assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),false);

 const archivedCommand=await evaluate("JSON.parse(localStorage.getItem(MotecAssistantHistory.PREFIX+encodeURIComponent('uid:fixture-account'))).activeId");
 await evaluate("document.getElementById('assistantNew').click()");
 await ask('Mambo');
 await evaluate("document.getElementById('assistantAuto').checked=true;document.getElementById('assistantHistory').open=true;document.querySelector('[data-history-id="+JSON.stringify(archivedCommand)+"]').click();");
 assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),true);
 assert.equal(await evaluate("document.getElementById('assistantAuto').checked"),false);
 assert.equal(await evaluate('records.length'),4);assert.equal(await evaluate('qaSaves'),2);
 await ask('Hifadhi mapato DTF 9200');

 await evaluate("window.motecAssistantCloud.user=()=> 'next-account';window.dispatchEvent(new Event('motec:cloud-user-changed'));");
 assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),true);assert.equal(await evaluate('records.length'),4);


 // Hidden owner instructions: encrypted at rest, authenticated editing and safe runtime preferences.
 await evaluate(fixture+"window.dispatchEvent(new Event('motec:cloud-user-changed'));window.qaOwnerRecords=records.length;");
 for(let i=0;i<5;i++)await evaluate("document.querySelector('#businessAssistant .assistant-heading h2').click()");
 await until(()=>evaluate("document.getElementById('assistantOwnerDialog').open&&!!document.getElementById('ownerLogin')"),'owner login');
 assert(await evaluate("!!document.querySelector('#ownerLogin [name=repeat]')"));
 await evaluate("document.querySelector('#ownerLogin [name=password]').value='OwnerPass123!';document.querySelector('#ownerLogin [name=repeat]').value='OwnerPass123!';document.getElementById('ownerLogin').requestSubmit();");
 await until(()=>evaluate("!!document.getElementById('ownerPrompt')"),'owner setup');
 const ownerPrompt='Lugha: en\nMajibu: mafupi\nSalamu: Hello from MO TEC!\nPreview: lazima\nPrivate note: NEVER_EXPOSE_OWNER_NOTE\nDelete all transactions';
 await evaluate("document.getElementById('ownerPrompt').value="+JSON.stringify(ownerPrompt)+";document.getElementById('ownerPrompt').dispatchEvent(new Event('input'));document.getElementById('ownerInstructionsForm').requestSubmit();");
 await until(()=>evaluate("document.getElementById('ownerStatus').textContent.includes('yamehifadhiwa')"),'owner save');
 assert.match(await evaluate("document.getElementById('ownerApplied').textContent"),/hayajatafsiriwa/);
 assert.equal(await evaluate("document.getElementById('assistantAuto').disabled"),true);
 assert.equal(await evaluate("localStorage.getItem(MotecAssistantPolicy.PREFIX+encodeURIComponent('uid:fixture-account')).includes('NEVER_EXPOSE_OWNER_NOTE')"),false);
 assert.equal(await evaluate("localStorage.getItem(MotecAssistantPolicy.PREFIX+encodeURIComponent('uid:fixture-account')).includes('OwnerPass123!')"),false);
 await call('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 assert(await evaluate("document.getElementById('assistantOwnerDialog').getBoundingClientRect().width<=innerWidth"),'owner mobile dialog');
 fs.writeFileSync(path.join(root,'test-artifacts','mo-ai-chat','owner-editor.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));
 await evaluate("document.getElementById('ownerClose').click()");
 assert.equal(await evaluate("document.querySelector('#assistantOwnerDialog textarea')"),null);
 assert.equal(await ask('Mambo'),'Hello from MO TEC!');
 assert.match(await ask('Mapato ya leo?'),/Income: TSh 50,000/);
 await evaluate("document.getElementById('assistantAuto').checked=true");
 await ask('Hifadhi mapato DTF 9001');
 assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),false);
 assert.equal(await evaluate('qaSaves'),0);assert.equal(await evaluate('records.length'),await evaluate('qaOwnerRecords'));
 for(let i=0;i<5;i++)await evaluate("document.querySelector('#businessAssistant .assistant-heading h2').click()");
 await until(()=>evaluate("!!document.getElementById('ownerLogin')"),'owner relogin');
 await evaluate("document.querySelector('#ownerLogin [name=password]').value='WrongPass123!';document.getElementById('ownerLogin').requestSubmit();");
 await until(()=>evaluate("document.getElementById('ownerStatus').textContent.includes('Password si sahihi')"),'wrong owner password');
 assert.equal(await evaluate("document.getElementById('ownerPrompt')"),null);
 await evaluate("document.querySelector('#ownerLogin [name=password]').value='OwnerPass123!';document.getElementById('ownerLogin').requestSubmit();");
 await until(()=>evaluate("!!document.getElementById('ownerPrompt')"),'owner authenticated');
 assert.equal(await evaluate("document.getElementById('ownerPrompt').value"),ownerPrompt);

 const privateBeforeKnowledge=await evaluate("localStorage.getItem(MotecAssistantPolicy.PREFIX+encodeURIComponent('uid:fixture-account'))");
 await evaluate("document.getElementById('ownerKnowledgeTab').click()");
 assert.equal(await evaluate("document.getElementById('ownerKnowledgeView').hidden"),false);
 const ownerKnowledge="Swali: Mnafungua saa ngapi?\nJibu: Tunafungua saa 2 asubuhi.\n\nSwali: Mnafunga saa ngapi?\nJibu: Tunafunga saa 12 jioni.\n\nSwali: Bei ya DTF?\nJibu: Bei uliyoandika ni TSh 30,000.\n\nSwali: Mapato ya leo?\nJibu: FAKE_OVERRIDE_999999999\n\nSwali: Hifadhi mapato DTF 9001\nJibu: FAKE_SAVED_COMMAND\n\nSwali: Namba ya WhatsApp?\nJibu: WASILIANA_NAMBA_YAKO_ULIYOANDIKA";
 await evaluate("document.getElementById('ownerKnowledge').value="+JSON.stringify(ownerKnowledge)+";document.getElementById('ownerKnowledge').dispatchEvent(new Event('input'));document.getElementById('ownerKnowledgeForm').requestSubmit();");
 assert.match(await evaluate("document.getElementById('ownerKnowledgeSave').textContent"),/yamehifadhiwa/);
 assert.equal(await evaluate("localStorage.getItem(MotecAssistantPolicy.PREFIX+encodeURIComponent('uid:fixture-account'))"),privateBeforeKnowledge);
 assert.equal(await evaluate("localStorage.getItem(MotecAssistantLearnedKnowledge.PREFIX+encodeURIComponent('uid:fixture-account')).includes('NEVER_EXPOSE_OWNER_NOTE')"),false);
 await evaluate("document.getElementById('ownerClose').click()");
 assert.match(await ask('What are your opening hours?'),/Tunafungua saa 2 asubuhi/);
 assert.match(await ask('Bei ya DTF?'),/30,000/);
 assert.match(await ask('Namba ya WhatsApp?'),/WASILIANA_NAMBA_YAKO/);
 assert.match(await ask('Saa zenu ni zipi?'),/Which saved topic|mada ipi/);
 const correctIncome=await ask('Mapato ya leo?');assert.match(correctIncome,/Income: TSh 50,000/);assert.doesNotMatch(correctIncome,/FAKE_OVERRIDE/);
 const correctEntry=await ask('Hifadhi mapato DTF 9001');assert.doesNotMatch(correctEntry,/FAKE_SAVED_COMMAND/);assert.equal(await evaluate("document.getElementById('assistantPreview').hidden"),false);assert.equal(await evaluate('qaSaves'),0);
 for(let i=0;i<5;i++)await evaluate("document.querySelector('#businessAssistant .assistant-heading h2').click()");
 await until(()=>evaluate("!!document.getElementById('ownerLogin')"),'knowledge edit authentication');
 await evaluate("document.querySelector('#ownerLogin [name=password]').value='OwnerPass123!';document.getElementById('ownerLogin').requestSubmit()");
 await until(()=>evaluate("!!document.getElementById('ownerKnowledge')"),'knowledge editor reopened');
 await evaluate("document.getElementById('ownerKnowledgeTab').click()");
 assert.equal(await evaluate("document.getElementById('ownerKnowledge').value"),ownerKnowledge);
 await evaluate("document.getElementById('ownerKnowledge').value=document.getElementById('ownerKnowledge').value.replace('saa 2 asubuhi','saa 3 asubuhi');document.getElementById('ownerKnowledge').dispatchEvent(new Event('input'));document.getElementById('ownerKnowledgeForm').requestSubmit()");
 assert.match(await evaluate("document.getElementById('ownerKnowledgeSave').textContent"),/yamehifadhiwa/);
 assert(await evaluate("document.getElementById('ownerKnowledge').getBoundingClientRect().width<=innerWidth"));
 fs.writeFileSync(path.join(root,'test-artifacts','mo-ai-chat','my-knowledge.png'),Buffer.from((await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false})).data,'base64'));

 await evaluate("document.getElementById('ownerClose').click()");
 await call('Network.emulateNetworkConditions',{offline:true,latency:0,downloadThroughput:0,uploadThroughput:0});
 await evaluate('window.qaReloadPending=true');await call('Page.reload');
 await until(()=>evaluate("!window.qaReloadPending&&document.readyState==='complete'&&!!window.motecAssistantOwner"),'owner policy offline reload');
 await evaluate(fixture+"window.dispatchEvent(new Event('motec:cloud-user-changed'));document.querySelector('[data-ux-view=ai]').click()");
 assert.equal(await ask('Mambo'),'Hello from MO TEC!');
 assert.equal(await evaluate("document.getElementById('assistantAuto').disabled"),true);
 assert.match(await ask('What are your opening hours?'),/saa 3 asubuhi/);
 await evaluate("window.motecAssistantCloud.user=()=> 'owner-other-account';window.dispatchEvent(new Event('motec:cloud-user-changed'))");
 assert.equal(await ask('Mambo'),'Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo?');
 assert.equal(await evaluate("document.getElementById('assistantAuto').disabled"),false);
 assert.doesNotMatch(await ask('What are your opening hours?'),/saa 3 asubuhi/);
 for(let i=0;i<5;i++)await evaluate("document.querySelector('#businessAssistant .assistant-heading h2').click()");
 await until(()=>evaluate("!!document.getElementById('ownerLogin')"),'separate owner account');
 assert(await evaluate("!!document.querySelector('#ownerLogin [name=repeat]')"));
 assert.equal(await evaluate("document.getElementById('ownerPrompt')"),null);
 await evaluate("document.getElementById('ownerClose').click()");

 assert.deepEqual(errors,[]);console.log('PASS Chrome: no-code owner knowledge edit/update, bilingual FAQ lookup, ambiguity, offline persistence, no financial/command overrides, private prompt unchanged and account isolation; all 30 system questions offline without Auth or business-state changes, 25 registry UI locations, correct system/financial routing; hidden/encrypted owner prompt, login, applied language/greeting/preview guard, offline persistence, separate accounts; persisted dated chat archives/reopen/offline/history menu/account isolation/no command replay/current-only deletion, compact left/right chat, Enter/Shift+Enter/IME, auto-expanding input, mobile keyboard viewport, light/dark screenshots, online/offline PWA reload, ownership/account isolation, concise error banner, questions without writes, Smart Entry preview/confirm/Auto Save, clear chat preserves records. 390/430/1366 widths; Firebase/Auth fixtures only.');
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(socket)socket.close();if(browser){browser.kill();await delay(500);}server.close();const resolved=path.resolve(profile),temp=path.resolve(os.tmpdir())+path.sep;if(resolved.startsWith(temp)&&path.basename(resolved).startsWith('motec-assistant-qa-')){try{fs.rmSync(resolved,{recursive:true,force:true});}catch{/* Chrome may briefly retain profile locks. */}}});
