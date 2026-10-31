'use strict';
(() => {
 const config = window.MOTEC_FIREBASE_CONFIG;
 const ready = config?.apiKey && config?.appId && config?.authDomain && config?.projectId;
 const anchor = document.getElementById('backupStatus');
 if (!anchor) return;
 anchor.insertAdjacentHTML('afterend', `<details class="collapsible-panel" id="cloudPanel">
  <summary>Firebase</summary>
  <p id="cloudIdentity" class="note">${ready ? 'Hujaingia kwenye akaunti.' : 'Weka Firebase Web App Config ili kuunganisha akaunti.'}</p>
  <form id="cloudAuthForm">
   <label>Email<input id="cloudEmail" type="email" autocomplete="username" required></label>
   <label>Password<input id="cloudPassword" type="password" autocomplete="current-password" required></label>
   <div class="actions wide"><button class="primary" id="cloudSignIn" type="submit">Ingia</button><button class="secondary" id="cloudSignUp" type="button">Tengeneza akaunti</button><button class="secondary" id="cloudReset" type="button">Reset password</button><button class="secondary" id="cloudSignOut" type="button" hidden>Toka</button></div>
  </form>
  <div id="cloudActions" class="actions" hidden><button class="secondary" id="cloudUpload" type="button">Pakia backup Firebase</button><button class="secondary" id="cloudDownload" type="button">Rejesha backup Firebase</button></div>
  <p id="cloudStatus" class="status" role="status" aria-live="polite"></p>
 </details>`);
 const el = id => document.getElementById(id);
 const status = (message, error = false) => { el('cloudStatus').dataset.rawMessage = message; el('cloudStatus').textContent = window.motecCloudMessage?.(message) || message; el('cloudStatus').classList.toggle('error', error); };
 const SYNC_KEY = 'motec-cloud-sync-v1';
 let services, user, busy = false, active = false, uploading = false, timer;
 let session = 0, epoch = 0, baseline = null, checking = false;
 const syncSettings = s => ({lang:s?.lang||'sw',theme:s?.theme||'light',categories:s?.categories||null,budgets:s?.budgets||null,summaryStart:s?.summaryStart||null,summaryStartSource:s?.summaryStartSource||null});
 const snapshotData = d => ({ version: 2, records: d.records, orders: d.orders, inventory: d.inventory,
  stockMoves: d.stockMoves || [], audit: d.audit || [], notebook: d.notebook || '',
  notebookPdf: d.notebookPdf || null, notes: d.notes || [], settings:syncSettings(d.settings||settings()) });
 async function fingerprint(d) {
  const bytes = new TextEncoder().encode(JSON.stringify(snapshotData(d)));
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(hash), x => x.toString(16).padStart(2, '0')).join('');
 }
 function savedMarker(uid) {
  try { const value = JSON.parse(localStorage.getItem(SYNC_KEY)); return value?.uid === uid ? value : null; }
  catch { return null; }
 }
 function remember(uid, backupPath, hash) {
  baseline = { uid, backupPath, hash };
  try { localStorage.setItem(SYNC_KEY, JSON.stringify(baseline)); } catch {}
  queueMicrotask(() => window.dispatchEvent(new Event('motec:cloud-ready')));
 }
 function hasData() { return !!(records.length || orders.length || inventory.length || stockMoves.length || notes.length || notebook || notebookPdf); }
 function setBusy(value) {
  busy = value;
  for (const id of ['cloudSignIn', 'cloudSignUp', 'cloudReset', 'cloudSignOut', 'cloudUpload', 'cloudDownload']) el(id).disabled = value || !ready;
 }
 function showUser(next) {
  session++;
  active = false;
  clearTimeout(timer);
  user = next;
  window.dispatchEvent(new Event('motec:cloud-user-changed'));
  baseline = next ? savedMarker(next.uid) : null;
  el('cloudIdentity').dataset.email=next ? (next.email || next.uid) : '';
  el('cloudIdentity').textContent = window.motecCloudIdentity?.(el('cloudIdentity').dataset.email) || (next ? `Akaunti: ${next.email || next.uid}` : 'Hujaingia kwenye akaunti.');
  el('cloudActions').hidden = !next;
  el('cloudSignOut').hidden = !next;
  el('cloudSignIn').hidden = !!next;
  el('cloudSignUp').hidden = !!next;
  el('cloudReset').hidden = !!next;
  el('cloudEmail').disabled = !!next;
  el('cloudPassword').disabled = !!next;
  if (next) el('cloudPassword').value = '';
  if (next) initializeSync(next, session, epoch).catch(error => status('Auto backup haijaanza: ' + error.message, true));
 }
 async function init() {
  if (!ready) throw Error('Firebase Web App Config haijakamilika.');
  if (services) return services;
  const base = 'https://www.gstatic.com/firebasejs/13.0.0/';
  const [app, auth, db] = await Promise.all([
   import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')
  ]);
  const instance = app.initializeApp(config);
  const authentication = auth.getAuth(instance);
  const firestore = db.getFirestore(instance);
  services = { auth, db, authentication, firestore };
  auth.onAuthStateChanged(authentication, showUser, error => status(error.message, true));
  return services;
 }
 async function run(action) {
  if (busy) return;
  setBusy(true);
  status('Inaendelea...');
  try { await action(); } catch (error) { status(error.message || String(error), true); }
  finally { setBusy(false); }
 }
 function credentials() {
  const email = el('cloudEmail').value.trim(), password = el('cloudPassword').value;
  if (!email || !password) throw Error('Weka email na password.');
  return { email, password };
 }
 el('cloudAuthForm').onsubmit = event => { event.preventDefault(); run(async () => {
  const s = await init(), { email, password } = credentials();
  await s.auth.signInWithEmailAndPassword(s.authentication, email, password);
 }); };
 el('cloudSignUp').onclick = () => run(async () => {
  const s = await init(), { email, password } = credentials();
  await s.auth.createUserWithEmailAndPassword(s.authentication, email, password);
 });
 el('cloudReset').onclick = () => run(async () => {
  const email = el('cloudEmail').value.trim();
  if (!email) throw Error('Weka email kwanza.');
  const s = await init();
  await s.auth.sendPasswordResetEmail(s.authentication, email);
  status('Ikiwa email ina akaunti, fuata maelekezo ya reset yaliyotumwa.');
 });
 el('cloudSignOut').onclick = () => run(async () => {
  const s = await init();
  await s.auth.signOut(s.authentication);
  status('Umetoka kwenye akaunti. Data ya kifaa imebaki.');
 });
 function requireUser() {
  const current = services?.authentication.currentUser;
  if (!current || !user || current.uid !== user.uid) throw Error('Ingia kwenye akaunti kwanza.');
  return current;
 }
 async function latestBackup(s, uid) {
  const backups = s.db.collection(s.firestore, 'users', uid, 'backups');
  const result = await s.db.getDocsFromServer(s.db.query(backups, s.db.orderBy('createdAt', 'desc'), s.db.limit(1)));
  return result.empty ? null : result.docs[0];
 }
 async function readBackup(s, latest) {
  const count = latest.data().count;
  if (!Number.isInteger(count) || count < 1 || count > 120) throw Error('Backup ya Firebase si sahihi.');
  const chunks = [];
  for (let i = 0; i < count; i++) {
   const item = await s.db.getDocFromServer(s.db.doc(latest.ref, 'chunks', String(i)));
   if (!item.exists() || typeof item.data().part !== 'string') throw Error('Backup haijakamilika; data ya kifaa haijabadilishwa.');
   chunks.push(item.data().part);
   status(`Inapakua ${i + 1}/${count}...`);
  }
  const raw = JSON.parse(chunks.join(''));
  normalizeBackup(raw);
  return raw;
 }
 window.motecReportCloud = {
  async source() {
   const s = await init(), current = requireUser();
   if (!navigator.onLine) throw Error('Ripoti ya Firestore inahitaji mtandao.');
   const latest = await latestBackup(s, current.uid);
   if (!latest) throw Error('Hakuna backup ya Firestore bado. Pakia backup kwanza.');
   const raw = await readBackup(s, latest);
   if (requireUser().uid !== current.uid) throw Error('Akaunti imebadilika.');
   return {raw, path:latest.ref.path, uid:current.uid};
  },
  async history() {
   const s = await init(), current = requireUser();
   const ref = s.db.collection(s.firestore, 'users', current.uid, 'reportHistory');
   const docs = await s.db.getDocsFromServer(s.db.query(ref, s.db.orderBy('start', 'desc'), s.db.limit(1000)));
   if (requireUser().uid !== current.uid) throw Error('Akaunti imebadilika.');
   return docs.docs.map(doc => ({id:doc.ref.path.split('/').pop(), ...doc.data()}));
  },
  async mark(id, data, expectedUid) {
   const s = await init(), current = requireUser();
   if (current.uid !== expectedUid) throw Error('Akaunti imebadilika.');
   if (!/^\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}$/.test(id)) throw Error('Kipindi si sahihi.');
   await s.db.setDoc(s.db.doc(s.firestore, 'users', current.uid, 'reportHistory', id), data);
  },
  user() { return user?.uid || null; },
  synchronized() { return !!(active && baseline && user && navigator.onLine); }
 };
 async function initializeSync(next, token, check) {
  if (uploading || checking) return;
  if (!navigator.onLine) { status('Offline. Auto backup itakagua Firebase mtandao ukirudi.'); return; }
  checking = true;
  try {
  const s = await init();
  const latest = await latestBackup(s, next.uid);
  if (token !== session || check !== epoch || user?.uid !== next.uid) return;
  const localHash = await fingerprint(dataset());
  if (token !== session || check !== epoch) return;
  if (baseline && baseline.backupPath === (latest?.ref.path || null)) {
   active = true;
   if (localHash !== baseline.hash) { status('Mabadiliko ya kifaa yanapakiwa Firebase...'); scheduleAuto(200); }
   else status('Auto backup imewashwa. Data ya kifaa na Firebase zinalingana.');
   return;
  }
  if (!latest && !hasData()) {
   remember(next.uid, null, localHash);
   active = true;
   status('Auto backup imewashwa. Rekodi mpya zitapakiwa zenyewe.');
   return;
  }
  if (latest && !baseline && !hasData()) {
   const remote = await readBackup(s, latest);
   if (token !== session || check !== epoch || user?.uid !== next.uid || hasData()) return;
   applyCloudBackup(remote);
   remember(next.uid, latest.ref.path, await fingerprint(dataset()));
   active = true;
   status('Data zimesomwa Firebase moja kwa moja. Auto backup imewashwa.');
   return;
  }
  if (latest && !baseline) {
   const remote = await readBackup(s, latest);
   if (token !== session || check !== epoch) return;
   const remoteHash = await fingerprint(normalizeBackup(remote));
   if (token !== session || check !== epoch) return;
   if (localHash === remoteHash) {
    remember(next.uid, latest.ref.path, localHash);
    active = true;
    status('Auto backup imewashwa. Rekodi mpya zitapakiwa zenyewe.');
    return;
   }
  }
  if (latest && baseline && localHash === baseline.hash) {
   const remote = await readBackup(s, latest);
   if (token !== session || check !== epoch || user?.uid !== next.uid || await fingerprint(dataset()) !== localHash) return;
   applyCloudBackup(remote);
   remember(next.uid, latest.ref.path, await fingerprint(dataset()));
   active = true;
   status('Mabadiliko ya kifaa kingine yamesomwa Firebase moja kwa moja.');
   return;
  }
  status('Data ya kifaa na Firebase zinatofautiana. Chagua Pakia au Rejesha backup kabla ya auto backup.', true);
  } finally { checking = false; }
 }
 function scheduleAuto(delay = 1500) {
  clearTimeout(timer);
  if (!active || !user) return;
  if (!navigator.onLine) { status('Offline. Mabadiliko yamebaki kwenye kifaa; yatapakiwa mtandao ukirudi.'); return; }
  timer = setTimeout(() => uploadSnapshot(false).catch(error => {
   status('Auto backup imeshindwa: ' + error.message + '. Taarifa zimebaki kwenye kifaa.', true);
   if (active && navigator.onLine) scheduleAuto(30000);
  }), delay);
 }
 async function uploadSnapshot(manual) {
  if (uploading) throw Error('Backup nyingine inaendelea.');
  const s = await init(), current = requireUser();
  if (businessLoadFailed || storageLoadFailed || ordersLoadFailed) throw Error('Data ya kifaa haisomeki. Rekebisha au rejesha backup kwanza.');
  const hash = await fingerprint(dataset());
  if (!manual && hash === baseline?.hash) return;
  const payload = JSON.stringify(backupPayload());
  if (payload.length > 20 * 1024 * 1024) throw Error('Backup imezidi 20 MB. Pakua JSON ya kifaa kwanza.');
  const parts = payload.match(/[\s\S]{1,200000}/g) || [''];
  if (parts.length > 120) throw Error('Backup ina sehemu nyingi mno kwa Firebase.');
  if (manual && !confirm(`Pakia backup yenye ${records.length} miamala na ${orders.length} oda kwenye akaunti ${current.email}? Nakala hii itakuwa ya mwisho.`)) { status('Umeghairi.'); return; }
  uploading = true;
  try {
   const latest = await latestBackup(s, current.uid);
   if (!manual && (latest?.ref.path || null) !== (baseline?.backupPath || null)) {
    active = false;
    throw Error('Kifaa kingine kimeweka backup mpya. Chagua Pakia au Rejesha ili kulinganisha data.');
   }
   const id = new Date().toISOString().replace(/[:.]/g, '-') + '-' + randomId();
   const ref = s.db.doc(s.firestore, 'users', current.uid, 'backups', id);
   for (let i = 0; i < parts.length; i++) {
    if (requireUser().uid !== current.uid) throw Error('Akaunti imebadilika wakati wa kupakia.');
    await s.db.setDoc(s.db.doc(ref, 'chunks', String(i)), { part: parts[i] });
    status(`Inapakia ${i + 1}/${parts.length}...`);
   }
   if (requireUser().uid !== current.uid) throw Error('Akaunti imebadilika wakati wa kupakia.');
   await s.db.setDoc(ref, { createdAt: s.db.serverTimestamp(), count: parts.length, version: 1 });
   if (requireUser().uid !== current.uid) return;
   remember(current.uid, ref.path, hash);
   active = true;
   status(manual ? 'Backup imehifadhiwa kwenye Firebase. Auto backup imewashwa.' : 'Mabadiliko yamehifadhiwa Firebase moja kwa moja.');
  } finally {
   uploading = false;
   if (active && await fingerprint(dataset()) !== baseline?.hash) scheduleAuto();
  }
 }
 el('cloudUpload').onclick = () => run(async () => { epoch++; clearTimeout(timer); await uploadSnapshot(true); });
 el('cloudDownload').onclick = () => run(async () => {
  epoch++;
  clearTimeout(timer);
  const s = await init(), current = requireUser();
  const latest = await latestBackup(s, current.uid);
  if (!latest) throw Error('Akaunti hii haina backup ya Firebase.');
  const raw = await readBackup(s, latest);
  if (requireUser().uid !== current.uid) throw Error('Akaunti imebadilika wakati wa kupakua.');
  active = false;
  clearTimeout(timer);
  const restored = restoreBackup(raw);
  if (restored) { remember(current.uid, latest.ref.path, await fingerprint(dataset())); active = true; }
  else initializeSync(current, session, epoch).catch(error => status(error.message, true));
  status(restored ? 'Backup ya Firebase imerejeshwa kwenye kifaa.' : 'Umeghairi kurejesha backup.');
 });
 window.addEventListener('motec:business-commit', () => { if (active) scheduleAuto(); });
 window.addEventListener('motec:settings-commit', () => { if (active) scheduleAuto(); });
 window.addEventListener('online', () => {
  if (!services) init().catch(error => status('Firebase haipatikani: ' + error.message, true));
  else if (user) initializeSync(user, session, epoch).catch(error => status(error.message, true));
 });
 document.addEventListener('visibilitychange', () => {
  if (document.hidden || !navigator.onLine) return;
  if (!services) init().catch(error => status('Firebase haipatikani: ' + error.message, true));
  else if (user) initializeSync(user, session, epoch).catch(error => status(error.message, true));
 });
 setInterval(() => {
  if (user && active && navigator.onLine && !document.hidden && !uploading)
   initializeSync(user, session, epoch).catch(error => status('Kusoma Firebase kumeshindwa: ' + error.message, true));
 }, 5000);
 setBusy(false);
 if (ready && navigator.onLine) init().catch(error => status('Firebase haipatikani: ' + error.message, true));
})();
