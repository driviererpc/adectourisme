# Portail des métiers et formations du tourisme à La Réunion

Site statique (HTML / CSS / JavaScript, sans backend) porté par **Réunion Prospective Compétences (RPC)**, destiné à valoriser les métiers et les formations du secteur touristique à La Réunion.

## Structure

```
index.html        Page d'accueil
metiers.html       Fiches métiers (recherche + filtre par famille, détail en modale)
formations.html    Catalogue de formations (recherche + filtres niveau/domaine)
a-propos.html       Présentation de la démarche
contact.html        Formulaire de contact (démonstration, non connecté à un backend)
css/style.css       Charte graphique et mise en page
js/main.js           Logique commune (navigation, filtres, modale, formulaire)
data/metiers.json     Contenu des fiches métiers
data/formations.json  Contenu du catalogue de formations
assets/img/          Favicon et visuels
```

## Lancer le site en local

Les pages chargent les données via `fetch()`, ce qui nécessite un serveur HTTP (l'ouverture directe des fichiers `.html` en `file://` ne fonctionnera pas dans certains navigateurs). Depuis la racine du projet :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000/index.html
```

## Charte graphique

La palette (bleu marine `#1b2452`, jaune `#ffc700`, noir, blanc) reprend les couleurs de la campagne institutionnelle **« Le tourisme recrute à La Réunion »** (letourisme-i-recrute.re), portée par les acteurs du tourisme réunionnais. Les variables de couleurs et de typographie sont centralisées en haut de `css/style.css` (`:root { ... }`) pour faciliter tout ajustement ultérieur avec la charte graphique officielle complète de Réunion Prospective Compétences (logo vectoriel, typographies sous licence, etc.).

## Contenu

Les fiches métiers et formations sont des contenus de démonstration à **vocation pédagogique et générale**. Un bandeau et des mentions le rappellent sur le site. Avant mise en production, il est recommandé de faire valider et actualiser ces contenus par :

- l'observatoire de Réunion Prospective Compétences ;
- les branches professionnelles du tourisme, de l'hôtellerie-restauration et des activités de pleine nature ;
- le CARIF-OREF Réunion, l'Onisep et France Travail, pour les données de formation et d'emploi.

## Évolutions possibles

- Remplacer le bloc `.brand-mark` par le logo officiel de RPC (SVG/PNG) une fois transmis.
- Enrichir `data/metiers.json` / `data/formations.json` avec des données vérifiées (établissements, effectifs, indicateurs).
- Ajouter un vrai backend ou un service tiers (ex. formulaire transactionnel) pour le formulaire de contact.
- Ajouter des pages « fiche métier » dédiées (URL propre par métier) si le référencement SEO devient un enjeu.
