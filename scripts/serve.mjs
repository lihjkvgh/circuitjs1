import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.deployment");
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml", ".svg": "image/svg+xml", ".png": "image/png", ".gif": "image/gif", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" };
const port = Number(process.env.CIRCUITJS_PORT || 8088);
const server = http.createServer(async (req, res) => {
  try {
    if (![`127.0.0.1:${port}`, `localhost:${port}`].includes(req.headers.host) || req.method !== "GET") { res.writeHead(403); return res.end(); }
    const url = new URL(req.url, "http://127.0.0.1:8080");
    if (url.pathname === "/health") { res.setHeader("Content-Type", "application/json"); return res.end('{"app":"circuitjs-repair-local"}'); }
    const relative = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    if (!/^[a-zA-Z0-9_./-]+$/.test(relative) || relative.split("/").some((p) => p.startsWith("."))) throw new Error("Invalid path");
    const target = path.resolve(root, "." + relative);
    if (!target.startsWith(root + path.sep)) throw new Error("Invalid path");
    const bytes = await fs.readFile(target);
    res.setHeader("X-Content-Type-Options", "nosniff"); res.setHeader("X-Frame-Options", "SAMEORIGIN"); res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-src 'self'; frame-ancestors 'self'; worker-src 'none'; object-src 'none'");
    res.writeHead(200, { "Content-Type": mime[path.extname(target)] || "application/octet-stream", "Cache-Control": "no-cache" }); res.end(bytes);
  } catch { res.writeHead(404); res.end("Not found"); }
});
server.on("error", (e) => { console.error(e.code === "EADDRINUSE" ? `Port ${port} is occupied. Open the existing CircuitJS1 window or stop that service.` : e); process.exitCode = 1; });
server.listen(port, "127.0.0.1", () => console.log(`CircuitJS1: http://127.0.0.1:${port} (Ctrl+C stops the server)`));
