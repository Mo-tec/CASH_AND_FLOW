# Business Assistant

Add facts without code: [MO-AI-EDITABLE-KNOWLEDGE.md](MO-AI-EDITABLE-KNOWLEDGE.md).

Current System Knowledge Layer V1: [MO-AI-SYSTEM-KNOWLEDGE-V1.md](MO-AI-SYSTEM-KNOWLEDGE-V1.md).

Owner instructions: [MO-AI-OWNER-INSTRUCTIONS.md](MO-AI-OWNER-INSTRUCTIONS.md).

Automatic saved conversations: [MO-AI-HISTORY.md](MO-AI-HISTORY.md).

Latest chat and verification changes: [MO-AI-CHAT-VERIFICATION-REPORT.md](MO-AI-CHAT-VERIFICATION-REPORT.md).

Current upgrade details and verification results: [MO-AI-UPGRADE-REPORT.md](MO-AI-UPGRADE-REPORT.md). The notes below describe the earlier implementation; the upgrade report takes precedence for current intents, Auto mode, protected offline caching and browser test results.

The MO AI navigation panel has one chat for questions and transaction commands. Clear chat removes messages, the input draft and unsaved preview; it does not delete saved transactions. The clear button is disabled while processing or saving. No API key, OpenAI call, deployment, rules change, or production test data is involved.

## Existing system reviewed

- `index.html`: transaction validation, category manager, date/type/category filters, dashboard, monthly Business Insights, CSV/PDF and JSON backup controls.
- `business.js`: atomic dataset validation and persistence, `commitBusiness`, dashboard rendering, backup normalization/merge, orders, inventory and audit history.
- `workspace.js`: installed category names and unified business account. There was no existing Smart Entry parser. Categories are strings with **no declared income/expense type**.
- `firebase-cloud.js` / `firestore.rules`: existing Firebase Auth; server-only reads of per-user chunked Firestore backups; automatic backup and conflict handling. Transactions are not independent Firestore documents.
- `reports.js`, `report-pdf.js`, totals modules, language/theme helpers, responsive navigation and service-worker cache remain in use.

## Usage

Open **MO AI** in the main navigation. Questions support Kiswahili and English. An unspecified period means today in Africa/Dar_es_Salaam. Supported periods: today, yesterday, day before yesterday, this/last week, this/last month, one ISO date, or two inclusive ISO dates. A week starts Monday. Comparisons use the immediately preceding period with the same number of days. Month/year or day-only requests ask for explicit ISO dates rather than guessing.

Examples:

- `Mapato ya leo?`
- `How much did I earn this week?`
- `Nimetumia pesa nyingi kwenye nini mwezi huu?`
- `Mapato 2026-11-13 hadi 2026-11-16?`
- `Hifadhi mapato DTF 30000 na matumizi MIMI BINAFSI 20000`

Use the exact category names configured in your installation. Mixed commands without declared types ask you to supply `mapato/income` or `matumizi/expense`. Historical usage does not prove a category's type, so it is not used to guess. The parser can consume typed category objects if a future category service supplies them; it does not change today's schema. Commands use positive whole TSh amounts, with optional thousands separators, at most 50 entries, and one transaction day.

Auto Save starts off and resets on account changes. With it off, review the preview and press Save. With it on, complete validated commands save immediately. Unknown categories or malformed/ambiguous clauses prevent the entire command from being saved. Submit the corrected full command after clarification.

## Data and safety

Questions default to the validated transaction dataset on this device, including offline and signed-out use. The source selector can instead request the latest authenticated **server** backup. Each answer names its source. Sources are not silently combined or substituted on errors. A device load failure is reported as an error, not an empty dataset. When Firebase is selected, missing backups mean an empty Firestore dataset; this is distinct from a server/network error. Answers describe the backup's transaction dates, and can lag local edits until automatic backup completes. Periods with no records are reported as no transactions; percentage comparisons with no baseline are unavailable. The difference between income and expenses is not described as verified net profit.

Saving requires an authenticated synchronized account, connectivity, and local transaction records matching the latest server backup. It uses existing `commitBusiness`, record validation, rendering and automatic backup upload. No historical records are modified. If upload fails after local commit, chat explicitly reports **saved locally, Firebase pending**; it does not claim cloud success or ask you to enter again. Existing cloud conflict handling still applies.

Duplicate protection conservatively rejects an existing transaction with the same business account, day, category, type and amount, including repeated messages after reload and duplicate items within one command. Intentionally separate identical transactions must use the existing manual record form. This guard is not a cross-device transaction lock: simultaneous backup writes retain the existing application's conflict limitations.

Chat uses text nodes, has no execution/eval/database-command interface, is not persisted, and clears on Firebase account changes. The feature adds no collection, permission rule, password logging or new credential storage.

## Architecture and verification

- `assistant-engine.js`: pure intent rules, date interpretation, strict transaction parser, calculations and response generation, exported for offline fixture tests.
- `business-assistant.js` / `.css`: responsive chat, preview, loading, suggestions, Auto Save and messages. UI strings are bilingual Swahili/English; narrative summaries follow existing Swahili/English preference. Chinese mode uses the Swahili assistant fallback.
- `motecAssistantCloud` in `firebase-cloud.js`: authenticated data/saving adapter reusing existing services. A future interpretation provider can replace the pure parser/intent layer without granting it write authority; validation and save gates remain separate.
- `sw.js`: version 54 includes the three new assets.

Run `node verify-assistant.cjs`. Fixtures cover intents, timezone boundaries, inclusive dates, summaries, category ranking, trends, multiple entries, invalid/ambiguous commands, duplicates, empty data, changed accounts, stale devices and Firebase failures. Existing backup merge, cloud merge, workspace and report checks also pass.

Browser/mobile visual verification could not run in this environment because `playwright` is unavailable and its offline package resolution failed. Responsive CSS is implemented, but actual Android/iPhone/desktop layout and real Firebase end-to-end behavior still require verification. No production Firebase reads or writes were performed during tests.

MO AI also answers standalone greetings (Mambo, Habari, Hello, Hi) without a network request: Poa! Karibu Mo tec Bussiness. Nikusaidie nini Leo? Saving transactions continues through the existing authenticated Firebase adapter regardless of the question source selector. Fixture tests exercise the actual submit handler for offline device answers, greetings, empty data, invalid local data and explicit Firebase errors.
