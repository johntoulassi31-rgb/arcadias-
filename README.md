# ARCADIAS — prototype RPG web

ARCADIAS est un RPG navigateur conçu pour Android et PC.

## Déplacements
- Android : croix directionnelle virtuelle inspirée de la PSP : haut, bas, gauche, droite. Maintenir une direction permet de marcher ; deux directions peuvent être combinées pour les diagonales.
- PC : flèches directionnelles ou touches WASD.
- Interaction : E ou F ; attaque : barre espace.

## Projet Supabase
- Project ID : `ffyddhozwdlnwcxezoag`
- Project URL : `https://ffyddhozwdlnwcxezoag.supabase.co`
- Monde initial : `asterion`

La migration initiale et les données de départ sont installées dans ce projet Supabase. La clé Publishable doit être configurée dans les secrets GitHub Actions sous `VITE_SUPABASE_ANON_KEY`. Ne jamais publier une clé `sb_secret_...` ou `service_role`.

## Démarrage
Le prototype utilise Vite : `npm install`, puis `npm run dev`. Pour construire : `npm run build`.

## Référence visuelle
La maquette de la capitale royale est la référence visuelle du projet. La reproduction fidèle de cette maquette dans le moteur de jeu reste une étape de développement distincte ; le présent dépôt ne doit pas être présenté comme déjà identique à l'image.

## État du projet
La base technique est un prototype, pas encore un MMORPG de production. Le combat et la progression de démonstration sont exécutés côté navigateur. Le dépôt est indépendant de Novelia.