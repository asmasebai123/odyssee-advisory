-- ============================================================
-- Odyssée Advisory — Schéma complet de la base (source de vérité)
-- À exécuter dans Supabase → SQL Editor.
-- Aligné sur le cahier des charges §6.2 et types/dossier.ts.
--
-- Idempotent autant que possible (IF NOT EXISTS / DO blocks).
-- Exécuter ENSUITE storage-setup.sql et realtime-setup.sql.
-- ============================================================

-- ---------- 1. USERS (profil applicatif lié à auth.users) ----------
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text unique not null,
  nom text not null,
  prenom text not null,
  role text not null default 'client' check (role in ('client', 'avocat')),
  langue text not null default 'fr' check (langue in ('fr', 'en', 'ar')),
  telephone text,
  created_at timestamptz not null default now()
);

-- ---------- 2. DOSSIERS ----------
create table if not exists public.dossiers (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.users(id) on delete cascade,
  titre text not null,
  -- statuts alignés cahier §6.2.1 + workflow business
  statut text not null default 'demande'
    check (statut in ('demande','en_analyse','pieces_manquantes','devis','en_cours','valide','cloture')),
  type_service text not null default 'acquisition',
  montant numeric,
  notes text,                                -- commentaires internes cabinet (§6.2.1)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- 3. MESSAGES ----------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  auteur_id uuid references public.users(id) on delete set null,
  contenu text not null,
  lu boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 4. DOCUMENTS ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  nom text not null,
  url text default '',                        -- chemin de stockage privé (ou '' si pièce demandée non déposée)
  type text not null default 'autre' check (type in ('contrat','facture','juridique','autre')),
  signe boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 5. DEVIS ----------
create table if not exists public.devis (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  montant numeric not null,
  description text not null default '',
  statut text not null default 'en_attente' check (statut in ('en_attente','accepte','refuse')),
  created_at timestamptz not null default now()
);

-- ---------- 6. FACTURES ----------
create table if not exists public.factures (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  reference text,
  libelle text,
  montant numeric not null,
  statut text not null default 'impayee' check (statut in ('impayee','payee','en_retard')),
  stripe_payment_id text,
  date_emission date,
  date_echeance date,
  created_at timestamptz not null default now()
);

-- ---------- 7. NOTIFICATIONS ----------
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  message text not null,
  lu boolean not null default false,
  type text not null default 'info',
  created_at timestamptz not null default now()
);

-- ---------- 8. AUDIT LOG (journal d'audit §6.2.4) ----------
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  dossier_id uuid references public.dossiers(id) on delete cascade,
  acteur_id uuid references public.users(id) on delete set null,
  acteur_label text,                          -- "Pierre Debuisson", "Système"…
  action text not null,                       -- ex: "statut_change", "document_demande"
  detail text,
  created_at timestamptz not null default now()
);

-- ---------- Trigger updated_at sur dossiers ----------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists dossiers_updated on public.dossiers;
create trigger dossiers_updated
  before update on public.dossiers
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS — Row Level Security
-- Le service_role (routes serveur) contourne toujours RLS.
-- Ces policies protègent les accès directs via la clé anon.
-- ============================================================
alter table public.users          enable row level security;
alter table public.dossiers       enable row level security;
alter table public.messages       enable row level security;
alter table public.documents      enable row level security;
alter table public.devis          enable row level security;
alter table public.factures       enable row level security;
alter table public.notifications  enable row level security;
alter table public.audit_log      enable row level security;

-- Helper: l'utilisateur courant est-il avocat ?
create or replace function public.is_avocat()
returns boolean as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'avocat'
  );
$$ language sql security definer stable;

-- USERS : chacun lit/modifie son profil ; l'avocat lit tout.
drop policy if exists users_self_select on public.users;
create policy users_self_select on public.users for select
  to authenticated using (id = auth.uid() or public.is_avocat());

drop policy if exists users_self_update on public.users;
create policy users_self_update on public.users for update
  to authenticated using (id = auth.uid());

-- DOSSIERS : le client voit les siens ; l'avocat voit tout.
drop policy if exists dossiers_access on public.dossiers;
create policy dossiers_access on public.dossiers for select
  to authenticated using (client_id = auth.uid() or public.is_avocat());

-- MESSAGES : accessibles si le dossier appartient au client ou si avocat.
drop policy if exists messages_access on public.messages;
create policy messages_access on public.messages for select
  to authenticated using (
    public.is_avocat() or exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id and d.client_id = auth.uid()
    )
  );

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages for insert
  to authenticated with check (
    public.is_avocat() or exists (
      select 1 from public.dossiers d
      where d.id = messages.dossier_id and d.client_id = auth.uid()
    )
  );

-- DOCUMENTS : même logique que messages.
drop policy if exists documents_access on public.documents;
create policy documents_access on public.documents for select
  to authenticated using (
    public.is_avocat() or exists (
      select 1 from public.dossiers d
      where d.id = documents.dossier_id and d.client_id = auth.uid()
    )
  );

-- FACTURES : lecture par le client propriétaire ou l'avocat.
drop policy if exists factures_access on public.factures;
create policy factures_access on public.factures for select
  to authenticated using (
    public.is_avocat() or exists (
      select 1 from public.dossiers d
      where d.id = factures.dossier_id and d.client_id = auth.uid()
    )
  );

-- DEVIS : idem factures.
drop policy if exists devis_access on public.devis;
create policy devis_access on public.devis for select
  to authenticated using (
    public.is_avocat() or exists (
      select 1 from public.dossiers d
      where d.id = devis.dossier_id and d.client_id = auth.uid()
    )
  );

-- NOTIFICATIONS : chacun les siennes.
drop policy if exists notifications_access on public.notifications;
create policy notifications_access on public.notifications for select
  to authenticated using (user_id = auth.uid());

drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications for update
  to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- AUDIT LOG : avocat uniquement.
drop policy if exists audit_avocat on public.audit_log;
create policy audit_avocat on public.audit_log for select
  to authenticated using (public.is_avocat());
