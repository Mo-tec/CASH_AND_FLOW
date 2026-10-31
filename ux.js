'use strict';
// Progressive disclosure: one task per view, with supporting options on demand.
(()=>{
 const main=document.querySelector('main'),cards=main.querySelector('.cards');
 const transactionPanel=$('transactionForm').closest('section');
 const historyPanel=$('transactions').closest('section');
 const reportPanel=$('categoryReport').closest('section');
 const headerActions=document.querySelector('.header-actions');
 const nodes={home:[cards,$('insightsPanel'),$('chartsPanel')],record:[transactionPanel],orders:[$('ordersPanel')],customers:[],more:[historyPanel,reportPanel,$('stockPanel'),$('managerPanel'),$('developerPanel')]};
 let currentView='home';
 const words={sw:{home:'Mwanzo',record:'Rekodi',orders:'Oda',more:'Zaidi',next:'Hatua inayofuata',homeTitle:'Leo unataka kurekodi nini?',homeHint:'Anza na pesa iliyoingia au iliyotoka. Malipo ya mteja mwenye oda yaongezwe kwenye Oda.',newRecord:'Rekodi muamala',seeOrders:'Angalia oda',recordTitle:'Rekodi pesa iliyoingia au iliyotoka',recordHint:'Chagua aina, weka kiasi na kategoria, kisha hifadhi.',ordersTitle:'Simamia kazi na malipo ya wateja',ordersHint:'Fungua oda iliyopo kupokea malipo. Kwa kazi mpya, chagua Oda mpya.',newOrder:'Oda mpya',orderFields:'Taarifa za oda',optional:'Maelezo zaidi (si lazima)',moreTitle:'Unahitaji kufanya nini?',moreHint:'Chagua sehemu moja hapa chini. Fungua tu unachohitaji.',recent:'Miamala ya karibuni',noRecent:'Bado hakuna miamala. Anza kwa kurekodi wa kwanza.',history:'Historia na backup',report:'Muhtasari kwa kategoria',stock:'Stock ya malighafi',budget:'Bajeti na kategoria',support:'Mipangilio na msaada',extra:'Chaguo zaidi',filters:'Chuja zaidi',saveHint:'Kiasi na kategoria vipo tayari. Bonyeza Hifadhi muamala.',amountHint:'Weka kiasi cha pesa kwanza.',doneHint:'Muamala umehifadhiwa. Unaweza kuongeza mwingine au kurudi Mwanzo.'},en:{home:'Home',record:'Record',orders:'Orders',more:'More',next:'Next step',homeTitle:'What would you like to record?',homeHint:'Start with money received or spent. Record payments for an existing customer order in Orders.',newRecord:'Record transaction',seeOrders:'View orders',recordTitle:'Record money received or spent',recordHint:'Choose the type, enter the amount and category, then save.',ordersTitle:'Manage customer jobs and payments',ordersHint:'Open an existing order to receive payment. Choose New order for a new job.',newOrder:'New order',orderFields:'Order details',optional:'More details (optional)',moreTitle:'What do you need to do?',moreHint:'Choose one section below. Open only what you need.',recent:'Recent transactions',noRecent:'No transactions yet. Start by recording the first one.',history:'History and backup',report:'Category summary',stock:'Materials stock',budget:'Budget and categories',support:'Settings and help',extra:'More options',filters:'More filters',saveHint:'The amount and category are ready. Save the transaction.',amountHint:'Enter the amount first.',doneHint:'Transaction saved. Add another or return Home.'},zh:{home:'首页',record:'记账',orders:'订单',more:'更多',next:'下一步',homeTitle:'今天要记录什么？',homeHint:'记录收入或支出。已有订单的客户付款请在订单中添加。',newRecord:'记录交易',seeOrders:'查看订单',recordTitle:'记录收入或支出',recordHint:'选择类型，输入金额和类别，然后保存。',ordersTitle:'管理客户工作和付款',ordersHint:'打开已有订单收款。新工作请选择新订单。',newOrder:'新订单',orderFields:'订单详情',optional:'更多详情（可选）',moreTitle:'您需要做什么？',moreHint:'选择一个部分，仅打开需要的内容。',recent:'最近交易',noRecent:'暂无交易。请先记录第一笔。',history:'历史和备份',report:'类别汇总',stock:'材料库存',budget:'预算和类别',support:'设置和帮助',extra:'更多选项',filters:'更多筛选',saveHint:'金额和类别已就绪，请保存交易。',amountHint:'请先输入金额。',doneHint:'交易已保存，可以继续添加或返回首页。'}};
 const w=k=>({customers:'Wateja',customersTitle:'Historia ya kila mteja',customersHint:'Rekodi jina la mteja kwenye muamala. Mauzo na gharama zake zitaonekana hapa.'}[k]||(words[settings().lang]||words.sw)[k]);
 const text=(el,key)=>{el.dataset.uxText=key;el.textContent=w(key)};
 function wrapper(id,title,node){const d=document.createElement('details');d.id=id;d.className='panel ux-disclosure';const summary=document.createElement('summary');text(summary,title);d.append(summary);node.classList.add('ux-inner');d.append(node);return d}
 const recent=document.createElement('section');recent.id='uxRecent';recent.className='panel';recent.innerHTML='<h2 data-ux-text="recent"></h2><div id="uxRecentList"></div>';
 nodes.home.splice(1,0,recent);
 // Charts and insights stay available, without opening all the controls on the first screen.
 nodes.home.slice(2).forEach(n=>n.open=false);
 const screens={};
 for(const [name,list] of Object.entries(nodes)){
 const section=document.createElement('section');section.id='ux-'+name;section.className='ux-view';section.dataset.view=name;
 if(name==='home'){
 const hero=document.createElement('section');hero.className='panel ux-start';hero.innerHTML='<h2 data-ux-text="homeTitle"></h2><p data-ux-text="homeHint"></p><button class="primary" id="uxStartRecord" data-ux-text="newRecord"></button><button class="ux-link" id="uxViewOrders" data-ux-text="seeOrders"></button>';section.append(hero);
 }
 if(name==='orders'){
 const b=document.createElement('button');b.id='uxNewOrder';b.className='primary ux-main-action';text(b,'newOrder');section.append(b);
 }
 for(const n of list){
 if(name==='more'&&n===historyPanel)section.append(wrapper('uxHistory','history',n));
 else if(name==='more'&&n===reportPanel)section.append(wrapper('uxReport','report',n));
 else {if(n instanceof HTMLDetailsElement)n.open=false;section.append(n)}
 }
 main.append(section);screens[name]=section;
 }
 // Keep the account context visible across views.
 const guide=document.createElement('section');guide.className='ux-guide';guide.id='uxGuide';guide.setAttribute('aria-live','polite');guide.innerHTML='<span data-ux-text="next"></span><h2 id="uxGuideTitle"></h2><p id="uxGuideHint"></p>';
 main.querySelector('.tabs').after(guide);
 const notice=document.createElement('p');notice.id='uxNotice';notice.className='status';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');guide.append(notice);
 // The order form opens only when creating or editing an order.
 const editor=document.createElement('details');editor.id='uxOrderEditor';editor.className='ux-disclosure ux-order-editor';editor.innerHTML='<summary data-ux-text="orderFields"></summary>';
 $('orderForm').before(editor);editor.append($('orderForm'));
 $('ordersPanel').open=true;$('ordersPanel').classList.add('ux-orders-shell');
 const cancelNew=document.createElement('button');cancelNew.type='button';cancelNew.className='ux-link';cancelNew.textContent='Ghairi';cancelNew.onclick=()=>resetOrderForm();editor.append(cancelNew);
 editor.addEventListener('toggle',()=>{$('uxNewOrder').hidden=editor.open;updateGuide()});
 const optional=document.createElement('details');optional.id='uxRecordOptional';optional.className='ux-disclosure wide';optional.innerHTML='<summary data-ux-text="optional"></summary><div class="ux-fields"></div>';
 $('transactionForm').querySelector('button[type=submit]').before(optional);
 for(const id of ['date','description','receipt'])optional.querySelector('.ux-fields').append($(id).closest('label'));
 optional.querySelector('.ux-fields').append($('receiptPreview'));
 $('date').addEventListener('invalid',()=>optional.open=true);
 const filters=document.createElement('details');filters.className='ux-disclosure';filters.id='uxFilterOptions';filters.innerHTML='<summary data-ux-text="filters"></summary>';
 const advanced=historyPanel.querySelector('.advanced-filters');advanced.before(filters);filters.append(advanced);
 // Developer controls belong under help, not in the normal money workflow.
 const preferences=document.createElement('div');preferences.className='ux-preferences';preferences.append(headerActions);$('developerPanel').querySelector('summary').after(preferences);
 const supportSummary=$('developerPanel').querySelector('summary');supportSummary.removeAttribute('data-i18n');text(supportSummary,'support');
 for(const [id,key] of [['stockPanel','stock'],['managerPanel','budget']]){const s=$(id).querySelector('summary');s.removeAttribute('data-i18n');text(s,key)}
 const nav=document.createElement('nav');nav.id='uxNav';nav.className='ux-nav';nav.setAttribute('aria-label','Sehemu za app');
 const icons={customers:'♙',home:'⌂',record:'＋',orders:'▤',more:'•••'};
 for(const name of Object.keys(screens)){const b=document.createElement('button');b.type='button';b.dataset.uxView=name;b.innerHTML='<span aria-hidden="true">'+icons[name]+'</span><span data-ux-text="'+name+'"></span>';b.onclick=()=>go(name,true);nav.append(b)}
 $('appShell').append(nav);
 function go(view,focus=false){currentView=view in screens?view:'home';for(const [name,s] of Object.entries(screens))s.hidden=name!==currentView;for(const b of nav.querySelectorAll('button')){const selected=b.dataset.uxView===currentView;b.setAttribute('aria-current',selected?'page':'false')}
 if(currentView==='orders')$('ordersPanel').open=true;
 updateGuide();if(focus){window.scrollTo({top:0,behavior:'auto'});$('uxGuideTitle').tabIndex=-1;$('uxGuideTitle').focus({preventScroll:true})}
 }
 function updateGuide(){const title={home:'homeTitle',record:'recordTitle',orders:'ordersTitle',customers:'customersTitle',more:'moreTitle'},hint={home:'homeHint',record:'recordHint',orders:'ordersHint',customers:'customersHint',more:'moreHint'};$('uxGuideTitle').textContent=w(title[currentView]);$('uxGuideHint').textContent=w(hint[currentView]);if(currentView==='record')$('uxGuideHint').textContent=w(Number($('amount').value)>0?'saveHint':'amountHint')}
 function compactOrders(){for(const card of $('ordersList').querySelectorAll('.order-card')){const actions=card.querySelector('.actions');if(!actions||actions.querySelector('.ux-order-options'))continue;const id=actions.querySelector('[data-id]')?.dataset.id,o=orders.find(x=>x.id===id);const pay=actions.querySelector('.order-payment');const menu=document.createElement('details');menu.className='ux-order-options';menu.innerHTML='<summary>'+escapeHtml(w('extra'))+'</summary><div class="ux-menu-actions"></div>';const inside=menu.querySelector('div');for(const b of [...actions.querySelectorAll('button')]){if(b===pay&&o?.status!=='cancelled'&&debtFor(o)>0)continue;inside.append(b)}actions.append(menu);if(pay&&inside.contains(pay)&&(!o||debtFor(o)===0||o.status==='cancelled'))pay.hidden=true;}}
 function refresh(){document.querySelectorAll('[data-ux-text]').forEach(el=>el.textContent=w(el.dataset.uxText));compactOrders();$('stockPanel').hidden=account!=='business';const accountRecords=records.filter(r=>r.account===account);$('income').textContent=money(sumBy(accountRecords,'income'));$('expense').textContent=money(sumBy(accountRecords,'expense'));$('balance').textContent=money(sumBy(accountRecords,'income')-sumBy(accountRecords,'expense'));const recentRecords=records.filter(r=>r.account===account).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);$('uxRecentList').innerHTML=recentRecords.length?recentRecords.map(r=>'<div class="ux-recent-row"><div><b>'+escapeHtml(r.description||r.category)+'</b><small>'+escapeHtml(new Date(r.date).toLocaleDateString())+'</small></div><strong class="'+r.type+'">'+(r.type==='income'?'+':'−')+money(r.amount)+'</strong></div>').join(''):'<p class="note">'+escapeHtml(w('noRecent'))+'</p>';updateGuide()}
 const originalRender=render;render=function(){originalRender();refresh()};
 const originalOrders=renderOrders;renderOrders=function(){originalOrders();compactOrders()};
 const originalEditRecord=editRecord;editRecord=function(id){const r=records.find(x=>x.id===id);if(!r?.orderId){go('record',true);optional.open=!!r?.description||!!r?.receipt}originalEditRecord(id)};
 const originalEditOrder=editOrder;editOrder=function(id){go('orders');editor.open=true;originalEditOrder(id)};
 const originalResetOrder=resetOrderForm;resetOrderForm=function(){originalResetOrder();editor.open=false};
 const originalStatus=setStatus;setStatus=function(message,error=false){originalStatus(message,error);$('uxNotice').textContent=message;$('uxNotice').classList.toggle('error',error);if(!error&&currentView==='record')$('uxGuideHint').textContent=w('doneHint')};
 $('uxStartRecord').onclick=()=>go('record',true);$('uxViewOrders').onclick=()=>go('orders',true);
 $('uxNewOrder').onclick=()=>{resetOrderForm();go('orders');editor.open=true;$('orderCustomer').focus();editor.scrollIntoView({behavior:'smooth',block:'start'})};
 $('amount').addEventListener('input',updateGuide);
 $('languageSelect').addEventListener('change',refresh);
 // Escape dismisses native dialogs; cancel editing also collapses the optional fields.
 $('cancelEditBtn').addEventListener('click',()=>optional.open=false);
 const successLink=document.createElement('button');successLink.type='button';successLink.className='ux-link';successLink.id='uxReturnHome';text(successLink,'home');successLink.onclick=()=>go('home',true);transactionPanel.append(successLink);
 window.moneyManagerUI={go,view:()=>currentView};
 $('uxNotice').textContent=$('status').textContent;refresh();go('home');
})();
