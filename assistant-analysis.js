'use strict';
// Read-only question understanding. Smart Entry remains in assistant-engine.js.
(function(root){
 const core=typeof module!=='undefined'&&module.exports?require('./assistant-engine'):root.MotecAssistantEngine;
 const shift=(s,n)=>new Date(Date.parse(s+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
 const names={income_summary:'income',expense_summary:'expense',balance:'balance',net_cash_flow:'balance',business_summary:'performance',business_health:'performance',period_comparison:'trend',income_trend:'trend',expense_trend:'trend'};
 const vocabulary=['mapato','matumizi','mauzo','salio','gharama','biashara','category','kategoria','income','expenses','expense','balance','average','revenue','sales','spending','trend','health','wastani','asilimia','ongezeka','pungua','punguza','kupunguza'];
 function distance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;}}return row[b.length];}
 function normalize(text,categories=[]){const protectedWords=new Set(categories.flatMap(c=>core.norm(typeof c==='string'?c:c.name).split(' ')));let corrected=false;
  const textNormalized=core.norm(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’']/g,'').replace(/[^\p{L}\p{N}\s%?/-]/gu,' ').replace(/\s+/g,' ').trim();
  const q=textNormalized.split(' ').map(word=>{if(word.length<5||vocabulary.includes(word)||protectedWords.has(word))return word;const candidates=vocabulary.filter(v=>Math.abs(v.length-word.length)<=1&&distance(v,word)===1);if(candidates.length===1){corrected=true;return candidates[0];}return word;}).join(' ');return {q,corrected};
 }
 function recognize(text,categories=[]){
  const {q,corrected}=normalize(text,categories),legacy=core.intent(text),result=(intent,confidence=.95,extra={})=>({intent,confidence,normalized:q,corrected,entities:{},...extra});
  if(legacy==='greeting'||legacy==='help')return result(legacy,1);
  const question=/\?|ngapi|kiasi gani|how much|how many|what|which|show|tell|nionyeshe|nipe|yakoje|ikoje|iko vipi|wastani|average|asilimia|percentage|ratio|linganish|compar|trend|mwenendo|tahadhari|alert|health|reduce|punguza|mengi|makubwa/.test(q);
  // Keep existing entry classification, but questions can never reach its save path.
  if(legacy==='create'&&!question)return result('create',1);
  if(/\b(hifadhi|save|record|ingiza|add)\b/.test(q)&&question)return result('clarify',.4,{reason:'Tenganisha swali na agizo la kuhifadhi / Separate the question from the save command.'});
  const income=/\b(mapato|mauzo|income|sales|revenue|earn|earned|nimepata|nimeingiza|nimepokea|nimeuza|niliuza|ingiza|napata|received)\b/.test(q);
  const expense=/\b(matumizi|gharama|expense|expenses|cost|costs|spend|spending|spent|nimetumia|nimetoa|natumia|nimelipa|paid)\b/.test(q);
  const categoryMatches=categories.map(c=>typeof c==='string'?c:c.name).filter(name=>(' '+q+' ').includes(' '+normalize(name).q+' ')).sort((a,b)=>b.length-a.length);
  const category=categoryMatches[0];
  if(categoryMatches.some(name=>name!==category&&!core.norm(category).includes(core.norm(name))))return result('clarify',.4,{reason:'Taja category moja kwa swali hili / Specify one category.'});
  const cat=/\b(category|categories|kategoria|kwenye nini)\b/.test(q),top=/mengi|makubwa|kubwa|zaidi|most|highest|largest|top|best/.test(q);
  const rules=[];const add=(id,match,score=.95)=>{if(match)rules.push({id,score});};
  add('business_health',/health|afya|inaendelea vizuri|inaenda vizuri|biashara.*vizuri/.test(q));
  add('cost_reduction',/punguz|reduce|cut costs|save money/.test(q));
  add('expense_alerts',/tahadhari|alert|warning|hatari/.test(q));
  add('expense_ratio',/asilimia|percent|ratio|uwiano/.test(q)&&expense&&income);
  add('average_income',/wastani|average|mean/.test(q)&&income&&!expense);
  add('average_expense',/wastani|average|mean/.test(q)&&expense&&!income);
  add('best_income_day',/\b(siku|day)\b/.test(q)&&top&&income&&!cat&&!expense);
  add('highest_expense_day',/\b(siku|day)\b/.test(q)&&top&&expense&&!cat&&!income);
  add('top_income_category',top&&(cat||/inaleta|inaniletea/.test(q))&&income&&!expense);
  add('top_expense_category',(top||/kwenye nini/.test(q))&&cat&&expense&&!income);
  const trend=/trend|mwenendo|ongezeka|pungua|mabadiliko|increas|decreas/.test(q),compare=/linganish|compar|versus|\bvs\b|dhidi/.test(q)&&!rules.some(r=>r.id==='expense_ratio');
  add('income_trend',trend&&!compare&&income&&!expense);
  add('expense_trend',trend&&!compare&&expense&&!income);
  add('period_comparison',compare||trend&&!income&&!expense);
  add('net_cash_flow',/net cash flow|cashflow|mtiririko|tofauti/.test(q));
  add('balance',/salio|balance|fedha iliyobaki|pesa iliyobaki/.test(q));
  if(/wastani|average/.test(q)&&income&&expense)return result('clarify',.4,{reason:'Wastani wa mapato au matumizi? / Average income or expenses?'});
  if(rules.length>1)return result('clarify',.45,{alternatives:rules.map(r=>r.id),reason:'Kuna aina zaidi ya moja ya uchambuzi; uliza moja kwanza / Please ask for one analysis at a time.'});
  let intent=rules[0]?.id;
  if(!intent){
   if(income&&expense)intent='business_summary';
   else if(income)intent=category||cat?'category_income':'income_summary';
   else if(expense)intent=category||cat?'category_expense':'expense_summary';
   else if(/biashara|business|mfumo wangu|summary|muhtasari|ripoti|report|performance/.test(q))intent='business_summary';
   else if(cat)return result('clarify',.4,{reason:'Unataka mapato au matumizi kwa category? / Income or expenses by category?'});
  }
  if(!intent)return result('clarify',.2,{reason:'Sijaelewa aina ya uchambuzi. Uliza mapato, matumizi, salio au biashara / Please specify the business analysis.'});
  if(cat&&!category&&!top&&!/kwa category|by categor|per categor|kwa kategoria|kwa kila/.test(q)&&['category_income','category_expense'].includes(intent))return result('clarify',.4,{reason:'Category gani? Tumia jina lililohifadhiwa / Which saved category?'});
  return result(intent,corrected?.8:.95,{entities:{category,type:income&&!expense?'income':expense&&!income?'expense':null},alternatives:[]});
 }
 function valid(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
 function makeRange(start,end,extra={}){if(!valid(start)||!valid(end)||start>end)throw Error('Taja tarehe halali za mwanzo na mwisho / Specify valid start and end dates.');const days=(Date.parse(end)-Date.parse(start))/86400000+1;return {start,end,days,previous:{start:shift(start,-days),end:shift(start,-1)},...extra};}
 function period(text,now=new Date(),context={}){
  const q=core.norm(text),today=core.day(now),dates=q.match(/\d{4}-\d{2}-\d{2}/g)||[];
  if(/dashboard|kipindi ulichochagua|kipindi nilichochagua|selected period|kipindi hiki/.test(q)){
   const d=context.dashboard;if(!d)throw Error('Chagua kipindi kwenye dashboard kwanza / Select a dashboard period.');
   if(d.mode==='custom')return makeRange(d.start,d.end,{dashboard:true});
   if(d.mode==='all')return makeRange(d.summaryStart,today,{dashboard:true,endAt:new Date(now).toISOString()});
   if(d.mode==='month'){const start=today.slice(0,8)+'01',next=new Date(start+'T12:00:00Z');next.setUTCMonth(next.getUTCMonth()+1);return makeRange(start,shift(next.toISOString().slice(0,10),-1),{dashboard:true});}
   if(d.mode==='week'){const wd=new Date(today+'T12:00:00Z').getUTCDay()||7;return makeRange(shift(today,1-wd),today,{dashboard:true,endAt:new Date(now).toISOString()});}
   throw Error('Kipindi cha dashboard hakijulikani / Unknown dashboard period.');
  }
  // Two full ranges can be compared explicitly, otherwise use an equal-length preceding period.
  if(dates.length===4){if(!/linganish|compar|versus|\bvs\b|dhidi/.test(q))throw Error('Tarehe nne zinahitaji swali la ulinganisho / Four dates require a comparison question.');const range=makeRange(dates[0],dates[1]);range.previous=makeRange(dates[2],dates[3]);return range;}
  if(dates.length>2)throw Error('Tumia tarehe mbili kwa kipindi, au nne kwa ulinganisho / Use two dates per period.');
  if(dates.length){const other=q.replace(/\d{4}-\d{2}-\d{2}/g,'');if(/\bleo\b|\bjana\b|\btoday\b|\byesterday\b/.test(other))throw Error('Usichanganye tarehe kamili na siku nyingine / Specify a single date interpretation.');return makeRange(dates[0],dates[1]||dates[0]);}
  const numericText=context.category?q.split(core.norm(context.category)).join(' '):q;
  if(/\d/.test(numericText))throw Error('Namba hizi zinamaanisha kipindi gani? Taja tarehe kamili / Clarify the numeric date or period.');
  if(/mwaka huu|this year/.test(q))return makeRange(today.slice(0,4)+'-01-01',today);
  const comparison=/linganish|compar|versus|\bvs\b|dhidi/.test(q);
  if(!comparison&&((/mwezi huu|this month/.test(q)&&/mwezi uliopita|last month/.test(q))||(/wiki hii|this week/.test(q)&&/wiki iliyopita|last week/.test(q))))throw Error('Ulinganishe vipindi hivyo au uchague kimoja? / Compare these periods or select one.');
  if(comparison&&/wiki hii|this week/.test(q)&&/wiki iliyopita|last week/.test(q)){const wd=new Date(today+'T12:00:00Z').getUTCDay()||7,start=shift(today,1-wd),range=makeRange(start,today);range.previous=makeRange(shift(start,-7),shift(start,-1));return range;}
  if(comparison&&/mwezi huu|this month/.test(q)&&/mwezi uliopita|last month/.test(q)){const start=today.slice(0,8)+'01',end=shift(start,-1),range=makeRange(start,today);range.previous=makeRange(end.slice(0,8)+'01',end);return range;}
  const groups=[[/\bleo\b|\btoday\b/,'today'],[/\bjana\b|\byesterday\b/,'yesterday'],[/\bjuzi\b|day before yesterday/,'before'],[/wiki|week/,'week'],[/mwezi|month/,'month']].filter(([rx])=>rx.test(q));
  const comparing=/linganish|compar|versus|\bvs\b|dhidi/.test(q);
  if(groups.length>1&&!(/day before yesterday/.test(q)&&groups.every(x=>['before','yesterday'].includes(x[1])))){
   if(comparing&&groups.length===2&&groups.some(x=>x[1]==='today')&&groups.some(x=>x[1]==='yesterday'))return makeRange(today,today);
   throw Error('Taja kipindi kimoja au tumia tarehe kamili kwa ulinganisho / Clarify the periods.');
  }
  if(/siku hizi|hivi karibuni|recently|lately/.test(q))throw Error('Ni kipindi gani hasa? / Which exact period?');
  const r=core.period(text,now);return makeRange(r.start,r.end);
 }
 function calculate(records,range,category){const selected=records.filter(r=>(!category||r.category===category)&&(!range.endAt||new Date(r.date)<=new Date(range.endAt)));const total=core.summarize(selected,range);const days=range.days||((Date.parse(range.end)-Date.parse(range.start))/86400000+1),daily={income:new Map(),expense:new Map()};
  for(const r of selected){const day=core.day(r.date);if(r.account==='business'&&day>=range.start&&day<=range.end&&daily[r.type])daily[r.type].set(day,(daily[r.type].get(day)||0)+r.amount);}
  return {...total,average:{income:total.income/days,expense:total.expense/days},days,ratio:total.income?total.expense/total.income*100:null,best:{income:[...daily.income].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0],expense:[...daily.expense].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))[0]}};
 }
 const money=n=>'TSh '+new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(n);
 function answer(recognition,records,range,lang='sw'){
  const en=lang==='en',id=recognition.intent,category=recognition.entities?.category,c=calculate(records,range,category),p=calculate(records,range.previous,category),label={income:en?'Income':'Mapato',expense:en?'Expenses':'Matumizi'};
  let lines=[range.start+' — '+range.end+(category?' · '+category:'')];
  if(!c.count){lines.push(en?'No transactions recorded in this period.':'Hakuna miamala iliyorekodiwa katika kipindi hiki.');return {text:lines.join('\n'),current:c,previous:p};}
  const type=/expense/.test(id)?'expense':'income';
  if(['average_income','average_expense'].includes(id))lines.push((en?'Daily average ':'Wastani kwa siku wa ')+label[type]+': '+money(c.average[type])+' / '+c.days+(en?' calendar days (including days with no entries).':' siku zote za kipindi (pamoja na siku zisizo na miamala).'));
  else if(['best_income_day','highest_expense_day'].includes(id)){const best=c.best[type];lines.push(label[type]+': '+(best?best[0]+' · '+money(best[1]):en?'No transactions of this type.':'Hakuna miamala ya aina hii.'));}
  else if(['category_income','category_expense','top_income_category','top_expense_category'].includes(id)){const cats=c.top[type],top=id.startsWith('top_');lines.push(label[type]+': '+money(c[type]));lines.push(...(top?cats.filter(x=>x[1]===cats[0]?.[1]):cats).map(([name,amount])=>name+': '+money(amount)));if(!cats.length)lines.push(en?'No transactions of this type.':'Hakuna miamala ya aina hii.');}
  else if(id==='expense_ratio')lines.push(c.ratio===null?(en?'Expense ratio unavailable: income is zero.':'Uwiano haupatikani: mapato ni sifuri.'):(en?'Expenses / income: ':'Matumizi / mapato: ')+c.ratio.toFixed(1)+'%');
  else if(['income_trend','expense_trend'].includes(id)){
   lines.push(label[type]+': '+money(c[type]));lines.push(...comparison(c,p,range,[type],en));
  }else if(['expense_alerts','cost_reduction'].includes(id)){
   lines.push(label.expense+': '+money(c.expense));lines.push(...advice(c,p,en));
  }else{
   const legacy=names[id]||'performance';lines=[core.response(legacy,c,p,range,lang)];
   if(id==='business_health')lines.push(en?'Health check reflects recorded cash movements only; it is not a complete financial assessment.':'Afya hii inategemea miamala iliyorekodiwa pekee; si tathmini kamili ya biashara.');
   if(['business_health','business_summary'].includes(id))lines.push(...advice(c,p,en));
  }
  if(category)lines.push(en?'Only the selected category is included.':'Category iliyochaguliwa pekee imehesabiwa.');
  return {text:lines.join('\n'),current:c,previous:p};
 }
 function comparison(c,p,range,types,en){const lines=[(en?'Compared with ':'Ikilinganishwa na ')+range.previous.start+' — '+range.previous.end];for(const type of types){const delta=c[type]-p[type];lines.push((type==='income'?(en?'Income':'Mapato'):(en?'Expenses':'Matumizi'))+': '+money(p[type])+' → '+money(c[type])+'; '+(!p.count?(en?'no comparison records':'hakuna miamala ya kulinganisha'):p[type]===0?(en?'percentage unavailable (zero baseline)':'asilimia haipatikani (msingi sifuri)'):(delta>=0?'+':'')+(delta/p[type]*100).toFixed(1)+'%'));}return lines;}
 function advice(c,p,en){const lines=[];if(c.expense>c.income)lines.push(en?'Alert: recorded expenses exceed income.':'Tahadhari: matumizi yaliyorekodiwa yamezidi mapato.');if(p.count&&p.expense>0&&c.expense>p.expense*1.2)lines.push(en?'Alert: expenses rose by over 20% against the preceding period.':'Tahadhari: matumizi yameongezeka zaidi ya 20% dhidi ya kipindi kilichotangulia.');const top=c.top.expense[0];if(top)lines.push((en?'Review ':'Kagua ')+top[0]+' ('+money(top[1])+', '+(top[1]/c.expense*100).toFixed(1)+(en?'% of recorded expenses). Check whether recurring costs can be reduced; this data does not establish which costs are essential.':'% ya matumizi yaliyorekodiwa). Angalia kama gharama zinazorudiwa zinaweza kupunguzwa; data hizi hazithibitishi gharama zipi ni za lazima.'));else lines.push(en?'No expense entries to support cost reduction advice.':'Hakuna matumizi yaliyorekodiwa ya kutosha kutoa pendekezo la kupunguza gharama.');if(c.count<3||!p.count)lines.push(en?'Limited records: comparisons and advice are provisional.':'Rekodi ni chache: ulinganisho na ushauri vina mipaka.');return lines;}
 const api={normalize,recognize,period,calculate,answer,makeRange};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantAnalysis=api;
})(typeof window==='undefined'?globalThis:window);
