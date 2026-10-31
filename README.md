# MO TEC Money Manager

## Firebase (hiari)

Project hii ni static PWA. `firebase-config.js` ina Web App Config ya project `mo-tec-business-manager`. Hizi ni vitambulisho vya web app vinavyoonekana kwa browser; usiweke service account JSON, private key au password kwenye faili. Email/Password Authentication imewashwa kwenye project. Ongeza domain ya hosting kwenye Authorized domains, na chapisha `firestore.rules` kwenye Firestore Rules kabla ya kupakia data.

Sehemu ya Firebase ipo kwenye eneo la backup. Ingia au tengeneza akaunti. Kifaa kipya kisicho na data husoma backup ya akaunti moja kwa moja; kifaa kilichosawazishwa hukagua mabadiliko ya kifaa kingine kila sekunde tano kinapokuwa wazi na online. Kuhifadhi rekodi, oda, stock au notebook hupakia nakala mpya baada ya muda mfupi. **Pakia backup Firebase** na **Rejesha backup Firebase** ni njia za kurekebisha tofauti pale ambapo kifaa kina data zake ambazo hazijapakiwa na Firebase pia imebadilika. Mfumo hausawazishi tofauti hizo kimya kimya ili data isipotee. Data ya offline hubaki kwenye kifaa na hupakiwa mtandao ukirudi ikiwa backup ya Firebase haijabadilika. Backup huhifadhiwa chini ya `users/{uid}/backups/{backupId}` na chunks zake; rules huruhusu UID hiyo pekee. PIN/pattern/biometriki ya kifaa haviingii kwenye backup. Akaunti ya Firebase haifungi data ya `localStorage` kwenye kifaa hiki; kwa kifaa kinachotumiwa na watu wengi, kila mtu atumie browser profile au kifaa chake.

PWA ya Kiswahili kwa mmiliki mmoja, yenye miamala ya biashara/binafsi, oda, madeni na stock. Toleo: 2026.10.11.4.

## Vipengele vipya

- Oda mpya yenye deposit hutengeneza muamala mmoja wa mapato. Kuhariri oda hakurudii deposit.
- Malipo ya ziada (cash, M-Pesa, Mixx/Tigo, Airtel, benki) hupunguza deni na kuongeza mapato. Malipo yanayozidi deni yanakataliwa.
- Gharama za kazi zinaunganishwa na oda. Matumizi yaliyokwisha kurekodiwa yanaweza kuunganishwa bila kuyaongeza tena.
- Kila oda ina historia ya malipo/gharama, salio, faida inayotarajiwa na faida ya kazi iliyokamilika. Faida ya kazi ni thamani ya kazi ukitoa gharama zilizohusishwa nayo; si faida halisi ya biashara yenye gharama zote. Dashboard ya fedha inaonyesha fedha zilizoingia ukitoa zilizotoka, si faida ya uhasibu.
- Oda zinautafutaji na filters za madeni na madeni yaliyochelewa.
- Quotation, invoice na risiti zinafunguka kwenye ukurasa wa kuchapisha. Chagua **Chapisha / Hifadhi kama PDF**. Hati hizi si risiti za EFD.
- Stock ya malighafi ina vipimo, kupokea/kutoa, kuzuia stock hasi, kiwango cha onyo na historia ya karibuni. Stock inahusu biashara. Kubadilisha idadi hakutengenezi muamala wa fedha; rekodi gharama za manunuzi mara moja.

## Kuhifadhi na kurejesha taarifa

Dataset ya `motec-business-data-v2` huhifadhi oda, miamala, stock na historia kwa write moja. Write ikishindwa, hali ya ndani haitabadilishwa. Data iliyoharibika huzuia writes hadi nakala halali irejeshwe.

Rekodi za zamani hubadilishwa bila kuongezwa mara mbili. Deposit ya zamani huhesabiwa kwenye salio la oda lakini haiongezwi kimya kimya kwenye mapato. Tumia **Unganisha deposit**: chagua muamala wa mapato uliopo wenye kiasi sawa, au thibitisha deposit haijawahi kurekodiwa. Keys za zamani zinabaki kwa rollback; toleo jipya hutumia dataset v2.

