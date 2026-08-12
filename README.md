# Portail des métiers et formations du tourisme à La Réunion

Application Node.js / Express, portée par **Réunion Prospective Compétences (RPC)**, destinée à valoriser les métiers et les formations du secteur touristique à La Réunion. Le serveur expose une API JSON pour les métiers et les formations, sert le front-end statique, et traite le formulaire de contact.

## Structure

```
server/index.js           Serveur Express : API + fichiers statiques
public/index.html          Page d'accueil
public/metiers.html         Fiches métiers (recherche + filtre par famille, détail en modale)
public/formations.html      Catalogue de formations (recherche + filtres niveau/domaine)
public/a-propos.html         Présentation de la démarche
public/contact.html          Formulaire de contact (envoyé au serveur via /api/contact)
public/css/style.css         Charte graphique et mise en page
public/js/main.js             Logique front-end (navigation, filtres, modale, formulaire)
data/metiers.json              Contenu des fiches métiers
data/formations.json           Contenu du catalogue de formations
data/contact-submissions.json  Messages reçus via le formulaire (généré au runtime, non versionné)
```

## Lancer le site en local

```bash
npm install
npm start
# puis ouvrir http://localhost:3000
```

`npm run dev` relance le serveur automatiquement à chaque modification (Node ≥ 18.11, option `--watch`).

## API

| Méthode | Route              | Description                                            |
|---------|---------------------|---------------------------------------------------------|
| GET     | `/api/metiers`       | Liste complète des fiches métiers                       |
| GET     | `/api/metiers/:id`   | Détail d'un métier                                       |
| GET     | `/api/formations`    | Liste complète des formations                            |
| POST    | `/api/contact`       | Enregistre un message (`nom`, `email`, `profil`, `message`) |

Les messages du formulaire de contact sont stockés dans `data/contact-submissions.json`. Il n'y a pas encore d'envoi d'e-mail réel : c'est la prochaine étape avant mise en production (voir plus bas).

## Charte graphique

La palette (bleu marine `#1e3a6b`, bleu moyen `#2c7bc0`, orange `#f1861f`, vert `#8fc93f`) reprend les couleurs du **logo officiel de Réunion Prospective Compétences**. Les variables de couleurs et de typographie sont centralisées en haut de `public/css/style.css` (`:root { ... }`) pour faciliter tout ajustement ultérieur.

## Contenu

Les fiches métiers et formations sont des contenus de démonstration à **vocation pédagogique et générale**. Un bandeau et des mentions le rappellent sur le site. Avant mise en production, il est recommandé de faire valider et actualiser ces contenus par :

- l'observatoire de Réunion Prospective Compétences ;
- les branches professionnelles du tourisme, de l'hôtellerie-restauration et des activités de pleine nature ;
- le CARIF-OREF Réunion, l'Onisep et France Travail, pour les données de formation et d'emploi.

## Évolutions possibles

- Remplacer le bloc `.brand-mark` par le logo officiel de RPC (SVG/PNG) une fois transmis.
- Enrichir `data/metiers.json` / `data/formations.json` avec des données vérifiées (établissements, effectifs, indicateurs) — idéalement en migrant ces fichiers vers une base de données si le volume de contenu grandit.
- Brancher un envoi d'e-mail réel (SMTP ou service tiers) sur `POST /api/contact`, et ajouter une protection anti-spam (captcha, rate limiting).
- Ajouter une authentification pour une interface d'administration permettant de modifier les métiers/formations sans toucher au code.
- Déployer le serveur (Render, Railway, VPS, etc.) et brancher un nom de domaine pour une mise en ligne publique.
