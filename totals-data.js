'use strict';
(function(root){
 function dateKey(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
 function validDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const d=new Date(value+'T00:00:00');return !Number.isNaN(d.getTime())&&dateKey(d)===value}
 function inferStart(records,now=new Date()){const dates=records.map(r=>new Date(r.date)).filter(d=>!Number.isNaN(d.getTime())&&d<=now);return dateKey(dates.length?new Date(Math.min(...dates.map(d=>d.getTime()))):now)}
 function summarize(records,account,start,now=new Date()){if(!validDate(start))throw Error('Invalid start date');const startAt=new Date(start+'T00:00:00'),rows=records.filter(r=>{const d=new Date(r.date);return r.account===account&&d>=startAt&&d<=now&&Number.isSafeInteger(r.amount)&&r.amount>0&&['income','expense'].includes(r.type)});const income=rows.filter(r=>r.type==='income').reduce((s,r)=>s+r.amount,0),expense=rows.filter(r=>r.type==='expense').reduce((s,r)=>s+r.amount,0);return {income,expense,balance:income-expense,count:rows.length}}
 const api={dateKey,validDate,inferStart,summarize};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecTotals=api;
})(typeof window==='undefined'?globalThis:window);
