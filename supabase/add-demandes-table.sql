-- ============================================================
-- Odyssée Advisory — Table des Demandes (Leads/Prospects)
-- ============================================================

create table if not exists public.demandes (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  email text not null,
  telephone text,
  titre text not null,
  type_service text not null default 'Acquisition Immobilière - Dubaï',
  montant numeric,
  statut text not null default 'nouveau' check (statut in ('nouveau', 'transforme', 'rejete')),
  created_at timestamptz not null default now()
);

-- Active la sécurité au niveau des lignes (RLS)
alter table public.demandes enable row level security;

-- Politiques de sécurité
drop policy if exists demandes_anon_insert on public.demandes;
create policy demandes_anon_insert on public.demandes for insert
  to anon with check (true);

drop policy if exists demandes_avocat_all on public.demandes;
create policy demandes_avocat_all on public.demandes for all
  to authenticated using (public.is_avocat());
