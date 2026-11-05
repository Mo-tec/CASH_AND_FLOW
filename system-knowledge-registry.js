'use strict';
// Audited static application knowledge. No private data or credentials.
(function(root){
 const registry={
  "schemaVersion": 1,
  "version": "1.1.0",
  "appVersion": "2026.11.04.2",
  "assetVersion": "motec-money-manager-v66",
  "verifiedAt": "2026-11-04",
  "features": [
    {
      "id": "finance",
      "name": {
        "sw": "Maana ya hesabu za fedha",
        "en": "Financial calculation meanings"
      },
      "description": {
        "sw": "Mapato ni miamala ya fedha zinazoingia; matumizi ni fedha zinazotoka. Tofauti/cash flow ni mapato ukitoa matumizi kwa kipindi husika. Deni la oda ambalo halijalipwa si mapato ya fedha tayari. Faida halisi haiwezi kuthibitishwa bila gharama zote. Wastani wa MO AI hutumia siku zote za kipindi, pamoja na siku bila miamala.",
        "en": "Income records money received; expenses record money paid out. Net cash flow is income minus expenses for the requested period. Unpaid order debt is not cash already received. Net profit requires all relevant costs. MO AI averages use every calendar day in the period, including days without transactions."
      },
      "matchPattern": "\\bmapato\\b|matumizi|salio|cash ?flow|faida|profit|\\bincome\\b|\\bexpenses?\\b",
      "capabilities": {
        "sw": [
          "Mapato ni miamala ya fedha zinazoingia; matumizi ni fedha zinazotoka"
        ],
        "en": [
          "Income records money received; expenses record money paid out"
        ]
      },
      "usageSteps": {
        "sw": [
          "Chagua kipindi cha fedha unachotaka kwenye Mwanzo.",
          "Soma Mapato, Matumizi na Salio/Tofauti; usihesabu deni lisilolipwa kama cash iliyopokelewa."
        ],
        "en": [
          "Choose the period on Home.",
          "Read Income, Expenses and Balance/difference; unpaid order debt is not received cash."
        ]
      },
      "limitations": {
        "sw": [
          "Faida halisi haiwezi kuthibitishwa bila gharama zote.",
          "Miamala isiyorekodiwa haiwezi kuhesabiwa."
        ],
        "en": [
          "Net profit requires all costs.",
          "Unrecorded transactions are not included."
        ]
      },
      "troubleshooting": [
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        }
      ],
      "route": "home",
      "location": {
        "sw": "Mwanzo > kadi za mapato, matumizi na salio",
        "en": "Home > income, expenses and balance cards"
      },
      "uiSelector": "#income",
      "functions": [
        {
          "file": "index.html",
          "name": "sumBy",
          "anchor": "function sumBy"
        },
        {
          "file": "totals-data.js",
          "name": "summarize",
          "anchor": "function summarize"
        },
        {
          "file": "assistant-analysis.js",
          "name": "calculate",
          "anchor": "function calculate"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "dates",
      "name": {
        "sw": "Tarehe na filters",
        "en": "Dates and filters"
      },
      "description": {
        "sw": "Chagua kipindi kwenye Mwanzo au uliza MO AI kwa leo, jana, juzi, wiki, mwezi, mwaka huu au tarehe kamili. Mfano: Mapato 2026-11-01 hadi 2026-11-04? Siku zote mbili zinajumuishwa. MO AI hutumia Africa/Dar_es_Salaam na tarehe halisi za miamala. Tarehe zisizo wazi huomba ufafanuzi.",
        "en": "Choose a period on Home or ask MO AI for today, yesterday, the day before yesterday, week, month, this year or full ISO dates. Example: Income 2026-11-01 to 2026-11-04? Both boundary dates are included. MO AI uses Africa/Dar_es_Salaam and actual transaction dates; ambiguous dates require clarification."
      },
      "matchPattern": "tarehe|date range|date filter|kipindi|\\bperiod\\b|filters?|chuja",
      "capabilities": {
        "sw": [
          "Chagua kipindi kwenye Mwanzo au uliza MO AI kwa leo, jana, juzi, wiki, mwezi, mwaka huu au tarehe kamili"
        ],
        "en": [
          "Choose a period on Home or ask MO AI for today, yesterday, the day before yesterday, week, month, this year or full ISO dates"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Mwanzo, kisha chagua kipindi kwenye dropdown ya Kipindi.",
          "Kwa custom, weka tarehe ya kuanzia na mwisho. Kwa MO AI tumia tarehe kamili YYYY-MM-DD.",
          "Kwenye Miamala yote unaweza kuongeza filter ya aina, category, kiasi au receipt."
        ],
        "en": [
          "On Home choose the period dropdown.",
          "For a custom period enter start/end dates; use full YYYY-MM-DD dates in MO AI.",
          "Transaction history also provides type, category, amount and receipt filters."
        ]
      },
      "limitations": {
        "sw": [
          "MO AI hutumia Africa/Dar_es_Salaam; tarehe zote mbili za range zinajumuishwa.",
          "Muhtasari wa juu unaweza kutofautiana na orodha yenye advanced filters."
        ],
        "en": [
          "MO AI uses Africa/Dar_es_Salaam and inclusive range boundaries.",
          "Top-level totals can differ from a list narrowed by advanced filters."
        ]
      },
      "troubleshooting": [
        {
          "id": "dates",
          "safeSteps": {
            "sw": [
              "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
              "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
              "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
              "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
            ],
            "en": [
              "Check actual transaction dates rather than the backup timestamp.",
              "Ensure the start is not after the end and the period is the one you intended.",
              "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
              "Check other narrowing filters when comparing a list with summary totals."
            ]
          }
        },
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        }
      ],
      "route": "home",
      "location": {
        "sw": "Mwanzo > Kipindi > tarehe maalumu; Historia > Chuja zaidi",
        "en": "Home > Period > custom dates; transaction history > more filters"
      },
      "uiSelector": "#period",
      "functions": [
        {
          "file": "index.html",
          "name": "periodRecords",
          "anchor": "function periodRecords"
        },
        {
          "file": "index.html",
          "name": "advancedRecords",
          "anchor": "function advancedRecords"
        },
        {
          "file": "assistant-analysis.js",
          "name": "period",
          "anchor": "function period"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "dashboard",
      "name": {
        "sw": "Mwanzo / Dashboard",
        "en": "Home / Dashboard"
      },
      "description": {
        "sw": "Mwanzo huonyesha mapato, matumizi na tofauti ya fedha kwa kipindi kilichochaguliwa. Chagua wiki, mwezi, tarehe maalumu au muda wote. Muhtasari wa muda wote hutumia tarehe ya kuanza na hauhesabu miamala ya baadaye. Tofauti ya fedha si faida halisi iliyothibitishwa.",
        "en": "Home shows income, expenses and their difference for the selected period. Choose week, month, custom dates or all time. All-time totals use the configured start date and exclude future transactions. This difference is not verified net profit."
      },
      "matchPattern": "dashboard|\\bmwanzo\\b",
      "capabilities": {
        "sw": [
          "Mwanzo huonyesha mapato, matumizi na tofauti ya fedha kwa kipindi kilichochaguliwa"
        ],
        "en": [
          "Home shows income, expenses and their difference for the selected period"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Mwanzo.",
          "Chagua muda wote, wiki, mwezi au tarehe maalumu.",
          "Soma kadi za fedha, graph ya mapato na Business Insights."
        ],
        "en": [
          "Open Home.",
          "Select all time, week, month or a custom period.",
          "Read the totals, income graph and Business Insights."
        ]
      },
      "limitations": {
        "sw": [
          "Dashboard hutumia data za kifaa, si lazima snapshot ileile ya Reports.",
          "Graph huonyesha mapato yaliyorekodiwa; all-time summary huacha tarehe za baadaye."
        ],
        "en": [
          "The dashboard uses device data, which may differ from Reports' server snapshot.",
          "The graph shows recorded income; the all-time summary excludes future transactions."
        ]
      },
      "troubleshooting": [
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        },
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        },
        {
          "id": "dates",
          "safeSteps": {
            "sw": [
              "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
              "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
              "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
              "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
            ],
            "en": [
              "Check actual transaction dates rather than the backup timestamp.",
              "Ensure the start is not after the end and the period is the one you intended.",
              "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
              "Check other narrowing filters when comparing a list with summary totals."
            ]
          }
        }
      ],
      "route": "home",
      "location": {
        "sw": "Menyu > Mwanzo",
        "en": "Navigation > Home"
      },
      "uiSelector": "#ux-home",
      "functions": [
        {
          "file": "cumulative.js",
          "name": "refresh",
          "anchor": "function refresh"
        },
        {
          "file": "chart-data.js",
          "name": "incomeSeries",
          "anchor": "function incomeSeries"
        },
        {
          "file": "luxury.js",
          "name": "render graph",
          "anchor": "periodOffset"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "entry",
      "name": {
        "sw": "Smart Entry ndani ya MO AI",
        "en": "Smart Entry in MO AI"
      },
      "description": {
        "sw": "Andika mfano: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000. Tumia majina halisi ya categories. Kagua preview kisha thibitisha. Auto Save hufanya kazi ikiwa imewashwa na haijazuiwa na maelekezo ya mmiliki. Kuhifadhi kunahitaji Firebase, internet na usawazishaji. Ujumbe wenye utata hauhifadhiwi.",
        "en": "For example: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000. Use exact category names. Review the preview and confirm. Auto Save requires opt-in and is blocked when owner instructions require preview. Saving requires synchronized Firebase and internet. Ambiguous commands are not saved."
      },
      "matchPattern": "smart entry|kupitia chat|kwenye chat|through chat",
      "capabilities": {
        "sw": [
          "Andika mfano: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000"
        ],
        "en": [
          "For example: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000"
        ]
      },
      "usageSteps": {
        "sw": [
          "Andika: Hifadhi mapato CATEGORY 30000 au Hifadhi matumizi CATEGORY 10000, kwa jina halisi lililosaved.",
          "Kagua preview na thibitisha kuhifadhi.",
          "Auto Save ni ya hiari na inaweza kuzuiwa na maelekezo ya mmiliki."
        ],
        "en": [
          "Write Hifadhi mapato CATEGORY 30000 or Hifadhi matumizi CATEGORY 10000 with an actual category name.",
          "Review the preview and confirm.",
          "Auto Save is opt-in and may be disabled by owner instructions."
        ]
      },
      "limitations": {
        "sw": [
          "Kuhifadhi kunahitaji akaunti ya Firebase, internet na data iliyosawazishwa.",
          "Hakuna kuhifadhi ujumbe wenye utata au muamala unaojirudia."
        ],
        "en": [
          "Saving requires Firebase authentication, connectivity and synchronized data.",
          "Ambiguous or duplicate entries are rejected."
        ]
      },
      "troubleshooting": [
        {
          "id": "entry",
          "safeSteps": {
            "sw": [
              "Kagua category, kiasi chanya cha TSh nzima, tarehe na aina ya muamala.",
              "Tenganisha swali na agizo la kuhifadhi; toa maagizo yenye taarifa kamili.",
              "Kama duplicate imezuiwa, kagua historia badala ya kubadilisha kiasi ili kupita ukaguzi.",
              "Hifadhi ya chat inahitaji Firebase iliyosawazishwa; tumia preview kabla ya kuthibitisha."
            ],
            "en": [
              "Check category, positive whole TSh amount, date and transaction type.",
              "Separate a question from a save command and supply complete information.",
              "For duplicates inspect the existing history rather than changing the amount to bypass the guard.",
              "Chat saves require synchronized Firebase; review the preview before confirming."
            ]
          }
        },
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "MO AI > input ya chat",
        "en": "MO AI > chat input"
      },
      "uiSelector": "#assistantForm",
      "functions": [
        {
          "file": "assistant-engine.js",
          "name": "parse",
          "anchor": "function parse"
        },
        {
          "file": "business-assistant.js",
          "name": "preview",
          "anchor": "function preview"
        },
        {
          "file": "firebase-cloud.js",
          "name": "motecAssistantCloud.save",
          "anchor": "async save(entries, expectedUid)"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "records",
      "name": {
        "sw": "Rekodi za mapato na matumizi",
        "en": "Transaction records"
      },
      "description": {
        "sw": "Rekodi: chagua mapato au matumizi, kiasi cha TSh, category na tarehe. Unaweza kuongeza mteja, bidhaa/huduma, maelezo na receipt. Miamala iliyopo ina chaguo la kuhariri; kufuta huhitaji ruhusa na uthibitisho wa mfumo. Malipo ya oda yapokelewe kupitia Oda ili deni na cash flow viunganishwe.",
        "en": "Record: choose income or expense, whole TSh amount, category and transaction date. Customer, product/service, notes and receipt are optional. Existing entries can be edited; deletion follows the existing permission and confirmation rules. Receive order payments through Orders to keep debt and cash flow linked."
      },
      "matchPattern": "\\brekodi\\b|\\brecord\\b|transaction|receipt|risiti",
      "capabilities": {
        "sw": [
          "Rekodi: chagua mapato au matumizi, kiasi cha TSh, category na tarehe"
        ],
        "en": [
          "Record: choose income or expense, whole TSh amount, category and transaction date"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Rekodi, chagua mapato au matumizi.",
          "Weka kiasi, category na tarehe halisi ya muamala; ongeza mteja/maelezo/receipt ikiwa unahitaji.",
          "Bonyeza Hifadhi muamala. Historia iliyopo inaweza kuhaririwa kupitia chaguo zake."
        ],
        "en": [
          "Open Record and select income or expense.",
          "Enter amount, category and actual transaction date; customer, description and receipt are optional.",
          "Save the transaction; use existing history controls for edits."
        ]
      },
      "limitations": {
        "sw": [
          "Kiasi ni TSh chanya cha namba nzima.",
          "Kurekodi malipo ya oda kama mauzo mengine kunaweza kurudia malipo; tumia huduma ya Oda."
        ],
        "en": [
          "Amounts are positive whole TSh.",
          "Recording the same order payment again can double-count it; use Orders payment controls."
        ]
      },
      "troubleshooting": [
        {
          "id": "entry",
          "safeSteps": {
            "sw": [
              "Kagua category, kiasi chanya cha TSh nzima, tarehe na aina ya muamala.",
              "Tenganisha swali na agizo la kuhifadhi; toa maagizo yenye taarifa kamili.",
              "Kama duplicate imezuiwa, kagua historia badala ya kubadilisha kiasi ili kupita ukaguzi.",
              "Hifadhi ya chat inahitaji Firebase iliyosawazishwa; tumia preview kabla ya kuthibitisha."
            ],
            "en": [
              "Check category, positive whole TSh amount, date and transaction type.",
              "Separate a question from a save command and supply complete information.",
              "For duplicates inspect the existing history rather than changing the amount to bypass the guard.",
              "Chat saves require synchronized Firebase; review the preview before confirming."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        }
      ],
      "route": "record",
      "location": {
        "sw": "Menyu > Rekodi; Mwanzo > Miamala yote kwa historia",
        "en": "Navigation > Record; Home > All transactions for history"
      },
      "uiSelector": "#transactionForm",
      "functions": [
        {
          "file": "index.html",
          "name": "validRecord",
          "anchor": "function validRecord"
        },
        {
          "file": "index.html",
          "name": "transactionForm submit handler",
          "anchor": "$('transactionForm').addEventListener"
        },
        {
          "file": "business.js",
          "name": "commitBusiness",
          "anchor": "function commitBusiness"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "orders",
      "name": {
        "sw": "Oda na malipo yake",
        "en": "Orders and payments"
      },
      "description": {
        "sw": "Oda: tumia Oda mpya kuweka mteja, kazi, thamani, deposit na tarehe ya kukabidhi. Kwenye oda iliyopo tumia Malipo au Gharama ili kuunganisha miamala na kazi. Salio la deni hutokana na thamani ya oda ukitoa malipo yaliyorekodiwa na legacy deposit. Invoice, quotation na risiti zinapatikana kwenye chaguo za oda. Usirekodi malipo yale yale mara mbili.",
        "en": "Orders: use New order for customer, job, value, deposit and due date. Use Payment or Cost on an existing order to link transactions. Outstanding debt is order value less recorded payments and any legacy deposit. Order options include quotations, invoices and receipts. Do not enter the same payment twice."
      },
      "matchPattern": "\\boda\\b|\\borders?\\b|deposit|quotation|invoice|deadline|kukabidhi",
      "capabilities": {
        "sw": [
          "Oda: tumia Oda mpya kuweka mteja, kazi, thamani, deposit na tarehe ya kukabidhi"
        ],
        "en": [
          "Orders: use New order for customer, job, value, deposit and due date"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Oda > Oda mpya.",
          "Weka mteja, kazi, thamani, deposit na deadline kisha hifadhi.",
          "Kwa oda iliyopo tumia Malipo, Gharama au chaguo zaidi kwa nyaraka na ledger."
        ],
        "en": [
          "Open Orders > New order.",
          "Enter customer, job, value, deposit and deadline, then save.",
          "Use Payment, Cost or more options for documents and ledger."
        ]
      },
      "limitations": {
        "sw": [
          "Malipo hayawezi kuzidi thamani ya oda.",
          "Legacy deposit hutendewa kama historia na haiingiziwi cash mara mbili bila reconciliation."
        ],
        "en": [
          "Payments cannot exceed order value.",
          "Legacy deposits require reconciliation rather than silently duplicating cash income."
        ]
      },
      "troubleshooting": [
        {
          "id": "orders",
          "safeSteps": {
            "sw": [
              "Kagua oda husika, thamani, malipo yaliyohusishwa na legacy deposit.",
              "Malipo yanayozidi thamani ya oda huzuiwa; oda iliyoghairiwa haitumiki kupokea malipo mapya.",
              "Kama deposit ya zamani ipo, tumia hatua za reconciliation badala ya kuiingiza mara mbili.",
              "Taja kama tatizo ni malipo, deni au nyaraka ili kuelekezwa kwa usahihi."
            ],
            "en": [
              "Review the order value, linked payments and any legacy deposit.",
              "Overpayments are rejected and cancelled orders do not accept new payments.",
              "Reconcile historical deposits rather than entering them twice.",
              "Specify whether the problem is a payment, debt balance or document."
            ]
          }
        },
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        }
      ],
      "route": "orders",
      "location": {
        "sw": "Menyu > Oda",
        "en": "Navigation > Orders"
      },
      "uiSelector": "#ordersPanel",
      "functions": [
        {
          "file": "business.js",
          "name": "submitBusinessOrder",
          "anchor": "function submitBusinessOrder"
        },
        {
          "file": "business.js",
          "name": "paidFor/debtFor",
          "anchor": "function debtFor"
        },
        {
          "file": "business.js",
          "name": "openEntry/printOrder",
          "anchor": "function printOrder"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "customers",
      "name": {
        "sw": "Wateja",
        "en": "Customers"
      },
      "description": {
        "sw": "Wateja hujumuisha oda na miamala yenye majina yanayolingana. Tumia jina lilelile kila mara, na jina tofauti kwa watu tofauti. Hapa unaona malipo, gharama zilizohusishwa, deni la oda na historia ya kila mteja. Mauzo ya moja kwa moja bila oda hayazalishi deni la kukisia.",
        "en": "Customers groups orders and named transactions with matching normalized names. Use consistent names and distinguish different people. It shows payments, linked costs, order debt and each customer history. Direct sales without an order do not create an assumed debt."
      },
      "matchPattern": "\\bwateja\\b|\\bmteja\\b|customers?|madeni|wadaiwa|debt",
      "capabilities": {
        "sw": [
          "Wateja hujumuisha oda na miamala yenye majina yanayolingana"
        ],
        "en": [
          "Customers groups orders and named transactions with matching normalized names"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Wateja na tafuta jina au bidhaa.",
          "Fungua kadi ya mteja; chagua mwezi kama unataka transactions za kipindi hicho.",
          "Tumia majina thabiti kwenye Oda na Rekodi ili historia ijumlishwe vizuri."
        ],
        "en": [
          "Open Customers and search by name or product.",
          "Open a customer card and select a month for transaction totals.",
          "Use consistent names in Orders and Record."
        ]
      },
      "limitations": {
        "sw": [
          "Majina yanayolingana hujumuishwa; watu tofauti wanahitaji majina yanayotofautishwa.",
          "Gharama zisizohusishwa na mteja/oda haziwezi kugawiwa kwa kubuni."
        ],
        "en": [
          "Matching normalized names are grouped; distinguish different people.",
          "Unlinked general costs are not invented or allocated to a customer."
        ]
      },
      "troubleshooting": [
        {
          "id": "customers",
          "safeSteps": {
            "sw": [
              "Kagua jina lililotumika kwenye Rekodi na Oda; majina yanayolingana hujumuishwa.",
              "Angalia filter ya mwezi na miamala iliyohusishwa na oda/mteja.",
              "Usibadilishe malipo kabla ya kuangalia kama yameshahifadhiwa kwenye historia."
            ],
            "en": [
              "Check the names used in Record and Orders; matching names are grouped.",
              "Review the month filter and linked customer/order transactions.",
              "Check existing payment history before making changes."
            ]
          }
        },
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        }
      ],
      "route": "customers",
      "location": {
        "sw": "Menyu > Wateja",
        "en": "Navigation > Customers"
      },
      "uiSelector": "#customerPanel",
      "functions": [
        {
          "file": "customer-data.js",
          "name": "summarize",
          "anchor": "function summarize"
        },
        {
          "file": "workspace.js",
          "name": "renderCustomers/refreshMonthly",
          "anchor": "function refreshMonthly"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "stock",
      "name": {
        "sw": "Stock ya malighafi",
        "en": "Materials inventory"
      },
      "description": {
        "sw": "Zaidi → Stock ya malighafi. Ongeza jina la bidhaa, unit, kiasi na kiwango cha onyo. Tumia Pokea/tumia kuongeza au kutoa stock; kiasi kisichotosha huzuiwa. Mfumo huonya stock inapokuwa sawa au chini ya kiwango cha onyo.",
        "en": "More → Materials stock. Add name, unit, quantity and warning threshold. Receive/use adjusts inventory; insufficient quantities are rejected. Low-stock warnings apply at or below the threshold."
      },
      "matchPattern": "\\bstock\\b|inventory|malighafi|materials",
      "capabilities": {
        "sw": [
          "Zaidi → Stock ya malighafi"
        ],
        "en": [
          "More → Materials stock"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Stock ya malighafi > Ongeza.",
          "Weka jina, unit, kiasi na kiwango cha onyo.",
          "Tumia Pokea/tumia kubadilisha idadi. Rekodi gharama ya manunuzi mara moja kwenye miamala."
        ],
        "en": [
          "Open More > Materials stock > Add.",
          "Enter name, unit, quantity and warning level.",
          "Use Receive/use for quantities; record purchasing expenses once in transactions."
        ]
      },
      "limitations": {
        "sw": [
          "Stock haiwezi kuwa hasi.",
          "Kubadilisha idadi ya stock hakuhifadhi gharama ya manunuzi kiotomatiki."
        ],
        "en": [
          "Inventory cannot become negative.",
          "Quantity adjustments do not automatically record purchasing expenses."
        ]
      },
      "troubleshooting": [
        {
          "id": "stock",
          "safeSteps": {
            "sw": [
              "Kagua kiasi kilichopo, unit na kiasi unachotaka kutoa.",
              "Kiasi hasi au kutoa zaidi ya kilichopo huzuiwa.",
              "Gharama ya ununuzi hutenganishwa na idadi ya stock; usirekodi gharama mara mbili."
            ],
            "en": [
              "Check available quantity, unit and the requested outgoing amount.",
              "Negative stock and issuing more than available are rejected.",
              "Purchasing expense is separate from stock quantity; avoid double recording it."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Stock ya malighafi",
        "en": "More > Materials stock"
      },
      "uiSelector": "#stockPanel",
      "functions": [
        {
          "file": "business.js",
          "name": "validStock/openStockForm",
          "anchor": "function openStockForm"
        },
        {
          "file": "business.js",
          "name": "openStockMove",
          "anchor": "function openStockMove"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "insights",
      "name": {
        "sw": "Business Insights",
        "en": "Business Insights"
      },
      "description": {
        "sw": "Business Insights kwenye Mwanzo hutoa muhtasari wa mwezi, wastani wa mapato, category kubwa za mapato/matumizi na mwenendo wa wiki. Hutumia miamala iliyorekodiwa; si uthibitisho wa gharama zote wala tathmini kamili ya faida halisi.",
        "en": "Business Insights on Home provides monthly summaries, average income, top income/expense categories and weekly trends from recorded transactions. It does not establish all business costs or verified net profit."
      },
      "matchPattern": "insights|cash health|best sales",
      "capabilities": {
        "sw": [
          "Business Insights kwenye Mwanzo hutoa muhtasari wa mwezi, wastani wa mapato, category kubwa za mapato/matumizi na mwenendo wa wiki"
        ],
        "en": [
          "Business Insights on Home provides monthly summaries, average income, top income/expense categories and weekly trends from recorded transactions"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Mwanzo > Business Insights.",
          "Linganisha mapato, matumizi, top categories na mwenendo wa wiki.",
          "Kwa uchambuzi wa kipindi maalumu uliza MO AI kwa tarehe zake."
        ],
        "en": [
          "Open Home > Business Insights.",
          "Review income, expenses, top categories and weekly trends.",
          "Ask MO AI with explicit dates for a custom-period analysis."
        ]
      },
      "limitations": {
        "sw": [
          "Baadhi ya Insights ni za mwezi wa sasa na wiki, si kila filter ya transaction list.",
          "Health score ni heuristic ya app, si tathmini ya uhakika ya biashara."
        ],
        "en": [
          "Some insights use the current month/week rather than every list filter.",
          "The health score is an application heuristic, not a definitive assessment."
        ]
      },
      "troubleshooting": [
        {
          "id": "totals",
          "safeSteps": {
            "sw": [
              "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
              "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
              "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
              "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
            ],
            "en": [
              "The reason for the mismatch is not confirmed without comparing the relevant data.",
              "Compare device dashboard totals with the Firestore/cache snapshot source.",
              "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
              "Review duplicates, linked order payments and legacy deposits before editing."
            ]
          }
        },
        {
          "id": "dates",
          "safeSteps": {
            "sw": [
              "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
              "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
              "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
              "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
            ],
            "en": [
              "Check actual transaction dates rather than the backup timestamp.",
              "Ensure the start is not after the end and the period is the one you intended.",
              "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
              "Check other narrowing filters when comparing a list with summary totals."
            ]
          }
        }
      ],
      "route": "home",
      "location": {
        "sw": "Mwanzo > Business Insights",
        "en": "Home > Business Insights"
      },
      "uiSelector": "#insightsPanel",
      "functions": [
        {
          "file": "index.html",
          "name": "renderInsights",
          "anchor": "function renderInsights"
        },
        {
          "file": "assistant-analysis.js",
          "name": "answer",
          "anchor": "function answer"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "reports",
      "name": {
        "sw": "Ripoti na PDF",
        "en": "Reports and PDF"
      },
      "description": {
        "sw": "Zaidi → Ripoti na Backup: chagua tarehe, akaunti na category kisha Onyesha ripoti. Sehemu hii husoma snapshot ya Firestore na ina PDF, Print na JSON. Historia ya miamala pia ina exports za kifaa. PDF iliyopakiwa kwenye Notebook ni ya kuonyeshwa; MO AI haisomi maandishi yake yenyewe.",
        "en": "More → Reports & Backup: select dates, account and category, then load the report. It reads the Firestore snapshot and offers PDF, Print and JSON. Transaction history also has device exports. Notebook PDF uploads are viewable documents; MO AI does not automatically extract their text."
      },
      "matchPattern": "ripoti|reports?|\\bpdf\\b|\\bcsv\\b",
      "capabilities": {
        "sw": [
          "Zaidi → Ripoti na Backup: chagua tarehe, akaunti na category kisha Onyesha ripoti",
          "History ya vipindi vya siku 10 huwekwa kama metadata kupitia tenDayCheck, si kuhifadhi PDF/JSON files cloud."
        ],
        "en": [
          "More → Reports & Backup: select dates, account and category, then load the report",
          "tenDayCheck stores ten-day period readiness metadata rather than PDF/JSON files in the cloud."
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Ripoti na Backup.",
          "Weka tarehe ya kuanzia/mwisho wa kipindi (kwa mwezi tumia mwanzo na mwisho unaotaka), akaunti na category.",
          "Bonyeza Onyesha ripoti, kisha PDF au Print. JSON hapa ni backup ya snapshot nzima, si PDF iliyochujwa."
        ],
        "en": [
          "Open More > Reports & Backup.",
          "Enter start/end dates for the desired month or period, account and category.",
          "Load the report, then use PDF or Print. JSON here is the complete snapshot backup, not a filtered PDF equivalent."
        ]
      },
      "limitations": {
        "sw": [
          "Reports husoma Firestore online; PDF writer yenyewe haitegemei CDN.",
          "History ya ripoti ni metadata; files hutengenezwa tena kutoka snapshot ya sasa.",
          "JSON export inajumuisha backup ya biashara nzima ya chanzo."
        ],
        "en": [
          "Reports load Firestore online; the PDF writer itself has no CDN dependency.",
          "Report history stores metadata, with files regenerated from current snapshots.",
          "JSON exports the complete source business backup."
        ]
      },
      "troubleshooting": [
        {
          "id": "pdf",
          "safeSteps": {
            "sw": [
              "Bila kuona hatua iliyoshindwa, siwezi kuthibitisha sababu ya PDF kushindikana.",
              "Kwa Ripoti na Backup, hakikisha internet, Firebase login na tarehe halali, kisha Onyesha ripoti na PDF.",
              "Kwa Print, ruhusu dirisha jipya; kwa Notebook tumia Print/Hifadhi PDF na controls zake.",
              "Ikiendelea, taja kama ni PDF ya Ripoti, Oda au Notebook na ujumbe mfupi unaoonekana."
            ],
            "en": [
              "The cause is not confirmed without knowing which PDF operation failed.",
              "For Reports & Backup check internet, Firebase sign-in and valid dates, load the report and download PDF.",
              "For Print allow popups; Notebook has its own Print/Save PDF control.",
              "If it persists, specify Reports, Orders or Notebook and the short displayed message."
            ]
          }
        },
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        },
        {
          "id": "dates",
          "safeSteps": {
            "sw": [
              "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
              "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
              "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
              "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
            ],
            "en": [
              "Check actual transaction dates rather than the backup timestamp.",
              "Ensure the start is not after the end and the period is the one you intended.",
              "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
              "Check other narrowing filters when comparing a list with summary totals."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Ripoti na Backup",
        "en": "More > Reports & Backup"
      },
      "uiSelector": "#reportsBackup",
      "functions": [
        {
          "file": "reports.js",
          "name": "report/load/exportFile",
          "anchor": "async function exportFile"
        },
        {
          "file": "reports.js",
          "name": "tenDayCheck",
          "anchor": "async function tenDayCheck"
        },
        {
          "file": "report-pdf.js",
          "name": "ReportPDF.create",
          "anchor": "async create(lines)"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "backup",
      "name": {
        "sw": "Backup na kurejesha data",
        "en": "Backup and restore"
      },
      "description": {
        "sw": "Pakua backup ya JSON kabla ya kufanya mabadiliko makubwa. Mfumo una backup ya kawaida na iliyolindwa kwa password. Rejesha/Pakia hutumia huduma zilizopo kuunganisha rekodi na kuzuia ID zinazojirudia; migongano huhitaji kufuata hatua zinazoonyeshwa. Historia ya chat na prompt ya mmiliki ni hifadhi tofauti za kifaa, hazijasawazishwa kama business backup.",
        "en": "Download a JSON backup before major changes. Normal and password-protected backups are available. Existing restore/upload services merge records and handle duplicate IDs; follow conflict prompts. Chat history and owner prompts are separate local stores, not synchronized business-backup data."
      },
      "matchPattern": "backup|nakala|rejesha|restore|json|export|import",
      "capabilities": {
        "sw": [
          "Pakua backup ya JSON kabla ya kufanya mabadiliko makubwa"
        ],
        "en": [
          "Download a JSON backup before major changes"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Mwanzo > Miamala yote, kisha chaguo za backup na pakua JSON (au backup yenye password).",
          "Kwa kurejesha, chagua Import/Rejesha na faili halali; weka password ikiwa backup imesimbwa.",
          "Soma muhtasari wa merge na uthibitishe. Rekodi za sasa huhifadhiwa; ID zinazofanana hushughulikiwa na merge."
        ],
        "en": [
          "On Home open All transactions, backup options and download JSON (or an encrypted backup).",
          "To restore, select Import/Restore and a valid file; enter its password if encrypted.",
          "Review and confirm the merge summary. Existing records are retained and matching IDs are handled by merge."
        ]
      },
      "limitations": {
        "sw": [
          "Import ina kikomo cha 20 MB; encrypted backup haiwezi kufunguliwa bila password sahihi.",
          "Rekodi zilizofutwa zinaweza kurudi kama zipo kwenye backup.",
          "Chat history na owner prompt si sehemu ya business backup."
        ],
        "en": [
          "Imports are limited to 20 MB; encrypted backups require the correct password.",
          "Deleted records can reappear if present in an imported backup.",
          "Chat history and owner prompts are separate from business backups."
        ]
      },
      "troubleshooting": [
        {
          "id": "backup",
          "safeSteps": {
            "sw": [
              "Sababu inaweza kuwa faili, password, ukubwa, storage au network; haijathibitishwa kutoka swali pekee.",
              "Hifadhi nakala ya sasa kwanza. Hakikisha JSON ni halali na faili la import halizidi 20 MB.",
              "Backup fiche inahitaji password yake; kwa Firebase hakikisha akaunti, internet na snapshot iliyo kamili.",
              "Fuata muhtasari wa merge/conflict. Usifute storage au records kama njia ya kurekebisha."
            ],
            "en": [
              "Possible issues include file validity, password, size, storage or network; the cause is not confirmed.",
              "Preserve the current backup first. Imports need valid JSON within 20 MB.",
              "Encrypted backups require their password; cloud operations need the owning account, connectivity and a complete snapshot.",
              "Follow merge/conflict prompts instead of clearing storage or records."
            ]
          }
        },
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Mwanzo > Miamala yote > Historia na backup; Zaidi > Firebase kwa cloud",
        "en": "Home > All transactions > History/backup; More > Firebase for cloud"
      },
      "uiSelector": "#exportBtn",
      "functions": [
        {
          "file": "business.js",
          "name": "exportBusinessBackup",
          "anchor": "function exportBusinessBackup"
        },
        {
          "file": "business.js",
          "name": "importBusinessBackup/restoreBackup",
          "anchor": "async function importBusinessBackup"
        },
        {
          "file": "backup-merge.js",
          "name": "merge",
          "anchor": "function merge"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "firebase",
      "name": {
        "sw": "Firebase na akaunti",
        "en": "Firebase and account"
      },
      "description": {
        "sw": "Zaidi → Firebase: ingia kwa email/password. Data za cloud huhifadhiwa chini ya UID ya akaunti, katika snapshots za backup. Auto backup husawazisha mabadiliko baada ya verification. Data za kifaa na cloud zikitofautiana, tumia hatua za Pakia/Rejesha kuunganisha kwa usalama. MO AI haitumii data ya akaunti nyingine.",
        "en": "More → Firebase: sign in with email/password. Cloud data is stored in backup snapshots under the authenticated UID. Automatic backup runs after verification. When device/cloud data conflicts, use the existing upload/restore workflow. MO AI does not substitute another account’s data."
      },
      "matchPattern": "firebase|firestore|akaunti|account|sync|sawazish",
      "capabilities": {
        "sw": [
          "Zaidi → Firebase: ingia kwa email/password"
        ],
        "en": [
          "More → Firebase: sign in with email/password"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Firebase na ingia kwenye akaunti inayomiliki data.",
          "Subiri verification na auto backup.",
          "Ikiwa kifaa na Firebase vinatofautiana, pakua backup kwanza; fuata Pakia/Rejesha na muhtasari wa merge badala ya kufuta data."
        ],
        "en": [
          "Open More > Firebase and sign into the owning account.",
          "Allow verification and automatic backup to finish.",
          "For a device/cloud conflict, download a backup first and follow upload/restore merge prompts instead of deleting data."
        ]
      },
      "limitations": {
        "sw": [
          "Cloud reads hutegemea UID ya Auth na Firestore Rules.",
          "Data ziko kwenye backup snapshots/chunks, si collection ya kila transaction."
        ],
        "en": [
          "Cloud reads are scoped by Auth UID and Firestore Rules.",
          "Business data uses backup snapshots/chunks rather than one transaction per document."
        ]
      },
      "troubleshooting": [
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        },
        {
          "id": "backup",
          "safeSteps": {
            "sw": [
              "Sababu inaweza kuwa faili, password, ukubwa, storage au network; haijathibitishwa kutoka swali pekee.",
              "Hifadhi nakala ya sasa kwanza. Hakikisha JSON ni halali na faili la import halizidi 20 MB.",
              "Backup fiche inahitaji password yake; kwa Firebase hakikisha akaunti, internet na snapshot iliyo kamili.",
              "Fuata muhtasari wa merge/conflict. Usifute storage au records kama njia ya kurekebisha."
            ],
            "en": [
              "Possible issues include file validity, password, size, storage or network; the cause is not confirmed.",
              "Preserve the current backup first. Imports need valid JSON within 20 MB.",
              "Encrypted backups require their password; cloud operations need the owning account, connectivity and a complete snapshot.",
              "Follow merge/conflict prompts instead of clearing storage or records."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Firebase",
        "en": "More > Firebase"
      },
      "uiSelector": "#cloudPanel",
      "functions": [
        {
          "file": "firebase-cloud.js",
          "name": "initializeFirebase/waitForAuth",
          "anchor": "async function waitForAuth"
        },
        {
          "file": "firebase-cloud.js",
          "name": "initializeSync/uploadSnapshot",
          "anchor": "async function initializeSync"
        },
        {
          "file": "firestore.rules",
          "name": "per-user authorization",
          "anchor": "request.auth.uid == userId"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "offline",
      "name": {
        "sw": "Online na Offline",
        "en": "Online and Offline"
      },
      "description": {
        "sw": "Auto husoma Firebase online na snapshot ya akaunti sahihi offline. Kifaa hiki husoma rekodi za kifaa baada ya verification. PWA huhifadhi resources za app. Cache isiyopatikana au isiyothibitishwa haitachukuliwa kuwa biashara yenye sifuri. Smart Entry bado inahitaji internet na Firebase iliyosawazishwa ili kuhifadhi.",
        "en": "Auto reads Firebase online and the correct account snapshot offline. Device mode requires ownership verification. The PWA caches app resources. Missing or unverified caches are not treated as zero activity. Smart Entry saving still requires internet and synchronized Firebase."
      },
      "matchPattern": "offline|online|internet|mtandao|pwa",
      "capabilities": {
        "sw": [
          "Auto husoma Firebase online na snapshot ya akaunti sahihi offline"
        ],
        "en": [
          "Auto reads Firebase online and the correct account snapshot offline"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua app online angalau mara moja ili resources na data zinazohitajika zipatikane.",
          "Offline, tumia Auto kwa cache ya akaunti sahihi au Kifaa hiki kwa data zilizothibitishwa.",
          "Ukikosa cache, unganisha mtandao na ingia akaunti sahihi; usibadilishe umiliki wa data kwa kubuni."
        ],
        "en": [
          "Open the app online at least once to cache resources and required data.",
          "Offline, use Auto for the correct account cache or Device for verified local records.",
          "If no cache exists, reconnect and sign into the owning account; do not invent ownership."
        ]
      },
      "limitations": {
        "sw": [
          "System help hufanya kazi bila Firebase; takwimu huhitaji data/cached snapshot halisi.",
          "Smart Entry save na server Reports bado huhitaji mtandao."
        ],
        "en": [
          "System help needs no Firebase connection; figures require real local/cached data.",
          "Smart Entry saving and server Reports still need connectivity."
        ]
      },
      "troubleshooting": [
        {
          "id": "offline",
          "safeSteps": {
            "sw": [
              "Cache inaweza kukosekana au app haijawahi kufunguliwa online; hii si utambuzi wa sababu halisi.",
              "Tumia Auto kwa cache ya akaunti yako au Kifaa hiki kwa rekodi zilizothibitishwa.",
              "Ikiwa hakuna cache sahihi, majibu ya takwimu yasubiri internet; maelekezo ya mfumo bado yanafanya kazi.",
              "Internet ikirudi, ingia akaunti sahihi na ruhusu verification/auto backup."
            ],
            "en": [
              "The cache may be missing or the app may not have been loaded online; this is not a confirmed diagnosis.",
              "Use Auto for your account snapshot or Device for verified records.",
              "Without a valid cache, figures must wait for connectivity; system help still works.",
              "Reconnect, sign into the owning account and allow verification/automatic backup."
            ]
          }
        },
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "MO AI > menyu ya chanzo cha data; hali ya connection",
        "en": "MO AI > source menu and connection indicator"
      },
      "uiSelector": "#assistantSource",
      "functions": [
        {
          "file": "assistant-data.js",
          "name": "source/cached/local",
          "anchor": "async function source"
        },
        {
          "file": "sw.js",
          "name": "fetch cache handler",
          "anchor": "self.addEventListener('fetch'"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "categories",
      "name": {
        "sw": "Categories na bajeti",
        "en": "Categories and budgets"
      },
      "description": {
        "sw": "Zaidi → Bajeti na kategoria. Tumia majina halisi ya categories zako; categories za sasa ni majina, si kanuni zinazosema mapato au matumizi. Kwa Smart Entry taja aina ya muamala. Bajeti ya mwezi hulinganishwa na matumizi yaliyorekodiwa.",
        "en": "More → Budget and categories. Use actual saved category names. Categories are names, not an income/expense type schema; state the transaction type in Smart Entry. Monthly budgets are compared with recorded expenses."
      },
      "matchPattern": "categor|kategoria|bajeti|budget",
      "capabilities": {
        "sw": [
          "Zaidi → Bajeti na kategoria"
        ],
        "en": [
          "More → Budget and categories"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Bajeti na kategoria.",
          "Kwa kuongeza category, andika jina na bonyeza Ongeza ukiwa na ruhusa ya app.",
          "Kwa kuona matumizi ya category: Mwanzo > Miamala yote > Chuja zaidi, chagua aina Matumizi na category husika."
        ],
        "en": [
          "Open More > Budget and categories.",
          "Enter a category name and Add when permitted by the app.",
          "For category expenses use Home > All transactions > more filters, select Expenses and the category."
        ]
      },
      "limitations": {
        "sw": [
          "Category schema ni majina tu; Smart Entry inahitaji aina ya mapato/matumizi.",
          "Kuondoa category kwenye orodha hakufuti transactions za zamani."
        ],
        "en": [
          "Categories are names only; Smart Entry requires income/expense type.",
          "Removing a category name does not delete historical transactions."
        ]
      },
      "troubleshooting": [
        {
          "id": "category",
          "safeSteps": {
            "sw": [
              "Kagua jina halisi la category na filters; siwezi kujua sababu halisi bila kuona hali yake.",
              "Zaidi > Bajeti na kategoria huonyesha majina yaliyosanidiwa.",
              "Category iliyotolewa kwenye orodha inaweza kubaki kwenye transactions za zamani; usifute transactions ili kurekebisha jina.",
              "Smart Entry inahitaji jina linalolingana na aina ya mapato/matumizi iliyo wazi."
            ],
            "en": [
              "Check the exact category name and filters; the exact cause needs more context.",
              "More > Budget and categories shows configured names.",
              "Removed category names can remain in old transactions; do not delete transactions to repair a label.",
              "Smart Entry requires an exact name and a clear income/expense type."
            ]
          }
        },
        {
          "id": "dates",
          "safeSteps": {
            "sw": [
              "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
              "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
              "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
              "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
            ],
            "en": [
              "Check actual transaction dates rather than the backup timestamp.",
              "Ensure the start is not after the end and the period is the one you intended.",
              "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
              "Check other narrowing filters when comparing a list with summary totals."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Bajeti na kategoria; Mwanzo > Miamala yote kwa filters",
        "en": "More > Budget/categories; Home > All transactions for filters"
      },
      "uiSelector": "#managerPanel",
      "functions": [
        {
          "file": "workspace.js",
          "name": "getCategories override",
          "anchor": "getCategories=function"
        },
        {
          "file": "index.html",
          "name": "addCategoryBtn handler",
          "anchor": "$('addCategoryBtn').addEventListener"
        },
        {
          "file": "index.html",
          "name": "advancedRecords",
          "anchor": "function advancedRecords"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "notebook",
      "name": {
        "sw": "Notebook na notes",
        "en": "Notebook and notes"
      },
      "description": {
        "sw": "Zaidi → Notebook kwa maandishi na notes zako. Unaweza kuhifadhi, kuhariri, kuchapisha au kupakia PDF kwa kutumia controls zilizopo. Kupakia PDF hakubadilishi maandishi yake kuwa miamala wala hakufundishi MO AI yaliyomo ndani yake.",
        "en": "More → Notebook for notes and documents. Existing controls save, edit, print and upload PDFs. Uploading a PDF does not turn its contents into transactions or teach MO AI its text automatically."
      },
      "matchPattern": "notebook|notes?|maandishi|kumbukumbu",
      "capabilities": {
        "sw": [
          "Zaidi → Notebook kwa maandishi na notes zako"
        ],
        "en": [
          "More → Notebook for notes and documents"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Notebook > Andika/hariri noti.",
          "Tumia Noti mpya, weka kichwa na maandishi kisha Hifadhi Notebook.",
          "Fungua noti iliyohifadhiwa kuhariri/kuchapisha. PDF inaweza kupakiwa kwa kutazamwa."
        ],
        "en": [
          "Open More > Notebook > Write/edit note.",
          "Use New note, enter a title and text, then Save Notebook.",
          "Open saved notes to edit or print. PDFs can be uploaded for viewing."
        ]
      },
      "limitations": {
        "sw": [
          "Noti huhitaji kichwa; mabadiliko yasiyohifadhiwa yana uthibitisho kabla ya kuyaacha.",
          "PDF upload ni hadi 2 MB; haiingizi transactions wala kusomewa maandishi na MO AI kiotomatiki."
        ],
        "en": [
          "Notes require titles; unsaved edits prompt before discard.",
          "PDF uploads are limited to 2 MB and do not automatically create transactions or teach MO AI document text."
        ]
      },
      "troubleshooting": [
        {
          "id": "notebook",
          "safeSteps": {
            "sw": [
              "Weka kichwa cha noti kabla ya kuhifadhi na angalia kama mabadiliko bado hayajahifadhiwa.",
              "PDF iliyopakiwa lazima iwe PDF na isizidi 2 MB.",
              "Ikiwa PDF haionekani kwenye viewer, tumia Fungua PDF; MO AI haisomi maandishi yake yenyewe.",
              "Usifute noti au storage ili kutatua kosa bila backup."
            ],
            "en": [
              "Enter a title before saving and check for unsaved edits.",
              "Uploaded files must be PDFs within 2 MB.",
              "If the viewer fails use Open PDF; MO AI does not automatically extract its text.",
              "Do not delete notes or storage as a troubleshooting shortcut."
            ]
          }
        },
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Notebook",
        "en": "More > Notebook"
      },
      "uiSelector": "#notebookPanel",
      "functions": [
        {
          "file": "notebook-notes.js",
          "name": "select/drawList/saveNotebook",
          "anchor": "function drawList"
        },
        {
          "file": "workspace.js",
          "name": "refreshPdf",
          "anchor": "function refreshPdf"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "history",
      "name": {
        "sw": "Historia ya chat",
        "en": "Chat history"
      },
      "description": {
        "sw": "MO AI → alama ya saa/Historia. Chat hujihifadhi kwa tarehe na saa za Tanzania. + huanza chat mpya; Futa chat huondoa chat iliyochaguliwa pekee. Historia ni ya kifaa/browser hii, imetenganishwa kwa akaunti. Kufungua chat ya zamani hakurudii kuhifadhi miamala yake.",
        "en": "MO AI → clock/history icon. Chats save automatically with Tanzania dates and times. + starts a new chat; Clear chat removes only the selected conversation. History is local to this browser and separated by account. Reopening old messages never replays transactions."
      },
      "matchPattern": "historia.*chat|chat.*historia|chat history|mazungumzo|chat mpya",
      "capabilities": {
        "sw": [
          "MO AI → alama ya saa/Historia"
        ],
        "en": [
          "MO AI → clock/history icon"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua MO AI na alama ya saa/Historia kuchagua chat yenye tarehe/saa.",
          "+ huanza chat mpya bila kufuta ya zamani.",
          "Futa chat huondoa mazungumzo yaliyochaguliwa tu; haifuti miamala."
        ],
        "en": [
          "Open MO AI and use the clock/history icon to select a dated chat.",
          "+ starts a new conversation without deleting earlier ones.",
          "Clear chat removes only the selected conversation, never business transactions."
        ]
      },
      "limitations": {
        "sw": [
          "Historia ni ya kifaa/browser na account scope yake; haisawazishwi kwenye vifaa vingine.",
          "Kufungua ujumbe wa zamani hakuendeshi tena Smart Entry."
        ],
        "en": [
          "History is local to this browser/account scope, without cross-device sync.",
          "Opening archived messages never replays Smart Entry."
        ]
      },
      "troubleshooting": [
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        },
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "MO AI > alama ya saa/Historia; + kwa chat mpya",
        "en": "MO AI > clock/history icon; + for a new chat"
      },
      "uiSelector": "#assistantHistory",
      "functions": [
        {
          "file": "assistant-history.js",
          "name": "create/append/select/removeActive",
          "anchor": "function create"
        },
        {
          "file": "business-assistant.js",
          "name": "renderActiveHistory",
          "anchor": "function renderActiveHistory"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "owner",
      "name": {
        "sw": "Maelekezo ya mmiliki",
        "en": "Owner instructions"
      },
      "description": {
        "sw": "Sehemu ya mmiliki inahitaji password. Prompt yake imesimbwa na haiongezwi kwenye chat au business backup. Kwa sasa inaongoza lugha, ufupi, salamu na lazima ya preview. Maagizo yasiyotambuliwa hayatekelezwi kiotomatiki; prompt haipi ruhusa ya kufuta data au kupita validation. Si backend ya AI API.",
        "en": "Owner instructions require a password. The encrypted prompt is not inserted into chat or business backups. Current supported preferences are language, brevity, greeting and mandatory preview. Unrecognized instructions are not automatically executable and cannot bypass data validation. This is not an AI API backend."
      },
      "matchPattern": "prompt|mmiliki|owner instructions|maelekezo.*ai",
      "capabilities": {
        "sw": [
          "Sehemu ya mmiliki inahitaji password"
        ],
        "en": [
          "Owner instructions require a password"
        ]
      },
      "usageSteps": {
        "sw": [
          "Tumia njia yako ya kufungua sehemu ya mmiliki na uthibitishe password.",
          "Andika maelekezo na soma mipangilio inayotambuliwa kabla ya kuhifadhi.",
          "Funga editor unapomaliza; prompt ya siri haisomwe kwenye chat."
        ],
        "en": [
          "Use your owner-area access method and authenticate with its password.",
          "Write instructions and review supported preferences before saving.",
          "Close the editor afterwards; private prompt contents are not read into chat."
        ]
      },
      "limitations": {
        "sw": [
          "Rule engine ya sasa hutekeleza lugha, ufupi, salamu na preview tu.",
          "Sehemu hii si ruhusa ya seva wala njia ya kupita validation."
        ],
        "en": [
          "The current rule engine supports language, brevity, greeting and preview preferences.",
          "This editor does not grant server permissions or bypass validation."
        ]
      },
      "troubleshooting": [
        {
          "id": "owner",
          "safeSteps": {
            "sw": [
              "Prompt ya siri inahitaji password yake; si salama kuisoma kupitia chat.",
              "Ukiisahau password ya encryption, prompt haiwezi kufunguliwa bila password hiyo.",
              "Maelekezo yasiyotambuliwa ni mipaka ya rule engine, si ruhusa ya kuendesha code mpya.",
              "Jaribio likizuiwa, subiri cooldown badala ya kufuta storage."
            ],
            "en": [
              "The private prompt needs its own password and is not read through chat.",
              "Without the encryption password the saved prompt cannot be decrypted.",
              "Unsupported instructions reflect the rule engine's limits; they do not grant arbitrary code execution.",
              "Wait for the cooldown rather than clearing storage after failed attempts."
            ]
          }
        },
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "Sehemu iliyolindwa ya mmiliki ndani ya MO AI",
        "en": "Protected owner area inside MO AI"
      },
      "uiSelector": "#assistantOwnerDialog",
      "functions": [
        {
          "file": "assistant-owner.js",
          "name": "open/showEditor",
          "anchor": "function showEditor"
        },
        {
          "file": "assistant-policy.js",
          "name": "compile/create",
          "anchor": "function compile"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "security",
      "name": {
        "sw": "Ulinzi na verification",
        "en": "Security and verification"
      },
      "description": {
        "sw": "App ina PIN/password, pattern na biometriki kulingana na kifaa. Kufuli ya ukurasa si ruhusa ya seva. Firebase Rules na UID hulinda access ya cloud. Owner prompt imesimbwa; data zingine za localStorage si zote zimesimbwa. Verification ikishindwa, ingia akaunti sahihi au tumia snapshot yake ya Firebase; usizime ulinzi.",
        "en": "The app supports PIN/password, pattern and device biometrics. A page lock is not server authorization. Firebase Rules and UID protect cloud access. Owner prompts are encrypted; not all other localStorage data is encrypted. If verification fails, sign into the correct account or use its Firebase snapshot; do not disable checks."
      },
      "matchPattern": "ulinzi|security|verification|password|\\bpin\\b|fingerprint|biometric|pattern",
      "capabilities": {
        "sw": [
          "App ina PIN/password, pattern na biometriki kulingana na kifaa"
        ],
        "en": [
          "The app supports PIN/password, pattern and device biometrics"
        ]
      },
      "usageSteps": {
        "sw": [
          "Tumia PIN/password au pattern ya app; biometriki hutegemea kifaa na HTTPS.",
          "Kwa Firebase, ingia akaunti inayomiliki data.",
          "Verification ikishindwa tumia hatua zilizoonyeshwa, si kuzima ukaguzi."
        ],
        "en": [
          "Use the app PIN/password or pattern; device biometrics require browser support and HTTPS.",
          "For Firebase use the account that owns the data.",
          "Follow verification recovery steps instead of disabling checks."
        ]
      },
      "limitations": {
        "sw": [
          "Kufuli ya app si authorization ya server; si data yote ya localStorage imesimbwa.",
          "Owner instructions zimefungwa tofauti na haziwezi kuongeza access ya Firebase."
        ],
        "en": [
          "The app lock is not server authorization; not all localStorage data is encrypted.",
          "Owner instructions are separately locked and do not expand Firebase access."
        ]
      },
      "troubleshooting": [
        {
          "id": "auth",
          "safeSteps": {
            "sw": [
              "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
              "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
              "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
              "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
            ],
            "en": [
              "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
              "Wait for Auth and sign into the owning account under More > Firebase.",
              "Offline caches require the verified UID; a UID marker alone is insufficient.",
              "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
            ]
          }
        },
        {
          "id": "owner",
          "safeSteps": {
            "sw": [
              "Prompt ya siri inahitaji password yake; si salama kuisoma kupitia chat.",
              "Ukiisahau password ya encryption, prompt haiwezi kufunguliwa bila password hiyo.",
              "Maelekezo yasiyotambuliwa ni mipaka ya rule engine, si ruhusa ya kuendesha code mpya.",
              "Jaribio likizuiwa, subiri cooldown badala ya kufuta storage."
            ],
            "en": [
              "The private prompt needs its own password and is not read through chat.",
              "Without the encryption password the saved prompt cannot be decrypted.",
              "Unsupported instructions reflect the rule engine's limits; they do not grant arbitrary code execution.",
              "Wait for the cooldown rather than clearing storage after failed attempts."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Kufuli ya app; Zaidi > Panel ya Developer > ulinzi",
        "en": "App lock; More > Developer Panel > security"
      },
      "uiSelector": "#securityType",
      "functions": [
        {
          "file": "index.html",
          "name": "initializeLock/authConfig",
          "anchor": "function initializeLock"
        },
        {
          "file": "index.html",
          "name": "registerBiometric",
          "anchor": "async function registerBiometric"
        },
        {
          "file": "firestore.rules",
          "name": "UID checks",
          "anchor": "request.auth.uid == userId"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "settings",
      "name": {
        "sw": "Lugha, theme na ukaguzi",
        "en": "Language, theme and diagnostics"
      },
      "description": {
        "sw": "Header ina chaguo la lugha na Dark/Light Mode. App ina Kiswahili, English na baadhi ya Chinese; MO AI hutumia Kiswahili/English na preferences za mmiliki. Zaidi → Panel ya Developer ina ukaguzi wa mfumo, sasisho la PWA na chaguo za ulinzi. Controls za owner hazibadilishi Firebase Rules.",
        "en": "The header controls language and light/dark theme. The app includes Swahili, English and some Chinese; MO AI uses Swahili/English and owner preferences. More → Developer Panel provides diagnostics, PWA updates and security controls. Owner preferences do not change Firebase Rules."
      },
      "matchPattern": "theme|dark|light|lugha|language|mipangilio|settings|developer|sasisho|update",
      "capabilities": {
        "sw": [
          "Header ina chaguo la lugha na Dark/Light Mode"
        ],
        "en": [
          "The header controls language and light/dark theme"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua Zaidi > Panel ya Developer.",
          "Tumia Kagua mfumo kuona diagnostics bila kubadilisha transactions.",
          "Angalia sasisho husasisha ukaguzi wa PWA; funga na ufungue app pale sasisho linasubiri."
        ],
        "en": [
          "Open More > Developer Panel.",
          "Run diagnostics to inspect status without changing transactions.",
          "Check updates inspects the PWA version; close/reopen when an update is waiting."
        ]
      },
      "limitations": {
        "sw": [
          "Kuuliza MO AI kuhusu settings hakuzibadilishi.",
          "Mabadiliko ya ulinzi yanafuata controls na uthibitisho uliopo.",
          "Developer reset iliyolindwa ipo kwa hatua za mmiliki; MO AI haiiendeshi wala kuipendekeza kama suluhisho la missing data."
        ],
        "en": [
          "Asking MO AI about settings does not change them.",
          "Security changes follow existing controls and confirmation.",
          "A separately protected developer reset exists; MO AI never executes it or recommends it for missing data."
        ]
      },
      "troubleshooting": [
        {
          "id": "pwa",
          "safeSteps": {
            "sw": [
              "PWA inahitaji HTTPS/localhost na browser inayounga mkono service workers.",
              "Fungua app online ili resources zipatikane. Tumia chaguo la install la browser ikiwa kitufe hakionekani.",
              "Sasisho likisubiri, funga app/tabs zake na uifungue tena; usifute data za browser ili kulazimisha update."
            ],
            "en": [
              "The PWA needs HTTPS/localhost and service-worker support.",
              "Load the app online to cache resources; use the browser install option when its button is unavailable.",
              "For a waiting update close the app/tabs and reopen, without clearing browser data."
            ]
          }
        },
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        }
      ],
      "route": "more",
      "location": {
        "sw": "Zaidi > Panel ya Developer; baadhi ya controls kwenye header",
        "en": "More > Developer Panel; header controls"
      },
      "uiSelector": "#developerPanel",
      "functions": [
        {
          "file": "index.html",
          "name": "runDiagnostics",
          "anchor": "async function runDiagnostics"
        },
        {
          "file": "index.html",
          "name": "updateApp",
          "anchor": "async function updateApp"
        },
        {
          "file": "developer-tools.js",
          "name": "protected developer reset",
          "anchor": "function showReset"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "ai",
      "name": {
        "sw": "MO AI Chat",
        "en": "MO AI Chat"
      },
      "description": {
        "sw": "MO AI hujibu maswali ya fedha, mwenendo, categories na maelekezo ya mfumo. Ina Smart Entry, historia ya chat na preferences za mmiliki. Hutumia JavaScript/rules na data zilizothibitishwa, si OpenAI API; haiwezi kujibu kila mada au kusoma faili kiholela.",
        "en": "MO AI handles financial analysis, trends, categories and application help, with Smart Entry, chat history and owner preferences. It uses local JavaScript rules and verified data, not an OpenAI API, and cannot answer every topic or read arbitrary files."
      },
      "matchPattern": "mo ai|business assistant|assistant|msaidizi",
      "capabilities": {
        "sw": [
          "MO AI hujibu maswali ya fedha, mwenendo, categories na maelekezo ya mfumo"
        ],
        "en": [
          "MO AI handles financial analysis, trends, categories and application help, with Smart Entry, chat history and owner preferences"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua MO AI na uliza swali la biashara au matumizi ya app.",
          "Taja kipindi na category ikiwa unahitaji takwimu.",
          "Kwa kuingiza muamala tumia Smart Entry na preview, si swali la msaada."
        ],
        "en": [
          "Open MO AI and ask a business or application question.",
          "Specify period/category when you need figures.",
          "Use Smart Entry and its preview for transactions, not a help question."
        ]
      },
      "limitations": {
        "sw": [
          "Hakuna OpenAI API; si kila swali au document ina handler ya ndani.",
          "Maelekezo ya mfumo si ruhusa ya kubadilisha settings au data."
        ],
        "en": [
          "No OpenAI API is used; not every question/document has a local handler.",
          "System help does not authorize settings or data changes."
        ]
      },
      "troubleshooting": [
        {
          "id": "entry",
          "safeSteps": {
            "sw": [
              "Kagua category, kiasi chanya cha TSh nzima, tarehe na aina ya muamala.",
              "Tenganisha swali na agizo la kuhifadhi; toa maagizo yenye taarifa kamili.",
              "Kama duplicate imezuiwa, kagua historia badala ya kubadilisha kiasi ili kupita ukaguzi.",
              "Hifadhi ya chat inahitaji Firebase iliyosawazishwa; tumia preview kabla ya kuthibitisha."
            ],
            "en": [
              "Check category, positive whole TSh amount, date and transaction type.",
              "Separate a question from a save command and supply complete information.",
              "For duplicates inspect the existing history rather than changing the amount to bypass the guard.",
              "Chat saves require synchronized Firebase; review the preview before confirming."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "Menyu > MO AI",
        "en": "Navigation > MO AI"
      },
      "uiSelector": "#businessAssistant",
      "functions": [
        {
          "file": "assistant-analysis.js",
          "name": "recognize/answer",
          "anchor": "function recognize"
        },
        {
          "file": "business-assistant.js",
          "name": "chat submit handler",
          "anchor": "el('assistantForm').onsubmit"
        },
        {
          "file": "assistant-knowledge.js",
          "name": "knowledge routing",
          "anchor": "function recognize"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "storage",
      "name": {
        "sw": "Mahali data zinapohifadhiwa",
        "en": "Data storage locations"
      },
      "description": {
        "sw": "Miamala, Oda, stock na Notebook zipo kwenye localStorage ya kifaa/browser. Firebase iliyounganishwa hutumia snapshots chini ya UID. MO AI ina cache ya akaunti kwa maswali offline. Chat history na prompt ya mmiliki ni hifadhi tofauti za kifaa; si kila data ya kifaa imesimbwa.",
        "en": "Transactions, orders, inventory and Notebook use this browser's localStorage. Connected Firebase stores snapshots under the authenticated UID. MO AI has per-account offline caches. Chat history and owner prompts are separate local stores; not all device data is encrypted."
      },
      "matchPattern": "data.*hifadhi|data.*stor|storage|localstorage",
      "capabilities": {
        "sw": [
          "Miamala, Oda, stock na Notebook zipo kwenye localStorage ya kifaa/browser"
        ],
        "en": [
          "Transactions, orders, inventory and Notebook use this browser's localStorage"
        ]
      },
      "usageSteps": {
        "sw": [
          "Miamala, Oda, stock na Notebook hutumia hifadhi ya kifaa.",
          "Ukiingia na kusawazisha Firebase, backup snapshots zinakuwa chini ya UID.",
          "Chat history, cache za MO AI na owner prompt hutumia hifadhi zao tofauti."
        ],
        "en": [
          "Transactions, Orders, stock and Notebook use local device storage.",
          "After authenticated Firebase synchronization, snapshots are stored under the UID.",
          "Chat history, MO AI caches and owner prompts use separate stores."
        ]
      },
      "limitations": {
        "sw": [
          "Kufuta browser storage huondoa data za kifaa; si kila hifadhi imesimbwa.",
          "Historia ya chat/owner prompt haisawazishwi kama business backup."
        ],
        "en": [
          "Clearing browser storage removes local data; not every store is encrypted.",
          "Chat history/owner prompts are not business-backup sync data."
        ]
      },
      "troubleshooting": [
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        },
        {
          "id": "data",
          "safeSteps": {
            "sw": [
              "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
              "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
              "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
              "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
            ],
            "en": [
              "The source, account or filters may differ; the exact cause is not established.",
              "Check Auto/Device/Firebase and sign into the owning account.",
              "Check the period, type, category, search and amount/receipt filters.",
              "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
            ]
          }
        }
      ],
      "route": null,
      "location": {
        "sw": "Kifaa/browser; Zaidi > Firebase kwa snapshots",
        "en": "This browser/device; More > Firebase for snapshots"
      },
      "uiSelector": "#backupStatus",
      "functions": [
        {
          "file": "business.js",
          "name": "dataset/commitBusiness",
          "anchor": "function dataset"
        },
        {
          "file": "firebase-cloud.js",
          "name": "snapshotData",
          "anchor": "const snapshotData"
        },
        {
          "file": "assistant-data.js",
          "name": "source",
          "anchor": "async function source"
        },
        {
          "file": "assistant-history.js",
          "name": "create",
          "anchor": "function create"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "pwa",
      "name": {
        "sw": "PWA na kusakinisha app",
        "en": "PWA installation"
      },
      "description": {
        "sw": "CASH AND FLOW ina manifest na service worker. Fungua online mara ya kwanza, kisha tumia Install au Add to Home Screen ya browser inayounga mkono. App shell na resources muhimu huhifadhiwa offline; data mpya za cloud bado huhitaji mtandao.",
        "en": "CASH AND FLOW includes a manifest and service worker. Load it online first, then use Install or Add to Home Screen in a supporting browser. The app shell and essential resources are cached offline; fresh cloud data still needs connectivity."
      },
      "matchPattern": "pwa|install|sakinish|ongeza.*home|home screen",
      "capabilities": {
        "sw": [
          "CASH AND FLOW ina manifest na service worker"
        ],
        "en": [
          "CASH AND FLOW includes a manifest and service worker"
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua website kupitia HTTPS na uiruhusu ipate resources online.",
          "Tumia Install kama browser inaonyesha chaguo hilo, au Add to Home Screen ya browser.",
          "Kwa updates, tumia Angalia sasisho na funga/fungua app pale inaposubiri."
        ],
        "en": [
          "Open the HTTPS site online so resources can be cached.",
          "Use Install when offered or the browser's Add to Home Screen.",
          "For updates, check updates and close/reopen when required."
        ]
      },
      "limitations": {
        "sw": [
          "Install UI hutegemea browser/kifaa; button inaweza kutokuonekana.",
          "Offline shell haimaanishi data mpya za Firebase zinapatikana bila mtandao."
        ],
        "en": [
          "Install UI depends on browser/device and may be hidden.",
          "An offline shell does not provide fresh Firebase data without connectivity."
        ]
      },
      "troubleshooting": [
        {
          "id": "pwa",
          "safeSteps": {
            "sw": [
              "PWA inahitaji HTTPS/localhost na browser inayounga mkono service workers.",
              "Fungua app online ili resources zipatikane. Tumia chaguo la install la browser ikiwa kitufe hakionekani.",
              "Sasisho likisubiri, funga app/tabs zake na uifungue tena; usifute data za browser ili kulazimisha update."
            ],
            "en": [
              "The PWA needs HTTPS/localhost and service-worker support.",
              "Load the app online to cache resources; use the browser install option when its button is unavailable.",
              "For a waiting update close the app/tabs and reopen, without clearing browser data."
            ]
          }
        },
        {
          "id": "offline",
          "safeSteps": {
            "sw": [
              "Cache inaweza kukosekana au app haijawahi kufunguliwa online; hii si utambuzi wa sababu halisi.",
              "Tumia Auto kwa cache ya akaunti yako au Kifaa hiki kwa rekodi zilizothibitishwa.",
              "Ikiwa hakuna cache sahihi, majibu ya takwimu yasubiri internet; maelekezo ya mfumo bado yanafanya kazi.",
              "Internet ikirudi, ingia akaunti sahihi na ruhusu verification/auto backup."
            ],
            "en": [
              "The cache may be missing or the app may not have been loaded online; this is not a confirmed diagnosis.",
              "Use Auto for your account snapshot or Device for verified records.",
              "Without a valid cache, figures must wait for connectivity; system help still works.",
              "Reconnect, sign into the owning account and allow verification/automatic backup."
            ]
          }
        }
      ],
      "route": "home",
      "location": {
        "sw": "Mwanzo > Install / menyu ya browser > Add to Home Screen",
        "en": "Home > Install / browser menu > Add to Home Screen"
      },
      "uiSelector": "#luxInstallBtn",
      "functions": [
        {
          "file": "luxury.js",
          "name": "updateInstall",
          "anchor": "async function updateInstall"
        },
        {
          "file": "sw.js",
          "name": "install/fetch",
          "anchor": "self.addEventListener('install'"
        },
        {
          "file": "manifest.json",
          "name": "PWA scope",
          "anchor": "\"start_url\""
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "languages",
      "name": {
        "sw": "Lugha",
        "en": "Languages"
      },
      "description": {
        "sw": "Tumia dropdown ya lugha kwenye header. App ina Kiswahili, English na baadhi ya Chinese. MO AI hutumia Kiswahili/English; owner language preference inaweza kubadilisha lugha yake. Hii haibadilishi majina halisi ya categories ulizosanidi.",
        "en": "Use the header language dropdown. The app includes Swahili, English and some Chinese. MO AI uses Swahili/English with an optional owner override. This does not rename configured categories."
      },
      "matchPattern": "lugha|language|kiswahili|kiingereza|english|chinese",
      "capabilities": {
        "sw": [
          "Tumia dropdown ya lugha kwenye header"
        ],
        "en": [
          "Use the header language dropdown"
        ]
      },
      "usageSteps": {
        "sw": [
          "Bonyeza dropdown ya lugha kwenye header.",
          "Chagua Kiswahili, English au Chinese kwenye app.",
          "MO AI hutumia Kiswahili/English; preference ya mmiliki ikiwa imewekwa inaweza kuongoza lugha yake."
        ],
        "en": [
          "Use the header language dropdown.",
          "Choose Swahili, English or Chinese for the app.",
          "MO AI uses Swahili/English and an explicit owner preference may override its response language."
        ]
      },
      "limitations": {
        "sw": [
          "Sio kila maandishi ya MO AI yana Chinese.",
          "Majina ya categories halisi hayabadilishwi kwa kubadili lugha."
        ],
        "en": [
          "MO AI does not provide every text in Chinese.",
          "Changing language does not rename actual categories."
        ]
      },
      "troubleshooting": [
        {
          "id": "category",
          "safeSteps": {
            "sw": [
              "Kagua jina halisi la category na filters; siwezi kujua sababu halisi bila kuona hali yake.",
              "Zaidi > Bajeti na kategoria huonyesha majina yaliyosanidiwa.",
              "Category iliyotolewa kwenye orodha inaweza kubaki kwenye transactions za zamani; usifute transactions ili kurekebisha jina.",
              "Smart Entry inahitaji jina linalolingana na aina ya mapato/matumizi iliyo wazi."
            ],
            "en": [
              "Check the exact category name and filters; the exact cause needs more context.",
              "More > Budget and categories shows configured names.",
              "Removed category names can remain in old transactions; do not delete transactions to repair a label.",
              "Smart Entry requires an exact name and a clear income/expense type."
            ]
          }
        }
      ],
      "route": null,
      "location": {
        "sw": "Header > dropdown ya lugha",
        "en": "Header > language dropdown"
      },
      "uiSelector": "#languageSelect",
      "functions": [
        {
          "file": "index.html",
          "name": "applyLanguage",
          "anchor": "function applyLanguage"
        },
        {
          "file": "ui-language.js",
          "name": "dialog translation",
          "anchor": "function updateDialog"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "theme",
      "name": {
        "sw": "Dark na Light Mode",
        "en": "Dark and Light Mode"
      },
      "description": {
        "sw": "Bonyeza alama ya jua/mwezi kwenye header kubadili Dark/Light Mode. Theme huhifadhiwa kwenye settings za app na hutumika kwa chat pia; haibadilishi miamala wala hesabu.",
        "en": "Use the sun/moon control in the header to switch light/dark mode. The setting also applies to chat and does not change transactions or calculations."
      },
      "matchPattern": "dark|light|theme|mwonekano",
      "capabilities": {
        "sw": [
          "Bonyeza alama ya jua/mwezi kwenye header kubadili Dark/Light Mode"
        ],
        "en": [
          "Use the sun/moon control in the header to switch light/dark mode"
        ]
      },
      "usageSteps": {
        "sw": [
          "Bonyeza alama ya jua/mwezi kwenye header.",
          "Mwonekano wa app na MO AI hubadilika Dark/Light.",
          "Chaguo huhifadhiwa kwenye settings; transactions hazibadilishwi."
        ],
        "en": [
          "Click the sun/moon control in the header.",
          "App and MO AI switch between light/dark mode.",
          "The preference is saved without modifying transactions."
        ]
      },
      "limitations": {
        "sw": [
          "Kubadili theme si kubadili takwimu au data source."
        ],
        "en": [
          "Theme changes do not change financial values or the source."
        ]
      },
      "troubleshooting": [
        {
          "id": "pwa",
          "safeSteps": {
            "sw": [
              "PWA inahitaji HTTPS/localhost na browser inayounga mkono service workers.",
              "Fungua app online ili resources zipatikane. Tumia chaguo la install la browser ikiwa kitufe hakionekani.",
              "Sasisho likisubiri, funga app/tabs zake na uifungue tena; usifute data za browser ili kulazimisha update."
            ],
            "en": [
              "The PWA needs HTTPS/localhost and service-worker support.",
              "Load the app online to cache resources; use the browser install option when its button is unavailable.",
              "For a waiting update close the app/tabs and reopen, without clearing browser data."
            ]
          }
        }
      ],
      "route": null,
      "location": {
        "sw": "Header > alama ya jua/mwezi",
        "en": "Header > sun/moon button"
      },
      "uiSelector": "#themeToggle",
      "functions": [
        {
          "file": "index.html",
          "name": "applyTheme",
          "anchor": "function applyTheme"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    },
    {
      "id": "learned",
      "name": {
        "sw": "Maarifa yangu",
        "en": "My Knowledge"
      },
      "description": {
        "sw": "Panel ya mmiliki ina sehemu ya kuandika taarifa au Swali/Jibu bila code. MO AI hutafuta mada inayolingana na swali na kunukuu taarifa ulizohifadhi. Majibu haya ni maarifa ya mmiliki, si takwimu za Firestore zilizohesabiwa.",
        "en": "The authenticated owner panel accepts plain facts and Question/Answer notes without code. MO AI retrieves matching saved text. These are owner-published facts, not calculated Firestore figures."
      },
      "matchPattern": "maarifa yangu|maarifa mapya|fundisha|teach|my knowledge|custom knowledge",
      "capabilities": {
        "sw": [
          "Kuongeza au kuhariri facts/FAQ baada ya password.",
          "Synonyms za msingi, tahajia ndogo, confidence na clarification."
        ],
        "en": [
          "Password-gated editing of facts/FAQs.",
          "Basic synonym/typo matching with confidence and clarification."
        ]
      },
      "usageSteps": {
        "sw": [
          "Fungua panel ya mmiliki na password, kisha chagua Maarifa yangu.",
          "Andika taarifa kwa mada tofauti au tumia Swali: na Jibu:.",
          "Bonyeza Hifadhi na tumia maarifa; uliza kuhusu mada hiyo kwenye chat."
        ],
        "en": [
          "Authenticate in the owner panel and select My Knowledge.",
          "Write separate topic paragraphs or use Question: and Answer:.",
          "Save the knowledge, then ask about the topic in chat."
        ]
      },
      "limitations": {
        "sw": [
          "Hifadhi ni ya kifaa/browser na akaunti hii. Maarifa ya kujibu si prompt ya siri iliyosimbwa.",
          "Hakuna translation/general AI inference; matching si uelewa wa kila sentensi.",
          "Facts haziwezi kupita financial calculations, permissions au Smart Entry validation."
        ],
        "en": [
          "Storage is local to this browser/account. Reply facts are separate from the encrypted private prompt.",
          "No general AI inference or automatic translation; matching does not understand every sentence.",
          "Facts cannot override financial calculations, permissions or Smart Entry validation."
        ]
      },
      "troubleshooting": [
        {
          "id": "storage",
          "safeSteps": {
            "sw": [
              "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
              "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
              "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
              "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
            ],
            "en": [
              "Browser storage may be full or unreadable; the exact cause is not confirmed.",
              "Download a business backup if readable and do not clear browser/app storage without a copy.",
              "A failed-history/cache notice means new content was not confirmed saved.",
              "Use the same browser/device or reconnect for verified Firebase data."
            ]
          }
        },
        {
          "id": "owner",
          "safeSteps": {
            "sw": [
              "Prompt ya siri inahitaji password yake; si salama kuisoma kupitia chat.",
              "Ukiisahau password ya encryption, prompt haiwezi kufunguliwa bila password hiyo.",
              "Maelekezo yasiyotambuliwa ni mipaka ya rule engine, si ruhusa ya kuendesha code mpya.",
              "Jaribio likizuiwa, subiri cooldown badala ya kufuta storage."
            ],
            "en": [
              "The private prompt needs its own password and is not read through chat.",
              "Without the encryption password the saved prompt cannot be decrypted.",
              "Unsupported instructions reflect the rule engine's limits; they do not grant arbitrary code execution.",
              "Wait for the cooldown rather than clearing storage after failed attempts."
            ]
          }
        }
      ],
      "route": "ai",
      "location": {
        "sw": "MO AI > panel ya mmiliki > Maarifa yangu",
        "en": "MO AI > authenticated owner panel > My Knowledge"
      },
      "uiSelector": "#assistantOwnerDialog",
      "functions": [
        {
          "file": "assistant-learned-knowledge.js",
          "name": "parse/match/create/protect",
          "anchor": "function match"
        },
        {
          "file": "assistant-owner.js",
          "name": "addKnowledgeEditor",
          "anchor": "function addKnowledgeEditor"
        }
      ],
      "available": true,
      "knowledgeOffline": true
    }
  ],
  "issues": {
    "data": {
      "sw": [
        "Chanzo cha data, akaunti au filter inaweza kutofautiana; bila taarifa zaidi siwezi kuthibitisha sababu.",
        "Angalia Auto/Kifaa hiki/Firebase na ingia akaunti inayomiliki data.",
        "Kagua kipindi, type, category, search na filters za kiasi/receipt.",
        "Kama cache haipo, unganisha mtandao na soma Firebase; usifute data ili kujaribu."
      ],
      "en": [
        "The source, account or filters may differ; the exact cause is not established.",
        "Check Auto/Device/Firebase and sign into the owning account.",
        "Check the period, type, category, search and amount/receipt filters.",
        "If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step."
      ]
    },
    "totals": {
      "sw": [
        "Siwezi kuthibitisha chanzo cha tofauti bila kulinganisha taarifa zinazohusika.",
        "Linganisha source: Dashboard ya kifaa dhidi ya snapshot ya Firestore au cache.",
        "Tumia kipindi, tarehe/timezone na filters zilezile; all-time na Insights si lazima zifuate advanced filters zote.",
        "Kagua duplicate, malipo yaliyohusishwa na oda na legacy deposits kabla ya kuhariri."
      ],
      "en": [
        "The reason for the mismatch is not confirmed without comparing the relevant data.",
        "Compare device dashboard totals with the Firestore/cache snapshot source.",
        "Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.",
        "Review duplicates, linked order payments and legacy deposits before editing."
      ]
    },
    "pdf": {
      "sw": [
        "Bila kuona hatua iliyoshindwa, siwezi kuthibitisha sababu ya PDF kushindikana.",
        "Kwa Ripoti na Backup, hakikisha internet, Firebase login na tarehe halali, kisha Onyesha ripoti na PDF.",
        "Kwa Print, ruhusu dirisha jipya; kwa Notebook tumia Print/Hifadhi PDF na controls zake.",
        "Ikiendelea, taja kama ni PDF ya Ripoti, Oda au Notebook na ujumbe mfupi unaoonekana."
      ],
      "en": [
        "The cause is not confirmed without knowing which PDF operation failed.",
        "For Reports & Backup check internet, Firebase sign-in and valid dates, load the report and download PDF.",
        "For Print allow popups; Notebook has its own Print/Save PDF control.",
        "If it persists, specify Reports, Orders or Notebook and the short displayed message."
      ]
    },
    "auth": {
      "sw": [
        "Hali ya akaunti au verification inaweza kuwa bado inasubiri; siwezi kuthibitisha chanzo cha kosa kutoka swali pekee.",
        "Subiri Auth ikamilike, kisha ingia akaunti inayomiliki data kwenye Zaidi > Firebase.",
        "Offline, cache lazima iwe ya UID iliyothibitishwa; marker ya UID pekee haitoshi.",
        "Data ikitofautiana pakua backup na fuata Pakia/Rejesha; usizime Security Rules."
      ],
      "en": [
        "Auth or verification may still be loading; the exact cause cannot be determined from the question alone.",
        "Wait for Auth and sign into the owning account under More > Firebase.",
        "Offline caches require the verified UID; a UID marker alone is insufficient.",
        "For conflicting data download a backup and follow upload/restore, without disabling Security Rules."
      ]
    },
    "offline": {
      "sw": [
        "Cache inaweza kukosekana au app haijawahi kufunguliwa online; hii si utambuzi wa sababu halisi.",
        "Tumia Auto kwa cache ya akaunti yako au Kifaa hiki kwa rekodi zilizothibitishwa.",
        "Ikiwa hakuna cache sahihi, majibu ya takwimu yasubiri internet; maelekezo ya mfumo bado yanafanya kazi.",
        "Internet ikirudi, ingia akaunti sahihi na ruhusu verification/auto backup."
      ],
      "en": [
        "The cache may be missing or the app may not have been loaded online; this is not a confirmed diagnosis.",
        "Use Auto for your account snapshot or Device for verified records.",
        "Without a valid cache, figures must wait for connectivity; system help still works.",
        "Reconnect, sign into the owning account and allow verification/automatic backup."
      ]
    },
    "category": {
      "sw": [
        "Kagua jina halisi la category na filters; siwezi kujua sababu halisi bila kuona hali yake.",
        "Zaidi > Bajeti na kategoria huonyesha majina yaliyosanidiwa.",
        "Category iliyotolewa kwenye orodha inaweza kubaki kwenye transactions za zamani; usifute transactions ili kurekebisha jina.",
        "Smart Entry inahitaji jina linalolingana na aina ya mapato/matumizi iliyo wazi."
      ],
      "en": [
        "Check the exact category name and filters; the exact cause needs more context.",
        "More > Budget and categories shows configured names.",
        "Removed category names can remain in old transactions; do not delete transactions to repair a label.",
        "Smart Entry requires an exact name and a clear income/expense type."
      ]
    },
    "dates": {
      "sw": [
        "Kagua tarehe halisi za transactions badala ya tarehe ya backup.",
        "Hakikisha tarehe ya mwanzo haizidi ya mwisho na umetumia kipindi unachokusudia.",
        "Kwa MO AI, taja YYYY-MM-DD; timezone ni Africa/Dar_es_Salaam na endpoints zinajumuishwa.",
        "Ondoa filters nyingine zinazopunguza orodha kama unalinganisha na muhtasari."
      ],
      "en": [
        "Check actual transaction dates rather than the backup timestamp.",
        "Ensure the start is not after the end and the period is the one you intended.",
        "Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.",
        "Check other narrowing filters when comparing a list with summary totals."
      ]
    },
    "backup": {
      "sw": [
        "Sababu inaweza kuwa faili, password, ukubwa, storage au network; haijathibitishwa kutoka swali pekee.",
        "Hifadhi nakala ya sasa kwanza. Hakikisha JSON ni halali na faili la import halizidi 20 MB.",
        "Backup fiche inahitaji password yake; kwa Firebase hakikisha akaunti, internet na snapshot iliyo kamili.",
        "Fuata muhtasari wa merge/conflict. Usifute storage au records kama njia ya kurekebisha."
      ],
      "en": [
        "Possible issues include file validity, password, size, storage or network; the cause is not confirmed.",
        "Preserve the current backup first. Imports need valid JSON within 20 MB.",
        "Encrypted backups require their password; cloud operations need the owning account, connectivity and a complete snapshot.",
        "Follow merge/conflict prompts instead of clearing storage or records."
      ]
    },
    "storage": {
      "sw": [
        "Hifadhi ya browser inaweza kukosa nafasi au kushindwa kusoma; sababu halisi haijathibitishwa.",
        "Pakua business backup ikiwa data zinasomeka, na usifute app/browser storage bila nakala.",
        "Ukiona ujumbe kwamba historia au cache haijahifadhiwa, usichukulie kwamba imehifadhiwa.",
        "Tumia kifaa/browser ileile au rudi online kwa data za Firebase zilizothibitishwa."
      ],
      "en": [
        "Browser storage may be full or unreadable; the exact cause is not confirmed.",
        "Download a business backup if readable and do not clear browser/app storage without a copy.",
        "A failed-history/cache notice means new content was not confirmed saved.",
        "Use the same browser/device or reconnect for verified Firebase data."
      ]
    },
    "entry": {
      "sw": [
        "Kagua category, kiasi chanya cha TSh nzima, tarehe na aina ya muamala.",
        "Tenganisha swali na agizo la kuhifadhi; toa maagizo yenye taarifa kamili.",
        "Kama duplicate imezuiwa, kagua historia badala ya kubadilisha kiasi ili kupita ukaguzi.",
        "Hifadhi ya chat inahitaji Firebase iliyosawazishwa; tumia preview kabla ya kuthibitisha."
      ],
      "en": [
        "Check category, positive whole TSh amount, date and transaction type.",
        "Separate a question from a save command and supply complete information.",
        "For duplicates inspect the existing history rather than changing the amount to bypass the guard.",
        "Chat saves require synchronized Firebase; review the preview before confirming."
      ]
    },
    "orders": {
      "sw": [
        "Kagua oda husika, thamani, malipo yaliyohusishwa na legacy deposit.",
        "Malipo yanayozidi thamani ya oda huzuiwa; oda iliyoghairiwa haitumiki kupokea malipo mapya.",
        "Kama deposit ya zamani ipo, tumia hatua za reconciliation badala ya kuiingiza mara mbili.",
        "Taja kama tatizo ni malipo, deni au nyaraka ili kuelekezwa kwa usahihi."
      ],
      "en": [
        "Review the order value, linked payments and any legacy deposit.",
        "Overpayments are rejected and cancelled orders do not accept new payments.",
        "Reconcile historical deposits rather than entering them twice.",
        "Specify whether the problem is a payment, debt balance or document."
      ]
    },
    "customers": {
      "sw": [
        "Kagua jina lililotumika kwenye Rekodi na Oda; majina yanayolingana hujumuishwa.",
        "Angalia filter ya mwezi na miamala iliyohusishwa na oda/mteja.",
        "Usibadilishe malipo kabla ya kuangalia kama yameshahifadhiwa kwenye historia."
      ],
      "en": [
        "Check the names used in Record and Orders; matching names are grouped.",
        "Review the month filter and linked customer/order transactions.",
        "Check existing payment history before making changes."
      ]
    },
    "stock": {
      "sw": [
        "Kagua kiasi kilichopo, unit na kiasi unachotaka kutoa.",
        "Kiasi hasi au kutoa zaidi ya kilichopo huzuiwa.",
        "Gharama ya ununuzi hutenganishwa na idadi ya stock; usirekodi gharama mara mbili."
      ],
      "en": [
        "Check available quantity, unit and the requested outgoing amount.",
        "Negative stock and issuing more than available are rejected.",
        "Purchasing expense is separate from stock quantity; avoid double recording it."
      ]
    },
    "notebook": {
      "sw": [
        "Weka kichwa cha noti kabla ya kuhifadhi na angalia kama mabadiliko bado hayajahifadhiwa.",
        "PDF iliyopakiwa lazima iwe PDF na isizidi 2 MB.",
        "Ikiwa PDF haionekani kwenye viewer, tumia Fungua PDF; MO AI haisomi maandishi yake yenyewe.",
        "Usifute noti au storage ili kutatua kosa bila backup."
      ],
      "en": [
        "Enter a title before saving and check for unsaved edits.",
        "Uploaded files must be PDFs within 2 MB.",
        "If the viewer fails use Open PDF; MO AI does not automatically extract its text.",
        "Do not delete notes or storage as a troubleshooting shortcut."
      ]
    },
    "owner": {
      "sw": [
        "Prompt ya siri inahitaji password yake; si salama kuisoma kupitia chat.",
        "Ukiisahau password ya encryption, prompt haiwezi kufunguliwa bila password hiyo.",
        "Maelekezo yasiyotambuliwa ni mipaka ya rule engine, si ruhusa ya kuendesha code mpya.",
        "Jaribio likizuiwa, subiri cooldown badala ya kufuta storage."
      ],
      "en": [
        "The private prompt needs its own password and is not read through chat.",
        "Without the encryption password the saved prompt cannot be decrypted.",
        "Unsupported instructions reflect the rule engine's limits; they do not grant arbitrary code execution.",
        "Wait for the cooldown rather than clearing storage after failed attempts."
      ]
    },
    "pwa": {
      "sw": [
        "PWA inahitaji HTTPS/localhost na browser inayounga mkono service workers.",
        "Fungua app online ili resources zipatikane. Tumia chaguo la install la browser ikiwa kitufe hakionekani.",
        "Sasisho likisubiri, funga app/tabs zake na uifungue tena; usifute data za browser ili kulazimisha update."
      ],
      "en": [
        "The PWA needs HTTPS/localhost and service-worker support.",
        "Load the app online to cache resources; use the browser install option when its button is unavailable.",
        "For a waiting update close the app/tabs and reopen, without clearing browser data."
      ]
    }
  },
  "unavailable": [
    {
      "id": "openai_api",
      "pattern": "openai api|general ai api|chatgpt integration",
      "name": {
        "sw": "AI API ya majibu ya jumla",
        "en": "General AI API"
      },
      "available": false
    },
    {
      "id": "whatsapp",
      "pattern": "whatsapp|sms automatically|sms kiotomatiki",
      "name": {
        "sw": "Kutuma WhatsApp/SMS kiotomatiki",
        "en": "Automatic WhatsApp/SMS sending"
      },
      "available": false
    },
    {
      "id": "voice",
      "pattern": "voice chat|voice input|speech to text|kuongea kwa sauti|kusikiliza sauti",
      "name": {
        "sw": "Voice chat",
        "en": "Voice chat"
      },
      "available": false
    },
    {
      "id": "chat_cloud",
      "pattern": "chat history.*(?:sync|firebase|cloud)|historia.*chat.*(?:firebase|vifaa vingine|cloud)",
      "name": {
        "sw": "Cloud sync ya historia ya chat",
        "en": "Cross-device chat history sync"
      },
      "available": false
    }
  ]
};
 if(typeof module!=='undefined'&&module.exports)module.exports=registry;else root.MotecSystemKnowledgeRegistry=registry;
})(typeof window==='undefined'?globalThis:window);
