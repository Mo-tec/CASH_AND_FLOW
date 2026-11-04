'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const D=require('./assistant-data');
const rows=[{id:'one',account:'business',type:'income',amount:30000,category:'DTF',date:'2026-11-04T12:00:00+03:00'}];
const raw={version:2,records:rows,orders:[],inventory:[],settings:{categories:['DTF']}};
const validRecord=r=>r&&typeof r.id==='string'&&['business','personal'].includes(r.account)&&['income','expense'].includes(r.type)&&Number.isSafeInteger(r.amount)&&r.amount>0&&typeof r.category==='string'&&!Number.isNaN(Date.parse(r.date));
function scenario({uid='A',online=true,local=raw,remote=raw,legacy=false,loading=false}={}){
 let user=loading?null:uid,network=online,remoteReads=0,deviceValue=local,authReads=0,restore=loading;
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const cloud={user:()=>user,ready:async()=>{authReads++;if(restore){user=uid;restore=false;}},source:async()=>{remoteReads++;return {uid:user,raw:remote};},verifyLocal:async()=>legacy};
 const service=()=>D.create({storage,cloud,device:()=>({raw:deviceValue}),online:()=>network,validRecord});
 return {map,storage,cloud,service,setUser:x=>user=x,setOnline:x=>network=x,setDevice:x=>deviceValue=x,reads:()=>remoteReads,authReads:()=>authReads};
}
async function run(){
 // First request waits for Auth; a matching legacy fingerprint is valid offline even when sync is inactive.
 const delayed=scenario({loading:true,online:false,legacy:true});delayed.storage.setItem('motec-cloud-sync-v1',JSON.stringify({uid:'A',hash:'legacy'}));
 const restored=await delayed.service().source('device');assert.equal(restored.uid,'A');assert.equal(delayed.reads(),0);assert(delayed.authReads()>0);
 assert.equal(JSON.parse(delayed.storage.getItem(D.OWNER)).uid,'A');
 // Ownership persists across restart without consulting a mutable synchronization flag.
 delayed.cloud.verifyLocal=async()=>false;assert.equal((await delayed.service().source('device')).raw.records[0].amount,30000);
 delayed.setUser('B');await assert.rejects(()=>delayed.service().source('device'),e=>e.code==='device/unverified');
 delayed.setUser(null);await assert.rejects(()=>delayed.service().source('device'),e=>e.code==='auth/required');
 delayed.setUser('A');delayed.setDevice({...raw,records:[{...rows[0],amount:31000}]});await assert.rejects(()=>delayed.service().source('device'),e=>e.code==='device/unverified');
 // Missing marker is repaired through a read-only exact server comparison, never by assigning UID on sign-in.
 const missing=scenario();const verified=await missing.service().source('device');assert.equal(verified.uid,'A');assert.equal(missing.reads(),1);assert(missing.storage.getItem(D.OWNER));
 missing.setOnline(false);assert.equal((await missing.service().source('device')).origin,'device');
 const mismatch=scenario({remote:{...raw,records:[]}});await assert.rejects(()=>mismatch.service().source('device'),e=>e.code==='device/unverified');assert.equal(mismatch.storage.getItem(D.OWNER),null);
 assert.equal((await mismatch.service().source('cloud')).raw.records.length,0);assert.equal(mismatch.reads(),2);
 // A stale account marker is insufficient, even when UID matches; a mismatched marker can be superseded only by proof.
 const stale=scenario({online:false});stale.storage.setItem('motec-cloud-sync-v1',JSON.stringify({uid:'A'}));await assert.rejects(()=>stale.service().source('device'),e=>e.code==='device/unverified');
 const other=scenario();other.storage.setItem('motec-cloud-sync-v1',JSON.stringify({uid:'B'}));assert.equal((await other.service().source('device')).uid,'A');
 // Anonymous offline records stay usable if no account has ever claimed the device.
 const anonymous=scenario({uid:null,online:false});anonymous.cloud.ready=async()=>{throw TypeError('SDK unavailable');};assert.equal((await anonymous.service().source('auto')).origin,'device');
 anonymous.storage.setItem('motec-cloud-sync-v1',JSON.stringify({uid:'A'}));await assert.rejects(()=>anonymous.service().source('auto'),e=>e.code==='auth/required');
 const pending=scenario({uid:null});pending.cloud.ready=async()=>{throw Object.assign(Error('pending'),{code:'auth/pending'});};await assert.rejects(()=>pending.service().source('auto'),e=>e.code==='auth/pending');
 // Account changes and local edits during verification do not stamp an ownership proof.
 const race=scenario();race.cloud.source=async()=>{race.setUser('B');return {uid:'A',raw};};await assert.rejects(()=>race.service().source('device'),e=>e.code==='auth/changed');assert.equal(race.storage.getItem(D.OWNER),null);
 const changed=scenario();changed.cloud.source=async()=>{changed.setDevice({...raw,records:[]});return {uid:'A',raw};};await assert.rejects(()=>changed.service().source('device'),e=>e.code==='data/changed');assert.equal(changed.storage.getItem(D.OWNER),null);
 const invalid=scenario({online:false});invalid.storage.setItem('motec-cloud-sync-v1','true');await assert.rejects(()=>invalid.service().source('device'),e=>e.code==='cache/invalid');invalid.map.delete('motec-cloud-sync-v1');invalid.storage.setItem(D.OWNER,JSON.stringify({version:1,uid:'A',hash:'broken'}));await assert.rejects(()=>invalid.service().source('device'),e=>e.code==='cache/invalid');
 // Fresh snapshots remain UID scoped and do not append duplicates after reconnect.
 const reconnect=scenario();await reconnect.service().source('cloud');reconnect.setOnline(false);assert.equal((await reconnect.service().source('auto')).raw.records.length,1);reconnect.setUser('B');await assert.rejects(()=>reconnect.service().source('cloud'),e=>e.code==='cache/missing');reconnect.setUser('A');reconnect.setOnline(true);await reconnect.service().refresh();await reconnect.service().refresh();assert.equal((await reconnect.service().source('cloud')).raw.records.length,1);
 await firebaseBridge();console.log('PASS ownership/Auth regressions: delayed restoration, legacy fingerprint offline, missing/stale/wrong markers, exact snapshot verification, persisted ownership, edited data, signed-out/cross-account rejection, verification races, anonymous offline and reconnect. No transaction writes.');
}
async function firebaseBridge(){
 const source=fs.readFileSync('firebase-cloud.js','utf8');let actual='A',hash='good',calls=0,resolveInit;
 const context={window:{motecReportCloud:{user:()=>actual}},user:{uid:'A'},authSettled:false,waitForAuth:async()=>{},requireUser:()=>({uid:actual}),savedMarker:()=>({uid:'A',hash:'good'}),dataset:()=>raw,records:rows,fingerprint:async()=>hash};
 vm.createContext(context);vm.runInContext(source.slice(source.indexOf(' window.motecAssistantCloud ='),source.indexOf(' async function initializeSync')),context);
 assert.equal(await context.window.motecAssistantCloud.verifyLocal(rows),true);hash='changed';assert.equal(await context.window.motecAssistantCloud.verifyLocal(rows),false);hash='good';assert.equal(await context.window.motecAssistantCloud.verifyLocal([{...rows[0],amount:2}]),false);
 const init={services:null,initializing:null,initializeFirebase:()=>{calls++;return new Promise(resolve=>resolveInit=resolve);}};
 vm.createContext(init);vm.runInContext(source.slice(source.indexOf(' async function init()'),source.indexOf(' async function waitForAuth()')),init);const one=init.init(),two=init.init();assert.equal(calls,1);resolveInit({ready:true});await Promise.all([one,two]);
 let resolveAuth;const auth={authSettled:false,authReady:new Promise(resolve=>resolveAuth=resolve),init:async()=>({}),setTimeout,clearTimeout};
 vm.createContext(auth);vm.runInContext(source.slice(source.indexOf(' async function waitForAuth()'),source.indexOf(' async function run(action)')),auth);let settled=false;const waiting=auth.waitForAuth().then(()=>settled=true);await Promise.resolve();assert.equal(settled,false);resolveAuth();await waiting;assert.equal(settled,true);
}
run().catch(error=>{console.error(error);process.exitCode=1;});
