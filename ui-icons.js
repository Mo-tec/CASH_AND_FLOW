'use strict';
(() => {
 const paths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21v-8h6v8"/>',
  record:'<circle cx="12" cy="12" r="9"/><path d="M12 7v10M7 12h10"/>',
  orders:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  customers:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M17 14a5 5 0 0 1 4 5v1"/>',
  more:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  income:'<path d="M12 3v16m0 0-5-5m5 5 5-5"/><path d="M4 21h16"/>',
  expense:'<path d="M12 21V5m0 0-5 5m5-5 5 5"/><path d="M4 3h16"/>',
  balance:'<circle cx="12" cy="12" r="9"/><path d="M15 8H9a2 2 0 0 0 0 4h6a2 2 0 0 1 0 4H9M12 6v12"/>',
  insight:'<path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-7"/><path d="M17 6h3v3"/>',
  chart:'<path d="M4 20V4M4 20h16M8 16v-4M13 16V8M18 16V5"/>',
  stock:'<path d="m3 7 9-4 9 4v11l-9 4-9-4zM3 7l9 4 9-4M12 11v11"/>',
  budget:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h2"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M10 2h4l1 3 2 1 3-1 2 4-2 2v2l2 2-2 4-3-1-2 1-1 3h-4l-1-3-2-1-3 1-2-4 2-2v-2L2 9l2-4 3 1 2-1z"/>',
  history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M3 4v4h4"/>',
  report:'<path d="M6 3h9l4 4v14H6zM15 3v5h4M9 17v-4M12 17v-7M15 17v-3"/>',
  notebook:'<path d="M5 3h14v18H5zM8 3v18M11 8h5M11 12h5M11 16h4"/>',
  filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  cloud:'<path d="M7 18H6a4 4 0 0 1-1-8 7 7 0 0 1 13-2 5 5 0 0 1 0 10h-1M12 12v9m0 0-3-3m3 3 3-3"/>'
 };
 const icon=name=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('ui-icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('stroke-linecap','round');svg.setAttribute('stroke-linejoin','round');svg.setAttribute('aria-hidden','true');svg.innerHTML=paths[name];return svg};
 for(const button of document.querySelectorAll('#uxNav button[data-ux-view]')){const holder=button.firstElementChild,name=button.dataset.uxView;if(holder&&paths[name])holder.replaceChildren(icon(name))}
 for(const [id,name] of [['notebookPanel','notebook'],['reportsBackup','report']]){const holder=document.querySelector('#'+id+'>summary>span[aria-hidden="true"]');if(holder)holder.replaceChildren(icon(name))}
 for(const [card,name] of [...document.querySelectorAll('#ux-home .cards .card')].map((node,i)=>[node,['income','expense','balance'][i]])){if(card&&name)card.prepend(icon(name))}
 const sections={insightsPanel:'insight',chartsPanel:'chart',stockPanel:'stock',managerPanel:'budget',developerPanel:'settings',uxHistory:'history',uxReport:'report',uxFilterOptions:'filter',cloudPanel:'cloud'};
 for(const [id,name] of Object.entries(sections)){
  const summary=document.querySelector('#'+id+'>summary');if(!summary||summary.querySelector('.ui-icon'))continue;
  const attribute=summary.hasAttribute('data-ux-text')?'data-ux-text':summary.hasAttribute('data-i18n')?'data-i18n':null;
  if(attribute){const label=document.createElement('span');label.textContent=summary.textContent;label.setAttribute(attribute,summary.getAttribute(attribute));summary.removeAttribute(attribute);summary.replaceChildren(label)}
  summary.prepend(icon(name));
 }
})();
