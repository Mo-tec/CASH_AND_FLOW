# MO AI — owner instructions

New: the authenticated owner dialog also has **Maarifa yangu** for facts/FAQs used in chat without code. See [editable knowledge](MO-AI-EDITABLE-KNOWLEDGE.md). These published facts are separate from the encrypted private prompt.

## Open and use

Open MO AI and tap its **MO AI heading five times quickly**. Keyboard users can focus that heading and press Enter or Space. The hidden gesture is a convenience; the password is the editor lock.

First use creates an owner-instructions password of 8–256 characters. If a Developer password or app PIN/password already exists, it must also be verified before setup. Later visits require the owner-instructions password.

Example:

```text
Lugha: sw
Majibu: mafupi
Salamu: Karibu MO TEC BUSINESS. Nikusaidie nini leo?
Preview: lazima
```

Press **Hifadhi maelekezo**. The panel shows which preferences the current engine understands and counts instructions it cannot execute. Closing the panel clears its prompt field and encryption key from the editor session. It also closes on account switching, app lock, leaving the tab, or after five minutes of inactivity.

## What is implemented now

This remains the existing rule-based assistant, without an AI API. The prompt is not an unrestricted command executor.

- Language: `sw`, `en`, or `auto` (existing app language).
- Responses: `mafupi/brief` or `kawaida/standard`. Brief mode conservatively reduces duplicate/verbose advice while preserving financial amounts, warnings and calculations.
- Greeting: custom text up to 300 characters, rendered as text.
- Preview: `lazima/required` forces transaction confirmation even if the Auto Save checkbox is manipulated. It never grants new write permissions.
- Some simple natural instructions such as `Jibu kwa Kiswahili, kwa ufupi.` are also recognized.
- Other instructions are retained in the encrypted prompt but are explicitly reported as unsupported. They do not silently acquire new capabilities.

Question understanding, calculations, validation, duplicate protection, Firestore ownership checks and the transaction save adapter remain in place. Prompts cannot execute JavaScript/database commands, delete records, access another user's data, bypass validation or create fabricated financial results. Archived replies remain as originally written.

## Storage and scope

Each authenticated Firebase UID has its own local owner-instructions record. Standalone device configuration is separate; data associated with an account does not fall back to another owner's preferences.

The full prompt is encrypted at rest with AES-GCM, a random 96-bit nonce per save, and a key derived from the password with PBKDF2-SHA-256 (210,000 iterations, random 128-bit salt). Neither the password nor the full prompt is stored in plaintext. The selected safe runtime preferences are stored visibly alongside the ciphertext, allowing them to apply after reopening the app without decrypting the private notes each time. A custom greeting is intentionally part of those visible preferences and of chat replies.

This is a **local device/browser editor lock**, not server-side administrator authorization. Someone controlling the browser's code/storage can change local runtime behavior; they do not gain new Firebase rights. The full prompt and private owner notes are not sent to Firebase, included in business backups or inserted into chat history by this feature. User-authored greetings are displayed intentionally. No API key should be put in the prompt.

Five incorrect unlock attempts cause a one-minute local cooldown, preserved across reload. Forgotten encryption passwords cannot decrypt the saved prompt. Corrupt records and storage quota failures do not silently overwrite the previous encrypted prompt. There is no cross-device prompt synchronization or new Firestore collection.

## Files and tests

Added `assistant-policy.js` (allowlisted compiler, encrypted vault and response formatting), `assistant-owner.js` (owner editor), and `verify-assistant-policy.cjs`.

Updated `business-assistant.js`, `business-assistant.css`, `index.html`, `sw.js` (cache version 58), and the existing assistant/browser regression harnesses.

Backup: `backups/mo-ai-before-owner-instructions/`.

Tests passed:

- `verify-assistant-policy.cjs`: encrypted prompt, wrong password, persisted safe preferences, locked saves, rate limiting/reload, account scoping, copied records, quota errors, unsupported commands and preserved financial values.
- `verify-assistant-browser.cjs`: five-tap entry, initial password setup, authenticated reopen, wrong-password refusal, supported preferences applied to real chat, forced preview with Auto Save manipulated, mobile dialog, offline reload and separation between accounts. Existing chat history, questions, Smart Entry, themes, keyboard and layout tests also pass.
- Existing assistant, 52-question analysis, ownership, history, cloud/backup merge, workspace and reports tests.
- Syntax checks for changed application JavaScript.

Browser tests use a temporary profile and mocked Firebase/Auth with external page requests blocked. No production records were read or changed. No API integration or deployment was performed.
