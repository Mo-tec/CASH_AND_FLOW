# MO AI — automatic chat history

The existing MO AI now saves conversations automatically in this browser's persistent local storage. This does not change transactions, analysis calculations, Firebase rules or the database schema.

## Using history

- The **+** button starts **Chat mpya** and preserves the previous conversation.
- The **clock/history icon** opens saved conversations. Entries show their first question, date and time in Africa/Dar_es_Salaam.
- Conversations are grouped as Today, Yesterday, Previous 7 days and older months. Individual dates make earlier days and weeks easy to locate.
- The last selected conversation reopens after restarting or reloading the app, including offline.
- A first message on a new Tanzania calendar day starts a new daily conversation. Earlier messages remain archived.
- **Futa chat** removes only the selected conversation from history. Other conversations and business transactions remain.
- Every message displays its time; its full date/time is available in the message title.
- Opening old history displays the recorded answer as it was. It does not recalculate old answers, recreate transaction previews or execute saved commands. Select a new question to obtain current figures.

## Account and storage boundaries

Signed-in history is scoped to the authenticated Firebase UID. Standalone history uses a separate device scope. History awaiting initial Auth restoration stays in memory until its owner is known. A real account switch clears the previous display and opens only the new account's history; signed-out users cannot open account-owned archives.

Stored messages contain text, role, timestamp and optional minimal source attribution. Firebase credentials and full business snapshots are not copied into history. Rendering uses text nodes.

There is no automatic deletion of older conversations and no 40-message truncation. If device storage is full or inaccessible, MO AI shows a notice instead of claiming that new history was saved. Corrupt saved history is preserved without being overwritten.

**Scope:** history is stored in this device/browser, not synchronized to Firebase or other devices. Clearing browser/app storage also removes its local history. Messages from before this feature existed were not saved and cannot be reconstructed.

## Files and verification

Added `assistant-history.js` and `verify-assistant-history.cjs`. Updated `business-assistant.js`, `business-assistant.css`, `index.html`, `sw.js` (version 57) and `verify-assistant-browser.cjs`.

Pre-change copies are in `backups/mo-ai-before-chat-history/`.

Passing tests:

- `node verify-assistant-history.cjs`: independent morning/new chats, daily and weekly persistence, reopening/selecting, account/device isolation, current-only deletion, more than 40 messages, minimal source data, corrupt storage and quota handling.
- `node verify-assistant-browser.cjs`: actual Chrome history menu, independent chats, dated groups, offline page reload with restored history, mobile/desktop menu bounds, account switching, selected-chat deletion and no Smart Entry replay. Existing keyboard, theme, layout, analysis, preview, confirm, Auto Save and clear-chat checks also pass.
- Existing assistant, 52-question analysis, ownership/Auth, backup merge, mocked cloud merge, workspace and report suites.
- JavaScript syntax checks.

Browser tests use isolated profiles and Firebase/Auth fixtures; no production records were read or changed. No deployment was performed.
