# CASH AND FLOW — System discovery audit

Verified source audit for app 2026.11.04.2, knowledge 1.1.0, assets motec-money-manager-v61. No production data was opened.

Each entry below is derived from checked source functions and actual UI selectors. Runtime tests verify the selectors; fixture tests verify every code anchor. These are capabilities and safe guidance, not permission to execute commands.

## Financial calculation meanings (finance)

Income records money received; expenses record money paid out. Net cash flow is income minus expenses for the requested period. Unpaid order debt is not cash already received. Net profit requires all relevant costs. MO AI averages use every calendar day in the period, including days without transactions.

- Available: true. Knowledge offline: true.
- Location: Home > income, expenses and balance cards; selector #income; route home.
- Capabilities: Income records money received; expenses record money paid out
- Steps: Choose the period on Home. Read Income, Expenses and Balance/difference; unpaid order debt is not received cash.
- Limits: Net profit requires all costs. Unrecorded transactions are not included.
- Source functions: index.html → sumBy [function sumBy]; totals-data.js → summarize [function summarize]; assistant-analysis.js → calculate [function calculate]
- Errors/recovery topics: totals

## Dates and filters (dates)

Choose a period on Home or ask MO AI for today, yesterday, the day before yesterday, week, month, this year or full ISO dates. Example: Income 2026-11-01 to 2026-11-04? Both boundary dates are included. MO AI uses Africa/Dar_es_Salaam and actual transaction dates; ambiguous dates require clarification.

- Available: true. Knowledge offline: true.
- Location: Home > Period > custom dates; transaction history > more filters; selector #period; route home.
- Capabilities: Choose a period on Home or ask MO AI for today, yesterday, the day before yesterday, week, month, this year or full ISO dates
- Steps: On Home choose the period dropdown. For a custom period enter start/end dates; use full YYYY-MM-DD dates in MO AI. Transaction history also provides type, category, amount and receipt filters.
- Limits: MO AI uses Africa/Dar_es_Salaam and inclusive range boundaries. Top-level totals can differ from a list narrowed by advanced filters.
- Source functions: index.html → periodRecords [function periodRecords]; index.html → advancedRecords [function advancedRecords]; assistant-analysis.js → period [function period]
- Errors/recovery topics: dates, totals

## Home / Dashboard (dashboard)

Home shows income, expenses and their difference for the selected period. Choose week, month, custom dates or all time. All-time totals use the configured start date and exclude future transactions. This difference is not verified net profit.

- Available: true. Knowledge offline: true.
- Location: Navigation > Home; selector #ux-home; route home.
- Capabilities: Home shows income, expenses and their difference for the selected period
- Steps: Open Home. Select all time, week, month or a custom period. Read the totals, income graph and Business Insights.
- Limits: The dashboard uses device data, which may differ from Reports' server snapshot. The graph shows recorded income; the all-time summary excludes future transactions.
- Source functions: cumulative.js → refresh [function refresh]; chart-data.js → incomeSeries [function incomeSeries]; luxury.js → render graph [periodOffset]
- Errors/recovery topics: data, totals, dates

## Smart Entry in MO AI (entry)

For example: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000. Use exact category names. Review the preview and confirm. Auto Save requires opt-in and is blocked when owner instructions require preview. Saving requires synchronized Firebase and internet. Ambiguous commands are not saved.

- Available: true. Knowledge offline: true.
- Location: MO AI > chat input; selector #assistantForm; route ai.
- Capabilities: For example: Hifadhi mapato CATEGORY 30000 na matumizi CATEGORY 10000
- Steps: Write Hifadhi mapato CATEGORY 30000 or Hifadhi matumizi CATEGORY 10000 with an actual category name. Review the preview and confirm. Auto Save is opt-in and may be disabled by owner instructions.
- Limits: Saving requires Firebase authentication, connectivity and synchronized data. Ambiguous or duplicate entries are rejected.
- Source functions: assistant-engine.js → parse [function parse]; business-assistant.js → preview [function preview]; firebase-cloud.js → motecAssistantCloud.save [async save(entries, expectedUid)]
- Errors/recovery topics: entry, auth, data

## Transaction records (records)

Record: choose income or expense, whole TSh amount, category and transaction date. Customer, product/service, notes and receipt are optional. Existing entries can be edited; deletion follows the existing permission and confirmation rules. Receive order payments through Orders to keep debt and cash flow linked.

