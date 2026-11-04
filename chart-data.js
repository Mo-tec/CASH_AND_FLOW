'use strict';
// Local calendar boundaries: never bucket by UTC strings when the device is in Tanzania.
(function(root){
 function startOfDay(d){const x=new Date(d);x.setHours(0,0,0,0);return x}
 function incomeSeries(records,account,mode,now=new Date(),offset=0){
  if(!['day','week','month'].includes(mode))mode='day';
  const count={day:7,week:8,month:12}[mode],end=startOfDay(now),items=[];
  if(mode==='week')end.setDate(end.getDate()-(end.getDay()+6)%7);
  if(mode==='month')end.setDate(1);
  offset=Number.isSafeInteger(offset)?Math.min(0,offset):0;
  if(mode==='month')end.setMonth(end.getMonth()+offset*count);
  else end.setDate(end.getDate()+offset*count*(mode==='week'?7:1));
  for(let i=count-1;i>=0;i--){const start=new Date(end),finish=new Date(end);if(mode==='month'){start.setMonth(start.getMonth()-i);finish.setMonth(finish.getMonth()-i+1)}else{const span=mode==='week'?7:1;start.setDate(start.getDate()-i*span);finish.setDate(finish.getDate()+(1-i)*span)}items.push({start,finish,value:0})}
  for(const r of records){if(r.account!==account||r.type!=='income'||!Number.isSafeInteger(r.amount)||r.amount<=0)continue;const date=new Date(r.date);if(Number.isNaN(date.getTime())||date>now)continue;const item=items.find(x=>date>=x.start&&date<x.finish);if(item)item.value+=r.amount}
  return items;
 }
 const api={incomeSeries};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecChartData=api;
})(typeof window==='undefined'?globalThis:window);
