import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function HonorairesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
            Honoraires
          </h1>
          <p className="text-xl text-text-muted mb-12">
            Transparence et prévisibilité sont les maîtres-mots de notre facturation.
          </p>

          <div className="rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">Consultation Initiale</h2>
            <p className="text-text-muted mb-6">
              La première consultation permet d'évaluer la faisabilité de votre projet, de définir le périmètre de notre intervention et d'identifier les risques potentiels.
            </p>
            <div className="flex items-center justify-between border-t border-border-soft pt-6">
              <span className="font-medium text-sidebar-deep">Durée estimée : 1 heure</span>
              <span className="font-display text-xl font-bold text-gold">Sur devis</span>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">Accompagnement Forfaitaire</h2>
            <p className="text-text-muted mb-6">
              Pour les transactions immobilières classiques, nous proposons un honoraire forfaitaire (Flat Fee) convenu à l'avance. Aucune surprise de facturation à l'heure ne sera appliquée sans votre accord préalable.
            </p>
            <ul className="list-disc pl-5 text-text-muted space-y-2">
              <li>Analyse du promoteur et du projet</li>
              <li>Revue du contrat de réservation et du SPA</li>
              <li>Accompagnement jusqu'à l'enregistrement au DLD</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
