// Briques communes du site vitrine : icônes, en-tête, pied de page, gabarit de page, cadres de capture.
import fs from 'node:fs';
import path from 'node:path';
import { loadTokens } from '../tokens.mjs';

// Aucune valeur de thème : les pages ne portent que des classes ; tout le visuel vient de styles.css + theme.css.

// Site réel : false par défaut (import encore fermé en prod). REMINDS_IMPORT_LIVE=1 pour le basculer (ou pour comparer aux maquettes).
export const IMPORT_LIVE = process.env.REMINDS_IMPORT_LIVE === '1'; // false : l'import est annoncé « Bientôt disponible » (un seul badge, étape 2 et guide)

const ICONS = {
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
  shield: '<path d="M12 3.5 5 6v5.5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6z"/><path d="m9.5 12 1.8 1.8 3.4-3.6"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.5-4.5-8.5 8"/>',
  mic: '<rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v2.5"/>',
  bookmark: '<path d="M6.5 4h11a.5.5 0 0 1 .5.5V20l-6-4-6 4V4.5a.5.5 0 0 1 .5-.5z"/>',
  share: '<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19.5a5.5 5.5 0 0 1 11 0M18 8v6M15 11h6"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.1 0 1.6-.8 1.6-1.6 0-1.2-1-1.5-1-2.6 0-.9.7-1.6 1.6-1.6h2.1a3.2 3.2 0 0 0 3.2-3.2c0-4.4-3.4-8-7.5-8z"/><circle cx="7.8" cy="11" r="1"/><circle cx="10.5" cy="7.3" r="1"/><circle cx="15" cy="7.8" r="1"/>',
  phone: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
  user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><path d="M4 20 20 4"/>',
  file: '<path d="M13.5 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8.5z"/><path d="M13.5 3.5v5h5"/>',
  down: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
  right: '<path d="m9.5 6 6 6-6 6"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M19.5 14.5A7.5 7.5 0 0 1 9.5 4.5a7.5 7.5 0 1 0 10 10z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  history: '<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4.5v4h4M12 8v4.5l3 1.8"/>',
};
const SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" class="sprite" aria-hidden="true">' +
  Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('') + '</svg>';
export const icon = (name, cls = '') => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

// Chemins des pages, par langue. `alt` = même page dans l'autre langue.
export const ROUTES = {
  home: { fr: 'index.html', en: 'en/index.html' },
  guide: { fr: 'guide-export-facebook.html', en: 'en/facebook-export-guide.html' },
  mentions: { fr: 'mentions-legales.html', en: 'en/legal-notice.html' },
  privacy: { fr: 'confidentialite.html', en: 'en/privacy.html' },
  terms: { fr: 'conditions.html', en: 'en/terms.html' },
  notfound: { fr: '404.html', en: '404.html' },
};

export function ctx(lang, key) {
  const file = ROUTES[key][lang];
  const P = '/'; // site réel : chemins absolus (404.html est servi à toutes les profondeurs)
  const t = (fr, en) => (lang === 'en' ? en : fr);
  const href = (k, l = lang) => P + ROUTES[k][l].replace(/(^|\/)index\.html$/, '$1');
  const shot = (name, cls = '', w = 1440, h = 900, alt = '') => {
    const s = lang === 'en' ? '-en' : '';
    return ['light', 'dark'].map((m) => `<img class="shot-${m} ${cls}" src="${P}images/app/${name}-${m}${s}.webp" width="${w}" height="${h}" alt="${m === 'light' ? alt : ''}"${m === 'dark' ? ' aria-hidden="true"' : ''} decoding="async">`).join('');
  };
  return { lang, key, P, t, href, shot, EN: lang === 'en' };
}