- Available: true. Knowledge offline: true.
- Location: Navigation > Record; Home > All transactions for history; selector #transactionForm; route record.
- Capabilities: Record: choose income or expense, whole TSh amount, category and transaction date
- Steps: Open Record and select income or expense. Enter amount, category and actual transaction date; customer, description and receipt are optional. Save the transaction; use existing history controls for edits.
- Limits: Amounts are positive whole TSh. Recording the same order payment again can double-count it; use Orders payment controls.
- Source functions: index.html → validRecord [function validRecord]; index.html → transactionForm submit handler [$('transactionForm').addEventListener]; business.js → commitBusiness [function commitBusiness]
- Errors/recovery topics: entry, data

## Orders and payments (orders)

Orders: use New order for customer, job, value, deposit and due date. Use Payment or Cost on an existing order to link transactions. Outstanding debt is order value less recorded payments and any legacy deposit. Order options include quotations, invoices and receipts. Do not enter the same payment twice.

- Available: true. Knowledge offline: true.
- Location: Navigation > Orders; selector #ordersPanel; route orders.
- Capabilities: Orders: use New order for customer, job, value, deposit and due date
- Steps: Open Orders > New order. Enter customer, job, value, deposit and deadline, then save. Use Payment, Cost or more options for documents and ledger.
- Limits: Payments cannot exceed order value. Legacy deposits require reconciliation rather than silently duplicating cash income.
- Source functions: business.js → submitBusinessOrder [function submitBusinessOrder]; business.js → paidFor/debtFor [function debtFor]; business.js → openEntry/printOrder [function printOrder]
- Errors/recovery topics: orders, totals

## Customers (customers)

Customers groups orders and named transactions with matching normalized names. Use consistent names and distinguish different people. It shows payments, linked costs, order debt and each customer history. Direct sales without an order do not create an assumed debt.

- Available: true. Knowledge offline: true.
- Location: Navigation > Customers; selector #customerPanel; route customers.
- Capabilities: Customers groups orders and named transactions with matching normalized names
- Steps: Open Customers and search by name or product. Open a customer card and select a month for transaction totals. Use consistent names in Orders and Record.
- Limits: Matching normalized names are grouped; distinguish different people. Unlinked general costs are not invented or allocated to a customer.
- Source functions: customer-data.js → summarize [function summarize]; workspace.js → renderCustomers/refreshMonthly [function refreshMonthly]
- Errors/recovery topics: customers, totals

## Materials inventory (stock)

More → Materials stock. Add name, unit, quantity and warning threshold. Receive/use adjusts inventory; insufficient quantities are rejected. Low-stock warnings apply at or below the threshold.

- Available: true. Knowledge offline: true.
- Location: More > Materials stock; selector #stockPanel; route more.
- Capabilities: More → Materials stock
- Steps: Open More > Materials stock > Add. Enter name, unit, quantity and warning level. Use Receive/use for quantities; record purchasing expenses once in transactions.
- Limits: Inventory cannot become negative. Quantity adjustments do not automatically record purchasing expenses.
- Source functions: business.js → validStock/openStockForm [function openStockForm]; business.js → openStockMove [function openStockMove]
- Errors/recovery topics: stock

## Business Insights (insights)

Business Insights on Home provides monthly summaries, average income, top income/expense categories and weekly trends from recorded transactions. It does not establish all business costs or verified net profit.

- Available: true. Knowledge offline: true.
- Location: Home > Business Insights; selector #insightsPanel; route home.
- Capabilities: Business Insights on Home provides monthly summaries, average income, top income/expense categories and weekly trends from recorded transactions
- Steps: Open Home > Business Insights. Review income, expenses, top categories and weekly trends. Ask MO AI with explicit dates for a custom-period analysis.
- Limits: Some insights use the current month/week rather than every list filter. The health score is an application heuristic, not a definitive assessment.
- Source functions: index.html → renderInsights [function renderInsights]; assistant-analysis.js → answer [function answer]
- Errors/recovery topics: totals, dates

## Reports and PDF (reports)

More → Reports & Backup: select dates, account and category, then load the report. It reads the Firestore snapshot and offers PDF, Print and JSON. Transaction history also has device exports. Notebook PDF uploads are viewable documents; MO AI does not automatically extract their text.

