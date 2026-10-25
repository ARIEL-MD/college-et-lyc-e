# Guide de démarrage — plateforme scolaire

Ce guide accompagne la **phase 1** : mise en place de la base de données sécurisée.
Les étapes sont à suivre dans l'ordre. Rien ici ne demande de connaître le code.

---

## Ce qui a déjà été fait

- **Schéma de base de données** prêt : `supabase/schema.sql` (élèves, notes, présences, paiements, SMS, audit, support).
- **Isolation par école** : une école ne peut voir que ses propres données, même si quelqu'un contourne l'interface.
- **Clé API SMS retirée** du code : elle ne doit plus jamais se trouver dans le navigateur.

## Ce qui reste à faire (phases suivantes)

1. Brancher l'application sur Supabase (remplacer le `localStorage` par la base).
2. Remplacer le code PIN « Fondateur » par une vraie connexion (email + mot de passe + double authentification).
3. Créer un petit serveur (« fonction serveur ») pour envoyer les SMS avec la clé API.
4. Brancher les paiements Mobile Money (Orange Money, MTN MoMo, Wave).

---

## Étape 1 — Créer un compte Supabase

1. Va sur **https://supabase.com** et crée un compte (gratuit pour commencer).
2. Clique sur **New project**.
3. Choisis :
   - **Name** : `plateforme-ecole`
   - **Database password** : un mot de passe fort. **Note-le dans un gestionnaire de mots de passe.**
   - **Region** : la plus proche possible (ex. Europe ou Afrique de l'Ouest si disponible).
4. Attends 2 minutes que le projet se crée.

## Étape 2 — Créer les tables

1. Dans le menu de gauche : **SQL Editor** → **New query**.
2. Ouvre le fichier `supabase/schema.sql`, copie tout son contenu.
3. Colle-le dans l'éditeur et clique sur **Run**.
4. Un message « Success » doit apparaître. Va dans **Table Editor** : tu dois voir les tables `students`, `payments`, `grades`, etc.

## Étape 3 — Récupérer les clés de connexion

1. Menu **Project Settings** → **API**.
2. Copie :
   - **Project URL**
   - **anon public key**

⚠️ **Ne copie jamais la `service_role key`** dans le code de l'application. Elle donne accès à toutes les données. Elle sert uniquement côté serveur.

## Étape 4 — Créer le premier compte fondateur

1. Menu **Authentication** → **Users** → **Add user** → **Create new user**.
2. Entre l'email et un mot de passe fort du fondateur.
3. Copie l'**identifiant (UUID)** du compte créé.
4. Retourne dans **SQL Editor** et exécute (en remplaçant l'UUID et l'email) :

```sql
insert into public.profiles (id, school_id, role, name)
values ('COLLE-ICI-L-UUID', null, 'SUPER_ADMIN', 'Nom du fondateur');
```

Le fondateur n'est rattaché à aucune école (`school_id` vide), donc il voit toutes les écoles.

## Étape 5 — Créer une école et son directeur

Dans **SQL Editor** :

```sql
-- 1. L'école
insert into public.schools (name, short_code, type, city, district, phone, email, director_name, current_academic_year)
values ('Collège-Lycée La Réussite', 'LAR', 'COLLEGE_LYCEE', 'Yamoussoukro', 'Lacs', '+225 00 00 00 00', 'contact@ecole.ci', 'M. Exemple', '2026-2027')
returning id;
```

Copie l'`id` renvoyé, puis crée le compte du directeur comme à l'étape 4 (Authentication → Add user), et :

```sql
insert into public.profiles (id, school_id, role, name)
values ('UUID-DU-DIRECTEUR', 'ID-DE-L-ECOLE', 'DIRECTEUR', 'M. Exemple');
```

## Étape 6 — Vérifier que la sécurité fonctionne

1. Crée deux écoles de test, chacune avec un utilisateur.
2. Connecte-toi avec le compte de l'école A : tu ne dois voir **aucune** donnée de l'école B.
3. Connecte-toi avec le fondateur : tu dois voir les deux écoles.

Si ce test échoue, **ne mets pas de vraies données** et demande de l'aide avant de continuer.

---

## Points de vigilance

- **Sauvegardes** : Supabase fait des sauvegardes automatiques sur les offres payantes. Sur l'offre gratuite, exporte régulièrement tes données (Table Editor → Export).
- **Données personnelles** : les dossiers d'élèves sont des données sensibles. Vérifie les obligations de la loi ivoirienne sur la protection des données (ARTCI) avant d'enregistrer de vraies informations.
- **Droits du directeur** : dans la version actuelle, un directeur peut modifier les profils de son école, y compris leur rôle. Une règle plus stricte (le directeur ne peut pas se promouvoir fondateur) sera ajoutée en phase 2.
- **Ne partage jamais** la `service_role key`, les mots de passe ou la clé API SMS par email ou WhatsApp.

## Besoin d'aide ?

Si une étape bloque, envoie-moi le message d'erreur exact (copié-collé) et l'étape où tu en es. Je te répondrai étape par étape.
