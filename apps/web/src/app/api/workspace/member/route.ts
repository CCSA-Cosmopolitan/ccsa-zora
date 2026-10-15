import { NextResponse, type NextRequest } from "next/server";
import { getDatabase } from "@/server/database";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fullName, phone, role, cluster, state } = body;

    if (!fullName || !phone) {
      return NextResponse.json(
        { error: "Full name and phone number are required" },
        { status: 400 }
      );
    }

    const orgId =
      process.env.NEXT_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001";
    const userId =
      process.env.ZORA_DEMO_USER_ID ?? "00000000-0000-4000-8000-000000000010";

    const { client } = getDatabase();

    const created = await client.begin(async (tx) => {
      // Set RLS tenant context
      await tx`
        select
          set_config('app.organization_id', ${orgId}, true),
          set_config('app.user_id', ${userId}, true),
          set_config('app.service', 'web', true)
      `;

      const rows = await tx`
        insert into public.farmer_profiles (
          organization_id,
          display_name,
          phone_e164_encrypted,
          preferred_language,
          community,
          state_code,
          active,
          attributes,
          updated_by,
          created_by
        ) values (
          ${orgId}::uuid,
          ${fullName},
          ${phone},
          'en',
          ${cluster || "Abuja Farm Cluster"},
          ${state ? state.slice(0, 2).toUpperCase() : "FC"},
          true,
          ${tx.json({ role: role || "Farmer" })}::jsonb,
          ${userId}::uuid,
          ${userId}::uuid
        )
        returning id, display_name, phone_e164_encrypted, community, state_code, created_at
      `;
      return rows[0];
    });

    return NextResponse.json({ success: true, member: created });
  } catch (error: any) {
    console.error("[Workspace Member API] Insert error:", error);
    return NextResponse.json(
      { error: "Failed to create farmer record in database", details: error?.message },
      { status: 500 }
    );
  }
}