- Available: true. Knowledge offline: true.
- Location: More > Reports & Backup; selector #reportsBackup; route more.
- Capabilities: More → Reports & Backup: select dates, account and category, then load the report tenDayCheck stores ten-day period readiness metadata rather than PDF/JSON files in the cloud.
- Steps: Open More > Reports & Backup. Enter start/end dates for the desired month or period, account and category. Load the report, then use PDF or Print. JSON here is the complete snapshot backup, not a filtered PDF equivalent.
- Limits: Reports load Firestore online; the PDF writer itself has no CDN dependency. Report history stores metadata, with files regenerated from current snapshots. JSON exports the complete source business backup.
- Source functions: reports.js → report/load/exportFile [async function exportFile]; reports.js → tenDayCheck [async function tenDayCheck]; report-pdf.js → ReportPDF.create [async create(lines)]
- Errors/recovery topics: pdf, auth, dates

## Backup and restore (backup)

Download a JSON backup before major changes. Normal and password-protected backups are available. Existing restore/upload services merge records and handle duplicate IDs; follow conflict prompts. Chat history and owner prompts are separate local stores, not synchronized business-backup data.

- Available: true. Knowledge offline: true.
- Location: Home > All transactions > History/backup; More > Firebase for cloud; selector #exportBtn; route more.
- Capabilities: Download a JSON backup before major changes
- Steps: On Home open All transactions, backup options and download JSON (or an encrypted backup). To restore, select Import/Restore and a valid file; enter its password if encrypted. Review and confirm the merge summary. Existing records are retained and matching IDs are handled by merge.
- Limits: Imports are limited to 20 MB; encrypted backups require the correct password. Deleted records can reappear if present in an imported backup. Chat history and owner prompts are separate from business backups.
- Source functions: business.js → exportBusinessBackup [function exportBusinessBackup]; business.js → importBusinessBackup/restoreBackup [async function importBusinessBackup]; backup-merge.js → merge [function merge]
- Errors/recovery topics: backup, storage

## Firebase and account (firebase)

More → Firebase: sign in with email/password. Cloud data is stored in backup snapshots under the authenticated UID. Automatic backup runs after verification. When device/cloud data conflicts, use the existing upload/restore workflow. MO AI does not substitute another account’s data.

- Available: true. Knowledge offline: true.
- Location: More > Firebase; selector #cloudPanel; route more.
- Capabilities: More → Firebase: sign in with email/password
- Steps: Open More > Firebase and sign into the owning account. Allow verification and automatic backup to finish. For a device/cloud conflict, download a backup first and follow upload/restore merge prompts instead of deleting data.
- Limits: Cloud reads are scoped by Auth UID and Firestore Rules. Business data uses backup snapshots/chunks rather than one transaction per document.
- Source functions: firebase-cloud.js → initializeFirebase/waitForAuth [async function waitForAuth]; firebase-cloud.js → initializeSync/uploadSnapshot [async function initializeSync]; firestore.rules → per-user authorization [request.auth.uid == userId]
- Errors/recovery topics: auth, data, backup

## Online and Offline (offline)

Auto reads Firebase online and the correct account snapshot offline. Device mode requires ownership verification. The PWA caches app resources. Missing or unverified caches are not treated as zero activity. Smart Entry saving still requires internet and synchronized Firebase.

