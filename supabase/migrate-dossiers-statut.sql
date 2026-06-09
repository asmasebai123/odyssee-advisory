-- =====================================================================
-- Migration : aligner la contrainte CHECK de dossiers.statut sur le
-- cahier des charges (§6.2.1) et sur les valeurs utilisées par l'UI.
--
-- Pourquoi : la table a été créée à l'origine avec la liste
--   ('demande','analyse','devis','contrat','en_cours','termine')
-- alors que le code utilise désormais
--   ('demande','en_analyse','pieces_manquantes','devis','en_cours',
--    'valide','cloture')
-- → tout passage à « Terminé / Clôturé » (= 'cloture') déclenche
--   `violates check constraint "dossiers_statut_check"`.
--
-- À exécuter UNE FOIS dans Supabase → SQL editor (idempotent).
-- =====================================================================

begin;

-- 1. Retirer d'abord l'ancienne contrainte CHECK : sans cela, les UPDATEs
--    de normalisation ci-dessous (qui écrivent 'cloture', 'en_analyse'…)
--    seraient bloqués par l'ancienne liste autorisée.
alter table public.dossiers drop constraint if exists dossiers_statut_check;

-- 2. Normaliser les valeurs historiques vers la nouvelle nomenclature.
update public.dossiers set statut = 'en_analyse' where statut = 'analyse';
update public.dossiers set statut = 'en_cours'   where statut = 'contrat';
update public.dossiers set statut = 'cloture'    where statut = 'termine';

-- 3. Ajouter la nouvelle contrainte CHECK (alignée cahier §6.2.1 + UI).
alter table public.dossiers
  add constraint dossiers_statut_check
  check (statut in (
    'demande',
    'en_analyse',
    'pieces_manquantes',
    'devis',
    'en_cours',
    'valide',
    'cloture'
  ));

-- 4. Aligner la valeur par défaut (création d'un nouveau dossier).
alter table public.dossiers alter column statut set default 'demande';

commit;

-- Vérification :
-- select distinct statut from public.dossiers order by 1;
