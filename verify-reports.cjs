const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('reports.js', 'utf8');
const body = code.slice(code.indexOf('function report('), code.indexOf(' function show('));
assert(body.startsWith('function report('));
const context = {
 day: value => new Date(value).toISOString().slice(0,10),
 validDate: value => /^\d{4}-\d{2}-\d{2}$/.test(value),
 w: () => ({invalidDate:'Invalid report dates.'}),
 Date, Map, Error
};
vm.createContext(context);
vm.runInContext(body, context);
const raw = {records:[
 {date:'2026-10-01T08:00:00Z',account:'business',type:'income',amount:1000,category:'Print'},
 {date:'2026-10-01T09:00:00Z',account:'business',type:'expense',amount:350,category:'Print'},
 {date:'2026-10-02T08:00:00Z',account:'business',type:'income',amount:600,category:'Sales'},
 {date:'2026-10-01T08:00:00Z',account:'personal',type:'expense',amount:90,category:'Food'}
]};
const all = context.report(raw,'2026-10-01','2026-10-02','business');
assert.deepEqual([all.income,all.expense,all.balance,all.count],[1600,350,1250,3]);
const category = context.report(raw,'2026-10-01','2026-10-01','business','Print');
assert.deepEqual([category.income,category.expense,category.balance,category.count],[1000,350,650,2]);
assert.equal(context.report(raw,'2026-10-01','2026-10-02','personal').balance,-90);
assert.throws(()=>context.report(raw,'2026-10-02','2026-10-01','business'),/Invalid report dates/);

const pdfSource = fs.readFileSync('report-pdf.js','utf8');
const ctx = {fillRect(){},fillText(){},measureText(s){return {width:s.length*12}},stroke(){},beginPath(){},moveTo(){},lineTo(){}};
const canvas = {getContext(){return ctx},toDataURL(){return 'data:image/jpeg;base64,'+Buffer.from([0xff,0xd8,0xff,0xd9]).toString('base64')}};
const pdfContext = {window:{},document:{createElement(){return canvas}},TextEncoder,Uint8Array,Blob,Date,atob};
vm.createContext(pdfContext); vm.runInContext(pdfSource,pdfContext);
pdfContext.window.ReportPDF.create([{text:'Report',heading:true},{columns:['Category','Income','Expense','Balance'],tableHead:true}]).then(async blob=>{
 const bytes=Buffer.from(await blob.arrayBuffer());
 assert(bytes.subarray(0,8).toString().startsWith('%PDF-1.4'));
 assert(bytes.toString().includes('/Type /Page'));
 console.log('PASS: report totals, category/account/date filters, PDF structure.');
}).catch(error=>{console.error(error);process.exitCode=1});
