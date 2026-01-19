const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const inputCss = path.join(rootDir, "src", "tailwind.css");
const configPath = path.join(rootDir, "tailwind.config.cjs");
const outputCss = path.join(rootDir, "build", "tailwind.datafront.css");
const outputTs = path.join(rootDir, "src", "generated", "tailwind.ts");
const tailwindPackageJsonPath = require.resolve("tailwindcss/package.json");
const tailwindPackageDir = path.dirname(tailwindPackageJsonPath);
const tailwindBinField = require(tailwindPackageJsonPath).bin;
const tailwindBinRelativePath =
  typeof tailwindBinField === "string"
    ? tailwindBinField
    : tailwindBinField.tailwindcss;
const tailwindCliPath = path.resolve(
  tailwindPackageDir,
  tailwindBinRelativePath,
);

fs.mkdirSync(path.dirname(outputCss), { recursive: true });
fs.mkdirSync(path.dirname(outputTs), { recursive: true });

execFileSync(
  process.execPath,
  [
    tailwindCliPath,
    "-c",
    configPath,
    "-i",
    inputCss,
    "-o",
    outputCss,
    "--minify",
  ],
  { stdio: "inherit" },
);

const css = fs.readFileSync(outputCss, "utf8");
fs.unlinkSync(outputCss);
const escaped = css
  .replaceAll("\\", "\\\\")
  .replaceAll("`", "\\`")
  .replaceAll("${", "\\${");

fs.writeFileSync(
  outputTs,
  `export const datafrontTailwindCss = \`${escaped}\`;\n`,
  "utf8",
);

console.log(
  `Wrote ${path.relative(rootDir, outputTs)} (${css.length} bytes CSS)`,
);
