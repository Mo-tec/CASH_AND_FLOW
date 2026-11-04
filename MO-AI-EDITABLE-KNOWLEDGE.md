# MO AI — maarifa mapya bila code

## Matumizi

1. Fungua MO AI na gusa jina lake mara tano mfululizo.
2. Ingiza password ya mmiliki.
3. Chagua tab **Maarifa yangu**.
4. Andika taarifa au maswali/majibu, kisha **Hifadhi na tumia maarifa**.
5. Rudi kwenye chat na uliza kuhusu mada hiyo. Hakuna ku-edit JavaScript.

Mfano tu, ubadilishe kwa taarifa zako halisi:

```text
Swali: Mnafungua saa ngapi?
Jibu: Tunafungua saa 2 asubuhi.

Swali: Bei ya huduma fulani ni kiasi gani?
Jibu: Andika bei yako halisi hapa.

Anwani: Andika eneo na mawasiliano yako hapa.
```

Tenga mada kwa mstari wazi. Muundo wa Swali/Jibu husaidia usahihi; paragraphs za kawaida pia zinakubaliwa. UI huonyesha idadi ya mada zinazotambulika kabla ya kuhifadhi.

## MO AI anafanya nini na maandishi haya?

- Hutafuta mada iliyo karibu na swali kwa tokens, synonyms za msingi za Kiswahili/English na makosa madogo ya tahajia.
- Hujibu kwa kunukuu maandishi uliyohifadhi, yakiwa na attribution ya “maarifa uliyohifadhi”.
- Akipata maana zaidi ya moja huomba ufafanuzi. Majibu yanayokinzana kwa swali lilelile hayaamuliwi kwa kubuni.
- Mabadiliko yanatumika baada ya Save, bila code au reload. Maarifa yaliyohifadhiwa yanapatikana baada ya restart na offline.
- Hii si model training, general AI reasoning au automatic translation. Si kila sentensi itaeleweka; andika FAQ iliyo wazi ikiwa swali halipatikani.

Business facts/FAQ ni tofauti na behavior prompt:
- **Maelekezo:** prompt yako ya siri iliyosimbwa; safe settings kama lugha, salamu na preview.
- **Maarifa yangu:** taarifa ulizochagua zitumike kwenye majibu ya akaunti hii. Hizi si private encrypted notes; zimehifadhiwa kama response knowledge. Usiweke passwords, API keys au taarifa ambazo hutaki zionekane kwenye chat.

Kuandika “Mapato ya leo ni kiasi fulani” kwenye maarifa hakubadilishi records au majibu ya live financial analysis. Official system guidance, financial amounts, debt/profit queries na Smart Entry commands zinalindwa dhidi ya override. Kuandika maelekezo ya code/database kwenye maarifa hakuyatekelezi.

## Ulinzi na persistence

Editing inahitaji owner login iliyopo. Service hukagua owner scope na editor authorization kabla ya Save. Account switching, app lock na closing dialog hufunga editor; timeout ni dakika tano za kutotumika. Published knowledge haisomi au kubadilisha private prompt.

Storage ni ya browser/kifaa hiki, keyed kwa Firebase UID; standalone device knowledge ina scope yake. Hakuna cloud sync au new Firestore schema. Akaunti nyingine haina access kupitia chat reader. Cache/Auth isiyothibitishwa haichukuliwi kuwa akaunti ya zamani.

Corrupt storage na quota failures huonyesha failure badala ya kufuta maarifa yaliyokuwepo. Hifadhi inakubali hadi herufi 30,000, mada 200 na body ya mada hadi herufi 6,000. Maswali mapya hutumia maarifa ya sasa; majibu yaliyoko kwenye old chat history hubaki kama yalivyokuwa wakati huo.

## Files na versions

Added:
- `assistant-learned-knowledge.js`: parsing, matching, confidence, protected financial/system routing na account-scoped store.
- `verify-assistant-learned.cjs`.

Updated:
- `assistant-owner.js`: tabs ndani ya owner dialog iliyopo, editor, save status na scoped read API.
- `business-assistant.js`: retrieve matching owner facts without running commands.
- `assistant-knowledge.js`: distingue business WhatsApp contact facts na unavailable automatic WhatsApp integration.
- `business-assistant.css`, `index.html`, `sw.js`.
- `system-knowledge-registry.js`: Maarifa yangu imeongezwa kama feature halisi.
- Existing system/browser tests and documentation.

App: `2026.11.04.2`; registry: `1.1.0`; PWA cache: `motec-money-manager-v61`.
Baseline: `backups/mo-ai-before-editable-knowledge/`.

## Tests

Passed:
- `verify-assistant-learned.cjs`: plain text/FAQ parsing, synonyms, typos, confidence/ambiguity/conflicts, persistence/update, readonly/owner guards, cross-account scope, corruption/quota safety na financial route protection.
- `verify-assistant-browser.cjs`: actual owner editor create/update/reopen, answering saved facts in Swahili/English questions, quoted answers, ambiguity, offline reload, private prompt unchanged, account isolation and no fake financial/save overrides.
- All 30 system questions, 18 English variants, 38 workflow variants, 52 financial questions, Smart Entry, ownership, chat history, owner encryption, backup/cloud merge, workspace and reports regression suites.
- Syntax checks. Screenshot `test-artifacts/mo-ai-chat/my-knowledge.png` was inspected.

Browser testing uses isolated Chrome and Firebase/Auth fixtures; production data was not read or changed. No OpenAI API or deployment was performed.
