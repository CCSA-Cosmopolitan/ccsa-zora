import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const ignoredDirectories = new Set([
  ".expo",
  ".git",
  ".mypy_cache",
  ".next",
  ".pytest_cache",
  ".ruff_cache",
  ".turbo",
  ".venv",
  "build",
  "dist",
  "node_modules",
]);
const sourceExtensions = new Set([".ts", ".tsx"]);
const files = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (
      entry.isDirectory() &&
      (ignoredDirectories.has(entry.name) ||
        entry.name.startsWith(".next-") ||
        entry.name.startsWith("dist-"))
    ) {
      continue;
    }

    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      walk(path);
    } else {
      files.push(path);
    }
  }
}

walk(".");

for (const jsonPath of files.filter((path) => extname(path) === ".json")) {
  JSON.parse(readFileSync(jsonPath, "utf8"));
}

const unresolved = [];
const importPattern = /from\s+["'](\.[^"']+)["']/g;

for (const sourcePath of files.filter((path) => sourceExtensions.has(extname(path)))) {
  const source = readFileSync(sourcePath, "utf8");

  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1];
    if (!specifier) {
      continue;
    }

    const target = resolve(dirname(sourcePath), specifier);
    const candidates = [
      target,
      `${target}.ts`,
      `${target}.tsx`,
      `${target}.js`,
      `${target}.mjs`,
      join(target, "index.ts"),
      join(target, "index.tsx"),
      join(target, "index.js"),
    ];

    if (!candidates.some((candidate) => existsSync(candidate))) {
      unresolved.push(`${sourcePath} -> ${specifier}`);
    }
  }
}

if (unresolved.length > 0) {
  throw new Error(`Unresolved relative imports:\n${unresolved.join("\n")}`);
}

console.log(
  `Structure validation passed (${files.length} files; JSON and relative imports checked).`,
);
