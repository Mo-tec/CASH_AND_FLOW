const http = require('http');
const fs = require('fs');
const path = require('path');
const gateway = require('./api-backend.cjs').createGateway();

const root = __dirname;
const port = Number(process.env.PORT) || 4173;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

http.createServer(async (req, res) => {
 if(await gateway.handle(req,res))return;
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{return res.writeHead(400).end();}
 if(!/^(127\.0\.0\.1|localhost):\d+$/.test(req.headers.host||''))return res.writeHead(403).end();
 // Serve only public app assets at the root. Vaults, source tests and backups stay private.
 if(pathname!=='/'&&(!/^\/[a-zA-Z0-9 ._-]+$/.test(pathname)||!['.html','.js','.css','.json','.png'].includes(path.extname(pathname))||pathname.startsWith('/.')||pathname==='/package.json'))return res.writeHead(404).end();
 if(!['GET','HEAD'].includes(req.method))return res.writeHead(405).end();
 const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
 if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
 fs.readFile(file, (error, data) => {
  if (error) return res.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.end(req.method==='HEAD'?undefined:data);
 });
}).listen(port, '127.0.0.1', () => console.log(`MO TEC: http://127.0.0.1:${port}`));
