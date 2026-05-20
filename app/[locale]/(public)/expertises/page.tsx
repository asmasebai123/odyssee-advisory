import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function ExpertisesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold uppercase tracking-wider mb-6">
            Expertises Juridiques
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-8">
            Un socle de compétences pluridisciplinaires
          </h1>
          <div className="prose prose-lg text-text-muted">
            <p className="lead text-xl text-text mb-10">
              L'investissement immobilier international requiert une maîtrise globale des enjeux juridiques et fiscaux, tant dans le pays d'origine que dans le pays d'investissement.
            </p>
            
            <div className="space-y-12">
              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">Droit Fiscal International</h3>
                <p>
                  Compréhension des conventions fiscales préventives de double imposition (notamment France-EAU). Analyse de l'impact de l'investissement sur votre fiscalité globale (IR, IFI) et stratégies de rapatriement des revenus.
                </p>
              </div>

              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">Droit des Affaires & Sociétés</h3>
                <p>
                  Accompagnement dans la création de structures d'investissement (Freezone, Mainland, Offshore) adaptées à l'acquisition immobilière commerciale ou résidentielle, incluant la rédaction de pactes d'actionnaires.
                </p>
              </div>

              <div className="border-l-2 border-gold pl-6">
                <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-3">Droit des Contrats & Immobilier</h3>
                <p>
                  Sécurisation des transactions via l'analyse méticuleuse des contrats (MOU, SPA). Vérification des garanties de bonne fin d'achèvement et des clauses suspensives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
