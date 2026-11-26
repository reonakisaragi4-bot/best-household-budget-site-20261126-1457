// Tiny static server for local testing: serves app/ at http://localhost:8080.
// Usage: node serve.ts [--port 8080]
// Only ever serves files under app/, nothing else on disk.

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "app");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
};

let port = 8080;
const flagAt = process.argv.indexOf("--port");
if (flagAt >= 0 && process.argv[flagAt + 1]) {
  const parsed = Number(process.argv[flagAt + 1]);
  if (Number.isInteger(parsed) && parsed > 0 && parsed < 65536) port = parsed;
}

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const rel = normalize(path).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]/, "");
    const file = resolve(appRoot, rel === "" ? "index.html" : rel);
    if (!file.startsWith(appRoot)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { "Content-Type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log("app/ is on http://localhost:" + port);
});
