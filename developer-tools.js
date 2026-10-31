'use strict';
(()=>{
 const KEY='motec-developer-lock-v1';
 let taps=0,lastTap=0,attempts=0,blockedUntil=0;
 const brand=document.querySelector('.business-brand');
 function config(){const raw=localStorage.getItem(KEY);if(!raw)return null;const c=JSON.parse(raw);if(typeof c.salt!=='string'||typeof c.hash!=='string')throw Error('Developer lock haisomeki.');return c}
 function openDeveloper(){try{const c=config();showBusinessDialog(c?'Developer: ingia':'Developer: weka password',`<form id="developerLogin"><label class="wide">Password ya Developer<input name="password" type="password" minlength="8" autocomplete="${c?'current-password':'new-password'}" required></label>${c?'':'<label class="wide">Rudia password<input name="repeat" type="password" minlength="8" autocomplete="new-password" required></label><p class="note">Password hii ni tofauti na kufuli ya app. Isanidi mwenyewe kabla ya kushirikisha kifaa. Hifadhi hii ya kifaa si ruhusa ya seva.</p>'}<button class="primary" type="submit">${c?'Ingia':'Hifadhi password'}</button></form><p id="developerMessage" role="status"></p>`);
 $('developerLogin').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{if(Date.now()<blockedUntil)throw Error('Subiri dakika moja kabla ya kujaribu tena.');const f=new FormData(e.target),password=f.get('password');if(password.length<8)throw Error('Tumia angalau herufi / namba 8.');if(c){const hash=await secretDigest(password,fromBase64Url(c.salt));if(hash!==c.hash){attempts++;if(attempts>=5){blockedUntil=Date.now()+60000;attempts=0}throw Error('Password si sahihi.')}}else{if(password!==f.get('repeat'))throw Error('Password hazifanani.');const salt=randomBytes(16),hash=await secretDigest(password,salt);localStorage.setItem(KEY,JSON.stringify({salt:base64Url(salt),hash}))}attempts=0;showReset(c||config())}catch(error){$('developerMessage').textContent=error.message}finally{button.disabled=false}};
 }catch(error){setStatus(error.message,true)}}
 function showReset(lock){showBusinessDialog('Developer: anza upya',`<p class="warning">Hii itafuta mauzo, matumizi, oda, historia ya wateja, stock, Notebook/PDF na nakala za kifaa. Kategoria zako, mipangilio na password zitabaki. Backup ulizopakua nje hazitafutwa.</p><button type="button" class="secondary" id="developerBackup">Pakua backup kwanza</button><form id="developerReset"><label class="wide">Andika FUTA REKODI ZOTE<input name="confirmation" autocomplete="off" required></label><label class="wide">Rudia password ya Developer<input name="password" type="password" autocomplete="current-password" required></label><button class="primary" type="submit">Futa rekodi zote kwenye kifaa hiki</button></form><p id="developerResetMessage" role="status"></p>`);
 $('developerBackup').onclick=exportBusinessBackup;
 $('developerReset').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{const f=new FormData(e.target);if(f.get('confirmation')!=='FUTA REKODI ZOTE')throw Error('Andika maneno ya uthibitisho kama yalivyo.');if(await secretDigest(f.get('password'),fromBase64Url(lock.salt))!==lock.hash)throw Error('Password si sahihi.');if(!confirm('Hatua ya mwisho: futa rekodi zote kwenye kifaa hiki?'))return;
 commitBusiness({records:[],orders:[],inventory:[],stockMoves:[],audit:[],notebook:'',notebookPdf:null,notes:[]},'Developer: rekodi zimefutwa',true);
 for(const key of [DB_KEY,ORDERS_KEY,SNAPSHOT_KEY])localStorage.removeItem(key);
 saveSettings({summaryStart:todayLocal(),summaryStartSource:'user'});
 location.reload();
 }catch(error){$('developerResetMessage').textContent='Hatua haijakamilika: '+error.message}finally{button.disabled=false}};
 }
 brand.addEventListener('click',()=>{const now=Date.now();taps=now-lastTap<1500?taps+1:1;lastTap=now;if(taps===7){taps=0;openDeveloper()}});
})();
