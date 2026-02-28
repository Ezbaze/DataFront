const fs = require("node:fs");
const path = require("node:path");

const target = process.argv[2];
if (!target) {
  console.error("normalize-lf: missing target path");
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), target);
const content = fs.readFileSync(absolutePath, "utf8");
const normalized = content.replace(/\r\n/g, "\n");

if (normalized !== content) {
  fs.writeFileSync(absolutePath, normalized, "utf8");
}
