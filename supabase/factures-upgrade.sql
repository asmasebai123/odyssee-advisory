-- ============================================================
-- Odyssée Advisory — Mise à niveau de la table « factures »
-- pour des factures légales complètes (réf, libellé, dates).
--
-- À exécuter dans Supabase → SQL Editor.
-- 100 % additif et idempotent : n'affecte pas les données existantes.
-- ============================================================

alter table public.factures add column if not exists reference text;
alter table public.factures add column if not exists libelle text;
alter table public.factures add column if not exists date_emission date;
alter table public.factures add column if not exists date_echeance date;

-- Optionnel : taux de TVA appliqué (0 par défaut — prestation de conseil
-- transfrontalière souvent hors TVA / autoliquidation). Stocké en %.
alter table public.factures add column if not exists tva_taux numeric not null default 0;

-- Backfill des anciennes factures sans référence (numérotation lisible).
update public.factures
set reference = 'FAC-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where reference is null;

-- Backfill libellé par défaut.
update public.factures
set libelle = 'Honoraires de conseil'
where libelle is null;

-- Backfill date d'émission = date de création.
update public.factures
set date_emission = created_at::date
where date_emission is null;
