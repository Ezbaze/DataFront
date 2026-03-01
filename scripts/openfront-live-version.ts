#!/usr/bin/env node

import process from "node:process";
import {
  createOpenFrontApiClient,
  DEFAULT_OPENFRONT_SITE,
  OpenFrontApiError,
  shortHash,
} from "../src/shared/api-client.js";

type CliOptions = {
  site: string;
  json: boolean;
  help?: boolean;
};

function writeLine(text = ""): void {
  process.stdout.write(`${text}\n`);
}

function writeErrorLine(text: string): void {
  process.stderr.write(`${text}\n`);
}

function printHelp(): void {
  writeLine(`Get current live OpenFront commit.

Usage:
  node ./build/scripts/openfront-live-version.js [options]

Options:
  --site <url>     OpenFront base URL (default: ${DEFAULT_OPENFRONT_SITE})
  --json           Print JSON output
  --help           Show this help
`);
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    site: DEFAULT_OPENFRONT_SITE,
    json: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }
    if (arg === "--json") {
      opts.json = true;
      continue;
    }
    if (arg === "--site") {
      const value = argv[i + 1];
      if (!value) throw new Error("Missing value for --site");
      opts.site = value;
      i += 1;
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return opts;
}

function normalizeSite(site: string): string {
  return site.replace(/\/+$/, "");
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const site = normalizeSite(options.site);
  const client = createOpenFrontApiClient({ site });
  const {
    commit: liveCommit,
    sourceUrl,
    sourceType,
  } = await client.getLiveCommit();

  const report = {
    site,
    sourceUrl,
    sourceType,
    liveCommit,
  };

  if (options.json) {
    writeLine(JSON.stringify(report, null, 2));
    return;
  }

  writeLine(`Live site:           ${site}`);
  writeLine(`Live commit source:  ${sourceUrl} (${sourceType})`);
  writeLine(`Live commit:         ${liveCommit} (${shortHash(liveCommit)})`);
}

main().catch((error: unknown) => {
  if (error instanceof OpenFrontApiError) {
    writeErrorLine(`Error [${error.code}]: ${error.message}`);
    if (error.context.url) {
      writeErrorLine(`URL: ${error.context.url}`);
    }
    process.exit(1);
  }

  writeErrorLine(
    `Error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
});
