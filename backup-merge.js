'use strict';
(function(root){
 // IDs identify a transaction, not its amount/date: equal sales may be separate sales.
 function merge(current,incoming){
  let conflicts=0;
  const combine=(a=[],b=[])=>{const rows=new Map(a.map(item=>[item.id,item]));for(const item of b){if(!rows.has(item.id))rows.set(item.id,item);else if(JSON.stringify(rows.get(item.id))!==JSON.stringify(item))conflicts++}return [...rows.values()]};
  const result={version:2};
  for(const key of ['records','orders','inventory','stockMoves','notes'])result[key]=combine(current[key],incoming[key]);
  // Stock quantities are snapshots; never add the same stock balance twice.
  result.audit=[...(current.audit||[]),...(incoming.audit||[])].filter((item,index,rows)=>rows.findIndex(x=>x.date===item.date&&x.action===item.action)===index).slice(-200);
  result.notebook=current.notebook||incoming.notebook||'';
  if(current.notebook&&incoming.notebook&&current.notebook!==incoming.notebook){let id='merged-legacy-notebook';while(result.notes.some(n=>n.id===id&&n.body!==incoming.notebook))id+='-old';if(!result.notes.some(n=>n.id===id))result.notes.push({id,title:'Notebook kutoka backup',body:incoming.notebook,updatedAt:'2026-10-20T00:00:00.000Z'})}
  result.notebookPdf=current.notebookPdf||incoming.notebookPdf||null;
  if(current.notebookPdf&&incoming.notebookPdf&&current.notebookPdf.data!==incoming.notebookPdf.data)throw Error('PDF za Notebook zinatofautiana. Pakua na hifadhi PDF zote mbili kabla ya kuunganisha.');
  result.settings={...(incoming.settings||{}),...(current.settings||{})};
  const categories=[...new Set([...(current.settings?.categories||[]),...(incoming.settings?.categories||[])])];
  if(categories.length)result.settings.categories=categories;
  const starts=[current.settings?.summaryStart,incoming.settings?.summaryStart,...result.records.map(r=>{const d=new Date(r.date);return Number.isNaN(d.getTime())?null:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`})].filter(s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)).sort();
  if(starts.length){result.settings.summaryStart=starts[0];result.settings.summaryStartSource='first-transaction'}
  return {data:result,conflicts};
 }
 const api={merge};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecBackupMerge=api;
})(typeof window==='undefined'?globalThis:window);
