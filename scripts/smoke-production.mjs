const webBase = normalizeUrl("ZORA_WEB_URL");
const kgmlBase = normalizeUrl("ZORA_KGML_URL");

function normalizeUrl(name) {
  const raw = process.env[name]?.trim();
  if (!raw) throw new Error(`${name} is required.`);
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url.toString().replace(/\/$/, "");
}

async function check(label, url, expectedService) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      redirect: "error",
      signal: controller.signal,
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`${label} returned HTTP ${response.status}: ${JSON.stringify(body)}`);
    }
    if (expectedService && body?.service !== expectedService) {
      throw new Error(`${label} returned an unexpected service identifier.`);
    }
    console.log(`PASS ${label} (${response.status})`);
  } finally {
    clearTimeout(timeout);
  }
}

await check("KGML liveness", `${kgmlBase}/health`, "ccsa-zora-intelligence-api");
await check("KGML readiness", `${kgmlBase}/ready`);
await check("web liveness", `${webBase}/api/health`, "ccsa-zora-web-api");
await check("web readiness", `${webBase}/api/ready`, "ccsa-zora-web-api");

console.log("CCSA Zora production smoke checks passed.");
