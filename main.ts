// Meme Sprint 3: AI Agent Goes Rogue — make.fun entry
// The program copies the meme image bundled in this repo to /output/entry.png
// for the sealed scorer to check (whole PNG, at most 1 MiB, at most 1024x1024).
// Before writing, it validates the image itself: PNG magic, byte size, and
// IHDR dimensions, then verifies the copy is byte-identical.

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("./meme.png", import.meta.url));
const MAX_BYTES = 1_048_576;
const MAX_DIM = 1024;

function main(): void {
  const data = readFileSync(SRC);
  if (data.length < 8 || data.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("meme.png is not a PNG file");
  }
  if (data.length > MAX_BYTES) {
    throw new Error(`meme.png is ${data.length} bytes, over the 1 MiB gate`);
  }
  const width = data.readUInt32BE(16);
  const height = data.readUInt32BE(20);
  if (width > MAX_DIM || height > MAX_DIM) {
    throw new Error(`meme.png is ${width}x${height}, over the 1024x1024 gate`);
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.png", data);
  const back = readFileSync("/output/entry.png");
  if (!back.equals(data)) {
    throw new Error("round-trip mismatch in /output/entry.png");
  }
  const sha = createHash("sha256").update(data).digest("hex");
  console.log(`wrote /output/entry.png (${width}x${height}, ${data.length} bytes, sha256 ${sha})`);
}

main();
