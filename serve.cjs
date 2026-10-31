const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

http.createServer((req, res) => {
 const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
 const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
 if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
 fs.readFile(file, (error, data) => {
  if (error) return res.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.end(data);
 });
}).listen(port, '127.0.0.1', () => console.log(`MO TEC: http://127.0.0.1:${port}`));
