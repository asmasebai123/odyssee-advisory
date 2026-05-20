import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function InvestissementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-sidebar-deep mb-6">
            L&apos;Investissement Immobilier à Dubaï
          </h1>
          <p className="text-xl text-text-muted mb-12">
            Comprendre le marché, le cadre légal et les opportunités pour investir sereinement.
          </p>

          <div className="aspect-[21/9] w-full rounded-2xl bg-sidebar-deep overflow-hidden mb-12 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <h2 className="relative z-10 text-white font-display text-3xl font-bold tracking-widest uppercase">Off-Plan & Ready Properties</h2>
          </div>

          <div className="space-y-8 text-text-muted text-lg leading-relaxed">
            <p>
              Le marché immobilier de Dubaï est particulièrement dynamique et attractif, offrant des rendements locatifs élevés et une fiscalité avantageuse (absence d&apos;impôt sur les revenus fonciers et sur la plus-value).
            </p>
            
            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mt-10">Le Cadre Légal (RERA & DLD)</h3>
            <p>
              Le Dubai Land Department (DLD) et la Real Estate Regulatory Agency (RERA) encadrent strictement les transactions. Lors d&apos;un achat sur plan (Off-Plan), les fonds doivent obligatoirement être versés sur un compte séquestre (Escrow Account) lié au projet.
            </p>

            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mt-10">Pourquoi se faire accompagner ?</h3>
            <p>
              Malgré ce cadre protecteur, de nombreux investisseurs non-résidents se heurtent à la barrière de la langue, à l&apos;agressivité commerciale de certains intermédiaires, et à la complexité des contrats (SPA). Notre rôle est de rééquilibrer la relation de force avec le promoteur et d&apos;assurer une due diligence complète.
            </p>
          </div>

          <div className="mt-16 rounded-2xl bg-beige-soft p-8 text-center border border-border-soft">
            <h3 className="font-display text-2xl font-semibold text-sidebar-deep mb-4">Prêt à sécuriser votre projet ?</h3>
            <p className="text-text-muted mb-6">
              Contactez-nous pour une première consultation d&apos;évaluation de votre projet immobilier.
            </p>
            <Link href="/contact">
              <Button size="lg">Demander une consultation</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
