import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") || "";
  
  if (!q.trim()) {
    return NextResponse.json({ results: [] });
  }

  // Determine user role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAvocat = profile?.role === "avocat";

  // Use service role to search securely based on permissions
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const admin = createAdminClient(supabaseUrl, serviceKey);

  const results: any[] = [];

  try {
    if (isAvocat) {
      // 1. Search clients
      const { data: clients } = await admin
        .from("users")
        .select("id, prenom, nom, email")
        .eq("role", "client")
        .or(`nom.ilike.%${q}%,prenom.ilike.%${q}%,email.ilike.%${q}%`)
        .limit(5);

      if (clients) {
        clients.forEach((c: any) => {
          results.push({
            id: c.id,
            title: `${c.prenom} ${c.nom}`,
            subtitle: c.email,
            type: "client",
            url: `/admin?tab=clients&search=${encodeURIComponent(c.email)}`,
          });
        });
      }

      // 2. Search dossiers
      const { data: dossiers } = await admin
        .from("dossiers")
        .select("id, titre, type_service, users(prenom, nom)")
        .or(`titre.ilike.%${q}%,type_service.ilike.%${q}%`)
        .limit(5);

      if (dossiers) {
        dossiers.forEach((d: any) => {
          const clientName = d.users ? `${d.users.prenom} ${d.users.nom}` : "Client";
          results.push({
            id: d.id,
            title: d.titre,
            subtitle: `${d.type_service} · ${clientName}`,
            type: "dossier",
            url: `/dossiers/${d.id}`,
          });
        });
      }

      // 3. Search documents
      const { data: documents } = await admin
        .from("documents")
        .select("id, nom, type, dossier_id")
        .ilike("nom", `%${q}%`)
        .limit(5);

      if (documents) {
        documents.forEach((d: any) => {
          results.push({
            id: d.id,
            title: d.nom,
            subtitle: `Document ${d.type}`,
            type: "document",
            url: `/dossiers/${d.dossier_id}`,
          });
        });
      }

      // 4. Search factures
      const { data: factures } = await admin
        .from("factures")
        .select("id, reference, libelle, montant, dossier_id")
        .or(`reference.ilike.%${q}%,libelle.ilike.%${q}%`)
        .limit(5);

      if (factures) {
        factures.forEach((f: any) => {
          results.push({
            id: f.id,
            title: f.reference || f.libelle || "Facture",
            subtitle: `${f.montant} €`,
            type: "invoice",
            url: `/dossiers/${f.dossier_id}`,
          });
        });
      }
    } else {
      // Client search (only search client's own items)
      // 1. Get client's dossiers
      const { data: myDossiers } = await admin
        .from("dossiers")
        .select("id")
        .eq("client_id", user.id);

      const dossierIds = myDossiers?.map((d: any) => d.id) || [];

      if (dossierIds.length > 0) {
        // Search dossiers
        const { data: dossiers } = await admin
          .from("dossiers")
          .select("id, titre, type_service")
          .in("id", dossierIds)
          .or(`titre.ilike.%${q}%,type_service.ilike.%${q}%`)
          .limit(5);

        if (dossiers) {
          dossiers.forEach((d: any) => {
            results.push({
              id: d.id,
              title: d.titre,
              subtitle: d.type_service,
              type: "dossier",
              url: `/dossier`,
            });
          });
        }

        // Search documents
        const { data: documents } = await admin
          .from("documents")
          .select("id, nom, type")
          .in("dossier_id", dossierIds)
          .ilike("nom", `%${q}%`)
          .limit(5);

        if (documents) {
          documents.forEach((d: any) => {
            results.push({
              id: d.id,
              title: d.nom,
              subtitle: `Document ${d.type}`,
              type: "document",
              url: `/documents`,
            });
          });
        }

        // Search factures
        const { data: factures } = await admin
          .from("factures")
          .select("id, reference, libelle, montant")
          .in("dossier_id", dossierIds)
          .or(`reference.ilike.%${q}%,libelle.ilike.%${q}%`)
          .limit(5);

        if (factures) {
          factures.forEach((f: any) => {
            results.push({
              id: f.id,
              title: f.reference || f.libelle || "Facture",
              subtitle: `${f.montant} €`,
              type: "invoice",
              url: `/factures`,
            });
          });
        }
      }
    }
  } catch (err) {
    console.error("Search API runtime error:", err);
  }

  return NextResponse.json({ results });
}
