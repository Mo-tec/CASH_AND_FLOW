'use strict';
(function(root){
 const registry=typeof module!=='undefined'&&module.exports?require('./system-knowledge-registry'):root.MotecSystemKnowledgeRegistry;
 const topics=registry.features.map(f=>({id:f.id,sw:f.name.sw,en:f.name.en,rx:new RegExp(f.matchPattern,'i'),view:f.route,a:f.description.sw,b:f.description.en}));
 const norm=value=>String(value).normalize('NFKC').toLowerCase().replace(/[’']/g,"'").replace(/\s+/g,' ').trim();
 function language(q){const sw=(q.match(/\b(nawezaje|ninawezaje|nifanye|nini|gani|mfumo|kwa nini|data zangu|lugha|kipindi|mapato|matumizi|miamala|wangu|kufuta|kunafuta|inafanya|inaonyesha|inatumika|inanisaidiaje|zinafanya|anafanya|inafanyaje|anafanyaje|naonaje|nafunguaje|ninapataje|nifanyaje|nielezee|bila|wapi|je|hesabu|haipakuliwi|haionekani)\b/g)||[]).length,en=(q.match(/\b(how|what|where|why|explain|does|can|my|which|without|please|help|features)\b/g)||[]).length;return en>sw?'en':sw>0?'sw':null;}
 function recognize(text){
  const q=norm(text),lang=language(q),result=(intent,kind='topic',topic,extra={})=>({intent,kind,topic,lang,confidence:.95,...extra});
  const finance=/\b(mapato|matumizi|salio|mauzo|gharama|income|expenses?|costs?|earn|spent|spend|cash ?flow|balance)\b/.test(q);
  if(/punguz|reduce|cut costs|save money/.test(q)&&/gharama|cost|expense|matumizi|spending/.test(q))return null;
  const procedural=/nawezaje|ninawezaje|nafanyaje|nifanyaje|nifanye nini|nifanyeje|ninapataje|naonaje|nafunguaje|natengenezaje|ninaanzaje|nawekaje|nifundishe|jinsi|\bhow (?:do|can|to)\b|show.*how|\bwhere\b|\bwapi\b/.test(q);
  const explanatory=/ni nini|inaonyesha nini|kazi gani|inafanyaje|anafanyaje|inafanya nini|inatumika|inanisaidiaje|nieleze|elezea|nisaidie kutumia|\bhow does\b|\bwhat (?:is|are|does)\b|explain|help (?:with|using)/.test(q);
  const why=/kwa nini|mbona|\bwhy\b/.test(q),trend=/ongezeka|pungua|mwenendo|trend|increas|decreas|mabadiliko/.test(q);
  const value=/\b(my|today|yesterday|current)\b|\bthis (?:week|month|year)\b|\blast (?:week|month|year)\b|\bleo\b|\bjana\b|ngapi|kiasi gani|how much|\d{4}-\d{2}-\d{2}/.test(q);
  const uiFailure=/haionekani|hazionekani|not showing|missing|mismatch|hazilingani|haipakuliwi|not downloading|cannot download|failed|imeshindwa/.test(q);
  const mechanism=/how does|inafanyaje|anafanyaje|kazi gani|inanisaidiaje|inatumika/.test(q);
  if(finance&&!procedural&&((why&&trend)||(value&&!uiFailure&&!mechanism)))return null;
  if(procedural&&finance&&/kiasi gani|how much|\bngapi\b/.test(q))return result('clarification','clarify',null,{confidence:.4});
  if(/kufuta chat.*(?:miamala|transactions)|(?:does|will).*clear.*chat.*(?:transaction|record)|delete.*chat.*delete.*transaction/.test(q))return result('feature_explanation','topic','history',{action:'delete_effects'});
  const command=/\b(hifadhi|save|ingiza|add|record|futa|delete|badilisha|weka)\b/.test(q);
  if(command&&!procedural&&!explanatory&&!why)return null;
  if(/mipaka|limitations|limits|can't do|cannot do|haiwezi kufanya|hauna uwezo/.test(q))return result('system_limitations','limitations');
  if(/whatsapp/.test(q)&&/namba|number|contact|mawasiliano|phone|simu/.test(q)&&!/send|tuma|automat|kiotomatiki|integrat|unganisha/.test(q))return null;
  const unavailable=registry.unavailable.find(f=>new RegExp(f.pattern,'i').test(q));
  if(unavailable)return result('feature_explanation','unavailable',unavailable.id);
  if(/(?:mfumo|system|cash and flow|cash_and_flow).*(?:uwezo|vipengele|sehemu gani|una nini|features|modules|capabilities)|what.*features/.test(q))return result('feature_list','overview');
  if(/^(msaada|help)[!?.]*$|(?:unajua|unaelewa|unafahamu|ujue|ufahamu).*(?:mfumo|system)|(?:nielezee|nieleze|elezea|explain|describe).*(?:cash and flow|cash_and_flow|mfumo|system)/.test(q))return result('system_overview','overview');
  if(/(?:mo ai|assistant|msaidizi).*(?:uwezo|anafanya|inafanya|fanya nini|capabilities|can.*do)|unaweza kufanya nini|what can you do/.test(q))return result('feature_explanation','topic','ai',{action:'explain'});
  if(/categor|kategoria/.test(q)&&/nilizonazo|zangu|gani zipo|nina.*categor.*gani|nina.*kategoria.*gani|orodha|list|available|configured|my categories/.test(q)&&!procedural&&!explanatory&&!/mengi|makubwa|zaidi|highest|most|top/.test(q))return result('category_data','categories','categories',{needsData:true});
  if(/unaona data gani|unaweza kusoma data gani|what data can you (?:see|read)/.test(q))return result('source_data','source','storage',{needsData:true});
  if(/data.*(?:hifadhi|stored|store)|where.*data/.test(q)&&/wapi|where/.test(q))return result('feature_location','topic','storage',{action:'location'});
  const failure=why||/hazionekani|haionekani|haipakuliwi|haijaunganishwa|haipatikani|haijapatikana|imeshindwa|imeshindikana|hazilingani|failed|failing|not showing|not connected|missing|unavailable|mismatch|not downloading|doesn't work|does not work|can't download|cannot download/.test(q);
  if(failure){
   let issue;
   if(/hesabu|totals?|mismatch|hazilingani/.test(q))issue='totals';
   else if(/pdf|print|download.*report/.test(q))issue='pdf';
   else if(/categor|kategoria/.test(q))issue='category';
   else if(/backup|json|restore|rejesha|nakala/.test(q))issue='backup';
   else if(/tarehe|date filter|date range|period|filter|chuja/.test(q))issue='dates';
   else if(/cache|offline|internet|mtandao/.test(q))issue='offline';
   else if(/firebase|firestore|auth|akaunti|account|verification/.test(q))issue='auth';
   else if(/notebook|note/.test(q))issue='notebook';
   else if(/data|rekodi|records/.test(q))issue='data';
   if(issue)return result('troubleshooting','troubleshooting',null,{issue});
  }
  if(/bila internet|bila mtandao|without internet|nikikosa internet|nikikosa mtandao/.test(q))return result('offline_help','topic','offline',{action:procedural?'steps':'explain'});
  if(/kufuta chat.*(?:miamala|transactions)|(?:does|will).*clear.*chat.*(?:transaction|record)|delete.*chat.*delete.*transaction/.test(q))return result('feature_explanation','topic','history',{action:'delete_effects'});
  if(!procedural&&!explanatory)return null;
  const matches=topics.filter(t=>t.rx.test(q)).sort((a,b)=>q.search(a.rx)-q.search(b.rx));
  let topic=matches[0];
  const pick=id=>topic=topics.find(t=>t.id===id);
  if(/maarifa yangu|maarifa mapya|fundisha|teach|my knowledge|custom knowledge/.test(q))pick('learned');
  else if(/prompt|mmiliki|owner instructions/.test(q))pick('owner');
  else if(/chat history|historia.*chat|chat.*historia|chat mpya|kufuta chat|clear chat|delete chat/.test(q))pick('history');
  else if(/smart entry|kupitia chat|kwenye chat|through chat/.test(q))pick('entry');
  else if(/notebook/.test(q))pick('notebook');
  else if(/\boda\b|\borders?\b|invoice|quotation/.test(q)&&/pdf|invoice|quotation|risiti|receipt/.test(q))pick('orders');
  else if(/\bpdf\b|\bcsv\b|ripoti|reports?/.test(q)&&!/backup|json|rejesha|restore/.test(q))pick('reports');
  else if(/backup|nakala|json|restore|rejesha/.test(q))pick('backup');
  else if(/dark|light|theme/.test(q))pick('theme');
  else if(/lugha|language/.test(q))pick('languages');
  else if(/categor|kategoria/.test(q))pick('categories');
  else if(finance&&procedural&&/ingiza|rekodi|record|add|enter/.test(q))pick('records');
  else if(finance&&procedural&&/kuona|view|see|kujua/.test(q))pick('dashboard');
  if(!topic)return result('clarification','clarify',null,{confidence:.4});
  let intent=procedural?'how_to_use':'feature_explanation',action=procedural?'steps':'explain';
  if(topic.id==='reports')intent='report_help';
  if(topic.id==='backup')intent='backup_help';
  if(topic.id==='categories')intent='category_help';
  if(topic.id==='notebook')intent='notebook_help';
  if(['settings','theme','languages'].includes(topic.id))intent='settings_help';
  if(topic.id==='offline')intent='offline_help';
  if(/wapi|\bwhere\b/.test(q)){intent='feature_location';action='location';}
  if(topic.id==='categories'&&/ongeza|add|create/.test(q))action='add_category';
  if(topic.id==='categories'&&/kuona|view|see|matumizi|expenses|filter|chuja/.test(q))action='filter_category';
  if(topic.id==='backup'&&/restore|rejesha|import/.test(q))action='restore';
  if(topic.id==='history'&&/futa|clear|delete/.test(q))action='clear_chat';
  return result(intent,'topic',topic.id,{action,view:topic.view});
 }
 const pick=(value,lang)=>value[lang==='en'?'en':'sw'];
 const numbered=lines=>lines.map((line,i)=>(i+1)+'. '+line).join('\n');
 function answer(request,{lang=request.lang||'sw',source,isAvailable}={}){
  const en=lang==='en',code=en?'en':'sw';
  if(request.kind==='clarify')return en?'Do you want steps for using the app, or figures calculated from your data? Name the feature or period.':'Unahitaji hatua za kutumia app au hesabu za data zako? Taja kipengele au kipindi.';
  if(request.kind==='unavailable'){const f=registry.unavailable.find(t=>t.id===request.topic);return (f?pick(f.name,code)+': ':'')+(en?'This feature is not integrated in this version. I cannot provide steps for a feature that is not available.':'Kipengele hiki hakijaunganishwa kwenye toleo hili. Siwezi kutoa hatua za feature ambayo haipatikani.');}
  if(request.kind==='limitations')return (en?'Current limits:\n':'Mipaka ya sasa:\n')+numbered(en?['No OpenAI/general-purpose AI API or arbitrary code execution.','Financial figures require verified device/Firebase/cache data; missing data is not zero.','Smart Entry saves and server Reports require connectivity.','Chat history and owner instructions are local, without cross-device sync.','Uploaded PDFs are not automatically read into MO AI.']:['Hakuna OpenAI/AI API ya maswali yote wala kuendesha code kiholela.','Takwimu huhitaji data halisi zilizothibitishwa; cache isiyopatikana si sifuri.','Smart Entry save na Reports za Firestore huhitaji mtandao.','Chat history na owner instructions ni za kifaa, bila sync ya vifaa vingine.','PDF zilizopakiwa hazisomwi na MO AI kiotomatiki.']);
  if(request.kind==='overview'){
   const groups=[['home',en?'Home':'Mwanzo'],['record',en?'Record':'Rekodi'],['orders',en?'Orders':'Oda'],['customers',en?'Customers':'Wateja'],['more',en?'More':'Zaidi'],['ai','MO AI']];
   return (en?'CASH AND FLOW manages recorded business cash movements and work:\n':'CASH AND FLOW husimamia fedha zilizorekodiwa na shughuli za biashara:\n')+groups.map(([route,title])=>title+': '+registry.features.filter(f=>f.available&&f.route===route).map(f=>pick(f.name,code)).join(', ')).join('\n')+'\n'+(en?'Also: ':'Pia: ')+registry.features.filter(f=>f.available&&f.route===null).map(f=>pick(f.name,code)).join(', ')+(en?'\nAsk how to use a feature, or specify a period for actual figures.':'\nUliza jinsi ya kutumia kipengele, au taja kipindi ili upate takwimu halisi.');
  }
  if(request.kind==='troubleshooting'){
   const steps=pick(registry.issues[request.issue]||registry.issues.data,code);
   const uncertain=/siwezi|haijathibitishwa|not confirmed|not established|cannot be determined/i.test(steps[0]);
   return (!uncertain?(en?'I cannot confirm the cause from the question alone.\n':'Siwezi kuthibitisha sababu kutoka swali pekee.\n'):'')+numbered(steps);
  }
  if(request.kind==='categories'||request.kind==='source'){
   if(!source?.raw)throw Error('Data source required.');
   if(request.kind==='categories'){const names=source.raw.settings?.categories||[];return names.length?(en?'Categories visible in this source:\n':'Categories zinazoonekana kwenye chanzo hiki:\n')+names.join(', '):(en?'No category names are available in this snapshot.':'Hakuna majina ya categories katika snapshot hii.');}
   return (en?'This source has ':'Chanzo hiki kina ')+source.raw.records.length+(en?' transaction records. Figures use these records and their real dates; I do not infer missing module data or decrypt the owner prompt.':' rekodi za miamala. Takwimu hutumia rekodi hizi na tarehe zake halisi; sibuni data za sehemu nyingine wala kufungua prompt ya siri ya mmiliki.');
  }
  const feature=registry.features.find(f=>f.id===request.topic);
  if(!feature||!feature.available||(isAvailable&&!isAvailable(feature)))return en?'This feature is not available in the opened version.':'Kipengele hiki hakipatikani kwenye toleo lililofunguliwa.';
  if(request.action==='delete_effects')return en?'No. Clear chat deletes only the selected conversation. Transactions, orders and other saved chats remain.':'Hapana. Futa chat huondoa mazungumzo yaliyochaguliwa tu. Miamala, Oda na chat nyingine zinabaki.';
  if(request.action==='location')return feature.id==='storage'?pick(feature.description,code):pick(feature.location,code);
  let steps=pick(feature.usageSteps,code);
  if(request.action==='restore')steps=[steps[0],...steps.slice(1)];
  if(request.action==='clear_chat')steps=en?['Open MO AI and select the conversation from History.','Click Clear chat. Only that conversation is removed; transactions remain.']:['Fungua MO AI na uchague chat kwenye Historia.','Bonyeza Futa chat. Chat hiyo pekee huondolewa; miamala inabaki.'];
  if(request.action==='add_category')steps=en?['Open More > Budget and categories.','Enter the new category name and click Add with the required app permission.','Use the saved exact name in Record or Smart Entry.']:['Fungua Zaidi > Bajeti na kategoria.','Andika jina jipya na bonyeza Ongeza ukiwa na ruhusa ya app.','Tumia jina lililohifadhiwa kwenye Rekodi au Smart Entry.'];
  if(request.action==='filter_category')steps=en?['Open Home > All transactions > more filters.','Select Expenses and the desired category, then the period.','Or ask MO AI: Expenses for CATEGORY this month? with your actual category name.']:['Fungua Mwanzo > Miamala yote > Chuja zaidi.','Chagua aina Matumizi, category husika na kipindi.','Au uliza MO AI: Matumizi ya CATEGORY mwezi huu? kwa jina lako halisi la category.'];
  if(['steps','restore','clear_chat','add_category','filter_category'].includes(request.action))return numbered(steps)+(feature.id==='reports'?'\n'+pick(feature.limitations,code)[0]:'');
  return pick(feature.description,code);
 }
 function context(lang='sw'){return 'System Knowledge '+registry.version+' / '+registry.assetVersion+'\n\n'+registry.features.filter(f=>f.available).map(f=>pick(f.name,lang)+': '+pick(f.description,lang)+'\n'+pick(f.location,lang)).join('\n\n');}
 const api={registry,topics,recognize,answer,context,version:registry.version};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.MotecAssistantKnowledge=api;
})(typeof window==='undefined'?globalThis:window);
