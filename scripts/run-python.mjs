import { spawnSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const apiDir = path.join(projectRoot, "apps", "kgml-api");

// Check if uv is available
function hasUv() {
  try {
    const result = spawnSync("uv", ["--version"], { stdio: "ignore" });
    return result.status === 0;
  } catch {
    return false;
  }
}

// Find local venv python or system python
function getPythonBinary() {
  const winVenv = path.join(apiDir, ".venv", "Scripts", "python.exe");
  const posixVenv = path.join(apiDir, ".venv", "bin", "python");

  if (process.platform === "win32" && fs.existsSync(winVenv)) {
    return winVenv;
  }
  if (fs.existsSync(posixVenv)) {
    return posixVenv;
  }
  return "python";
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: node scripts/run-python.mjs <command...>");
  process.exit(1);
}

if (hasUv()) {
  const child = spawn("uv", ["--directory", apiDir, "run", ...args], {
    cwd: projectRoot,
    stdio: "inherit",
    shell: true,
  });
  child.on("exit", (code) => process.exit(code ?? 0));
} else {
  const pythonBin = getPythonBinary();
  const child = spawn(pythonBin, args, {
    cwd: apiDir,
    stdio: "inherit",
    env: {
      ...process.env,
      PYTHONPATH: apiDir,
    },
    shell: false,
  });
  child.on("exit", (code) => process.exit(code ?? 0));
}
