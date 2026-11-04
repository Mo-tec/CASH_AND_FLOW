'use strict';
// Pure rules and calculations: deliberately independent of UI and Firebase.
(function(root){
 const norm=s=>String(s).toLowerCase().normalize('NFKC').replace(/\s+/g,' ').trim();
 const day=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Dar_es_Salaam',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(d));
 const shift=(s,n)=>new Date(Date.parse(s+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 function valid(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
 function period(text,now=new Date()){
  const q=norm(text),today=day(now);let start=today,end=today;
  const dates=q.match(/\d{4}-\d{2}-\d{2}/g)||[];
  if(/tomorrow|kesho|year|mwaka|all time|muda wote|last \d|siku \d|wiki \d/.test(q)&&!dates.length)throw Error('Kipindi hakitumiki bado; taja tarehe kamili / Specify full start and end dates.');
  if(dates.length){if(dates.length>2||!dates.every(valid))throw Error('Tarehe si sahihi / Invalid date.');[start,end]=[dates[0],dates[1]||dates[0]];}
  else if(/tarehe|kuanzia|\bfrom\b|\bbetween\b|\bon \d|\bdate\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december|januari|februari|machi|aprili|mei|juni|julai|agosti|septemba|oktoba|novemba|desemba)\b/.test(q))throw Error('Taja tarehe kamili, mfano 2026-11-13 hadi 2026-11-16 / Use full ISO dates.');
  else if(/juzi|day before yesterday/.test(q))start=end=shift(today,-2);
  else if(/jana|yesterday/.test(q))start=end=shift(today,-1);
  else if(/wiki|week/.test(q)){const wd=new Date(today+'T12:00:00Z').getUTCDay()||7;start=shift(today,1-wd);if(/iliyopita|last|previous/.test(q)){start=shift(start,-7);end=shift(start,6);}else end=today;}
  else if(/mwezi|month/.test(q)){start=today.slice(0,8)+'01';if(/uliopita|last|previous/.test(q)){end=shift(start,-1);start=end.slice(0,8)+'01';}}
  if(start>end)throw Error('Tarehe ya mwisho iko kabla ya mwanzo / Reversed date range.');
  const length=Math.round((Date.parse(end)-Date.parse(start))/86400000)+1;
  return {start,end,previous:{start:shift(start,-length),end:shift(start,-1)}};
 }
 function intent(text){const q=norm(text);
  if(/^(?:mambo|habari|hujambo|salama|hello|hi|hey)[\s!?.]*$/.test(q))return 'greeting';
  if(/\b(help|msaada)\b/.test(q))return 'help';
  if(/\b(save|record|add|ingiza|hifadhi|nimeingiza|nimetoa|nimetumia|nimepokea|nimepata|received|paid|spent|earned)\b/.test(q)&&/\d/.test(q.replace(/\d{4}-\d{2}-\d{2}/g,''))&&!/ngapi|kiasi gani|how much|\?/.test(q))return 'create';
  if(/ongezeka|pungua|trend|compar|mabadiliko|increased|decreased/.test(q))return 'trend';
  if(/category|kategoria|kwenye nini/.test(q))return 'category';
  if(/salio|balance|tofauti/.test(q))return 'balance';
  if(/mapato|nimepata|nimeingiza|earn|income|ingiza kiasi|ingiza ngapi/.test(q))return 'income';
  if(/matumizi|nimetumia|nimetoa|expense|spend|spent/.test(q))return 'expense';
  if(/biashara|mfumo wangu|business|performance|summary|report|ripoti/.test(q))return 'performance';
  return 'unknown';
 }
 function summarize(records,range){const rows=records.filter(r=>r.account==='business'&&day(r.date)>=range.start&&day(r.date)<=range.end);const totals={income:0,expense:0,count:rows.length,top:{}};
  for(const type of ['income','expense']){const cats=new Map();for(const r of rows.filter(r=>r.type===type)){if(!Number.isSafeInteger(r.amount)||r.amount<=0)throw Error('Invalid transaction amount');totals[type]+=r.amount;if(!Number.isSafeInteger(totals[type]))throw Error('Total exceeds safe integer limit');cats.set(r.category,(cats.get(r.category)||0)+r.amount);}totals.top[type]=[...cats].sort((a,b)=>b[1]-a[1]);}totals.balance=totals.income-totals.expense;return totals;
 }
 function parse(text,categories,history,now){
  const range=period(text,now);if(range.start!==range.end)throw Error('Muamala unahitaji siku moja / Specify one transaction date.');
  // Every clause must be accounted for; never silently save only part of a message.
  let body=norm(text).replace(/\d{4}-\d{2}-\d{2}/g,'').replace(/^(?:leo|jana|juzi|today|yesterday)\b\s*/,'').replace(/^(?:(?:nimeingiza|nimetoa|nimetumia|nimepokea|nimepata|hifadhi|ingiza|save|record|add|received|paid|spent|earned)\s*(?:na\s*)?)+/,'');
  const chunks=body.split(/\s+(?:na|and)\s+|[,;](?!\d{3}\b)/).map(x=>x.trim().replace(/[.!]$/,'')).filter(Boolean);
  if(!chunks.length||chunks.length>50)throw Error('Weka category na kiasi / Supply category and amount.');
  const leading=norm(text).replace(/\d{4}-\d{2}-\d{2}/g,'').replace(/^(?:leo|jana|juzi|today|yesterday)\b\s*/,'').replace(/^(?:hifadhi|ingiza|save|record|add)\s+/,'');
  const header=leading.match(/^(?:(?:nimeingiza|nimepokea|nimepata|received|earned|income|mapato|nimetoa|nimetumia|paid|spent|expense|matumizi|na|and)\s+)+/)?.[0]||'';
  const globalIncome=/nimeingiza|nimepokea|nimepata|received|earned|\bincome\b|\bmapato\b/.test(header);
  const globalExpense=/nimetoa|nimetumia|paid|spent|\bexpense\b|\bmatumizi\b/.test(header);
  const result=chunks.map(chunk=>{
   const m=chunk.match(/^(.*?)\s+(?:tsh\s*)?([0-9]+(?:,[0-9]{3})*)\s*(?:tsh)?$/);if(!m)throw Error('Sielewi kipengele: '+chunk+' / Use category then whole TSh amount.');
   const amount=Number(m[2].replace(/,/g,''));if(!Number.isSafeInteger(amount)||amount<=0)throw Error('Kiasi si sahihi / Invalid amount.');
   const label=m[1].replace(/\b(mapato|income|matumizi|expense|nimeingiza|nimetoa|nimetumia|nimepokea|nimepata|received|paid|spent|earned)\b/g,'').trim();
   const matches=categories.filter(c=>norm(typeof c==='string'?c:c.name)===label);if(matches.length!==1)throw Error('Category haijulikani: '+label+' / Use its exact saved name.');
   const c=matches[0],category=typeof c==='string'?c:c.name;
   let type;const inc=/\b(mapato|income|nimeingiza|nimepokea|nimepata|received|earned)\b/.test(m[1]),exp=/\b(matumizi|expense|nimetoa|nimetumia|paid|spent)\b/.test(m[1]);
   if(inc!==exp)type=inc?'income':'expense';else if(inc&&exp)throw Error('Aina mbili kwa category moja / Ambiguous type.');
   else if(globalIncome!==globalExpense)type=globalIncome?'income':'expense';
   else if(typeof c==='object'&&['income','expense'].includes(c.type))type=c.type;
   // Historical usage is not a category schema: ask instead of guessing.
   if(!type)throw Error('Taja mapato/income au matumizi/expense kwa '+category+'.');
   return {category,type,amount,date:range.start+'T12:00:00+03:00',account:'business',description:'Business Assistant',source:'business-assistant'};
  });
  const keys=result.map(key);if(new Set(keys).size!==keys.length)throw Error('Miamala imejirudia kwenye ujumbe / Duplicate entries.');return result;
 }
 function key(r){return [r.account,r.type,norm(r.category),r.amount,day(r.date)].join('|');}
 const money=n=>'TSh '+n.toLocaleString('en-US');
 function response(kind,current,previous,range,lang='sw'){
  const en=lang==='en',labels=en?{income:'Income',expense:'Expenses',balance:'Income minus expenses'}:{income:'Mapato',expense:'Matumizi',balance:'Tofauti ya mapato na matumizi'};
  if(!current.count)return (en?'No transactions in this period: ':'Hakuna miamala katika kipindi: ')+range.start+' — '+range.end;
  let lines=[range.start+' — '+range.end];
  for(const type of (['income','expense','balance'].includes(kind)?[kind]:['income','expense','balance']))lines.push(labels[type]+': '+money(current[type]));
  if(['category','performance'].includes(kind))for(const type of ['income','expense']){const top=current.top[type][0];lines.push((en?'Top ':'Category kubwa ya ')+labels[type]+': '+(top?top[0]+' ('+money(top[1])+')':en?'No transactions':'Hakuna miamala'));}
  if(['trend','performance'].includes(kind)){
   lines.push((en?'Compared with ':'Ikilinganishwa na ')+range.previous.start+' — '+range.previous.end);
   if(!previous.count)lines.push(en?'No transactions in comparison period; percentage unavailable.':'Hakuna miamala kipindi cha kulinganisha; asilimia haipatikani.');
   else for(const type of ['income','expense']){const diff=current[type]-previous[type];lines.push(labels[type]+': '+money(previous[type])+' → '+money(current[type])+'; '+(previous[type]?(diff>=0?'+':'')+(diff/previous[type]*100).toFixed(1)+'%':en?'percentage unavailable (zero baseline)':'asilimia haipatikani (msingi sifuri)'));}
   if(previous.expense>0&&current.expense>previous.expense*1.2)lines.push(en?'Alert: costs rose by over 20%. Review expense categories.':'Tahadhari: matumizi yameongezeka zaidi ya 20%. Kagua categories za matumizi.');
   lines.push(current.expense>current.income?(en?'Expenses exceed income; review the largest costs.':'Matumizi yamezidi mapato; kagua gharama kubwa.'):(en?'Keep tracking all costs; this difference is not verified net profit.':'Endelea kurekodi gharama zote; tofauti hii si faida halisi iliyothibitishwa.'));
  }return lines.join('\n');
 }
 const api={norm,day,period,intent,summarize,parse,key,response};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantEngine=api;
})(typeof window==='undefined'?globalThis:window);