Nakala tatu za kabla ya mabadiliko huhifadhiwa kwenye kifaa pale storage inapotosha. Hizi si cloud backup, na zinaweza kukosekana storage ikijaa. Kufuta data ya browser huondoa nakala hizi pamoja na taarifa. Pakua backup ya nje na uihifadhi sehemu salama; inaweza kurejeshwa kwenye simu mpya.

Backup ya JSON inajumuisha miamala, oda, stock, historia na mipangilio iliyochaguliwa. Kurejesha **hubadilisha dataset nzima** baada ya uthibitisho; si merge. Kurejesha faili lilelile mara mbili hakurudii miamala. PIN/credential ya kifaa haiingii kwenye backup na haibadilishwi wakati wa restore.

Chaguo la **Backup yenye password** hutumia AES-256-GCM, salt/IV za nasibu na PBKDF2 SHA-256 (310,000 iterations). Password isiyofanana au faili lililobadilishwa hukataliwa kabla ya restore. Password ikipotea, faili fiche haliwezi kufunguliwa. Backup hii haifichi dataset ya ndani ya browser.

## Usalama na mipaka

- Toleo hili lina usomaji na uandishi wa Firebase kiotomatiki kwa vifaa vilivyosawazishwa, lakini tofauti za mabadiliko ya wakati mmoja zinahitaji kuchagua upande sahihi; hakuna akaunti tofauti za wafanyakazi.
- Role selector ya kujichagua Admin/Staff imeondolewa: kifaa kinatumika na mmiliki mmoja. Akaunti na ruhusa halisi zinahitaji backend inayotambulisha watumiaji na kukagua kila ombi.
- PIN/pattern ni kufuli ya UI. Data ya ndani haijasimbwa. Fingerprint inategemea WebAuthn ya kifaa na HTTPS.
- Fedha za mtaji/mikopo zirekodiwe kwa kategoria zake; cash flow bado si profit and loss ya uhasibu.
- Deposit inayorejeshwa kwa mteja na partial refunds hazijawekewa workflow maalum. Kitufe cha kuondoa rekodi yenye kosa ni correction, si refund.

## Offline na hosting

Icons za 64/180/192/512 na maskable zipo kwenye folda kuu ya mradi. Service worker inahifadhi HTML, business.js, manifest na icons pamoja; toleo jipya linasubiri app za zamani zifungwe ili kuepuka kuchanganya matoleo.

Endesha kwa HTTPS au localhost. Usitumie file:// kwa WebAuthn/service worker. Njia za faili ni relative kwa GitHub Pages project URL.

Pakua backup kabla ya kubadilisha faili za app. Pakia faili kwenye repository ileile na endelea kutumia URL ileile ya GitHub Pages. ZIP hii haijapakiwa GitHub; ufikiaji wa kuandika repository ulikataliwa (HTTP 403).

## Majaribio

`node tests/core.spec.cjs` hujaribu malipo mara moja, kuhariri, overpayment, gharama, kuunganisha miamala bila duplicates, stock, atomic-write failure, backup idempotence, invalid imports, migration, corruption protection, encryption na precache assets.

Kwa browser: `npm install --no-save playwright@1.51.1`, `npx playwright install chromium`, kisha `TZ=Africa/Dar_es_Salaam node tests/business.spec.cjs` na `TZ=Africa/Dar_es_Salaam node tests/buttons.spec.cjs`. Tests hizi zinaanzisha server ya localhost zenyewe. Browser tests zote mbili zimepita kwenye Chromium headless kwa ukubwa wa simu 390 × 844. Hakuna dependency ya Playwright inayohitajika kuendesha app yenyewe.



## Mpangilio mpya wa cash-and-flow

Toleo 2026.10.11.2 lina Mwanzo, Rekodi, Oda na Zaidi. Hatua inayofuata iko juu ya kila sehemu. Maelezo ya ziada, filters na vitufe vya nyaraka vinafunguka kwa kuchaguliwa. Mwanzo ina muhtasari wa akaunti nzima na miamala mitatu ya karibuni. Oda mpya hufungua fomu ya oda; kuhifadhi huifunga. Ruhusa na hali ya GitHub upload lazima zithibitishwe kabla ya kudai app ya online imesasishwa.