// Cadre « navigateur » autour d'une capture d'ordinateur, recadrée (coordonnées en px CSS de la capture 1440x900).
export function browser(c, name, { x = 0, y = 0, w = 1440, h = 900, alt = '' } = {}) {
  return `<figure class="browser"><div class="browser__bar"><span class="browser__url">${icon('lock', 'i-xs')}reminds.cybersds.fr/app</span></div>` +
    `<div class="crop" style="--x:${x};--y:${y};--w:${w};--h:${h}">${c.shot(name, '', 1440, 900, alt)}</div></figure>`;
}
// Cadre téléphone ; `h` = hauteur visible de la capture 390x844 (recadrage par le haut).
export function phone(c, name, { h = 844, alt = '', cls = '' } = {}) {
  return `<figure class="phone ${cls}"><div class="crop crop--phone" style="--x:0;--y:0;--w:390;--h:${h}">${c.shot(name, '', 390, 844, alt)}</div></figure>`;
}

export function header(c) {
  const { t, href, P } = c;
  const home = c.key === 'home' ? '' : href('home');
  const links = [
    [home + '#fonctionnalites', t('Fonctionnalités', 'Features')],
    [home + '#securite', t('Sécurité', 'Security')],
    [home + '#acces', t('Accès', 'Access')],
    [href('guide'), t('Guide', 'Guide')],
    [home + '#faq', 'FAQ'],
  ];
  const other = c.lang === 'en' ? 'fr' : 'en';
  const nav = links.map(([h, l]) => `<a href="${h}"${c.key === 'guide' && h === href('guide') ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<a class="skip" href="#contenu">${t('Aller au contenu', 'Skip to content')}</a>
<header class="top"><div class="wrap top__in">
  <a class="brand" href="${href('home')}"><img src="${P}images/icon-192.png" width="32" height="32" alt=""><span>Reminds</span></a>
  <nav class="nav" aria-label="${t('Navigation principale', 'Main navigation')}">${nav}</nav>
  <div class="top__tools">
    <a class="iconbtn iconbtn--text" href="${href(c.key, other)}" hreflang="${other}" lang="${other}" aria-label="${t('English version', 'Version française')}">${other.toUpperCase()}</a>
    <button class="iconbtn" type="button" data-theme-toggle aria-label="${t('Basculer le thème clair ou sombre', 'Switch light or dark theme')}">${icon('moon', 'only-light')}${icon('sun', 'only-dark')}</button>
    <a class="btn btn--secondary top__open" href="/app/">${t('Ouvrir Reminds', 'Open Reminds')}</a>
    <button class="iconbtn top__menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="${t('Menu', 'Menu')}">${icon('menu', 'only-closed')}${icon('x', 'only-open')}</button>
  </div>
</div>
<div class="menu" id="menu" hidden><div class="wrap">
  <nav class="menu__nav" aria-label="${t('Navigation principale', 'Main navigation')}">${nav}</nav>
  ${cta(c)}
</div></div>
</header>`;
}

// Paire d'actions : toujours la même hauteur, la même largeur, alignées (côte à côte, même sur téléphone).
export function cta(c, { primary = true } = {}) {
  const { t } = c;
  return `<div class="cta">
    <a class="btn btn--lg ${primary ? 'btn--primary' : 'btn--secondary'}" href="/app/?request=1">${t('Demander un accès', 'Request access')}</a>
    <a class="btn btn--lg btn--secondary" href="/app/">${t('Ouvrir Reminds', 'Open Reminds')}</a>
  </div>`;
}

export function footer(c) {
  const { t, href } = c;
  const home = c.key === 'home' ? '' : href('home');
  return `<footer class="foot"><div class="wrap">
  <div class="foot__grid">
    <div class="foot__brand">
      <a class="brand" href="${href('home')}"><img src="${c.P}images/icon-192.png" width="32" height="32" alt=""><span>Reminds</span></a>
      <p>${t('Relire vos conversations Messenger, en privé, sur le web et sur iPhone.', 'Reread your Messenger conversations, privately, on the web and on iPhone.')}</p>
    </div>
    <nav class="foot__col" aria-label="Reminds">
      <h2>Reminds</h2>
      <a href="${home}#fonctionnalites">${t('Fonctionnalités', 'Features')}</a>
      <a href="${home}#securite">${t('Sécurité', 'Security')}</a>
      <a href="${href('guide')}">${t('Guide export Facebook', 'Facebook export guide')}</a>
      <a href="${home}#faq">${t('Questions fréquentes', 'FAQ')}</a>
    </nav>
    <nav class="foot__col" aria-label="${t('Informations légales', 'Legal information')}">
      <h2>${t('Informations légales', 'Legal information')}</h2>
      <a href="${href('mentions')}">${t('Mentions légales', 'Legal notice')}</a>
      <a href="${href('privacy')}">${t('Confidentialité', 'Privacy')}</a>
      <a href="${href('terms')}">${t('Conditions', 'Terms')}</a>
      <a href="mailto:contact@cybersds.fr">contact@cybersds.fr</a>
    </nav>
  </div>
  <div class="foot__legal">
    <p class="foot__name">${t('Raison sociale : CYBERSHIELD DEV SOLUTIONS', 'Legal business name: CYBERSHIELD DEV SOLUTIONS')}</p>
    <p>© 2026 <a href="https://cybersds.fr">CYBERSHIELD DEV SOLUTIONS</a> · RCCM RB/PKO/26 A 31675 · IFU 0202518429222 · Parakou, ${t('Bénin', 'Benin')}</p>
    <p>${t('Les écrans montrés sur ce site sont des maquettes : noms, messages et dates sont fictifs.', 'The screens shown on this site are mock-ups: names, messages and dates are fictitious.')}</p>
  </div>
</div></footer>`;
}

// <head> du site réel : référencement et plateforme repris tels quels de la page v4 (design/content) :
// canonical, hreflang (dont x-default), robots, icônes, manifest, Open Graph, carte Twitter.
// theme-color vient des jetons (paper clair et sombre), jamais écrit en dur.
const CONTENT = path.resolve(import.meta.dirname, '../content');
const KEEP = /rel="(canonical|alternate|icon|apple-touch-icon|manifest)"|name="(robots|twitter:[^"]+)"|property="og:/;
const TOKENS = loadTokens(path.resolve(import.meta.dirname, '../tokens.json'));
function seoHead(c) {
  const v4 = fs.readFileSync(path.join(CONTENT, ROUTES[c.key][c.lang]), 'utf8');
  const head = v4.slice(v4.indexOf('<head>'), v4.indexOf('</head>'));
  return head.split('\n').map((l) => l.trim()).filter((l) => KEEP.test(l)).join('\n');
}

