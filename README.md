# Reminds, site vitrine

Site statique de présentation de Reminds, servi à la racine de https://reminds.cybersds.fr/ .
Édité par CyberShield Dev Solutions. Pages légales selon `MODELE-JURIDIQUE.md` (CyberShield).

La racine du dépôt est le dossier à déployer. Les pages et `theme.css` sont **générées** par `design/` et versionnées :
la racine reste déployable telle quelle, sans build sur le serveur.

## Construire

```sh
node design/build.mjs     # theme.css (depuis design/tokens.json) + les 11 pages + couleurs de site.webmanifest
node design/lint.mjs      # aucune couleur, taille de police, rayon, ombre ni durée en dur ; aucun tiret cadratin
```

Ne jamais modifier à la main `theme.css` ni les pages HTML : modifier `design/` puis relancer le build.
`REMINDS_IMPORT_LIVE=1 node design/build.mjs` annonce l'import comme ouvert (par défaut : « Bientôt disponible »,
l'import est encore fermé en prod ; le drapeau est `IMPORT_LIVE` dans `design/src/kit.mjs`).

| Fichier | Rôle |
| --- | --- |
| `index.html`, `en/index.html` | Accueil : en-tête, héros, frise, trois étapes, fonctionnalités, sécurité, accès, guide, FAQ, pied de page légal |
| `guide-export-facebook.html`, `en/facebook-export-guide.html` | Guide pas à pas de l'export Facebook, captures dans `images/guide/{fr,en}/` (WebP, anonymisées) |
| `mentions-legales.html`, `confidentialite.html`, `conditions.html` (+ `en/legal-notice.html`, `en/privacy.html`, `en/terms.html`) | Les trois pages légales, un seul gabarit |
| `404.html` | Page d'erreur (chemins absolus, servie depuis n'importe quelle profondeur) |
| `theme.css` | **Généré** : variables du thème (jetons), polices Manrope, recadrages des captures |
| `styles.css` | Toute la mise en forme, uniquement des `var(--…)` de `theme.css` |
| `site.js` | Thème clair/sombre (système par défaut, choix gardé dans le navigateur, `?theme=dark`) et menu du téléphone |
| `fonts/` | Manrope (latin, 400 à 800, woff2) |
| `images/` | Icônes (favicon, apple-touch, manifest ; `icon-192.png` sert aussi de logo), images Open Graph 1200x630, `app/` captures de l'app (maquettes, données fictives), `guide/` |
| `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.ico` | Référencement et icônes |
| `.well-known/security.txt` (copie à la racine) | Contact sécurité (RFC 9116), expire le 04/11/2027 : à renouveler |
| `design/` | Générateur (non déployé) : `tokens.json` + `tokens.mjs` (source unique du thème, copiés de `reminds-web-redesign`, commit dans `design/SOURCE`), `src/kit.mjs` (en-tête, pied de page, `<head>`), `src/home.mjs` (accueil FR/EN), `src/docs.mjs` (guide, légal, 404), `content/` (pages v4 d'origine : texte du guide et des pages légales, balises SEO), `build.mjs`, `lint.mjs`, `render.mjs` (comparaison aux maquettes) |

Le texte du guide et des pages légales vient de `design/content/` (instantané des pages v4) : pour le modifier,
modifier ces fichiers dans les deux langues, puis relancer le build. Les balises de référencement de chaque page
(canonical, hreflang, Open Graph, robots, icônes) sont aussi reprises de `design/content/`.

### Mettre à jour les jetons

`design/tokens.json` est une copie de `reminds-web-redesign/mockups/redesign/tokens.json` (la même source que l'app
web, iOS et les e-mails). Pour suivre un changement : recopier `tokens.json` (et `tokens.mjs` s'il a changé), noter le
commit dans `design/SOURCE`, lancer `node design/build.mjs` puis `node design/lint.mjs`, vérifier, committer.

### Comparer aux maquettes

```sh
python3 -m http.server 8771 &              # depuis la racine
REMINDS_IMPORT_LIVE=1 node design/build.mjs   # les maquettes montrent l'import ouvert
node design/render.mjs                      # design/compare/ : rendus, côte à côte, écarts (non versionnés)
node design/build.mjs                       # revenir à l'état par défaut avant de committer
```

Le site existe en français (référence) et en anglais : toute modification de texte se fait dans les deux langues.
Aucun lien mailto comme bouton d'action : « Demander un accès » mène à `/app/?request=1` ; contact@cybersds.fr reste
en pied de page, dans la FAQ et dans les pages légales.

Les écrans montrés sont des maquettes de l'app avec un contenu fictif. Aucune vraie conversation,
aucun vrai nom ne doit apparaître sur ce site.

## Tester en local

```sh
python3 -m http.server 8765
# puis http://localhost:8765/
```

`app/` sur le serveur est l'app web Reminds (Flutter, dépôt `reminds`, `flutter build web`) : toujours l'exclure, sinon `--delete` l'efface.

## Déployer

Le serveur et nginx sont gérés à part ; ici on copie seulement des fichiers statiques (pas de build,
pas de redémarrage) :

```sh
rsync -av --delete \
  --exclude '.git*' --exclude '.github' --exclude '.DS_Store' \
  --exclude 'downloads' --exclude 'node_modules' \
  --exclude 'README.md' --exclude 'LICENSE' --exclude 'app' --exclude 'design' \
  ./ root@82.112.241.241:/home/damien/cmpharma/reminds/site/
```

`.well-known/` doit être copié (il n'est pas exclu par `.git*`).

Côté nginx (vhost `reminds.cybersds.fr`, pour mémoire) :

- `root /home/damien/cmpharma/reminds/site;` et `index index.html;`
- `error_page 404 /404.html;`
- `location /api/ { ... }` vers le conteneur de l'API (inchangé)
- le site n'utilise ni script en ligne ni attribut `style` (les recadrages sont des classes générées dans `theme.css`) : une CSP stricte convient,
  par exemple `default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`
- cache conseillé : `Cache-Control: public, max-age=3600` sur les `.css`, `.js`, images et `/fonts/*.woff2`
- `/fonts/` est servi par le même `root` (pas de règle à ajouter) ; `font-src 'self'` suffit

## Contact

contact@cybersds.fr
