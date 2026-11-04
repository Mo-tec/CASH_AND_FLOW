# Reports & Backup audit — 31 October 2026

## Added

- Reports & Backup UI for Firestore backed income, expenses, balance and category totals. Period boundaries use Africa/Dar_es_Salaam. Future dated transactions are excluded from totals.
- Local, offline capable PDF generator. Its canvas pages support the browser's installed fonts. PDF and JSON downloads are created in the browser and are **not** stored as files in Firestore.
- JSON export explicitly includes the version 2 business dataset and validated non-secret settings, with backup metadata. Existing `normalizeBackup` accepts the extra `backupMeta` field. It does not include the local PIN/pattern hash, recovery hash, Firebase credentials or tokens.
- Ten day completed business periods are detected on app open after Firebase synchronization and unlock. Missing periods are processed once using deterministic period IDs. Firestore stores only report history metadata under `users/{uid}/reportHistory/{periodId}`. History downloads are regenerated from the current Firestore dataset and may differ if historical transactions were edited.
- Firebase password reset email action through Firebase Authentication.
- Local lock attempt throttling: five failed PIN/pattern/recovery attempts cause a one minute pause; PIN input is cleared after verification. This is a client side measure and can be bypassed by a user who controls browser storage.

## Reviewed security boundaries

- Firebase email/password input goes to Firebase Authentication. The app does not store the Firebase password in Firestore, localStorage, or a backup.
- Existing local PIN/pattern and Developer password use salted PBKDF2 SHA-256 at 310,000 iterations. No plaintext local PIN/password storage was found in the application paths reviewed. PBKDF2 is a password key derivation function, not a bare SHA-256 hash. **It is not Argon2id or scrypt**, so the requested algorithm upgrade remains open. Existing hashes were preserved to avoid locking out users.
- Existing local lock and Developer password remain client side UI controls. Browser data itself is not encrypted. Local rate limiting is not server enforced.
- Existing Firestore backup and chunk rules are scoped to `request.auth.uid == userId`. New report history rules have the same UID restriction. The updated `firestore.rules` must be published separately before report history can work online. No production Firebase rules were changed by this local edit.
- Existing data, authentication accounts, and Firestore backup schema were not deleted or migrated.

## Verification and limits

- `node --check` passed for the changed JavaScript files.
- `node verify-reports.cjs` passed for report totals, category/account/date filters and basic PDF structure.
- `node verify-workspace.cjs`, `node verify-customers.cjs`, and `node verify-chart-navigation.cjs` passed.
- Browser integration scripts `verify-browser.cjs` and `verify-firebase.cjs` could not run because Playwright is not installed in this environment. Live Firebase rules, actual PDF rendering, device print, and offline behavior still need browser/device verification.
- Automatic checks run only while the app is open, authenticated, unlocked and synchronized online. No Cloud Functions, Scheduler or paid Firebase Storage are used.
