'use strict';
// Small, offline PDF writer. Each A4 page is rasterized from a canvas so
// browser fonts can render Kiswahili, English and Chinese without a CDN.
window.ReportPDF = {
 async create(lines) {
  const encoder = new TextEncoder(), objects = [], pages = [];
  const add = value => { objects.push(value); return objects.length; };
  const catalog = add(''), pageTree = add('');
  for (let offset = 0; offset < Math.max(1, lines.length); offset += 36) {
   const canvas = document.createElement('canvas'); canvas.width = 1240; canvas.height = 1754;
   const ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = '#b51e32'; ctx.fillRect(0, 0, 1240, 18);
   ctx.font = 'bold 44px Arial, sans-serif'; ctx.fillText('CASH AND FLOW', 70, 100);
   ctx.font = '24px Arial, sans-serif'; ctx.fillStyle = '#334155';
   ctx.fillText('MO TEC BUSINESS  |  TZS', 70, 143);
   let y = 208;
   for (const line of lines.slice(offset, offset + 36)) {
    if (line.columns) {
     ctx.fillStyle = line.tableHead ? '#fce8eb' : (Math.floor(y / 39) % 2 ? '#f8fafc' : '#fff');
     ctx.fillRect(65, y - 29, 1110, 39);
     ctx.fillStyle = line.tableHead ? '#9f1239' : '#17233a';
     ctx.font = `${line.tableHead ? 'bold 20' : '19'}px Arial, sans-serif`;
     const xs = [76, 510, 735, 950], widths = [405, 210, 205, 210];
     line.columns.forEach((value, i) => { let s = String(value); while (ctx.measureText(s).width > widths[i] && s.length > 3) s = s.slice(0, -2) + '…'; ctx.fillText(s, xs[i], y); });
     ctx.strokeStyle = '#e2e8f0'; ctx.beginPath(); ctx.moveTo(65, y + 11); ctx.lineTo(1175, y + 11); ctx.stroke();
     y += 39; continue;
    }
    ctx.fillStyle = line.heading ? '#b51e32' : '#17233a';
    ctx.font = `${line.heading ? 'bold 29' : '23'}px Arial, sans-serif`;
    const words = String(line.text).split(' '); let text = '';
    for (const word of words) {
     const next = text ? text + ' ' + word : word;
     if (ctx.measureText(next).width > 1080 && text) { ctx.fillText(text, 70, y); y += 32; text = word; }
     else text = next;
    }
    ctx.fillText(text, 70, y); y += line.heading ? 50 : 39;
    if (y > 1660) break;
   }
   ctx.fillStyle = '#64748b'; ctx.font = '19px Arial';
   ctx.fillText(`Ukurasa ${pages.length + 1}  |  ${new Date().toLocaleString('sw-TZ', {timeZone:'Africa/Dar_es_Salaam'})}`, 70, 1700);
   const jpeg = Uint8Array.from(atob(canvas.toDataURL('image/jpeg', .84).split(',')[1]), c => c.charCodeAt(0));
   const image = add({head:`<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, bytes:jpeg});
   const drawing = encoder.encode(`q 595 0 0 842 0 0 cm /I${image} Do Q`);
   const content = add({head:`<< /Length ${drawing.length} >>\nstream\n`, bytes:drawing});
   pages.push(add(`<< /Type /Page /Parent ${pageTree} 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /I${image} ${image} 0 R >> >> /Contents ${content} 0 R >>`));
  }
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pageTree} 0 R >>`;
  objects[pageTree - 1] = `<< /Type /Pages /Kids [${pages.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  const pieces = [encoder.encode('%PDF-1.4\n')], offsets = [0]; let size = pieces[0].length;
  const push = bytes => { pieces.push(bytes); size += bytes.length; };
  objects.forEach((obj, index) => {
   offsets.push(size); push(encoder.encode(`${index + 1} 0 obj\n`));
   if (typeof obj === 'string') push(encoder.encode(obj));
   else { push(encoder.encode(obj.head)); push(obj.bytes); push(encoder.encode('\nendstream')); }
   push(encoder.encode('\nendobj\n'));
  });
  const xref = size;
  push(encoder.encode(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`));
  offsets.slice(1).forEach(n => push(encoder.encode(`${String(n).padStart(10, '0')} 00000 n \n`)));
  push(encoder.encode(`trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R >>\nstartxref\n${xref}\n%%EOF`));
  return new Blob(pieces, {type:'application/pdf'});
 }
};
