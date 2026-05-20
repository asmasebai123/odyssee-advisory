import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-5xl">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
                Contactez-nous
              </h1>
              <p className="text-lg text-text-muted mb-8">
                Vous avez un projet d'investissement à Dubaï ou vous souhaitez sécuriser une transaction en cours ? Laissez-nous vos coordonnées, nous vous recontacterons dans les 24h.
              </p>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-sidebar-deep">Bureau (Dubaï)</h3>
                  <p className="text-text-muted">Dubai International Financial Centre (DIFC)<br/>Dubaï, UAE</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sidebar-deep">Email</h3>
                  <p className="text-text-muted">contact@odyssee-advisory.com</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border-soft bg-card p-8 shadow-sm">
              <form className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input id="firstName" placeholder="Jean" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input id="lastName" placeholder="Dupont" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="jean.dupont@email.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" placeholder="+33 6 12 34 56 78" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Sujet de votre demande</Label>
                  <Input id="subject" placeholder="Achat sur plan (Off-Plan)" />
                </div>

                <Button type="button" className="w-full">Envoyer la demande</Button>
                <p className="text-xs text-text-muted text-center mt-4">
                  Vos données sont traitées de manière confidentielle conformément à notre politique de confidentialité.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
