import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function MentionsLegalesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-10">
            Mentions Légales
          </h1>
          
          <div className="prose prose-lg text-text-muted">
            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">1. Éditeur du site</h2>
            <p>
              Le site <strong>Odyssée Advisory</strong> est édité par Monsieur Pierre Debuisson, exerçant en tant que <em>Legal Consultant</em> aux Émirats Arabes Unis.
            </p>
            <p>
              Siège social : Dubai International Financial Centre (DIFC), Dubaï, Émirats Arabes Unis.<br/>
              Email : contact@odyssee-advisory.com
            </p>

            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">2. Hébergement</h2>
            <p>
              Le site est hébergé sur des serveurs sécurisés situés aux Émirats Arabes Unis, garantissant la protection et la localisation des données en conformité avec la réglementation locale.
            </p>

            <h2 className="font-display text-2xl font-semibold text-sidebar-deep mt-8 mb-4">3. Avertissement Légal</h2>
            <p>
              Les informations fournies sur ce site le sont à titre purement indicatif et pédagogique. Elles ne sauraient constituer un conseil juridique personnalisé ni une offre d'investissement avec garantie de rendement.
            </p>
            <p>
              Odyssée Advisory agit strictement en tant que cabinet de conseil juridique et stratégique, et n'exerce pas d'activité de courtage immobilier ou d'agence immobilière.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
