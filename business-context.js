'use strict';
// Read only. Never serialize credentials, private prompts, receipts or browser storage.
(function(root){
 let runtimeErrors=0,rejectedPromises=0;
 root.addEventListener?.('error',()=>{runtimeErrors++;});
 root.addEventListener?.('unhandledrejection',()=>{rejectedPromises++;});
 function summarize(raw,question,now=new Date()){
  const engine=root.MotecAssistantEngine,analysis=root.MotecAssistantAnalysis;
  const today=engine.day(now),records=raw.records.filter(r=>r.account==='business'&&engine.day(r.date)<=today);
  const first=records.reduce((s,r)=>engine.day(r.date)<s?engine.day(r.date):s,today);
  const range=/muda wote|all time/i.test(question)?analysis.makeRange(first,today):analysis.period(question,now),inRange=r=>engine.day(r.date)>=range.start&&engine.day(r.date)<=range.end;
  const current=records.filter(inRange),orders=(raw.orders||[]).filter(o=>o.account==='business');
  const customers=root.MotecCustomers.summarize(orders,records).map(c=>({name:c.name,orderValue:c.amount,paidIncludingLegacy:c.paid,linkedCost:c.cost,outstandingDebt:c.debt,legacyDeposit:c.legacy,jobCount:c.jobs.length}));
  const receipts=new Map();for(const r of current){const name=r.customer||orders.find(o=>o.id===r.orderId)?.customer;if(!name)continue;const key=root.MotecCustomers.key(name),c=receipts.get(key)||{name,received:0,incomeTransactions:0,linkedExpense:0};if(r.type==='income'){c.received+=r.amount;c.incomeTransactions++;}else c.linkedExpense+=r.amount;receipts.set(key,c);}
  const start=records.reduce((s,r)=>engine.day(r.date)<s?engine.day(r.date):s,today);
  const result={asOf:now.toISOString(),timezone:'Africa/Dar_es_Salaam',currency:'TSh',period:range,current:analysis.calculate(records,range),previous:analysis.calculate(records,range.previous),allTime:analysis.calculate(records,analysis.makeRange(start,today)),customersAllTime:customers.sort((a,b)=>b.paidIncludingLegacy-a.paidIncludingLegacy),customersInPeriod:[...receipts.values()].sort((a,b)=>b.received-a.received),orders:orders.map(o=>({customer:o.customer,work:o.work,date:o.date,due:o.due,status:o.status,amount:o.amount,legacyDeposit:o.legacyDeposit})),inventory:(raw.inventory||[]).map(s=>({name:s.name,quantity:s.quantity,unit:s.unit,minimum:s.minimum,low:s.quantity<=s.minimum})),coverage:{records:records.length,orders:orders.length,customers:customers.length,notes:'Not supplied',receipts:'Not supplied',privateInstructions:'Not supplied'},limits:['Cash flow is not verified net profit.','Legacy deposits are historical payments, not new cash.','Customer received ranks payments; transaction count is not number of purchases.','Unrecorded activity and unlinked costs are unknown.']};
  if(JSON.stringify(result).length>100000)throw Error('Data ni nyingi kwa muhtasari mmoja. Taja kipindi au mada maalumu.');
  return result;
 }
 async function build(question,cloud){
  const expected=cloud.user();if(!expected)throw Error('Ingia Firebase kupata uchambuzi wa biashara.');
  let source,dataError;try{source=await cloud.source();}catch{dataError='Firebase snapshot unavailable; do not infer zero activity.';}
  if(cloud.user()!==expected||source&&source.uid!==expected)throw Error('Akaunti imebadilika.');
  const now=new Date(),context={version:1,source:'Firebase snapshot',fetchedAt:now.toISOString(),dataError};
  if(source){try{context.business=summarize(source.raw,question,now);}catch(error){context.dataError=error.message;}}
  let registration,updateCheck='not requested';try{registration=await navigator.serviceWorker?.getRegistration();if(registration&&/update|sasisho|shida|tatizo|diagnos|kagua|problem/i.test(question)){await registration.update();updateCheck='requested; installation may still be in progress';}}catch{updateCheck='failed or unavailable';}
  context.app={observedAt:new Date().toISOString(),online:navigator.onLine,secureContext:root.isSecureContext,serviceWorkerSupported:'serviceWorker' in navigator,serviceWorkerControlled:!!navigator.serviceWorker?.controller,updateWaiting:registration?!!registration.waiting:null,updateInstalling:registration?!!registration.installing:null,limits:'Only observed browser state. No complete bug scan. No guarantee of monitoring while app is closed. No update check was requested from server.'};
  context.app.updateCheck=updateCheck;context.app.runtimeErrorsSincePageLoad=runtimeErrors;context.app.unhandledRejectionsSincePageLoad=rejectedPromises;
  context.app.limits='Observed browser state and error counts since page load only. No complete bug scan or continuous monitoring while app is closed. Fetch time is not the last business modification time. An update check can still be installing.';
  if(cloud.user()!==expected)throw Error('Akaunti imebadilika.');return context;
 }
 const api={summarize,build};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.motecBusinessContext=api;
})(typeof window==='undefined'?globalThis:window);
