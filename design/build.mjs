// Construit le site vitrine à la racine du dépôt (le dossier déployé) :
//  1. theme.css, généré depuis design/tokens.json (source unique du thème, la même que l'app web et iOS),
//     suivi des variables de recadrage des captures (la CSP interdit les attributs style="") ;
//  2. les 11 pages HTML FR et EN ;
//  3. les couleurs de site.webmanifest (jetons paper et brand).
// Usage, depuis la racine : node design/build.mjs   (REMINDS_IMPORT_LIVE=1 : import annoncé ouvert)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { loadTokens, toCss } from './tokens.mjs';
import { ctx, page, frenchSpacing, keepWords, ROUTES } from './src/kit.mjs';
import { home } from './src/home.mjs';
import { guide, legal, notFound } from './src/docs.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '..');
const tokens = loadTokens(path.join(dir, 'tokens.json'));

// Attributs style="--x:…" du générateur (recadrages, positions de la frise) : convertis en classes
// .v-<empreinte>, dont les règles sont ajoutées à theme.css. Même rendu, compatible avec style-src 'self'.
const rules = new Map();
function hoistStyles(html) {
  return html.replace(/<([a-z]+)((?:\s[^>]*?)?)\sstyle="([^"]*)"([^>]*)>/g, (m, tag, before, decl, after) => {
    const cls = 'v-' + crypto.createHash('sha1').update(decl).digest('hex').slice(0, 8);
    rules.set(cls, decl);
    let attrs = before + after;
    attrs = /\sclass="/.test(attrs) ? attrs.replace(/\sclass="([^"]*)"/, (x, c) => ` class="${c} ${cls}"`) : ` class="${cls}"${attrs}`;
    return `<${tag}${attrs}>`;
  });
}

const PAGES = { home, guide, mentions: legal('mentions'), privacy: legal('privacy'), terms: legal('terms') };
const written = [];
function write(rel, html) {
  const out = path.join(root, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, hoistStyles(html));
  written.push(rel);
}
for (const [key, fn] of Object.entries(PAGES)) for (const lang of ['fr', 'en']) {
  const c = ctx(lang, key);
  const html = keepWords(page(c, fn(c)));
  write(ROUTES[key][lang], lang === 'fr' ? frenchSpacing(html) : html);
}
{
  const c = ctx('fr', 'notfound');
  write('404.html', frenchSpacing(keepWords(page(c, notFound(c)))));
}

const vars = [...rules].sort().map(([cls, decl]) => `.${cls} { ${decl}; }`).join('\n');
const css = toCss(tokens).replaceAll('url(fonts/', 'url(/fonts/') +
  `\n/* Recadrages et positions (générés par design/build.mjs depuis les pages). */\n${vars}\n`;
fs.writeFileSync(path.join(root, 'theme.css'), css);

const manifestFile = path.join(root, 'site.webmanifest');
const manifest = fs.readFileSync(manifestFile, 'utf8')
  .replace(/("background_color": )"[^"]*"/, `$1"${tokens.color.light.paper}"`)
  .replace(/("theme_color": )"[^"]*"/, `$1"${tokens.color.light.brand}"`);
fs.writeFileSync(manifestFile, manifest);

console.log(`theme.css + site.webmanifest + ${written.length} pages : ${written.join(', ')}`);
