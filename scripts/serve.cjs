'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const root = fs.realpathSync(path.resolve(__dirname, '..', process.argv[2] === 'dist' ? 'dist' : '.'));
const port = Number(process.env.PORT || 5173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.mp3': 'audio/mpeg', '.ics': 'text/calendar; charset=utf-8', '.woff2': 'font/woff2' };

const server = http.createServer(async (req, res) => {
  const fail = (status, message) => { res.writeHead(status, { 'Content-Type': 'text/plain' }); res.end(message); };
  if (!['GET', 'HEAD'].includes(req.method)) return fail(405, 'Method not allowed');
  try {
    const url = new URL(req.url, 'http://localhost');
    const requested = decodeURIComponent(url.pathname);
    const relative = requested === '/' ? 'index.html' : requested.slice(1);
    // Restrict this development server to public frontend files.
    if (relative !== 'index.html' && !/^(css|js|assets)\//.test(relative)) return fail(404, 'Not found');
    if (relative.split(/[\\/]/).some(part => part.startsWith('.'))) return fail(404, 'Not found');
    const file = await fs.promises.realpath(path.resolve(root, relative));
    if (!file.startsWith(root + path.sep)) return fail(404, 'Not found');
    const mime = types[path.extname(file)];
    const info = await fs.promises.stat(file);
    if (!mime || !info.isFile()) return fail(404, 'Not found');
    let start = 0, end = info.size - 1, status = 200;
    const headers = { 'Content-Type': mime, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache', 'Accept-Ranges': 'bytes' };
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) return fail(416, 'Invalid range');
      start = match[1] ? Number(match[1]) : Math.max(0, info.size - Number(match[2]));
      end = match[1] && match[2] ? Math.min(Number(match[2]), end) : end;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start < 0) return fail(416, 'Invalid range');
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length'] = end - start + 1;
    res.writeHead(status, headers);
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(file, { start, end });
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) { fail(error instanceof URIError ? 400 : 404, 'Not found'); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the existing server or use PORT=5174 npm start.` : error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Invitation: http://127.0.0.1:${port}`));
