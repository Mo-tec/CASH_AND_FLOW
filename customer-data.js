'use strict';
(function(root){
 function key(name){return String(name||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase()}
 function summarize(orders,records){
  const groups=new Map(),ledger=new Map();
  for(const r of records){if(!r.orderId||r.account!=='business')continue;const row=ledger.get(r.orderId)||{paid:0,cost:0};if(r.type==='income')row.paid+=r.amount;if(r.type==='expense')row.cost+=r.amount;ledger.set(r.orderId,row)}
  for(const o of orders){if(o.account!=='business')continue;const id=key(o.customer);if(!id)continue;
   if(!groups.has(id))groups.set(id,{id,name:o.customer,phones:[],jobs:[],amount:0,paid:0,cost:0,debt:0,profit:0,cash:0,legacy:0,unpriced:0});
   const c=groups.get(id),r=ledger.get(o.id)||{paid:0,cost:0},legacy=o.legacyDeposit||0,paid=r.paid+legacy,active=o.status!=='cancelled';
   if(o.phone&&!c.phones.includes(o.phone))c.phones.push(o.phone);
   c.jobs.push({...o,paid,cost:r.cost,debt:active?Math.max(0,o.amount-paid):0,profit:active?o.amount-r.cost:-r.cost,cash:r.paid-r.cost});
   c.amount+=active?o.amount:0;c.paid+=paid;c.cost+=r.cost;c.debt+=active?Math.max(0,o.amount-paid):0;c.legacy+=legacy;c.cash+=r.paid-r.cost;if(active&&o.amount===0)c.unpriced++;
  }
  for(const r of records){if(r.account!=='business'||r.orderId||!key(r.customer))continue;const id=key(r.customer);if(!groups.has(id))groups.set(id,{id,name:r.customer,phones:[],jobs:[],amount:0,paid:0,cost:0,debt:0,profit:0,cash:0,legacy:0,unpriced:0});const c=groups.get(id),income=r.type==='income'?r.amount:0,cost=r.type==='expense'?r.amount:0;c.amount+=income;c.paid+=income;c.cost+=cost;c.cash+=income-cost;c.jobs.push({id:r.id,customer:r.customer,work:r.product||r.description||r.category,amount:income,paid:income,cost,profit:income-cost,cash:income-cost,status:'transaction',date:r.date,direct:true})}
  for(const c of groups.values())c.profit=c.amount-c.cost;
  return [...groups.values()].sort((a,b)=>a.name.localeCompare(b.name));
 }
 const api={key,summarize};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecCustomers=api;
})(typeof window==='undefined'?globalThis:window);
