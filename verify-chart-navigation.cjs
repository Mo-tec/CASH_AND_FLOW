const assert=require('assert');
const {incomeSeries}=require('./chart-data.js');
const now=new Date(2026,9,19,18);
const records=[{account:'business',type:'income',amount:100,date:new Date(2026,9,12,20).toISOString()},{account:'business',type:'income',amount:200,date:new Date(2026,9,19,10).toISOString()},{account:'business',type:'income',amount:900,date:new Date(2026,9,20,10).toISOString()}];
const total=rows=>rows.reduce((n,r)=>n+r.value,0);
assert.equal(total(incomeSeries(records,'business','day',now)),200);
assert.equal(total(incomeSeries(records,'business','day',now,-1)),100);
assert.equal(total(incomeSeries(records,'business','day',now,1)),200);
for(const mode of ['day','week','month']){
 const current=incomeSeries(records,'business',mode,now),previous=incomeSeries(records,'business',mode,now,-1);
 assert.equal(previous.at(-1).finish.getTime(),current[0].start.getTime());
 assert.equal(total(incomeSeries(records,'personal',mode,now,-1)),0);
}
console.log('PASS: previous/current periods, contiguous dates, future exclusion and account isolation.');
