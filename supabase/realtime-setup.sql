-- ============================================================
-- Odyssée Advisory — Activation du temps réel (Realtime)
-- À exécuter UNE FOIS dans Supabase → SQL Editor.
--
-- Les abonnements Realtime côté app (messagerie client/cabinet,
-- documents déposés, factures émises) ne reçoivent d'événements que
-- si les tables sont ajoutées à la publication `supabase_realtime`.
-- ============================================================

-- Messagerie sécurisée (cahier §6.2.4) — temps réel des nouveaux messages
alter publication supabase_realtime add table public.messages;

-- Dépôt de pièces par le client → notification temps réel au cabinet
alter publication supabase_realtime add table public.documents;

-- Émission/paiement de factures → mise à jour temps réel
alter publication supabase_realtime add table public.factures;

-- Changement de statut d'un dossier → suivi temps réel
alter publication supabase_realtime add table public.dossiers;

-- NB : si une table est déjà dans la publication, Supabase renvoie une
-- erreur "is already member of publication" — sans gravité, l'ignorer.
