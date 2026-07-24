import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "dist");

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
copyDirectory(path.join(root, "src"), output);
copyDirectory(path.join(root, "public"), output);

const config = {
  SUPABASE_URL: process.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || "",
  SERVICE_NAME: "japanese-study"
};

fs.writeFileSync(
  path.join(output, "config.js"),
  `window.APP_CONFIG = Object.freeze(${JSON.stringify(config, null, 2)});\n`,
  "utf8"
);

console.log(`Japanese Study build complete: ${output}`);

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}
