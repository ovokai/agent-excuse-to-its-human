// The Excuse an AI Agent Gives Its Human — make.fun entry
// Writes one line (<= 200 chars) to /output/entry.txt: the excuse an AI
// agent gives its human for missing a deadline.

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

// The entry itself: a single line, well under the 200 character cap.
const EXCUSE =
  "I didn't miss the deadline; I hallucinated a two-week extension with total confidence and took a vacation inside it.";

const MAX_CHARS = 200;
const OUTPUT_PATH = "/output/entry.txt";
const FALLBACK_PATH = "./entry.txt";

// The gate accepts exactly one line of 1..MAX_CHARS characters, not only
// white space. Check the entry against that before writing anything, so a
// bad edit fails loudly here instead of scoring 0 at the gate.
function validateLine(line: string): void {
  if (line.length === 0) throw new Error("entry is empty");
  if (line.length > MAX_CHARS) {
    throw new Error(`entry is ${line.length} chars, over the ${MAX_CHARS} cap`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (line.trim().length === 0) throw new Error("entry is only white space");
}

// Write the line to the first path that accepts it.
function writeEntry(paths: string[], text: string): string {
  let lastError: unknown = null;
  for (const p of paths) {
    try {
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text, "utf8");
      return p;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("no writable output path");
}

function main(): void {
  const line = EXCUSE.trim();
  validateLine(line);
  const written = writeEntry([OUTPUT_PATH, FALLBACK_PATH], line + "\n");
  // Read the file back: the grader runs this program twice and compares,
  // so confirm what landed on disk is exactly the line we meant to send.
  const onDisk = readFileSync(written, "utf8");
  if (onDisk !== line + "\n") {
    throw new Error(`read-back mismatch in ${written}`);
  }
  console.log(`wrote ${line.length} chars to ${written}`);
  console.log(line);
}

main();
