import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const sourceName = process.argv[2] === "dist" ? "dist" : "src";
const sourceRoot = path.join(root, sourceName);
const port = Number(process.env.PORT || 4174);

http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  const filePath = path.resolve(sourceRoot, relativePath);
  if (!filePath.startsWith(sourceRoot) || !fs.existsSync(filePath)) {
    if (relativePath === "config.js") {
      response.setHeader("Content-Type", "text/javascript; charset=utf-8");
      response.end(`window.APP_CONFIG = Object.freeze({SUPABASE_URL:"",SUPABASE_ANON_KEY:"",SERVICE_NAME:"boardgame-score"});`);
      return;
    }
    response.writeHead(404).end("Not found");
    return;
  }
  const mime = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
  response.setHeader("Content-Type", `${mime[path.extname(filePath)] || "application/octet-stream"}; charset=utf-8`);
  fs.createReadStream(filePath).pipe(response);
}).listen(port, () => console.log(`Boardgame Score: http://localhost:${port}`));
