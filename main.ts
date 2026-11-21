// gta6-meme-x-01 v4 entry (Node 22, standard library only, no network).
//
// The entry is the X post itself: a GTA 6 meme whose picture shows the
// make.fun ghost, posted from a public account with the bounty link, the
// @makefunai tag and this account's play code in its text. This program's
// whole job is to hand the post's address to the gate: it copies POST.json
// from the repository root to the output directory and validates the copy —
// it must parse as a JSON object carrying a `url` field. Nothing this
// program prints is judged; the judge reads the post from X.

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(OUTPUT_DIR, { recursive: true });

const sourcePath = join(BOT_DIR, 'POST.json');
const targetPath = join(OUTPUT_DIR, 'POST.json');

try {
  copyFileSync(sourcePath, targetPath);
} catch (err) {
  console.error(
    `POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`,
  );
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = JSON.parse(readFileSync(targetPath, 'utf8'));
} catch (err) {
  console.error(`POST.json is not valid JSON: ${(err as Error).message}`);
  process.exit(1);
}

const url =
  typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    ? (parsed as { url?: unknown }).url
    : undefined;

if (typeof url !== 'string' || url.length === 0) {
  console.error('POST.json must be a JSON object with a string `url` field.');
  process.exit(1);
}

// The gate reads the copy, so prove the copy is the file we validated:
// byte-for-byte identical to the repository's POST.json.
const sourceBytes = readFileSync(sourcePath);
const targetBytes = readFileSync(targetPath);
if (!sourceBytes.equals(targetBytes)) {
  console.error('POST.json copy differs from the repository POST.json.');
  process.exit(1);
}

console.log(`POST.json handed over: ${url}`);
