const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const inputPath = path.join(rootDir, "dist", "datafront.user.js");
const outputPath = path.join(rootDir, "dist", "datafront.meta.js");
const source = fs.readFileSync(inputPath, "utf8");
const match = source.match(
  /(^\/\/ ==UserScript==[\s\S]*?^\/\/ ==\/UserScript==)/m,
);

if (!match) {
  console.error("build-userscript-meta: userscript metadata block not found");
  process.exit(1);
}

const metaBlock = `${match[1]}\n`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, metaBlock, "utf8");

console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
