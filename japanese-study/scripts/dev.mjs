import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const requestedRoot = process.argv[2] === "dist" ? "dist" : "src";
const publicRoot = path.join(root, requestedRoot);
const port = Number(process.env.PORT || 4173);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  let filePath = path.resolve(publicRoot, relativePath);

  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403).end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) && requestedRoot === "src") {
    filePath = path.resolve(path.join(root, "public"), relativePath);
  }
  if (!fs.existsSync(filePath) && relativePath === "config.js") {
    response.setHeader("Content-Type", mimeTypes[".js"]);
    response.end(`window.APP_CONFIG = Object.freeze({SUPABASE_URL:"",SUPABASE_ANON_KEY:"",SERVICE_NAME:"japanese-study"});`);
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    response.writeHead(404).end("Not found");
    return;
  }

  response.setHeader("Content-Type", mimeTypes[path.extname(filePath)] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(response);
}).listen(port, () => console.log(`Japanese Study: http://localhost:${port}`));
