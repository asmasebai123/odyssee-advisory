import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-5xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
            Nos Services
          </h1>
          <p className="text-xl text-text-muted mb-16 max-w-3xl">
            Un accompagnement sur-mesure pour sécuriser et optimiser vos projets immobiliers aux Émirats Arabes Unis.
          </p>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">01</span>
                </div>
                <CardTitle>Audit & Due Diligence</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  Analyse approfondie des promoteurs immobiliers (track record, santé financière) et des projets (escrow account, autorisations RERA) avant tout engagement.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">02</span>
                </div>
                <CardTitle>Revue de Contrats (SPA)</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  Lecture et négociation des contrats de vente (Sales and Purchase Agreement) pour protéger vos intérêts et éviter les clauses abusives.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">03</span>
                </div>
                <CardTitle>Structuration Fiscale</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  Conseil sur la structuration de l'acquisition (en nom propre, via une société offshore ou Freezone) selon votre situation de résident fiscal français ou émirati.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <span className="font-bold text-lg">04</span>
                </div>
                <CardTitle>Succession & Transmission</CardTitle>
                <CardDescription className="mt-4 text-base leading-relaxed">
                  Mise en place de testaments (DIFC Wills) et stratégies de transmission pour protéger votre patrimoine immobilier aux EAU.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
