const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const server = http.createServer((req, res) => {
 const file = path.join(__dirname, decodeURIComponent(req.url === '/' ? '/index.html' : req.url));
 if (!file.startsWith(__dirname + path.sep)) return res.writeHead(403).end();
 try {
  res.setHeader('Content-Type', { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' }[path.extname(file)] || 'application/octet-stream');
  res.end(fs.readFileSync(file));
 } catch { res.writeHead(404).end(); }
});

const modules = {
 'firebase-app.js': `export function initializeApp(config) { return config; }`,
 'firebase-auth.js': `
  const email = localStorage.getItem('mock-auth-email');
  const state = globalThis.__mockAuth = { currentUser: email ? { uid: email, email } : null, callback: null };
  export function getAuth() { return state; }
  export function onAuthStateChanged(auth, callback) { auth.callback = callback; callback(auth.currentUser); }
  export async function signInWithEmailAndPassword(auth, email) { localStorage.setItem('mock-auth-email', email); auth.currentUser = { uid: email, email }; auth.callback(auth.currentUser); }
  export async function createUserWithEmailAndPassword(auth, email) { return signInWithEmailAndPassword(auth, email); }
  export async function signOut(auth) { localStorage.removeItem('mock-auth-email'); auth.currentUser = null; auth.callback(null); }
 `,
 'firebase-firestore.js': `
  const items = globalThis.__mockFirestore = new Map(JSON.parse(localStorage.getItem('mock-firestore') || '[]'));
  let clock = 0;
  export function getFirestore() { return {}; }
  export function doc(parent, ...parts) { return { path: [parent.path, ...parts].filter(Boolean).join('/') }; }
  export function collection(parent, ...parts) { return doc(parent, ...parts); }
  export function serverTimestamp() { return Date.now() + ++clock; }
  export async function setDoc(ref, data) { items.set(ref.path, data); localStorage.setItem('mock-firestore', JSON.stringify([...items])); }
  export function query(ref) { return ref; }
  export function orderBy() { return null; }
  export function limit() { return null; }
  export async function getDocsFromServer(ref) {
   const docs = [...items].filter(([key]) => key.startsWith(ref.path + '/') && !key.slice(ref.path.length + 1).includes('/'))
    .sort((a, b) => b[1].createdAt - a[1].createdAt).slice(0, 1)
    .map(([key, data]) => ({ ref: { path: key }, data: () => data }));
   return { empty: !docs.length, docs };
  }
  export async function getDocFromServer(ref) { return { exists: () => items.has(ref.path), data: () => items.get(ref.path) }; }
 `
};

(async () => {
 await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
 const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
 try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  await page.route('https://www.gstatic.com/firebasejs/13.0.0/**', route => {
   const name = route.request().url().split('/').pop();
   return route.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: modules[name] });
  });
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.selectOption('#securityType', 'none');
  await page.click('#patternDoneBtn');
  await page.waitForSelector('#appShell:visible');
  await page.evaluate(() => {
   const record = { id: 'firebase-test', account: 'business', type: 'income', amount: 100, category: 'Test', date: new Date().toISOString() };
   commitBusiness({ records: [record] }, 'Test');
   for (let node = document.getElementById('cloudPanel'); node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
  });
  assert.equal(await page.locator('#cloudPanel').count(), 1);
  await page.fill('#cloudEmail', 'one@example.test');
  await page.fill('#cloudPassword', 'test-password');
  await page.click('#cloudSignIn');
  await page.waitForFunction(() => document.getElementById('cloudActions').hidden === false);
  await page.click('#cloudUpload');
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('imehifadhiwa'));
  assert.equal(await page.evaluate(() => records.length), 1);
  await page.evaluate(() => localStorage.removeItem('motec-cloud-sync-v1'));
  await page.reload();
  await page.waitForFunction(() => document.getElementById('cloudStatus')?.textContent.includes('Auto backup imewashwa'));
  await page.evaluate(() => { for (let node = document.getElementById('cloudPanel'); node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true; });
  await page.click('#cloudSignOut');
  await page.waitForFunction(() => document.getElementById('cloudActions').hidden);
  await page.fill('#cloudEmail', 'two@example.test');
  await page.fill('#cloudPassword', 'test-password');
  await page.click('#cloudSignIn');
  await page.waitForFunction(() => document.getElementById('cloudActions').hidden === false);
  await page.click('#cloudDownload');
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('haina backup'));
  assert.equal(await page.evaluate(() => records.length), 1);
  await page.click('#cloudSignOut');
  await page.waitForFunction(() => document.getElementById('cloudActions').hidden);
  await page.fill('#cloudEmail', 'one@example.test');
  await page.fill('#cloudPassword', 'test-password');
  await page.click('#cloudSignIn');
  await page.waitForFunction(() => document.getElementById('cloudActions').hidden === false);
  await page.evaluate(() => commitBusiness({ records: [] }, 'Test clear'));
  await page.click('#cloudDownload');
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('imerejeshwa'));
  assert.equal(await page.evaluate(() => records.length), 1);
  await page.evaluate(() => commitBusiness({ records: [...records, { id: 'auto-one', account: 'business', type: 'expense', amount: 20, category: 'Test', date: new Date().toISOString() }] }, 'Auto test'));
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('moja kwa moja'));
  const count = () => page.evaluate(() => [...globalThis.__mockFirestore.keys()].filter(key => key.startsWith('users/one@example.test/backups/') && key.split('/').length === 4).length);
  assert.equal(await count(), 2);
  await page.context().setOffline(true);
  await page.evaluate(() => commitBusiness({ records: [...records, { id: 'offline-one', account: 'business', type: 'income', amount: 40, category: 'Test', date: new Date().toISOString() }] }, 'Offline test'));
  assert.equal(await count(), 2);
  await page.reload();
  await page.waitForSelector('#appShell:visible');
  assert.equal(await page.evaluate(() => records.length), 3);
  await page.context().setOffline(false);
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('moja kwa moja'));
  assert.equal(await count(), 3);
  await page.evaluate(() => { localStorage.removeItem('motec-business-data-v2'); localStorage.removeItem('motec-cloud-sync-v1'); });
  await page.reload();
  await page.waitForFunction(() => document.getElementById('cloudStatus')?.textContent.includes('Data zimesomwa Firebase'));
  assert.equal(await page.evaluate(() => records.length), 3);
  await page.evaluate(() => {
   const items = globalThis.__mockFirestore;
   const base = 'users/one@example.test/backups/other-device';
   const data = JSON.parse(localStorage.getItem('motec-business-data-v2'));
   data.records.push({ id: 'remote-one', account: 'business', type: 'income', amount: 30, category: 'Test', date: new Date().toISOString() });
   items.set(base + '/chunks/0', { part: JSON.stringify(data) });
   items.set(base, { createdAt: Date.now() + 500000, count: 1, version: 1 });
  });
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('kifaa kingine yamesomwa'), null, { timeout: 15000 });
  assert.equal(await page.evaluate(() => records.length), 4);
  await page.evaluate(() => globalThis.__mockFirestore.set('users/one@example.test/backups/foreign', { createdAt: Date.now() + 1000000, count: 1, version: 1 }));
  await page.evaluate(() => commitBusiness({ records: [...records, { id: 'conflict-one', account: 'business', type: 'income', amount: 50, category: 'Test', date: new Date().toISOString() }] }, 'Conflict test'));
  await page.waitForFunction(() => document.getElementById('cloudStatus').textContent.includes('Kifaa kingine'));
  assert.equal(await count(), 5);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.context().setOffline(true);
  await page.reload();
  await page.waitForSelector('#appShell:visible');
  assert.equal(await page.evaluate(() => records.length), 5);
  assert.deepEqual(errors, []);
  console.log('PASS: Firebase upload, auto backup, automatic cloud read, remote update, offline retry, conflict stop, per-user path, restore and offline reload.');
  await page.close();
 } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
