// Pages « document » : guide d'export Facebook, pages légales (même gabarit) et 404.
// Le texte du guide et des pages légales est lu dans le site actuel (reminds_siteweb, lecture seule)
// pour ne rien perdre ni réécrire : seule la mise en forme change.
import fs from 'node:fs';
import path from 'node:path';
import { icon, cta, IMPORT_LIVE } from './kit.mjs';

// Instantané des pages v4 (design/content) : le générateur ne relit jamais ses propres pages.
const SITE = process.env.REMINDS_SITE || path.resolve(import.meta.dirname, '../content');
const SOURCES = {
  guide: { fr: 'guide-export-facebook.html', en: 'en/facebook-export-guide.html' },
  mentions: { fr: 'mentions-legales.html', en: 'en/legal-notice.html' },
  privacy: { fr: 'confidentialite.html', en: 'en/privacy.html' },
  terms: { fr: 'conditions.html', en: 'en/terms.html' },
};

function read(key, lang) {
  const html = fs.readFileSync(path.join(SITE, SOURCES[key][lang]), 'utf8');
  const article = html.match(/<article>([\s\S]*?)<\/article>/)[1];
  const title = html.match(/<title>([\s\S]*?)<\/title>/)[1].trim();
  const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  return { article, title, desc };
}

// Liens du site v4 vers les routes du générateur (déjà absolus ; /images/guide/ reste tel quel).
function relink(c, html) {
  const map = {
    '/mentions-legales.html': 'mentions', '/confidentialite.html': 'privacy', '/conditions.html': 'terms', '/guide-export-facebook.html': 'guide',
    '/en/legal-notice.html': 'mentions', '/en/privacy.html': 'privacy', '/en/terms.html': 'terms', '/en/facebook-export-guide.html': 'guide',
  };
  return html
    .replace(/href="(\/[^"#]*\.html)"/g, (m, p) => (map[p] ? `href="${c.href(map[p])}"` : m))
    .replace(/href="\/(en\/)?#([^"]+)"/g, (m, en, id) => `href="${c.href('home')}#${id}"`);
}

function intro(article) {
  // Sur-titre, titre et date sortent de l'article pour former l'en-tête de page.
  const eyebrow = (article.match(/<p class="eyebrow">([\s\S]*?)<\/p>/) || [])[1] || '';
  const h1 = article.match(/<h1>([\s\S]*?)<\/h1>/)[1];
  const updated = (article.match(/<p class="updated">([\s\S]*?)<\/p>/) || [])[1] || '';
  const rest = article.replace(/<p class="eyebrow">[\s\S]*?<\/p>/, '').replace(/<h1>[\s\S]*?<\/h1>/, '').replace(/<p class="updated">[\s\S]*?<\/p>/, '');
  return { eyebrow, h1, updated, rest };
}

const docHead = (eyebrow, h1, updated) => `<header class="doc__head">
  ${eyebrow ? `<p class="doc__kicker">${eyebrow}</p>` : ''}
  <h1 class="h2">${h1}</h1>
  ${updated ? `<p class="meta">${updated}</p>` : ''}
</header>`;

export function guide(c) {
  const { t } = c;
  const src = read('guide', c.lang);
  let { eyebrow, h1, updated, rest } = intro(relink(c, src.article));
  rest = rest
    .replace(/ loading="lazy"/g, '')
    .replace(/<a class="zoom" href="[^"]*"[^>]*>(<img[^>]*>)<\/a>/g, '$1')
    .replace(/<div class="actions">[\s\S]*?<\/div>/, '')
    .replace(/<nav class="guide-toc"/, '<nav class="guide-toc only-phone"');
  if (IMPORT_LIVE) {
    rest = rest.replace(/(<h2 id="reminds">[\s\S]*?)\s*<span class="badge">[^<]*<\/span>/, '$1')
      .replace(/(<h2 id="reminds">[\s\S]*?<\/h2>)\s*<p>[\s\S]*?<\/p>/, '$1');
  }
  rest = rest.replace(/<span class="badge">/g, '<span class="badge badge--warn">');
  const toc = (src.article.match(/<nav class="guide-toc"[^>]*>([\s\S]*?)<\/nav>/) || [])[1] || '';
  const body = `<div class="wrap doc doc--guide">
  <article class="doc__main prose">
    ${docHead(eyebrow, h1, updated)}
    ${rest}
    <aside class="doc__cta">
      <p class="h3">${t('Votre export est prêt ?', 'Is your export ready?')}</p>
      <p>${t('Demandez un accès, ou ouvrez Reminds si vous en avez déjà un.', 'Request access, or open Reminds if you already have one.')}</p>
      ${cta(c)}
    </aside>
  </article>
  <aside class="doc__side only-desk" aria-labelledby="toc-t">
    <p class="doc__side-h" id="toc-t">${t('Sur cette page', 'On this page')}</p>
    ${toc.replace(/<ul>/, '<ul class="doc__toc">')}
  </aside>
</div>`;
  return { title: src.title, description: src.desc, body, bodyClass: 'page-doc' };
}

export function legal(key) {
  return (c) => {
    const { t, href } = c;
    const src = read(key, c.lang);
    const { eyebrow, h1, updated, rest } = intro(relink(c, src.article));
    const others = ['mentions', 'privacy', 'terms'];
    const names = { mentions: t('Mentions légales', 'Legal notice'), privacy: t('Confidentialité & RGPD', 'Privacy & GDPR'), terms: t('Conditions d’utilisation', 'Terms of use') };
    const body = `<div class="wrap doc doc--legal">
  <article class="doc__main prose">
    ${docHead(eyebrow, h1, updated)}
    ${rest}
  </article>
  <aside class="doc__side" aria-labelledby="legal-t">
    <p class="doc__side-h" id="legal-t">${t('Informations légales', 'Legal information')}</p>
    <ul class="doc__toc">${others.map((k) => `<li><a href="${href(k)}"${k === key ? ' aria-current="page"' : ''}>${names[k]}</a></li>`).join('')}</ul>
  </aside>
</div>`;
    return { title: src.title, description: src.desc, body, bodyClass: 'page-doc' };
  };
}

export function notFound(c) {
  const body = `<section class="lost"><div class="wrap">
  <p class="doc__kicker">Erreur 404</p>
  <h1 class="h-hero lost__h">Cette page s’est perdue.</h1>
  <p class="lead">Elle n’existe pas ou n’existe plus. Le reste du site, lui, est toujours là.</p>
  <div class="frise frise--lost" aria-hidden="true"><div class="frise__track"><span class="frise__run frise__run--a"></span><span class="frise__gap">404</span><span class="frise__run frise__run--b"></span></div></div>
  <div class="cta">
    <a class="btn btn--lg btn--primary" href="${c.href('home')}">Revenir à l’accueil</a>
    <a class="btn btn--lg btn--secondary" href="${c.href('home', 'en')}" lang="en" hreflang="en">English home page</a>
  </div>
</div></section>`;
  return { title: 'Page introuvable | Reminds', description: 'Cette page n’existe pas ou n’existe plus.', body, bodyClass: 'page-lost' };
}
export { icon };
