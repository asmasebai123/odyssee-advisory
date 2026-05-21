-- ============================================================
-- Odyssée Advisory — Configuration du stockage des documents
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Objectif (cahier §11 confidentialité, §8 sécurité) :
--   bucket PRIVÉ « documents » + politiques RLS de stockage.
--   Les fichiers ne sont JAMAIS publics : le téléchargement passe par
--   /api/documents/download qui génère une URL signée de 60 s après
--   vérification de l'autorisation (client propriétaire ou avocat).
-- ============================================================

-- 1. Créer le bucket privé (idempotent)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do update set public = false;

-- 2. Politiques RLS sur storage.objects pour le bucket « documents »
--    (l'upload se fait côté client avec la session de l'utilisateur)

-- Lecture : un utilisateur authentifié peut lire les objets du bucket.
-- (La vraie restriction d'accès est faite côté serveur via l'URL signée ;
--  on garde donc une policy simple "authenticated".)
drop policy if exists "documents_read_authenticated" on storage.objects;
create policy "documents_read_authenticated"
on storage.objects for select
to authenticated
using (bucket_id = 'documents');

-- Upload : un utilisateur authentifié peut déposer dans le bucket,
-- uniquement sous le préfixe clients/<son_dossier>/… (contrôlé par l'app).
drop policy if exists "documents_insert_authenticated" on storage.objects;
create policy "documents_insert_authenticated"
on storage.objects for insert
to authenticated
with check (bucket_id = 'documents');

-- Mise à jour / remplacement par le propriétaire de l'objet.
drop policy if exists "documents_update_owner" on storage.objects;
create policy "documents_update_owner"
on storage.objects for update
to authenticated
using (bucket_id = 'documents' and owner = auth.uid());

-- Suppression réservée au propriétaire.
drop policy if exists "documents_delete_owner" on storage.objects;
create policy "documents_delete_owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'documents' and owner = auth.uid());

-- NB : le service_role (utilisé par /api/documents/download et les routes
-- admin) contourne toujours ces policies — c'est attendu.
