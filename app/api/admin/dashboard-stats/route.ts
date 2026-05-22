import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAvocat } from "@/lib/auth-guard";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/dashboard-stats — Calcule et renvoie les métriques réelles du cabinet.
 * Réservé au cabinet (session + rôle avocat).
 */
export async function GET(request: NextRequest) {
  const guard = await requireAvocat(request);
  if (!guard.ok) return guard.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { success: false, error: "Missing Supabase keys" },
      { status: 500 }
    );
  }

  // Client admin pour bypasser RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    global: {
      fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });

  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = `${currentYear}-01-01T00:00:00Z`;

    // 1. Récupérer tous les dossiers
    const { data: dossiers, error: dosErr } = await supabase
      .from("dossiers")
      .select("*, client:users(*)")
      .order("created_at", { ascending: false });

    if (dosErr) throw new Error("Erreur dossiers: " + dosErr.message);

    // 2. Récupérer toutes les factures
    const { data: factures, error: facErr } = await supabase
      .from("factures")
      .select("*");

    if (facErr) throw new Error("Erreur factures: " + facErr.message);

    // 3. Récupérer les demandes (leads)
    let demandes: any[] = [];
    try {
      const { data: demData, error: demErr } = await supabase
        .from("demandes")
        .select("*")
        .eq("statut", "nouveau")
        .order("created_at", { ascending: false });
      
      if (!demErr && demData) {
        demandes = demData;
      }
    } catch (e) {
      console.warn("La table demandes n'existe peut-être pas encore. Repli automatique.", e);
    }

    // --- Calcul des KPIs ---

    // A. Dossiers actifs (statut !== 'cloture')
    const dossiersActifs = dossiers.filter(d => d.statut !== "cloture");
    const countDossiersActifs = dossiersActifs.length;

    // B. Volume conseillé (YTD) — Somme des montants des dossiers créés cette année
    const dossiersYTD = dossiers.filter(d => d.created_at >= startOfYear);
    const volumeConseilleYTD = dossiersYTD.reduce((sum, d) => sum + (Number(d.montant) || 0), 0);

    // C. Honoraires
    const totalFactures = factures.reduce((sum, f) => sum + (Number(f.montant) || 0), 0);
    const totalPaye = factures.filter(f => f.statut === "payee").reduce((sum, f) => sum + (Number(f.montant) || 0), 0);
    const pipeline = factures.filter(f => f.statut === "impayee").reduce((sum, f) => sum + (Number(f.montant) || 0), 0);

    // D. Délai moyen / dossier clôturé — "—" si aucun dossier encore clôturé
    const dossiersClotures = dossiers.filter(d => d.statut === "cloture" && d.updated_at && d.created_at);
    let delaiMoyen: number | null = null;
    if (dossiersClotures.length > 0) {
      const totalDays = dossiersClotures.reduce((sum, d) => {
        const diffMs = new Date(d.updated_at).getTime() - new Date(d.created_at).getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return sum + diffDays;
      }, 0);
      delaiMoyen = Math.round(totalDays / dossiersClotures.length);
    }

    // E. Évolution sur 12 mois (Graphique)
    // Nous allons regrouper les factures payées par mois sur les 12 derniers mois
    const revenueSeries = Array(12).fill(0);
    const monthsLabels = [];
    const dateCursor = new Date();
    
    // Initialise les libellés des 12 derniers mois (ex: "Jun", "Jul", etc.)
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(dateCursor.getMonth() - i);
      monthsLabels.push(monthNames[d.getMonth()]);
    }

    // Répartit les montants payés dans les bons mois
    factures.forEach(f => {
      if (f.statut !== "payee" || !f.created_at) return;
      
      const fDate = new Date(f.created_at);
      const diffMonths = (dateCursor.getFullYear() - fDate.getFullYear()) * 12 + (dateCursor.getMonth() - fDate.getMonth());
      
      if (diffMonths >= 0 && diffMonths < 12) {
        // L'index dans la série (0 correspond à il y a 11 mois, 11 correspond au mois en cours)
        const index = 11 - diffMonths;
        revenueSeries[index] += (Number(f.montant) || 0);
      }
    });

    // Série réelle en K€ — zéros si aucune facture payée (pas de données fictives)
    const finalSeries = revenueSeries.map(v => Math.round(v / 1000));

    // F. Nouvelles demandes (leads récents) — données réelles uniquement, tableau vide si aucune
    const finalDemandes = demandes.map(d => ({
      id: d.id,
      who: `${d.prenom} ${d.nom}`,
      topic: `${d.titre} · ${d.type_service}`,
      time: formatTimeAgo(d.created_at),
      urgent: d.montant > 5000000,
      email: d.email,
      prenom: d.prenom,
      nom: d.nom,
      telephone: d.telephone,
      montant: d.montant,
      type_service: d.type_service
    }));

    // G. Clients/Dossiers actifs récents
    const recentClients = dossiersActifs.slice(0, 6).map(d => ({
      name: d.client ? `${d.client.prenom} ${d.client.nom}` : "Client Inconnu",
      dossier: d.id.split("-")[0].toUpperCase(),
      dossierId: d.id,
      stage: d.statut,
      value: d.montant ? `${(d.montant / 1000000).toFixed(1)}M €` : "-- €",
      status: mapStatutToBadge(d.statut),
      urgent: d.statut === "pieces_manquantes" || d.statut === "demande",
      avatar: d.client ? `${d.client.prenom[0] || ""}${d.client.nom[0] || ""}`.toUpperCase() : "CI"
    }));

    return NextResponse.json({
      success: true,
      kpis: {
        dossiersActifs: countDossiersActifs,
        volumeConseilleYTD: formatEuro(volumeConseilleYTD),
        honorairesFactures: formatEuro(totalFactures),
        honorairesPayes: formatEuro(totalPaye),
        pipeline: formatEuro(pipeline),
        delaiMoyen: delaiMoyen !== null ? `${delaiMoyen}j` : "—",
      },
      revenueSeries: finalSeries,
      monthsLabels,
      demandes: finalDemandes,
      recentClients
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Unknown error" },
      { status: 500 }
    );
  }
}

// Helpers
function formatTimeAgo(dateString: string): string {
  const diffMs = new Date().getTime() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHrs < 24) return `Il y a ${diffHrs} h`;
  return `Hier` + (diffDays > 1 ? ` (${diffDays} j)` : "");
}

function formatEuro(val: number) {
  if (val >= 1000000) {
    return `${(val / 1000000).toFixed(1)}M €`;
  }
  if (val >= 1000) {
    return `${Math.round(val / 1000)}K €`;
  }
  return `${val} €`;
}

function mapStatutToBadge(statut: string): string {
  switch (statut) {
    case "en_cours":
    case "valide":
      return "actif";
    case "pieces_manquantes":
    case "devis":
      return "review";
    case "demande":
    case "en_analyse":
      return "nouveau";
    default:
      return "actif";
  }
}
