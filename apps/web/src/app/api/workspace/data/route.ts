import { NextResponse, type NextRequest } from "next/server";
import { getDatabase } from "@/server/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const orgId =
      process.env.NEXT_PUBLIC_ZORA_ORGANIZATION_ID ?? "00000000-0000-4000-8000-000000000001";
    const userId =
      process.env.ZORA_DEMO_USER_ID ?? "00000000-0000-4000-8000-000000000010";

    const { client } = getDatabase();

    const data = await client.begin(async (tx) => {
      // Set RLS tenant context
      await tx`
        select
          set_config('app.organization_id', ${orgId}, true),
          set_config('app.user_id', ${userId}, true),
          set_config('app.service', 'web', true)
      `;

      // 1. Organization details
      const orgRows = await tx`
        select id, name, slug, country_code from public.organizations where id = ${orgId}::uuid
      `;

      // 2. Real Farmer Profiles from DB
      const farmerRows = await tx`
        select
          id,
          display_name,
          phone_e164_encrypted,
          preferred_language,
          community,
          state_code,
          active,
          created_at
        from public.farmer_profiles
        where organization_id = ${orgId}::uuid
        order by created_at desc
        limit 50
      `;

      // 3. Real Advisory Sessions & Consultations from DB
      const sessionRows = await tx`
        select
          s.id,
          s.language,
          s.channel,
          s.status,
          s.summary,
          s.started_at,
          f.name as field_name,
          f.crop_code
        from public.advisory_sessions s
        left join public.fields f on f.id = s.field_id
        where s.organization_id = ${orgId}::uuid
        order by s.started_at desc
        limit 50
      `;

      // 4. Real Fields & Crops from DB
      const fieldRows = await tx`
        select id, name, crop_code, area_hectares, status
        from public.fields
        where organization_id = ${orgId}::uuid and archived_at is null
        order by name asc
      `;

      // 5. Total counts
      const counts = await tx`
        select
          (select count(*)::int from public.farmer_profiles where organization_id = ${orgId}::uuid) as farmer_count,
          (select count(*)::int from public.fields where organization_id = ${orgId}::uuid and archived_at is null) as field_count,
          (select count(*)::int from public.advisory_sessions where organization_id = ${orgId}::uuid) as advisory_count
      `;

      return {
        organization: orgRows[0] ?? {
          id: orgId,
          name: "CCSA Zora Abuja Pilot",
          slug: "ccsa-zora-abuja-pilot",
        },
        farmers: farmerRows,
        advisories: sessionRows,
        fields: fieldRows,
        metrics: counts[0] ?? { farmer_count: 0, field_count: 0, advisory_count: 0 },
      };
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Workspace Data API] Database query error:", error);
    return NextResponse.json(
      { error: "Database query failed", details: error?.message },
      { status: 500 }
    );
  }
}
