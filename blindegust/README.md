# Blindegust

Application web colorée pour dégustation de sodas à l'aveugle.

## Mise en ligne rapide

1. Crée un projet sur Supabase.
2. Dans Supabase > SQL Editor, colle et exécute `supabase/schema.sql`.
3. Récupère `Project URL` et `anon public key` dans Supabase > Project Settings > API.
4. Déploie ce dossier sur Vercel.
5. Ajoute ces variables d'environnement dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Ouvre `/host` pour créer une partie.

## Écrans

- `/host` : maître du jeu
- `/play/CODE` : joueurs sur téléphone
- `/screen/CODE` : écran public TV/projecteur
