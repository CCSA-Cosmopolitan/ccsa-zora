import { createHmac } from "node:crypto";

const masterSecret = process.env.IOT_INGEST_SECRET?.trim();
const organizationId = process.env.ZORA_IOT_ORGANIZATION_ID?.trim()?.toLowerCase();

if (!masterSecret || masterSecret.length < 32) {
  throw new Error("IOT_INGEST_SECRET must contain at least 32 characters.");
}
if (!organizationId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(organizationId)) {
  throw new Error("ZORA_IOT_ORGANIZATION_ID must be a valid UUID.");
}

const gatewaySecret = createHmac("sha256", masterSecret)
  .update(`zora-iot:${organizationId}`)
  .digest("base64url");

console.log(gatewaySecret);
