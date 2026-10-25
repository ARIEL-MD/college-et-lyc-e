# Plateforme scolaire

Gestion des élèves, notes, présences, paiements et communication avec les parents pour les collèges et lycées.

## Installation

1. Installer Node.js (version 20 ou plus).
2. `npm install`
3. Copier `.env.example` vers `.env.local` et renseigner les clés Supabase.
4. `npm run dev` puis ouvrir http://localhost:3000

## Base de données

Le schéma se trouve dans `supabase/schema.sql`. Voir `GUIDE_DEMARRAGE.md` pour la mise en place pas à pas.

## Scripts

- `npm run dev` : serveur de développement
- `npm run build` : vérification des types puis build de production
- `npm run typecheck` : vérification des types seule
