# MO AI System Knowledge Layer V1

Current extension: [Maarifa yangu — editable facts/FAQs without code](MO-AI-EDITABLE-KNOWLEDGE.md). Actual features and permissions still require code; informational knowledge does not.

## Matokeo

MO AI iliyopo imeongezewa maarifa yaliyothibitishwa kuhusu maeneo 25 ya CASH AND FLOW. Haijaanzishwa assistant/project nyingine. Hakuna OpenAI API, production deployment, database schema au Firestore Rules change.

Registry: schema 1, knowledge version 1.1.0, app version 2026.11.04.2, PWA asset cache motec-money-manager-v61.

## Utekelezaji

- `system-knowledge-registry.js`: static reusable registry yenye name, description, capabilities, usageSteps, limitations, troubleshooting, route/location, UI selector, availability na functions/code anchors za ushahidi. Inatenganisha maarifa ya app na data binafsi.
- `assistant-knowledge.js`: intent recognition, Swahili/English synonyms, numbered instructions, locations, limitations, safe troubleshooting na unavailable-feature responses.
- `business-assistant.js`: system questions huenda kwenye knowledge layer; maswali ya hesabu na Smart Entry yanaendelea kwenye engines zilizopo. Hakuna auto-navigation au settings/data edits kutokana na swali.
- `index.html`: registry hupakiwa kabla ya response engine; version ya app imelinganishwa.
- `sw.js`: registry na response logic zinapatikana offline.
- `assistant-owner.js`: ramani ya mfumo ndani ya editor iliyopo hutumia context ya registry. Hakuna panel mpya ya chat, controls mpya au prompt ya siri iliyochapishwa.

## Routing

- “Nawezaje kuona mapato ya mwezi huu?” → hatua za kutumia Mwanzo.
- “Mapato yangu ya mwezi huu ni kiasi gani?” → hesabu halisi kupitia data engine.
- “Kwa nini matumizi yangu yameongezeka?” → financial trend analysis.
- “Kwa nini PDF haipakuliwi?” → troubleshooting yenye hatua salama; haidai kujua chanzo halisi.
- “Kufuta chat kunafuta miamala?” → maelezo tu; hakuna kufuta chochote.
- “Data zangu zinahifadhiwa wapi?” → maelezo ya localStorage, Firestore na cache, bila kusoma data.
- Maswali ya live category list/source iliyokuwa imeongezwa awali bado yanapitia verified data reader; static system help haihitaji Firebase.

Canonical system intents: `system_overview`, `feature_list`, `feature_explanation`, `how_to_use`, `feature_location`, `report_help`, `backup_help`, `category_help`, `notebook_help`, `settings_help`, `offline_help`, `troubleshooting`, `system_limitations`. Ambiguous requests return clarification; financial/save commands are not reinterpreted as help actions.

Lugha hutambuliwa kutoka swali kwa Kiswahili/English; app preference ni fallback na explicit owner preference hubaki na kipaumbele.

## Audit muhimu

Maelezo ya kila feature, functions, location, mipaka, errors na hatua salama yako kwenye [SYSTEM-KNOWLEDGE-AUDIT.md](SYSTEM-KNOWLEDGE-AUDIT.md).

- Dashboard hutumia device data; Reports husoma snapshot ya Firestore.
- Date-filtered report PDF na JSON ya Reports si data scope ileile: JSON ni complete business backup.
- Report history ni metadata; PDFs/JSON hutengenezwa tena kutoka snapshot.
- Notebook PDF viewer haisomi maandishi ya PDF kuwa maarifa ya MO AI.
- Chat history na owner prompt ni local stores tofauti, bila cross-device sync.
- Categories ni majina, si schema ya income/expense types.
- Protected developer reset ilionekana kwenye audit, lakini haitumiki kama troubleshooting shortcut wala action ya chat.
- App lock si server authorization; Firebase UID rules na source verification zimeachwa kama zilivyo.

## Online na Offline

System help hutegemea code ya app iliyocachewa tu, hata bila Firebase login. Financial analysis inaendelea kutumia engine ileile ya verified online/offline data. Ukikosa cache sahihi, system help bado hufanya kazi lakini takwimu hazibuniwi.

Safu hii haijabadili online synchronization, financial transaction parsing/saving, category assignment au Firestore persistence settings.

## Files

Added:
- `system-knowledge-registry.js`
- `verify-system-knowledge.cjs`
- `SYSTEM-KNOWLEDGE-AUDIT.md`
- `MO-AI-SYSTEM-KNOWLEDGE-V1.md` (ripoti hii)

Updated:
- `assistant-knowledge.js`
- `business-assistant.js`
- `assistant-owner.js` (registry context kwenye editor iliyopo)
- `index.html`
- `sw.js`
- `verify-assistant-knowledge.cjs`
- `verify-assistant-browser.cjs`
- `BUSINESS-ASSISTANT.md` / `README.md` (links na maintenance)

Backups: `backups/mo-ai-before-system-knowledge/` ni baseline kabla ya handbook ya awali; `backups/mo-ai-before-knowledge-v1/` ni baseline kabla ya structured registry.

## Tests

Zimepita:
- `node verify-system-knowledge.cjs`: maswali yote 30, English variants 18, schema/ushahidi wa features 25, routing ya maswali 52 ya biashara, identical online/offline help, zero business data reads/writes kwa system questions, ambiguity, unsupported features, language na version/cache alignment.
- `node verify-assistant-knowledge.cjs`: Swahili/English workflow variants 38 pamoja na category/source guards.
- `node verify-assistant-browser.cjs`: maswali yote 30 kwenye actual chat offline bila Auth; selectors za features zote 25 zipo. Business records, orders, inventory na settings hazibadiliki. Keyboard/layout, Dark/Light Mode, history, owner prompt, Smart Entry preview/save/Auto Save na account isolation pia zimepita.
- Existing assistant, analysis, ownership, chat history, owner policy, mocked cloud merge, backup merge, workspace na report suites.
- JavaScript syntax checks.

Browser tests ni Chrome kwenye isolated profile yenye Firebase/Auth fixtures na external page requests zilizozuiwa. Hazithibitishi physical Android/iPhone devices au live production Firebase. Historia ya mazungumzo huendelea kujihifadhi kama kawaida; “no writes” kwenye tests humaanisha hakuna business transaction/settings mutation.

## Future updates

Feature mpya ikiongezwa:
1. Kagua code na UI halisi.
2. Sasisha/ongeza registry entry na source anchors, limitations na troubleshooting.
3. Ongeza synonyms/intents bila kuingilia financial/Smart Entry routing.
4. Linganisha knowledge version, APP_VERSION na cache version.
5. Endesha tests hapo juu na browser suite.

MO AI haina uwezo wa kujibadilishia code au kuendesha commands kiholela. Registry si uthibitisho kwamba anaweza kusoma kila database/document: live data handlers zilizopo ndizo mipaka yake ya sasa.
