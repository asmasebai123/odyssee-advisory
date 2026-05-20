import { NextResponse, type NextRequest } from "next/server";
import { adminGuard } from "@/lib/admin-guard";

/**
 * GET /api/admin/diagnose-schema — vérifie le schéma Supabase exposé via REST.
 * Protégé par adminGuard.
 */
export async function GET(request: NextRequest) {
  const blocked = adminGuard(request);
  if (blocked) return blocked;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseServiceKey,
        Accept: "application/openapi+json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed: ${res.statusText}` });
    }

    const schema = await res.json();
    const usersTableDef = schema.definitions?.users;
    const facturesTableDef = schema.definitions?.factures;
    const documentsTableDef = schema.definitions?.documents;

    return NextResponse.json({
      tables: schema.definitions ? Object.keys(schema.definitions) : [],
      usersColumns: usersTableDef?.properties
        ? Object.keys(usersTableDef.properties)
        : [],
      facturesColumns: facturesTableDef?.properties
        ? Object.keys(facturesTableDef.properties)
        : [],
      documentsColumns: documentsTableDef?.properties
        ? Object.keys(documentsTableDef.properties)
        : [],
      facturesDefinition: facturesTableDef,
      documentsDefinition: documentsTableDef,
      fullSchemaInfo: schema.info,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message });
  }
}
