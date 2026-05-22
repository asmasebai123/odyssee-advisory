import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Identifiant de facture manquant" },
      { status: 400 }
    );
  }

  const supabase = createClient();
  
  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProd = process.env.NODE_ENV === "production";
  
  let currentUserId: string | null = null;
  let currentUserRole: string = "client";

  // Use admin service role client to fetch full invoice with client info (which normal client RLS might block)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Configuration Supabase manquante" },
      { status: 500 }
    );
  }

  const supabaseAdmin = createServiceClient(supabaseUrl, supabaseServiceKey);

  if (user) {
    currentUserId = user.id;
    // Fetch user profile to check role
    const { data: profile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (profile) {
      currentUserRole = profile.role;
    }
  } else if (isProd) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  } else {
    // In dev environment, act as avocat if no session exists
    currentUserRole = "avocat";
  }

  // Fetch the invoice with dossier and client profile details
  const { data: facture, error: factureError } = await supabaseAdmin
    .from("factures")
    .select("*, dossier:dossiers(*, client:users(*))")
    .eq("id", id)
    .single();

  if (factureError || !facture) {
    return NextResponse.json(
      { success: false, error: "Facture introuvable" },
      { status: 404 }
    );
  }

  // Check authorization:
  // - If avocat, authorized.
  // - If client, authorized only if dossier.client_id === currentUserId
  if (currentUserRole !== "avocat") {
    const dossierClientId = facture.dossier?.client_id;
    if (dossierClientId !== currentUserId) {
      return NextResponse.json(
        { success: false, error: "Accès refusé" },
        { status: 403 }
      );
    }
  }

  return NextResponse.json({ success: true, facture });
}
