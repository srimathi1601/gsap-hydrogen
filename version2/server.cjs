// Minimal static server: node server.cjs  ->  http://localhost:5300
const http = require('http'), fs = require('fs'), path = require('path');
const root = __dirname, port = process.env.PORT || 5300;
const types = { '.html': 'text/html; charset=utf-8', '.webm': 'video/webm', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  p = path.normalize(p).replace(/^(\.\.[\/\\])+/, '').replace(/^[/\\]+/, '');
  const f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.stat(f, (e, st) => {
    if (e || !st.isFile()) { res.writeHead(404, { 'Cache-Control': 'no-store' }); return res.end('Not found'); }
    const type = types[path.extname(f).toLowerCase()] || 'application/octet-stream', range = req.headers.range;
    const nocache = { 'Cache-Control': 'no-store, no-cache, must-revalidate', 'Pragma': 'no-cache' };
    if (range) {
      const [s, en] = range.replace('bytes=', '').split('-'); const start = +s, end = en ? +en : st.size - 1;
      res.writeHead(206, Object.assign({ 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 }, nocache));
      return fs.createReadStream(f, { start, end }).pipe(res);
    }
    res.writeHead(200, Object.assign({ 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' }, nocache));
    fs.createReadStream(f).pipe(res);
  });
}).listen(port, () => console.log(`sTread Pro 3D preview: http://localhost:${port}`));
