# Périmètre des composants & pages publics

⚠️ **À lire avant toute modification.**

Le **site vitrine institutionnel** d'Odyssée Advisory (homepage, services,
expertises, blog, contact, mentions légales, etc. — cahier des charges §6.1)
est porté par **un autre développeur** sur une codebase distincte.

Les fichiers suivants présents ici sont des **stubs / drafts**, conservés
uniquement pour permettre à la plateforme de fonctionner localement sans
404 (liens depuis le footer, navbar interne) :

- `components/layout/PublicNavbar.tsx`
- `components/layout/Footer.tsx`
- `components/layout/Header.tsx`
- `app/[locale]/(public)/services/page.tsx`
- `app/[locale]/(public)/expertises/page.tsx`
- `app/[locale]/(public)/honoraires/page.tsx`
- `app/[locale]/(public)/investissement-immobilier/page.tsx`
- `app/[locale]/(public)/contact/page.tsx`
- `app/[locale]/(public)/mentions-legales/page.tsx`
- `app/[locale]/(public)/confidentialite/page.tsx`
- `app/[locale]/(public)/blog/page.tsx`

## Décisions à prendre avec l'équipe vitrine

1. **Source unique du design** : aligner avec leur charte une fois la
   vitrine livrée — coordonner les couleurs, typographies, composants
   shadcn pour éviter divergence.
2. **Mode d'intégration** : héberger sous le même domaine ?
   sous-domaine `app.odyssee-advisory.com` ? proxy ?
3. **Quand la vitrine sera prête** : supprimer ces stubs et faire pointer
   les liens `/services`, `/expertises`, etc. vers le site final.

## Périmètre actuel de cette codebase

**Plateforme uniquement** (cahier §6.2) :
- Espace client : dashboard, dossier, documents, factures, messagerie, paramètres
- Espace cabinet : admin, dossiers, clients, utilisateurs, journal, factures, paramètres
- API : auth, dossiers, documents, factures, notifications, admin (seed/purge)