- Available: true. Knowledge offline: true.
- Location: MO AI > source menu and connection indicator; selector #assistantSource; route ai.
- Capabilities: Auto reads Firebase online and the correct account snapshot offline
- Steps: Open the app online at least once to cache resources and required data. Offline, use Auto for the correct account cache or Device for verified local records. If no cache exists, reconnect and sign into the owning account; do not invent ownership.
- Limits: System help needs no Firebase connection; figures require real local/cached data. Smart Entry saving and server Reports still need connectivity.
- Source functions: assistant-data.js → source/cached/local [async function source]; sw.js → fetch cache handler [self.addEventListener('fetch']
- Errors/recovery topics: offline, auth, data

## Categories and budgets (categories)

More → Budget and categories. Use actual saved category names. Categories are names, not an income/expense type schema; state the transaction type in Smart Entry. Monthly budgets are compared with recorded expenses.

- Available: true. Knowledge offline: true.
- Location: More > Budget/categories; Home > All transactions for filters; selector #managerPanel; route more.
- Capabilities: More → Budget and categories
- Steps: Open More > Budget and categories. Enter a category name and Add when permitted by the app. For category expenses use Home > All transactions > more filters, select Expenses and the category.
- Limits: Categories are names only; Smart Entry requires income/expense type. Removing a category name does not delete historical transactions.
- Source functions: workspace.js → getCategories override [getCategories=function]; index.html → addCategoryBtn handler [$('addCategoryBtn').addEventListener]; index.html → advancedRecords [function advancedRecords]
- Errors/recovery topics: category, dates

## Notebook and notes (notebook)

More → Notebook for notes and documents. Existing controls save, edit, print and upload PDFs. Uploading a PDF does not turn its contents into transactions or teach MO AI its text automatically.

- Available: true. Knowledge offline: true.
- Location: More > Notebook; selector #notebookPanel; route more.
- Capabilities: More → Notebook for notes and documents
- Steps: Open More > Notebook > Write/edit note. Use New note, enter a title and text, then Save Notebook. Open saved notes to edit or print. PDFs can be uploaded for viewing.
- Limits: Notes require titles; unsaved edits prompt before discard. PDF uploads are limited to 2 MB and do not automatically create transactions or teach MO AI document text.
- Source functions: notebook-notes.js → select/drawList/saveNotebook [function drawList]; workspace.js → refreshPdf [function refreshPdf]
- Errors/recovery topics: notebook, storage

## Chat history (history)

MO AI → clock/history icon. Chats save automatically with Tanzania dates and times. + starts a new chat; Clear chat removes only the selected conversation. History is local to this browser and separated by account. Reopening old messages never replays transactions.

- Available: true. Knowledge offline: true.
- Location: MO AI > clock/history icon; + for a new chat; selector #assistantHistory; route ai.
- Capabilities: MO AI → clock/history icon
- Steps: Open MO AI and use the clock/history icon to select a dated chat. + starts a new conversation without deleting earlier ones. Clear chat removes only the selected conversation, never business transactions.
- Limits: History is local to this browser/account scope, without cross-device sync. Opening archived messages never replays Smart Entry.
- Source functions: assistant-history.js → create/append/select/removeActive [function create]; business-assistant.js → renderActiveHistory [function renderActiveHistory]
- Errors/recovery topics: storage, auth

## Owner instructions (owner)

Owner instructions require a password. The encrypted prompt is not inserted into chat or business backups. Current supported preferences are language, brevity, greeting and mandatory preview. Unrecognized instructions are not automatically executable and cannot bypass data validation. This is not an AI API backend.

- Available: true. Knowledge offline: true.
- Location: Protected owner area inside MO AI; selector #assistantOwnerDialog; route ai.
- Capabilities: Owner instructions require a password
- Steps: Use your owner-area access method and authenticate with its password. Write instructions and review supported preferences before saving. Close the editor afterwards; private prompt contents are not read into chat.
- Limits: The current rule engine supports language, brevity, greeting and preview preferences. This editor does not grant server permissions or bypass validation.
- Source functions: assistant-owner.js → open/showEditor [function showEditor]; assistant-policy.js → compile/create [function compile]
- Errors/recovery topics: owner, auth

## Security and verification (security)

The app supports PIN/password, pattern and device biometrics. A page lock is not server authorization. Firebase Rules and UID protect cloud access. Owner prompts are encrypted; not all other localStorage data is encrypted. If verification fails, sign into the correct account or use its Firebase snapshot; do not disable checks.

- Available: true. Knowledge offline: true.
- Location: App lock; More > Developer Panel > security; selector #securityType; route more.
- Capabilities: The app supports PIN/password, pattern and device biometrics
- Steps: Use the app PIN/password or pattern; device biometrics require browser support and HTTPS. For Firebase use the account that owns the data. Follow verification recovery steps instead of disabling checks.
- Limits: The app lock is not server authorization; not all localStorage data is encrypted. Owner instructions are separately locked and do not expand Firebase access.
- Source functions: index.html → initializeLock/authConfig [function initializeLock]; index.html → registerBiometric [async function registerBiometric]; firestore.rules → UID checks [request.auth.uid == userId]
- Errors/recovery topics: auth, owner

## Language, theme and diagnostics (settings)

The header controls language and light/dark theme. The app includes Swahili, English and some Chinese; MO AI uses Swahili/English and owner preferences. More → Developer Panel provides diagnostics, PWA updates and security controls. Owner preferences do not change Firebase Rules.

- Available: true. Knowledge offline: true.
- Location: More > Developer Panel; header controls; selector #developerPanel; route more.
- Capabilities: The header controls language and light/dark theme
- Steps: Open More > Developer Panel. Run diagnostics to inspect status without changing transactions. Check updates inspects the PWA version; close/reopen when an update is waiting.
- Limits: Asking MO AI about settings does not change them. Security changes follow existing controls and confirmation. A separately protected developer reset exists; MO AI never executes it or recommends it for missing data.
- Source functions: index.html → runDiagnostics [async function runDiagnostics]; index.html → updateApp [async function updateApp]; developer-tools.js → protected developer reset [function showReset]
- Errors/recovery topics: pwa, storage

## MO AI Chat (ai)

MO AI handles financial analysis, trends, categories and application help, with Smart Entry, chat history and owner preferences. It uses local JavaScript rules and verified data, not an OpenAI API, and cannot answer every topic or read arbitrary files.

- Available: true. Knowledge offline: true.
- Location: Navigation > MO AI; selector #businessAssistant; route ai.
- Capabilities: MO AI handles financial analysis, trends, categories and application help, with Smart Entry, chat history and owner preferences
- Steps: Open MO AI and ask a business or application question. Specify period/category when you need figures. Use Smart Entry and its preview for transactions, not a help question.
- Limits: No OpenAI API is used; not every question/document has a local handler. System help does not authorize settings or data changes.
- Source functions: assistant-analysis.js → recognize/answer [function recognize]; business-assistant.js → chat submit handler [el('assistantForm').onsubmit]; assistant-knowledge.js → knowledge routing [function recognize]
- Errors/recovery topics: entry, data

## Data storage locations (storage)

Transactions, orders, inventory and Notebook use this browser's localStorage. Connected Firebase stores snapshots under the authenticated UID. MO AI has per-account offline caches. Chat history and owner prompts are separate local stores; not all device data is encrypted.

- Available: true. Knowledge offline: true.
- Location: This browser/device; More > Firebase for snapshots; selector #backupStatus; route header/data storage.
- Capabilities: Transactions, orders, inventory and Notebook use this browser's localStorage
- Steps: Transactions, Orders, stock and Notebook use local device storage. After authenticated Firebase synchronization, snapshots are stored under the UID. Chat history, MO AI caches and owner prompts use separate stores.
- Limits: Clearing browser storage removes local data; not every store is encrypted. Chat history/owner prompts are not business-backup sync data.
- Source functions: business.js → dataset/commitBusiness [function dataset]; firebase-cloud.js → snapshotData [const snapshotData]; assistant-data.js → source [async function source]; assistant-history.js → create [function create]
- Errors/recovery topics: storage, data

## PWA installation (pwa)

CASH AND FLOW includes a manifest and service worker. Load it online first, then use Install or Add to Home Screen in a supporting browser. The app shell and essential resources are cached offline; fresh cloud data still needs connectivity.

- Available: true. Knowledge offline: true.
- Location: Home > Install / browser menu > Add to Home Screen; selector #luxInstallBtn; route home.
- Capabilities: CASH AND FLOW includes a manifest and service worker
- Steps: Open the HTTPS site online so resources can be cached. Use Install when offered or the browser's Add to Home Screen. For updates, check updates and close/reopen when required.
- Limits: Install UI depends on browser/device and may be hidden. An offline shell does not provide fresh Firebase data without connectivity.
- Source functions: luxury.js → updateInstall [async function updateInstall]; sw.js → install/fetch [self.addEventListener('install']; manifest.json → PWA scope ["start_url"]
- Errors/recovery topics: pwa, offline

## Languages (languages)

Use the header language dropdown. The app includes Swahili, English and some Chinese. MO AI uses Swahili/English with an optional owner override. This does not rename configured categories.

- Available: true. Knowledge offline: true.
- Location: Header > language dropdown; selector #languageSelect; route header/data storage.
- Capabilities: Use the header language dropdown
- Steps: Use the header language dropdown. Choose Swahili, English or Chinese for the app. MO AI uses Swahili/English and an explicit owner preference may override its response language.
- Limits: MO AI does not provide every text in Chinese. Changing language does not rename actual categories.
- Source functions: index.html → applyLanguage [function applyLanguage]; ui-language.js → dialog translation [function updateDialog]
- Errors/recovery topics: category

## Dark and Light Mode (theme)

Use the sun/moon control in the header to switch light/dark mode. The setting also applies to chat and does not change transactions or calculations.

- Available: true. Knowledge offline: true.
- Location: Header > sun/moon button; selector #themeToggle; route header/data storage.
- Capabilities: Use the sun/moon control in the header to switch light/dark mode
- Steps: Click the sun/moon control in the header. App and MO AI switch between light/dark mode. The preference is saved without modifying transactions.
- Limits: Theme changes do not change financial values or the source.
- Source functions: index.html → applyTheme [function applyTheme]
- Errors/recovery topics: pwa

## My Knowledge (learned)

The authenticated owner panel accepts plain facts and Question/Answer notes without code. MO AI retrieves matching saved text. These are owner-published facts, not calculated Firestore figures.

- Available: true. Knowledge offline: true.
- Location: MO AI > authenticated owner panel > My Knowledge; selector #assistantOwnerDialog; route ai.
- Capabilities: Password-gated editing of facts/FAQs. Basic synonym/typo matching with confidence and clarification.
- Steps: Authenticate in the owner panel and select My Knowledge. Write separate topic paragraphs or use Question: and Answer:. Save the knowledge, then ask about the topic in chat.
- Limits: Storage is local to this browser/account. Reply facts are separate from the encrypted private prompt. No general AI inference or automatic translation; matching does not understand every sentence. Facts cannot override financial calculations, permissions or Smart Entry validation.
- Source functions: assistant-learned-knowledge.js → parse/match/create/protect [function match]; assistant-owner.js → addKnowledgeEditor [function addKnowledgeEditor]
- Errors/recovery topics: storage, owner

## Troubleshooting evidence and safe recovery

### data

1. The source, account or filters may differ; the exact cause is not established.
2. Check Auto/Device/Firebase and sign into the owning account.
3. Check the period, type, category, search and amount/receipt filters.
4. If no cache exists, reconnect and read Firebase; do not delete data as a troubleshooting step.

### totals

1. The reason for the mismatch is not confirmed without comparing the relevant data.
2. Compare device dashboard totals with the Firestore/cache snapshot source.
3. Use the same period, dates/timezone and filters; all-time cards/Insights may not follow every advanced list filter.
4. Review duplicates, linked order payments and legacy deposits before editing.

### pdf

1. The cause is not confirmed without knowing which PDF operation failed.
2. For Reports & Backup check internet, Firebase sign-in and valid dates, load the report and download PDF.
3. For Print allow popups; Notebook has its own Print/Save PDF control.
4. If it persists, specify Reports, Orders or Notebook and the short displayed message.

### auth

1. Auth or verification may still be loading; the exact cause cannot be determined from the question alone.
2. Wait for Auth and sign into the owning account under More > Firebase.
3. Offline caches require the verified UID; a UID marker alone is insufficient.
4. For conflicting data download a backup and follow upload/restore, without disabling Security Rules.

### offline

1. The cache may be missing or the app may not have been loaded online; this is not a confirmed diagnosis.
2. Use Auto for your account snapshot or Device for verified records.
3. Without a valid cache, figures must wait for connectivity; system help still works.
4. Reconnect, sign into the owning account and allow verification/automatic backup.

### category

1. Check the exact category name and filters; the exact cause needs more context.
2. More > Budget and categories shows configured names.
3. Removed category names can remain in old transactions; do not delete transactions to repair a label.
4. Smart Entry requires an exact name and a clear income/expense type.

### dates

1. Check actual transaction dates rather than the backup timestamp.
2. Ensure the start is not after the end and the period is the one you intended.
3. Use YYYY-MM-DD in MO AI; Africa/Dar_es_Salaam and inclusive boundaries apply.
4. Check other narrowing filters when comparing a list with summary totals.

### backup

1. Possible issues include file validity, password, size, storage or network; the cause is not confirmed.
2. Preserve the current backup first. Imports need valid JSON within 20 MB.
3. Encrypted backups require their password; cloud operations need the owning account, connectivity and a complete snapshot.
4. Follow merge/conflict prompts instead of clearing storage or records.

### storage

1. Browser storage may be full or unreadable; the exact cause is not confirmed.
2. Download a business backup if readable and do not clear browser/app storage without a copy.
3. A failed-history/cache notice means new content was not confirmed saved.
4. Use the same browser/device or reconnect for verified Firebase data.

### entry

1. Check category, positive whole TSh amount, date and transaction type.
2. Separate a question from a save command and supply complete information.
3. For duplicates inspect the existing history rather than changing the amount to bypass the guard.
4. Chat saves require synchronized Firebase; review the preview before confirming.

### orders

1. Review the order value, linked payments and any legacy deposit.
2. Overpayments are rejected and cancelled orders do not accept new payments.
3. Reconcile historical deposits rather than entering them twice.
4. Specify whether the problem is a payment, debt balance or document.

### customers

1. Check the names used in Record and Orders; matching names are grouped.
2. Review the month filter and linked customer/order transactions.
3. Check existing payment history before making changes.

### stock

1. Check available quantity, unit and the requested outgoing amount.
2. Negative stock and issuing more than available are rejected.
3. Purchasing expense is separate from stock quantity; avoid double recording it.

### notebook

1. Enter a title before saving and check for unsaved edits.
2. Uploaded files must be PDFs within 2 MB.
3. If the viewer fails use Open PDF; MO AI does not automatically extract its text.
4. Do not delete notes or storage as a troubleshooting shortcut.

### owner

1. The private prompt needs its own password and is not read through chat.
2. Without the encryption password the saved prompt cannot be decrypted.
3. Unsupported instructions reflect the rule engine's limits; they do not grant arbitrary code execution.
4. Wait for the cooldown rather than clearing storage after failed attempts.

### pwa

1. The PWA needs HTTPS/localhost and service-worker support.
2. Load the app online to cache resources; use the browser install option when its button is unavailable.
3. For a waiting update close the app/tabs and reopen, without clearing browser data.

## Audited absences and protected areas

No OpenAI/general-purpose AI API, automatic WhatsApp/SMS, voice chat or cross-device chat-history sync implementation was found among the application modules. These are explicitly unavailable in the registry, rather than invented controls.

developer-tools.js includes a protected local developer reset. It was audited but is not exposed as a chat action and is never recommended for missing-data troubleshooting. Owner prompt text and credentials are excluded from the registry.

## Runtime source inventory

SHA-256 fingerprints identify the source snapshot. Configuration contents, credentials and business data are not reproduced.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| assistant-analysis.js | 15901 | 2497df6766b3a20dc35010ee8214fb2b3106d3e615f6289bc883f7374a8abb60 |
| assistant-data.js | 5524 | 48cf2327907b806e411d9fda5fa0dd90bf7e633f09e5d873c7cae053d0d8aa30 |
| assistant-engine.js | 9081 | b62b8e386bb7d66021b11b93d63815a645b1f0545bbfc12c8d2f454b5c576912 |
| assistant-history.js | 3975 | 627ab314b2ecdb40fd0975bc605a931b72396667c6e1c7ad545b52f082ca2a34 |
| assistant-knowledge.js | 14520 | fc794ff7ed224cfaad1b6a531609a749af9a93adc8e6538ed685fcabc7d188cc |
| assistant-learned-knowledge.js | 7267 | 6c76a98096f2ed69870e4761220b8fb9fa6dd21fbdb599992c01dde3ecde2ba5 |
| assistant-owner.js | 12708 | 6a9b13f7aee6a32c382072d0ae55d3963a9d71aa96caa83fb5ae30ffd87e9ce9 |
| assistant-policy.js | 7063 | 3a6dd3c5834e7dee2a59986f5ac6622eb587e233ff589e734fe1410eb5483788 |
| backup-merge.js | 2408 | 71577e50c88148845c933439b2558fe51b37a9dffe0993d43629c9eb6d51269c |
| business-assistant.css | 9987 | 968d3a8e763f9e12a66d3bae372125cac0d5af75c2a2d605e29b84d8fa761023 |
| business-assistant.js | 24348 | b563319cad6f73b80cbd25f70b3f070293ab8fb715db8a63c18c1f5cc2f081bf |
| business.js | 34924 | 09c371af0795268ae04d353d70f75429d8a11a9a0f51eaca918f7c60a4b92147 |
| chart-data.js | 1489 | 59b44d84417ab251eb99886faeb22e4b2818afb103b4e8b4828e6ebbe662500e |
| cumulative.js | 7493 | f020fc453fc3cd82b9b335c9a6022af8dc8ddf8d599575ad04fcf82ad4d798c1 |
| customer-data.js | 2142 | b84cd8dd5dd1b4ccb25fe62204398e5e76d42ecc0f9f8d7c932997bfaff50fd4 |
| developer-tools.js | 3873 | da8d6112de0d1437ffb9c1d347354fae291fd91be78cd132f72c73d11528571f |
| firebase-cloud.js | 19993 | 2d15b728309acfab4629be80a17614ffd7c3cb67246da9f091ee8fe6b89ddf6a |
| firebase-config.js | 516 | e553f1d3e39d90035c2d56d94befc46cb9235ec119f376a8cc38018386c39e5a |
| firestore.rules | 490 | 665aa46b07bbe23ccec86b1dd2b324b6c0ac07175f55f7aecbe11b9859085be6 |
| fold-ui.js | 653 | 1b1950032db00ffb28a530756b121dfa2fbcd20eb226311d668b2a5de935e7b3 |
| index.html | 87734 | d6dd974f9a50c9b7ea21b1c05b5c4625b54570818b3c175f70172e76a13d5b8f |
| luxury.css | 15615 | 548e69d8865a3cd11467543de04f2eed5acbfb3fdb920be85738c0eaf5cf97bc |
| luxury.js | 13574 | d835204f5d22d73f903037e7b8544ceb061ac0d670fff3330d65edbcc476edd2 |
| manifest.json | 997 | 6bbbff3969ecc5a274cbd6632a723b96a0bb97552133a1123b24e9e8a36adba0 |
| notebook-notes.js | 7552 | eaf07c35896e77c2bef7ecf15c2a342691a52b228f90bda4f8395aea7138360f |
| report-pdf.js | 4094 | 2cd41bb7f2bee4de2f2379c32c01024d6c511741e540773c2b1ea84c4ed110ab |
| reports.css | 2824 | 4d1b9b8b07d7b0d3e4088a91128b07dbd5b26f3937edc3ce3c42ce78df4c678a |
| reports.js | 14419 | 3bf390d8acdd27e96e861069310655986902ca875324addd4e247ffb3c85d9c3 |
| sw.js | 2473 | 62e4f28596eb506e5c4c1283ec924cf9b962fb4bdb65edae4b8e843fab0d63c1 |
| system-knowledge-registry.js | 128747 | d63786fd7b2daaa9c80161a824367b50307d0282e282fa8270c3e81fd30deef7 |
| totals-data.js | 1345 | 8a6f200b5b125e987d7bcef31b4bff6293b308cbf050faf9e55f3f5b9ab9b9f9 |
| ui-icons.js | 3615 | 9ac1be40e047fa9ac3ec630b8b1c76597e8f16f849f1e7fb6dd055e1ae5c62f1 |
| ui-language.js | 18524 | e8b0402a0a188b6c364aa7a5d4891c7d57b5c0dc2f6d64d06637563f5e1698bb |
| ux.css | 4849 | af345e03cb32f596a6b0fda949fc48a0c10c6e49019608b6a10163e55cdfe4ed |
| ux.js | 13753 | 01deb8cef0e53374634deb6c628c6a1f3cefe365c22f5796f0533ecc45072847 |
| workspace.js | 11392 | ed5df0643e387563da97e137998fbf843aa70e3f3af0e78059dda563b912b25d |

Node .cjs files were treated as verification/server tooling, not advertised application capabilities. Images/icons and manifest metadata were checked as app assets; source inventory includes the manifest and offline service worker.

## Knowledge maintenance

Update system-knowledge-registry.js when a feature changes; keep descriptive guidance separate from account-scoped data. Update app/asset versions and run verify-system-knowledge.cjs plus the isolated Chrome suite. The registry is a bundled static module, not executable instructions, private data or an autonomous code updater.
