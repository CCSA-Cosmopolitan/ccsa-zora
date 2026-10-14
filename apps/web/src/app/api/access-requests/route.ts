import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { apiError } from "@/server/responses";
import { getDatabase } from "@/server/database";
import { accessRequestInputSchema } from "@/server/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;
const CONSENT_VERSION = "access-request-v1";

function acceptedResponse() {
  return NextResponse.json(
    {
      status: "received",
      message: "Your request has been received for institutional review. Credentials will be sent upon approval.",
    },
    { status: 202, headers: { "cache-control": "no-store" } },
  );
}

async function sendNotificationEmail(params: {
  fullName: string;
  email: string;
  organizationName: string;
  role: string;
  phone?: string;
  useCase: string;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY not configured; skipping email notification");
    return;
  }
  const adminEmail = process.env.ACCESS_NOTIFICATION_EMAIL || "abdulrahman.dauda@cosmopolitan.edu.ng";
  const fimsUrl = process.env.FIMS_API_URL || "http://localhost:3000";
  const reviewUrl = `${fimsUrl}/requests/zora-requests`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>New Zora Workspace Access Request</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #1e293b; margin: 0; padding: 20px; background-color: #f8fafc; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
          .header { background: #075d37; color: #ffffff; padding: 24px 28px; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
          .header p { margin: 4px 0 0; opacity: 0.9; font-size: 13px; }
          .content { padding: 28px; }
          .field { margin-bottom: 14px; }
          .label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.5px; }
          .value { font-size: 14px; color: #0f172a; margin-top: 3px; font-weight: 500; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; font-size: 13px; color: #334155; }
          .btn { display: inline-block; background: #075d37; color: #ffffff !important; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 18px; }
          .footer { padding: 16px 28px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1>CCSA Zora — New Access Request</h1>
            <p>Centre for Climate-Smart Agriculture · Cosmopolitan University Abuja</p>
          </div>
          <div class="content">
            <p style="margin-top: 0; font-size: 14px; color: #334155;">
              A new user has submitted a request for institutional access to the <strong>CCSA Zora</strong> workspace.
            </p>
            <div class="field">
              <div class="label">Applicant Name</div>
              <div class="value">${params.fullName}</div>
            </div>
            <div class="field">
              <div class="label">Organization / State ADP</div>
              <div class="value">${params.organizationName}</div>
            </div>
            <div class="field">
              <div class="label">Agricultural Role</div>
              <div class="value"><span class="badge">${params.role}</span></div>
            </div>
            <div class="field">
              <div class="label">Work Email</div>
              <div class="value"><a href="mailto:${params.email}" style="color: #075d37;">${params.email}</a></div>
            </div>
            ${params.phone ? `<div class="field"><div class="label">Phone / WhatsApp</div><div class="value">${params.phone}</div></div>` : ""}
            <div class="field">
              <div class="label">Intended Use & Operational Focus</div>
              <div class="box">${params.useCase}</div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${reviewUrl}" class="btn">Review & Grant Access in FIMS</a>
            </div>
          </div>
          <div class="footer">
            Centre for Climate-Smart Agriculture (CCSA) · Automated notification to ${adminEmail}
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CCSA Zora <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `New Zora Access Request: ${params.fullName} (${params.organizationName})`,
        html,
        text: `New Zora Access Request\n\nName: ${params.fullName}\nEmail: ${params.email}\nOrg: ${params.organizationName}\nRole: ${params.role}\nUse Case: ${params.useCase}\n\nReview in FIMS: ${reviewUrl}`,
      }),
    });
  } catch (err) {
    console.warn("Failed to dispatch Resend email notification:", err);
  }
}

async function syncToFims(params: {
  fullName: string;
  email: string;
  organizationName: string;
  role: string;
  phone?: string;
  useCase: string;
}) {
  const fimsUrl = process.env.FIMS_API_URL || "http://localhost:3000";
  try {
    await fetch(`${fimsUrl}/api/public/zora-access-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      // Short timeout to not delay response if FIMS is starting
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.warn("Notice: FIMS sync endpoint was not reachable:", err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body is too large" }, { status: 413 });
    }
    if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
    }

    const input = accessRequestInputSchema.parse(body);

    // Honeypot check
    if (input.website) return acceptedResponse();

    // 1. Dispatch email alert to abdulrahman.dauda@cosmopolitan.edu.ng
    sendNotificationEmail({
      fullName: input.fullName,
      email: input.email,
      organizationName: input.organizationName,
      role: input.requestedRole,
      phone: input.phone,
      useCase: input.useCase,
    }).catch((e) => console.warn("Email alert error:", e));

    // 2. Sync to FIMS dashboard database
    syncToFims({
      fullName: input.fullName,
      email: input.email,
      organizationName: input.organizationName,
      role: input.requestedRole,
      phone: input.phone,
      useCase: input.useCase,
    }).catch((e) => console.warn("FIMS sync error:", e));

    // 3. Try to save to local Zora Neon DB if configured
    const fingerprintSalt = process.env.ACCESS_REQUEST_HASH_SALT?.trim();
    if (fingerprintSalt && fingerprintSalt.length >= 32) {
      const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      const address = forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
      const fingerprint = createHash("sha256").update(`${fingerprintSalt}:${address}`).digest("hex");

      try {
        const { client } = getDatabase();
        await client`
          select public.submit_access_request(
            ${input.fullName},
            ${input.email},
            ${input.organizationName},
            ${input.requestedRole},
            ${input.country || null},
            ${input.useCase},
            ${CONSENT_VERSION},
            ${fingerprint},
            ${client.json({ source: "zora_web", phone: input.phone })}::jsonb
          ) as request_id
        `;
      } catch (dbErr) {
        // If Neon DB has rate limit or offline, proceed since email and FIMS sync fired
        console.warn("Neon access_request notice:", dbErr);
      }
    }

    return acceptedResponse();
  } catch (error) {
    return apiError(error);
  }
}