export function page(c, { title, description, body, bodyClass = '' }) {
  const { P } = c;
  return `<!doctype html>
<html lang="${c.lang}" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
${seoHead(c)}
<meta name="theme-color" media="(prefers-color-scheme: light)" content="${TOKENS.color.light.paper}">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="${TOKENS.color.dark.paper}">
<script src="${P}site.js"></script>
<link rel="stylesheet" href="${P}theme.css">
<link rel="stylesheet" href="${P}styles.css">
</head>
<body class="${bodyClass}">
${SPRITE}
${header(c)}
<main id="contenu">
${body}
</main>
${footer(c)}
</body>
</html>
`;
}

// Espaces insécables du français avant : ; ? ! » et après « (texte seulement, jamais dans les balises).
// « e-mail » ne se coupe jamais au trait d'union (corps de page seulement, jamais dans <head>).
export function keepWords(html) {
  const i = html.indexOf('<body');
  return html.slice(0, i) + html.slice(i).replace(/>([^<]+)</g, (m, text) => '>' + text.replace(/\b([eE])-mail(s?)\b/g, '<span class="nw">$1-mail$2</span>') + '<');
}

export function frenchSpacing(html) {
  return html.replace(/>([^<]+)</g, (m, text) => '>' + text
    .replace(/ ([:;?!»])/g, ' $1')
    .replace(/« /g, '« ') + '<');
}
