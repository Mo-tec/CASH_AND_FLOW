const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {merge}=require('./backup-merge.js');
const source=fs.readFileSync('firebase-cloud.js','utf8');
const row=id=>({id,account:'business',type:'income',amount:100,category:'Sale',date:'2026-10-13T12:00:00+03:00'});
const empty=()=>({version:2,records:[],orders:[],inventory:[],notes:[]});
async function scenario({cancel=false,race=false}={}){
 let local={...empty(),records:[row('new')]},remote={...empty(),records:[row('old')]},queries=0,applied=0;const writes=[];
 const latest={ref:{path:'users/test/backups/old'}};
 const ctx={uploading:false,checking:false,businessLoadFailed:false,storageLoadFailed:false,ordersLoadFailed:false,active:false,baseline:null,user:{uid:'test'},TextEncoder,Date,Error,JSON,
 init:async()=>({db:{doc:(parent,...parts)=>({path:[parent.path,...parts].filter(Boolean).join('/')}),setDoc:async(ref,data)=>writes.push({ref,data}),serverTimestamp:()=>123},firestore:{}}),
 requireUser:()=>({uid:'test',email:'test@example.test'}),latestBackup:async()=>++queries>1&&race?{ref:{path:'users/test/backups/other-device'}}:latest,
 readBackup:async()=>remote,mergeBusinessBackup:raw=>merge(local,raw),mergeBackupMessage:()=> 'Confirm merge',confirm:()=>!cancel,
 applyCloudBackup:data=>{local=data;applied++},dataset:()=>local,backupPayload:()=>local,fingerprint:async data=>JSON.stringify(data),randomId:()=> 'test',status(){},remember(uid,path,hash){ctx.baseline={hash,path}},scheduleAuto(){}};
 vm.createContext(ctx);vm.runInContext(source.slice(source.indexOf(' async function uploadSnapshot(manual)'),source.indexOf(" el('cloudUpload').onclick")),ctx);
 if(race){await assert.rejects(()=>ctx.uploadSnapshot(true),/Kifaa kingine/);assert.equal(writes.filter(w=>w.data.count).length,0);assert.equal(local.records.length,2)}
 else {await ctx.uploadSnapshot(true);if(cancel){assert.equal(applied,0);assert.equal(writes.length,0);assert.equal(local.records.length,1)}else{const chunks=writes.filter(w=>w.data.part).map(w=>w.data.part).join('');assert.deepEqual(JSON.parse(chunks).records.map(r=>r.id).sort(),['new','old']);assert.equal(writes.filter(w=>w.data.count).length,1);assert.equal(local.records.length,2);await ctx.uploadSnapshot(true);assert.equal(local.records.length,2)}}
 assert.equal(ctx.uploading,false);
}
(async()=>{await scenario();await scenario({cancel:true});await scenario({race:true});console.log('PASS: actual Firebase upload merges old/new, repeated uploads do not duplicate, cancellation leaves data untouched, remote change stops publication. Mock Firebase only.');})().catch(e=>{console.error(e);process.exitCode=1});
