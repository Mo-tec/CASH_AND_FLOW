'use strict';
// Local, single-owner API gateway. Never expose this server to a public interface.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),https=require('node:https'),http=require('node:http'),dns=require('node:dns').promises;
const fail=(message,status=400)=>Object.assign(Error(message),{status});
const derive=(password,salt)=>new Promise((resolve,reject)=>crypto.scrypt(password,salt,32,(e,key)=>e?reject(e):resolve(key)));
function publicAddress(ip){
 if(ip.includes(':'))return /^[23][0-9a-f]{3}:/i.test(ip)&&!/^200[12]:/i.test(ip);
 const a=ip.split('.').map(Number);if(a.length!==4||a.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
 return !(a[0]===0||a[0]===10||a[0]===127||a[0]>=224||a[0]===169&&a[1]===254||a[0]===172&&a[1]>=16&&a[1]<=31||a[0]===192&&(a[1]===168||a[1]===0||a[1]===2)||a[0]===100&&a[1]>=64&&a[1]<=127||a[0]===198&&(a[1]===18||a[1]===19||a[1]===51)||a[0]===203&&a[1]===0&&a[2]===113);
}
function validateProfile(input,old={}){
 const p={id:old.id||crypto.randomUUID(),name:String(input.name||'').trim(),protocol:input.protocol,baseUrl:String(input.baseUrl||'').trim(),model:String(input.model||'').trim(),apiKey:input.apiKey===undefined||input.apiKey===''?old.apiKey||'':String(input.apiKey),timeout:Number(input.timeout),maxTokens:Number(input.maxTokens),dailyLimit:Number(input.dailyLimit)};
 if(!p.name||p.name.length>60||!['compatible','anthropic','gemini','ollama'].includes(p.protocol))throw fail('Jina au aina ya API si sahihi.');
 let url;try{url=new URL(p.baseUrl);}catch{throw fail('Base URL si sahihi.');}
 if(url.username||url.password||url.search||url.hash)throw fail('URL isiwe na password, query au fragment.');
 if(p.protocol==='ollama'){
  if(url.origin!=='http://127.0.0.1:11434'||url.pathname.replace(/\/$/,'')!=='/v1')throw fail('Ollama: tumia http://127.0.0.1:11434/v1 pekee.');
  if(p.apiKey)throw fail('Usiweke API key kwenye Ollama ya ndani.');
 }else if(url.protocol!=='https:'||url.port&&url.port!=='443')throw fail('API ya nje inahitaji HTTPS port 443.');
 p.baseUrl=url.href.replace(/\/$/,'');
 if(!p.model||p.model.length>160||! /^[a-zA-Z0-9._:/-]+$/.test(p.model))throw fail('Andika jina sahihi la model.');
 if(p.apiKey.length>4096||/[\r\n]/.test(p.apiKey)||p.protocol!=='ollama'&&!p.apiKey)throw fail('Weka API key halali.');
 if(!Number.isInteger(p.timeout)||p.timeout<5||p.timeout>120||!Number.isInteger(p.maxTokens)||p.maxTokens<64||p.maxTokens>8192||!Number.isInteger(p.dailyLimit)||p.dailyLimit<1||p.dailyLimit>1000)throw fail('Kagua timeout, token limit na daily request limit.');
 return p;
}
function createGateway({directory=path.join(__dirname,'.private'),request=upstream}={}){
 const file=path.join(directory,'api-vault.json');let envelope=null;
 if(fs.existsSync(file))envelope=JSON.parse(fs.readFileSync(file,'utf8'));
 const sessions=new Map();let failures=0,blockedUntil=0,loginBusy=false,active=0;const recent=[];
 function persist(vault,key,salt){
  const iv=crypto.randomBytes(12),cipher=crypto.createCipheriv('aes-256-gcm',key,iv),data=Buffer.concat([cipher.update(JSON.stringify(vault)),cipher.final()]);
  const next={version:1,salt,iv:iv.toString('base64'),tag:cipher.getAuthTag().toString('base64'),data:data.toString('base64')};
  fs.mkdirSync(directory,{recursive:true,mode:0o700});fs.writeFileSync(file+'.tmp',JSON.stringify(next),{mode:0o600});fs.renameSync(file+'.tmp',file);envelope=next;
 }
 function open(key){try{const d=crypto.createDecipheriv('aes-256-gcm',key,Buffer.from(envelope.iv,'base64'));d.setAuthTag(Buffer.from(envelope.tag,'base64'));return JSON.parse(Buffer.concat([d.update(Buffer.from(envelope.data,'base64')),d.final()]).toString());}catch{throw fail('Password si sahihi au vault haisomeki.',401);}}
 const safe=p=>{const {apiKey,...rest}=p;return {...rest,hasKey:!!apiKey,keyHint:apiKey?'••••'+(apiKey.length>8?apiKey.slice(-4):''):''};};
 async function handle(req,res){
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/'))return false;
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
  try{
   const host=req.headers.host;
   if(!/^(127\.0\.0\.1|localhost):\d+$/.test(host||''))throw fail('Host imekataliwa.',403);
   if(req.headers.origin&&req.headers.origin!==`http://${host}`||req.headers['sec-fetch-site']==='cross-site')throw fail('Origin imekataliwa.',403);
   if(req.method==='GET'&&url.pathname==='/api/status'){send(200,{configured:!!envelope});return true;}
   if(req.method!=='POST'||!String(req.headers['content-type']).startsWith('application/json'))throw fail('Tumia POST JSON.',405);
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>32768)throw fail('Ombi ni kubwa mno.',413);}
   let body;try{body=JSON.parse(raw);}catch{throw fail('JSON si sahihi.');}
   if(!body||typeof body!=='object'||Array.isArray(body))throw fail('Ombi si sahihi.');
   if(url.pathname==='/api/login'){
    if(loginBusy||Date.now()<blockedUntil)throw fail('Subiri dakika moja kisha ujaribu tena.',429);
    if(typeof body.password!=='string'||body.password.length<12||body.password.length>256)throw fail('Password iwe na herufi/namba 12–256.');
    loginBusy=true;try{
     const salt=envelope?.salt||crypto.randomBytes(16).toString('base64'),key=await derive(body.password,salt);
     let vault;if(envelope)vault=open(key);else{vault={profiles:[],selected:null,usage:{}};persist(vault,key,salt);}
     failures=0;const token=crypto.randomBytes(32).toString('hex');
     for(const [id,s]of sessions)if(s.until<Date.now())sessions.delete(id);
     if(sessions.size>=8)sessions.delete(sessions.keys().next().value);
     sessions.set(token,{key,until:Date.now()+30*60000});send(200,{token});
    }catch(e){if(++failures>=5){blockedUntil=Date.now()+60000;failures=0;}throw e;}finally{loginBusy=false;}return true;
   }
   const token=String(req.headers.authorization||'').replace(/^Bearer /,''),session=sessions.get(token);
   if(!session||session.until<Date.now()){sessions.delete(token);throw fail('Ingia tena kwenye API Settings.',401);}
   if(url.pathname==='/api/logout'){sessions.delete(token);send(200,{ok:true});return true;}
   const vault=open(session.key),save=()=>persist(vault,session.key,envelope.salt);
   const summary=()=>({profiles:vault.profiles.map(safe),selected:vault.selected,usage:vault.usage});
   if(url.pathname==='/api/config'){send(200,summary());return true;}
   if(url.pathname==='/api/save'){
    if(body.id&&!vault.profiles.some(p=>p.id===body.id))throw fail('Config haipo.',404);
    const old=vault.profiles.find(p=>p.id===body.id),p=validateProfile(body,old);
    if(!old&&vault.profiles.length>=20)throw fail('Configs zisizidi 20.');
    vault.profiles=old?vault.profiles.map(x=>x.id===p.id?p:x):[...vault.profiles,p];
    if(body.activate===true)vault.selected=p.id;save();send(200,summary());return true;
   }
   if(url.pathname==='/api/select'){
    if(body.id!==null&&!vault.profiles.some(p=>p.id===body.id))throw fail('Config haipo.',404);
    vault.selected=body.id;save();send(200,summary());return true;
   }
   if(url.pathname==='/api/delete'){
    vault.profiles=vault.profiles.filter(p=>p.id!==body.id);if(vault.selected===body.id)vault.selected=null;save();send(200,summary());return true;
   }
   if(!['/api/test','/api/models','/api/chat'].includes(url.pathname))throw fail('Njia haipo.',404);
   const p=vault.profiles.find(p=>p.id===(url.pathname==='/api/chat'?vault.selected:body.id));if(!p)throw fail('Chagua config iliyohifadhiwa kwanza.');
   const now=Date.now();while(recent.length&&recent[0]<now-60000)recent.shift();
   if(active>=2||recent.length>=12)throw fail('Requests ni nyingi. Subiri kidogo.',429);
   const day=new Date().toISOString().slice(0,10),usage=vault.usage[p.id];
   if(usage?.day===day&&usage.count>=p.dailyLimit)throw fail('Umefikia kikomo cha requests cha leo (UTC).',429);
   const chat=url.pathname==='/api/chat';
   if(chat&&(typeof body.message!=='string'||!body.message.trim()||body.message.length>3000))throw fail('Ujumbe uwe na herufi 1–3000.');
   vault.usage[p.id]={day,count:usage?.day===day?usage.count+1:1};save();recent.push(now);active++;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),p.timeout*1000),closed=()=>{if(!res.writableEnded)controller.abort();};res.on('close',closed);
   try{
    const started=Date.now();
    if(chat){
     res.writeHead(200,{'Content-Type':'application/x-ndjson','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.flushHeaders();
     const emit=value=>{if(!res.destroyed)res.write(JSON.stringify(value)+'\n');};
     let length=0;await request(p,'chat',body.message,controller.signal,delta=>{length+=delta.length;if(length>65536)throw fail('Jibu limezidi kikomo.');emit({delta});});
     emit({done:true,model:p.model,ms:Date.now()-started});res.end();
    }else{const result=await request(p,url.pathname==='/api/models'?'models':'test','Reply with OK.',controller.signal);send(200,{ok:true,model:p.model,ms:Date.now()-started,...result});}
   }catch(e){const message=controller.signal.aborted?'Ombi limeghairiwa au limepita timeout.':e.status?e.message:'Connection imeshindwa. Kagua URL, model na API key.';if(res.headersSent){res.end(JSON.stringify({error:message})+'\n');}else send(e.status||502,{error:message});}
   finally{active--;clearTimeout(timer);res.removeListener('close',closed);}return true;
  }catch(e){if(!res.headersSent)send(e.status||500,{error:e.status?e.message:'Seva imeshindwa kusoma au kuhifadhi config.'});else res.end();return true;}
 }
 return {handle};
}
async function upstream(p,action,message,signal,onDelta){
 const base=new URL(p.baseUrl+'/');let addresses;
 if(p.protocol==='ollama')addresses=[{address:'127.0.0.1',family:4}];
 else{addresses=await dns.lookup(base.hostname.replace(/^\[|\]$/g,''),{all:true});if(!addresses.length||addresses.some(x=>!publicAddress(x.address)))throw fail('API URL inaelekeza kwenye mtandao binafsi.',403);}
 const stream=action==='chat',models=action==='models',limit=action==='test'?64:p.maxTokens;
 let endpoint=models?'models':'chat/completions',headers={'Content-Type':'application/json'},payload;
 const instruction='You are MO AI, a helpful business assistant. Reply in the language of the user. You have no access to business records or tools and cannot save or change transactions. Do not invent account balances or claim you performed actions.';
 if(p.protocol==='gemini'){
  endpoint=models?'models':`models/${encodeURIComponent(p.model.replace(/^models\//,''))}:${stream?'streamGenerateContent?alt=sse':'generateContent'}`;
  headers['x-goog-api-key']=p.apiKey;payload={systemInstruction:{parts:[{text:instruction}]},contents:[{role:'user',parts:[{text:message}]}],generationConfig:{maxOutputTokens:limit}};
 }else if(p.protocol==='anthropic'){
  headers['x-api-key']=p.apiKey;headers['anthropic-version']='2023-06-01';endpoint=models?'models':'messages';payload={model:p.model,system:instruction,messages:[{role:'user',content:message}],max_tokens:limit,stream};
 }else{if(p.apiKey)headers.Authorization='Bearer '+p.apiKey;payload={model:p.model,messages:[{role:'system',content:instruction},{role:'user',content:message}],max_tokens:limit,stream};}
 const target=new URL(endpoint,base),transport=target.protocol==='https:'?https:http;
 const response=await new Promise((resolve,reject)=>{
  const req=transport.request(target,{method:models?'GET':'POST',headers,signal,lookup:(_host,options,cb)=>{const a=addresses[0];cb(null,options.all?[a]:a.address,a.family);}},resolve);req.on('error',reject);req.end(models?undefined:JSON.stringify(payload));
 });
 // Redirects are deliberately rejected, so keys never follow redirects.
 if(response.statusCode<200||response.statusCode>=300){response.destroy();throw fail(`Provider amekataa ombi (HTTP ${response.statusCode}). Kagua key, model, quota na Base URL.`,502);}
 let size=0;
 if(!stream){let text='';for await(const chunk of response){size+=chunk.length;if(size>1048576){response.destroy();throw fail('Jibu la provider ni kubwa mno.',502);}text+=chunk;}let data;try{data=JSON.parse(text);}catch{throw fail('Provider hajarudisha JSON halali.',502);}
  if(models){const list=data.data||data.models;if(!Array.isArray(list))throw fail('Provider hana orodha ya models. Andika jina mwenyewe.',502);return {models:list.map(x=>x.id||x.name).filter(x=>typeof x==='string').slice(0,500)};}
  const reply=data.choices?.[0]?.message?.content||data.content?.filter(x=>x.type==='text').map(x=>x.text).join('')||data.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('');if(typeof reply!=='string'||!reply.trim())throw fail('Model haijarudisha maandishi. Kagua model na token limit.',502);return {};
 }
 if(!String(response.headers['content-type']).includes('text/event-stream')){response.destroy();throw fail('Provider haungi mkono SSE streaming kwa config hii.',502);}
 const decoder=new TextDecoder();let buffer='',received=false;
 function event(block){const raw=block.split('\n').filter(x=>x.startsWith('data:')).map(x=>x.slice(5).trim()).join('\n');if(!raw||raw==='[DONE]')return;let data;try{data=JSON.parse(raw);}catch{throw fail('Stream ya provider haisomeki.',502);}if(data.error||data.type==='error')throw fail('Provider amesitisha jibu. Kagua quota au model.',502);
  const delta=data.choices?.[0]?.delta?.content||data.delta?.text||data.candidates?.[0]?.content?.parts?.filter(x=>!x.thought).map(x=>x.text||'').join('');if(typeof delta==='string'&&delta){received=true;onDelta(delta);}}
 for await(const chunk of response){size+=chunk.length;if(size>2097152){response.destroy();throw fail('Stream imezidi kikomo.',502);}buffer+=decoder.decode(chunk,{stream:true}).replace(/\r/g,'');let pos;while((pos=buffer.indexOf('\n\n'))>=0){event(buffer.slice(0,pos));buffer=buffer.slice(pos+2);}}
 buffer+=decoder.decode();if(buffer.trim())event(buffer);if(!received)throw fail('Model haijarudisha maandishi. Kagua model na token limit.',502);return {};
}
module.exports={createGateway,validateProfile,publicAddress,upstream};
