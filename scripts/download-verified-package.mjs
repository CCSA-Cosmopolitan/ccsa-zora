import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, open, readFile, stat, writeFile } from "node:fs/promises";
import https from "node:https";
import path from "node:path";
import process from "node:process";

const [url, destinationArg, totalBytesArg, expectedDigest, chunkSizeArg = "65536", concurrencyArg = "8"] =
  process.argv.slice(2);

if (!url || !destinationArg || !totalBytesArg || !expectedDigest) {
  throw new Error(
    "Usage: node download-verified-package.mjs <url> <destination> <total-bytes> <sha512-base64> [chunk-size] [concurrency]",
  );
}

const destination = path.resolve(destinationArg);
const workspace = process.cwd();
const temporaryRoot = path.join(workspace, ".tmp") + path.sep;

if (!destination.startsWith(temporaryRoot)) {
  throw new Error(`Destination must be inside ${temporaryRoot}`);
}

const totalBytes = Number(totalBytesArg);
const chunkSize = Number(chunkSizeArg);
const concurrency = Number(concurrencyArg);
const partDirectory = `${destination}.parts`;
const chunkCount = Math.ceil(totalBytes / chunkSize);

await mkdir(partDirectory, { recursive: true });

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function fetchRange(start, end) {
  return new Promise((resolve, reject) => {
    const request = https.get(
      url,
      {
        headers: {
          Accept: "application/octet-stream",
          Range: `bytes=${start}-${end}`,
          "User-Agent": "CCSA-Zora-build-validator/1.0",
        },
      },
      (response) => {
        if (response.statusCode !== 206) {
          response.resume();
          reject(new Error(`Expected HTTP 206 for ${start}-${end}; received ${response.statusCode}`));
          return;
        }

        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => resolve(Buffer.concat(chunks)));
        response.on("error", reject);
      },
    );

    request.setTimeout(30_000, () => request.destroy(new Error(`Range ${start}-${end} timed out`)));
    request.on("error", reject);
  });
}

async function downloadPart(index) {
  const start = index * chunkSize;
  const end = Math.min(totalBytes - 1, start + chunkSize - 1);
  const expectedLength = end - start + 1;
  const partPath = path.join(partDirectory, `${String(index).padStart(5, "0")}.part`);

  try {
    if ((await stat(partPath)).size === expectedLength) {
      return false;
    }
  } catch {
    // The part is not cached yet.
  }

  let lastError;
  for (let attempt = 1; attempt <= 20; attempt += 1) {
    try {
      const body = await fetchRange(start, end);
      if (body.length !== expectedLength) {
        throw new Error(`Range ${start}-${end} returned ${body.length} bytes; expected ${expectedLength}`);
      }
      await writeFile(partPath, body);
      return true;
    } catch (error) {
      lastError = error;
      await delay(Math.min(3_000, attempt * 250));
    }
  }

  throw lastError;
}

let cursor = 0;
let completed = 0;

async function worker() {
  while (cursor < chunkCount) {
    const index = cursor;
    cursor += 1;
    await downloadPart(index);
    completed += 1;
    if (completed % 25 === 0 || completed === chunkCount) {
      console.log(`Downloaded or verified ${completed}/${chunkCount} ranges`);
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

const output = await open(destination, "w");
try {
  for (let index = 0; index < chunkCount; index += 1) {
    const partPath = path.join(partDirectory, `${String(index).padStart(5, "0")}.part`);
    await output.write(await readFile(partPath));
  }
} finally {
  await output.close();
}

const actualDigest = await new Promise((resolve, reject) => {
  const hash = createHash("sha512");
  const input = createReadStream(destination);
  input.on("data", (chunk) => hash.update(chunk));
  input.on("end", () => resolve(hash.digest("base64")));
  input.on("error", reject);
});

if (actualDigest !== expectedDigest) {
  throw new Error(`SHA-512 mismatch: expected ${expectedDigest}, received ${actualDigest}`);
}

console.log(`Verified ${destination} (${totalBytes} bytes, SHA-512 match)`);
