'use strict';
(() => {
 const persistentIds=['stockPanel','developerPanel','uxHistory','uxReport','uxFilterOptions','uxRecordOptional','cumulativeDateOptions','cloudPanel'];
 for(const id of persistentIds){
  const panel=document.getElementById(id);if(!panel)continue;
  panel.classList.add('cf-fold');
  const key='foldOpen_'+id, saved=settings()[key];
  if(typeof saved==='boolean')panel.open=saved;
  panel.addEventListener('toggle',()=>saveSettings({[key]:panel.open}));
 }
 for(const panel of document.querySelectorAll('#insightsPanel,#chartsPanel,#managerPanel,#notebookPanel,#notebookEditor,#reportsBackup'))panel.classList.add('cf-fold');
})();