Icons ziko kwenye root ya mradi huu, si icons/. Endelea kutumia host/domain na storage keys zilezile ili data ya kifaa ibaki inasomeka.


## Luxury, graph na app ya offline (2026.10.11.3)

Nyekundu ya MO TEC inabaki kwenye vitufe vikuu, sehemu iliyochaguliwa na neon ya vitufe. Navy, cream na gold zinasaidia muonekano wa Luxury. Graph ya juu ina mapato halisi kwa siku 7, wiki 8 au miezi 12. Gusa graph au tumia arrow keys kuona kiasi cha kipindi. Data ya binafsi na biashara haitachanganywa, na matumizi/future-dated income haviingii kwenye graph ya mapato. Graph, lugha tatu, neon na Dark/Light modes hazihitaji CDN au font ya internet.

### Kusakinisha kwenye Android

1. Pakia faili zote kwenye repository ya cash-and-flow, kwa muundo huu huu. Fungua URL yake kupitia Chrome na intaneti.
2. Nenda Zaidi → Mipangilio na msaada. Subiri ujumbe kwamba app iko tayari offline.
3. Bonyeza Sakinisha app. Browser isipoonyesha prompt, tumia Chrome ⋮ → Install app au Add to Home screen.
4. Fungua app kutoka ikoni yake. Zima intaneti na uhakikishe unaweza kuifungua, kurekodi na kuona graph.
5. Kwa sasisho linalosubiri, funga app na tabs zake za Chrome kisha fungua tena.

Hii ni PWA, si APK. Browser ndiyo inayodhibiti installation prompt. First-load bila intaneti haitafanya kazi. Kufuta data ya browser, browser eviction au kubadili domain kunaweza kuondoa/kuficha taarifa, hivyo pakua backup ya nje mara kwa mara. Offline haihitaji cloud; usawazishaji wa mabadiliko yanayogongana na employee login bado havipo.

Majaribio ya chart: `TZ=Africa/Dar_es_Salaam node tests/chart.spec.cjs`.


## Muhtasari tangu kuanza na miamala yote (2026.10.11.4)

Mwanzo inaonyesha tarehe ya kuanza hadi wakati huu, jumla ya mapato, matumizi na salio la akaunti iliyochaguliwa. Salio ni mapato yaliyorekodiwa ukitoa matumizi yaliyorekodiwa katika kipindi hicho; si salio linalothibitishwa moja kwa moja na benki. Miamala ya tarehe za baadaye na madeni ya oda ambayo hayajalipwa haihesabiwi kwenye fedha iliyopo. Kutafuta au kuchuja miamala hakubadilishi jumla hizi.

App ya zamani haikuhifadhi tarehe halisi ya kujisajili. Kwa data ya zamani, tarehe ya kwanza ya muamala uliokwisha kufanyika inatumika; kwa app mpya, tarehe ya kwanza ya matumizi inahifadhiwa. Chagua **Sahihisha tarehe ya kuanza** ikiwa tarehe hiyo si sahihi. Tarehe inabaki baada ya restart na inaingia kwenye backup ya JSON/encrypted. Ukirejesha backup ya zamani isiyo na tarehe ya kuanza, tarehe inatokana na muamala wa kwanza katika backup hiyo.

Panel ya **Miamala yote** iko Mwanzo na huanza ikiwa imefungwa. Iguse kufungua au kuficha historia; search, filters, kuhariri, kufuta na ripoti vinabaki ndani yake. Historia inaweza kuonyesha hata muamala wa kabla ya tarehe ya kuanza au wa baadaye; muhtasari hujumuisha kipindi kinachoonyeshwa tu. Akaunti ya biashara na binafsi zina jumla/historia tofauti.

Service worker v23 inahifadhi pia totals-data.js na cumulative.js. Offline reload imejaribiwa kwenye Chromium pamoja na tarehe, miamala na muhtasari uliosasishwa. Install prompt handoff imejaribiwa kwa tukio la majaribio; ikoni ya OS na fingerprint vinahitaji ukaguzi kwenye kifaa halisi.

Majaribio ya jumla: `TZ=Africa/Dar_es_Salaam node tests/totals.spec.cjs`.
