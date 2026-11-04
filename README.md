# Reminds, site vitrine

Site statique de présentation de Reminds, servi à la racine de https://reminds.cybersds.fr/ .
Édité par CyberShield Dev Solutions. Pages légales selon `MODELE-JURIDIQUE.md` (CyberShield).

Aucune étape de build : la racine du dépôt est le dossier à déployer.

| Fichier | Rôle |
| --- | --- |
| `index.html` | Accueil : héros, fonctionnalités, confidentialité, accès sur invitation, contact |
| `mentions-legales.html`, `confidentialite.html`, `conditions.html` | Les trois pages légales |
| `404.html` | Page d'erreur (chemins absolus, servie depuis n'importe quelle profondeur) |
| `styles.css`, `theme.js` | Seule feuille de style ; seul script (thème clair/sombre, mémorisé dans le navigateur) |
| `images/` | Icônes (favicon, apple-touch, manifest) et image Open Graph 1200x630 |
| `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.ico` | Référencement et icônes |
| `.well-known/security.txt` (copie à la racine) | Contact sécurité (RFC 9116), expire le 04/11/2027 : à renouveler |

Les maquettes d'iPhone sont dessinées en HTML/CSS avec un contenu fictif. Aucune vraie conversation,
aucun vrai nom ne doit apparaître sur ce site.

## Tester en local

```sh
python3 -m http.server 8765
# puis http://localhost:8765/
```

## Déployer

Le serveur et nginx sont gérés à part ; ici on copie seulement des fichiers statiques (pas de build,
pas de redémarrage) :

```sh
rsync -av --delete \
  --exclude '.git*' --exclude '.github' --exclude '.DS_Store' \
  --exclude 'downloads' --exclude 'node_modules' \
  --exclude 'README.md' --exclude 'LICENSE' \
  ./ root@82.112.241.241:/home/damien/cmpharma/reminds/site/
```

`.well-known/` doit être copié (il n'est pas exclu par `.git*`).

Côté nginx (vhost `reminds.cybersds.fr`, pour mémoire) :

- `root /home/damien/cmpharma/reminds/site;` et `index index.html;`
- `error_page 404 /404.html;`
- `location /api/ { ... }` vers le conteneur de l'API (inchangé)
- le site n'utilise ni script en ligne ni style en ligne : une CSP stricte convient,
  par exemple `default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`
- cache conseillé : `Cache-Control: public, max-age=3600` sur les `.css`, `.js` et images

## Contact

contact@cybersds.fr
