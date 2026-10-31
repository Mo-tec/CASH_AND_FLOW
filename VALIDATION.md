# cash-and-flow validation

Target: https://mo-tec.github.io/cash-and-flow/
Source commit: d2493b728d9c37f75e5e83c5e1d4d713332bf912.
Updated application: 2026.10.11.4; service-worker cache v23.
Test date: 2026-10-11.

## Passed locally

- Core suite: payments once, edits, overpayment rejection, costs, allocation without duplicates, stock bounds, atomic write failure, restore idempotence, invalid imports, migration, corruption protection, AES-GCM, syntax and precache asset existence.
- Chart suite: real daily/weekly/monthly income, local midnight and year boundaries, future-date exclusion, account isolation and empty data.
- Totals suite: start-day inclusivity, all-period income/expenses/balance, future exclusion, strict dates, account isolation and legacy start-date inference.
- Business browser suite: actual mobile Chromium UI, orders/payments/costs, editing, documents, stock, plain/encrypted backup, quota failures, invalid imports, real service-worker offline reload, migration and corruption.
- Buttons browser suite: change/save start date; collapse/open all history; filters/search/clear without changing cumulative totals; add/edit/cancel/delete transaction and attach receipt; CSV formula escaping; PDF popup; all three languages; theme toggle; budget/category changes; diagnostics/update; graph keyboard navigation; account switch; start-date round-trip through backup restore, old-backup date inference, persistence and real offline reload.
- Install button: simulated beforeinstallprompt event verifies the prompt handoff. This is not an actual OS installation.
- Mobile dashboard and orders screenshots inspected internally; screenshots are not included in this package.

Browser: Playwright 1.51.1 Chromium headless shell, mobile viewport 390 × 844, Africa/Dar_es_Salaam timezone. Both browser suites serve localhost themselves.

## Limits

Actual Android/iOS/Windows installation, device biometrics and cross-browser behavior require device verification. There was no recorded registration date in the old app: existing users start at the earliest nonfuture transaction, editable in the Home panel. New users retain the first-use date. Current balance reflects recorded cash flow, not a bank reconciliation.

GitHub upload was previously rejected with HTTP 403 Resource not accessible by integration. No online site change or GitHub write occurred. This ZIP is the updated, tested source for manual deployment.

Existing database, lock keys, manifest identity, root icon paths and project-relative URLs are preserved. Export a backup before deploying. Assets are local and precached; no external chart/font CDN is required. Updates wait until older app tabs close to avoid mixed versions.
