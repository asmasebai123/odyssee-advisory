import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sendDocumentUploadedEmail } from "@/lib/resend";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/client/dossier — Récupère de manière sécurisée l'ensemble du dossier actif du client
 * (dossier, profil, documents, factures, messages) sous service_role pour contourner RLS.
 */
export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // 1. Initialiser le client de session pour récupérer l'utilisateur connecté
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseSession = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string): string | undefined {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions): void {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });

  const { data: { user } } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  }

  // 2. Initialiser le client privilégié service_role
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url: RequestInfo | URL, options?: RequestInit) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });

  try {
    // 3. Charger le profil client
    const { data: profile, error: profErr } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profErr || !profile) {
      return NextResponse.json({
        success: true,
        profile: {
          id: user.id,
          email: user.email || "",
          prenom: user.user_metadata?.prenom || "Client",
          nom: user.user_metadata?.nom || "",
          role: "client"
        },
        dossier: null,
        documents: [],
        factures: [],
        messages: []
      });
    }

    // 4. Charger TOUS les dossiers du client (le plus récent = dossier "actif")
    const { data: dossiersList } = await supabaseAdmin
      .from("dossiers")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    const dossiers = dossiersList || [];
    const dossier = dossiers[0] || null;

    if (!dossier) {
      return NextResponse.json({
        success: true,
        profile,
        dossier: null,
        documents: [],
        factures: [],
        messages: []
      });
    }

    // 5. Agréger documents / factures / messages sur TOUS les dossiers du client
    //    (évite qu'une pièce demandée sur un autre dossier reste invisible)
    const dossierIds = dossiers.map((d: any) => d.id);

    const { data: documents } = await supabaseAdmin
      .from("documents")
      .select("*")
      .in("dossier_id", dossierIds)
      .order("created_at", { ascending: false });

    const { data: factures } = await supabaseAdmin
      .from("factures")
      .select("*")
      .in("dossier_id", dossierIds)
      .order("created_at", { ascending: false });

    const { data: messages } = await supabaseAdmin
      .from("messages")
      .select(`
        *,
        auteur:users!messages_auteur_id_fkey (
          prenom,
          nom,
          role
        )
      `)
      .in("dossier_id", dossierIds)
      .order("created_at", { ascending: true });

    // 6. Le conseil référent du cabinet (avocat réel en base)
    const { data: avocat } = await supabaseAdmin
      .from("users")
      .select("prenom, nom, email, telephone")
      .eq("role", "avocat")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      profile,
      dossier,
      documents: documents || [],
      factures: factures || [],
      messages: messages || [],
      avocat: avocat || null
    });

  } catch (err: any) {
    console.error("CLIENT DOSSIER FETCH ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/client/dossier — Effectue des actions d'écriture (envoyer un message, lier un document uploadé)
 * de manière sécurisée sous service_role après vérification de session.
 */
export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // 1. Authentifier l'utilisateur connecté
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabaseSession = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string): string | undefined {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions): void {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions): void {
        request.cookies.set({ name, value: "", ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabaseSession.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "Non authentifié." },
      { status: 401 }
    );
  }

  // 2. Initialiser le client privilégié
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action manquante." },
        { status: 400 }
      );
    }

    // A. Récupérer le dossier de l'utilisateur pour vérifier que l'action s'applique bien à son propre dossier
    const { data: dossier, error: dosErr } = await supabaseAdmin
      .from("dossiers")
      .select("id")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!dossier) {
      return NextResponse.json(
        { success: false, error: "Aucun dossier trouvé pour ce compte client." },
        { status: 404 }
      );
    }

    if (action === "send-message") {
      const { contenu } = payload;
      if (!contenu || !contenu.trim()) {
        return NextResponse.json(
          { success: false, error: "Contenu du message obligatoire." },
          { status: 400 }
        );
      }

      const { error } = await supabaseAdmin
        .from("messages")
        .insert({
          dossier_id: dossier.id,
          auteur_id: user.id,
          contenu: contenu.trim(),
          lu: false
        });

      if (error) throw new Error("Message insert error: " + error.message);

      return NextResponse.json({ success: true });
    }

    if (action === "upload-document") {
      const { nom, url, type, documentId } = payload;
      if (!nom || !url || !type) {
        return NextResponse.json(
          { success: false, error: "Nom, url et type obligatoires." },
          { status: 400 }
        );
      }

      let dbError;
      if (documentId) {
        // Only update the url — nom keeps its original requested name so the client knows what it was
        const { error } = await supabaseAdmin
          .from("documents")
          .update({ url })
          .eq("id", documentId);
        dbError = error;
      } else {
        const { error } = await supabaseAdmin
          .from("documents")
          .insert({
            dossier_id: dossier.id,
            nom: nom.trim(),
            url,
            type,
            signe: false
          });
        dbError = error;
      }

      if (dbError) throw new Error("Document save error: " + dbError.message);

      // Notification par e-mail à l'avocat (avocat@test.com)
      try {
        const { data: clientProfile } = await supabaseAdmin
          .from("users")
          .select("prenom, nom")
          .eq("id", user.id)
          .single();

        const { data: dossierDetails } = await supabaseAdmin
          .from("dossiers")
          .select("titre")
          .eq("id", dossier.id)
          .single();

        if (clientProfile) {
          const clientName = `${clientProfile.prenom} ${clientProfile.nom}`;
          const dossierTitle = (dossierDetails && dossierDetails.titre) || "Accompagnement";
          await sendDocumentUploadedEmail(
            "avocat@test.com",
            clientName,
            dossierTitle,
            nom.trim()
          );
        }
      } catch (emailErr) {
        console.error("Failed to send doc uploaded email notification:", emailErr);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "pay-invoice") {
      const { invoiceId } = payload;
      if (!invoiceId) {
        return NextResponse.json(
          { success: false, error: "invoiceId obligatoire." },
          { status: 400 }
        );
      }

      // Verify invoice belongs to client's dossier before updating
      const { data: invoice } = await supabaseAdmin
        .from("factures")
        .select("dossier_id")
        .eq("id", invoiceId)
        .single();

      if (!invoice || invoice.dossier_id !== dossier.id) {
        return NextResponse.json(
          { success: false, error: "Facture introuvable ou accès non autorisé." },
          { status: 403 }
        );
      }

      const { error } = await supabaseAdmin
        .from("factures")
        .update({ statut: "payee" })
        .eq("id", invoiceId);

      if (error) throw new Error("Facture update error: " + error.message);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: `Action '${action}' inconnue.` },
      { status: 400 }
    );

  } catch (err: any) {
    console.error("CLIENT ACTION ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}
