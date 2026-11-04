# MO AI: chat and device verification fix

Date: 4 November 2026. This updates the existing MO AI in `CASH_AND_FLOW V.3 AI/CASH_AND_FLOW-main`. The earlier workspace path no longer exists; the current implementation was found in this moved project. No production deployment, database schema/rules change or deletion of business records was performed.

## Findings

The previous device reader treated a sync UID marker as ownership, checked Auth before its initial callback had necessarily restored the user, and used the online-only synchronized flag when a marker was absent. This could block legitimate data during startup or offline, and a missing/stale marker had no read-only recovery path. It also placed the full raw exception in every chat response.

Firestore reads explicitly use server-only APIs. The app's assistant snapshot cache, not the SDK's general Firestore offline cache, provides offline answers. Firebase Auth uses its existing persisted session. SDK code is already included in PWA caching. No Firestore persistence setting was changed to bypass account validation.

The investigation used code and isolated fixture accounts; the user's actual Firebase UID and production datasets were not opened. Genuine wrong-account or unverified data still stays blocked.

## Verification changes

- Firebase initialization is single-flight. Analysis waits for initial Auth resolution with a bounded timeout, instead of treating an unresolved user as a signed-out user.
- Initial Auth restoration does not discard a question submitted while it was loading. Subsequent real account changes clear messages and pending previews.
- The existing full-dataset sync fingerprint can verify an unchanged device dataset for its authenticated UID even offline, without requiring an online sync flag.
- A missing/stale marker can be resolved online by comparing the exact analysis records (ID, account, type, amount, category and transaction date) against the authenticated server snapshot. Comparison ignores array order.
- Only verified records get an additional per-device ownership proof (UID plus SHA-256 digest). This local metadata does not modify the existing cloud sync marker, transaction schema or records.
- Offline device reads require a valid proof or a matching legacy fingerprint for the authenticated UID. Edited, unknown, malformed and other-account datasets are rejected until verified. Auth and dataset changes during verification are rechecked before a proof is written.
- Never-associated standalone device records can still work without an online Firebase SDK. Data associated with an account cannot use that standalone path.
- Auto continues to use verified Firebase online and the current account's snapshot offline. Explicit device mode does not bypass ownership checks.
- Errors appear in one short recovery banner with Sign in, Use Firebase or Retry. Repeated questions do not append raw errors or stack traces to chat. Unknown-source data is not turned into zero totals.

## Chat changes

- Compact user bubbles on the right and MO AI responses on the left; short messages fit their content.
- Reduced containers and borders, theme variables for light/dark mode, a small connection indicator, and optional source/Auto Save controls inside the menu.
- Source attribution stays as a small label beneath analysis replies; timestamp/completeness detail is available in its tooltip rather than repeated paragraphs.
- Compact auto-expanding input with `Uliza MO AI chochote...`, red send icon and processing spinner.
- Desktop Enter sends; Shift+Enter adds a line; IME composition does not accidentally submit. Touch devices keep native multiline input and the send button.
- Chat scrolls within its own message area. Reduced-motion preference is respected.
- Chat height follows the visible viewport and reserves space for app navigation. Keyboard resizing scrolls the composer into view. The duplicate generic MO AI guide is hidden only while the MO AI screen is active.
- Existing Futa chat, suggestions, question engine, analysis/date/category calculations and Smart Entry preview/confirm/Auto Save are retained. Futa chat does not delete transactions.

## Files and backup

Changed: `business-assistant.js`, `business-assistant.css`, `assistant-data.js`, `firebase-cloud.js`, `sw.js` (cache version 56), `verify-assistant.cjs`, `verify-assistant-analysis.cjs`, `verify-assistant-browser.cjs`.

Added: `verify-assistant-ownership.cjs`, this report, and isolated QA screenshots under `test-artifacts/mo-ai-chat/`.

Pre-change copies are in `backups/mo-ai-before-chat-verification-fix/`. The original intent/parser/calculation files and cloud save adapter are unchanged; automated comparisons to the earlier baseline still pass.

## Tests completed

All passed:

- `node verify-assistant-ownership.cjs`: delayed Auth, unchanged legacy fingerprints offline, missing/stale/wrong markers, exact remote verification, persisted proof after restart, edited records, malformed metadata handling, signed-out and cross-account rejection, account/data races, standalone offline use and reconnect without transaction writes.
- `node verify-assistant-analysis.cjs`: 52 question variants over 20 analysis intents, identical online/offline calculations, dashboard parity, category/date analysis, cache isolation and unchanged parser/save adapter.
- `node verify-assistant.cjs`: existing greeting/questions, parsing, duplicates, validation and mocked Firebase save failures.
- `node verify-assistant-browser.cjs`: installed headless Chrome with isolated profile, production page networking blocked, mocked Firebase/Auth. Covers the first question during Auth restoration, actual chat DOM, compact bubble alignment, desktop Enter/Shift+Enter, IME, textarea growth, light/dark modes, 390/430/1366 widths, a 520px keyboard-sized viewport with visible composer, offline PWA reload, account switching, repeated error banner, Smart Entry preview/confirmed save/Auto Save, and clear chat preserving transactions.
- Existing `verify-cloud-merge.cjs`, `verify-backup-merge.cjs`, `verify-workspace.cjs` and `verify-reports.cjs`.
- Syntax checks of modified application JavaScript.

Screenshots were inspected: `light-mobile.png`, `dark-mobile.png`, `desktop.png`. Tests simulate Android-style touch/viewport conditions; physical Android/iPhone keyboards and live production Firebase were not exercised.

## If data cannot be verified

Use the short action in MO AI. Sign in to the account that owns the records; online, choose Firebase to read that account's validated server snapshot. Device-only records that differ from the server still require the existing backup/synchronization workflow. The fix deliberately does not auto-assign unknown records to the current account, merge them silently or delete them.
