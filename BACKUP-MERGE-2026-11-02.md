# Kipindi na kuunganisha backup — 2 Novemba 2026

- Mwanzo: chagua Kipindi > Chagua tarehe, kisha tarehe ya kuanzia na ya mwisho. Kadi za mapato, matumizi na salio hutumia siku zote ndani ya kipindi, pamoja na siku ya mwanzo na ya mwisho. Chagua Muda wote kurudi kwenye muhtasari wa tangu kuanza.
- JSON, backup fiche na nakala za kifaa sasa huunganishwa na dataset ya sasa baada ya uthibitisho. Restore haiondoi rekodi mpya zilizopo. Rekodi iliyofutwa inaweza kurudi ikiwa bado ipo kwenye backup.
- ID ileile huonekana mara moja. ID tofauti huhifadhiwa hata kama kiasi na tarehe vinafanana: zinaweza kuwa mauzo mawili halali. Mfumo hauwezi kutambua mauzo yaliyoingizwa upya kwa mkono kama ni nakala ya ya zamani bila ID ileile.
- Ikiwa ID ileile ina taarifa tofauti, mtumiaji huonywa na taarifa za kifaa hubaki. Stock ni salio, haitajumlishwa mara mbili. Muunganiko unaovunja sheria za oda/malipo hukataliwa kabla ya kuhifadhi. PDF mbili tofauti za Notebook huzuia muunganiko ili faili lisipotee.
- Tarehe ya muhtasari hurudishwa kufikia taarifa za zamani zilizounganishwa. Kipindi maalumu hakitegemei tarehe hiyo ya kuanza.
- Pakia backup Firebase husoma nakala ya mwisho, huunganisha na kifaa baada ya uthibitisho, kisha huunda backup mpya. Backup za awali hazifutwi. Upload ikishindwa baada ya muunganiko wa kifaa, data iliyounganishwa hubaki kwenye kifaa kwa kujaribu tena.
- Rejesha backup Firebase huunganisha; muunganiko hupangiwa kupakiwa kiotomatiki. Baada ya kusawazishwa, mabadiliko mapya huendelea kupakiwa app ikiwa wazi na online. Tofauti kutoka kifaa kingine bado huhitaji kuchagua Pakia/Rejesha; hakuna kufuta kimya kimya au merge ya migongano bila uthibitisho.
- Ukaguzi wa nakala ya mwisho hurudiwa kabla ya kuchapisha metadata ya upload ili kugundua mabadiliko yaliyotokea wakati wa kupakia. Huu si transaction ya vifaa vingi; kuandika kwa vifaa vingi kwa wakati uleule bado kunahitaji uboreshaji tofauti.

## Uhakiki

`node verify-backup-merge.cjs` na `node verify-cloud-merge.cjs`: tarehe 13–16, kadi za Mwanzo, muunganiko usiorudia ID, kuhifadhi rekodi mpya, tofauti za ID, stock, tarehe ya kuanza, validation, cancellation na mabadiliko ya remote wakati wa upload. Firebase imeigwa kwenye kumbukumbu; hakuna database halisi iliyobadilishwa.

Majaribio sita ya awali na syntax yamehakikiwa pia. Browser integration haijaendeshwa kwa sababu Playwright haijasakinishwa. Hakuna deployment iliyofanyika.
