// Compare le site construit aux rendus des maquettes (reminds-web-redesign/mockups/redesign/landing/shots) :
// mêmes pages, tailles, thèmes et menu du téléphone que render.mjs des maquettes, puis côte à côte
// (maquette | site) et écart en pixels (ImageMagick compare -metric AE). Chrome headless uniquement.
// Prérequis : la racine servie en local (python3 -m http.server 8771) ; Playwright de reminds-web-redesign.
// Usage : REMINDS_IMPORT_LIVE=1 node design/build.mjs && node design/render.mjs [page ...]
// Sorties (non versionnées) : design/compare/{site,sbs,diff}/, design/compare/report.txt
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const MOCK = process.env.MOCKUP_DIR || path.resolve(dir, '../../reminds-web-redesign/mockups/redesign/landing');
const { chromium } = createRequire(path.join(MOCK, '../../../package.json'))('playwright');
const BASE = process.env.SITE_URL || 'http://localhost:8771';
const out = path.join(dir, 'compare');
for (const d of ['mockup', 'site', 'sbs', 'diff']) fs.mkdirSync(path.join(out, d), { recursive: true });

// Référence : les rendus de la maquette au commit noté dans design/SOURCE (pas l'arbre de travail, qui bouge).
const REF = process.env.MOCKUP_REF || fs.readFileSync(path.join(dir, 'SOURCE'), 'utf8').split(' ')[1];
const repo = path.resolve(MOCK, '../../..');
const SHOTS = path.join(out, 'mockup');
for (const f of execFileSync('git', ['-C', repo, 'ls-tree', '--name-only', `${REF}:mockups/redesign/landing/shots`]).toString().split('\n').filter((x) => x.endsWith('.png'))) {
  fs.writeFileSync(path.join(SHOTS, f), execFileSync('git', ['-C', repo, 'show', `${REF}:mockups/redesign/landing/shots/${f}`], { maxBuffer: 1 << 28 }));
}

const PAGES = {
  'accueil-fr': '/', 'accueil-en': '/en/',
  'guide-fr': '/guide-export-facebook.html', 'guide-en': '/en/facebook-export-guide.html',
  'legal-fr': '/mentions-legales.html', 'legal-en': '/en/legal-notice.html',
  '404': '/404.html',
};
const VIEWS = { desktop: { width: 1440, height: 900 }, phone: { width: 390, height: 844 } };
const only = process.argv.slice(2);
const names = only.length ? only : Object.keys(PAGES);
const problems = [];
const report = [];

// Même découpage que la maquette : Chrome répète le haut de page au-delà de 16 384 px.
async function fullShot(page, file, width, scale) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.floor(8000 / scale);
  if (height * scale <= 16000) return page.screenshot({ path: file, fullPage: true });
  const parts = [];
  for (let y = 0, i = 0; y < height; y += step, i++) {
    const part = `${file}.${i}.png`;
    await page.screenshot({ path: part, fullPage: true, clip: { x: 0, y, width, height: Math.min(step, height - y) } });
    parts.push(part);
  }
  execFileSync('magick', [...parts, '-append', '+repage', file]);
  parts.forEach((p) => fs.unlinkSync(p));
}

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.documentElement.classList.contains('ready') && [...document.images].every((i) => i.complete));
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].filter((i) => i.offsetParent !== null).map((i) => i.decode().catch(() => {}))));
  await page.waitForTimeout(100);
}

const size = (f) => execFileSync('magick', ['identify', '-format', '%wx%h', f]).toString();
function compare(shot) {
  const a = path.join(SHOTS, shot); const b = path.join(out, 'site', shot);
  if (!fs.existsSync(a)) return report.push(`${shot}: pas de rendu maquette`);
  const [sa, sb] = [size(a), size(b)];
  let ae;
  try { ae = execFileSync('magick', ['compare', '-metric', 'AE', a, b, path.join(out, 'diff', shot)], { stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (e) { ae = (e.stderr || '').toString(); }
  const px = parseFloat(ae) || 0;
  const [w, h] = sa.split('x').map(Number);
  report.push(`${shot}: ${sa === sb ? '' : `TAILLES ${sa} / ${sb} `}${px} px différents (${((px / (w * h)) * 100).toFixed(3)} %)`);
  execFileSync('magick', [a, b, '-background', 'gray50', '-splice', '0x0', '+append', path.join(out, 'sbs', shot)]);
}

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome', headless: true });
for (const theme of ['light', 'dark']) for (const [view, vp] of Object.entries(VIEWS)) for (const name of names) {
  const scale = view === 'phone' && !name.startsWith('guide') ? 2 : 1;
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: scale });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(`JS ${name}: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' && !/ERR_CONNECTION_RESET|ERR_SOCKET_NOT_CONNECTED/.test(m.text())) problems.push(`console ${name}: ${m.text()}`); });
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().endsWith('/404.html')) problems.push(`${name}: ${r.status()} ${r.url()}`); });
  // python http.server coupe parfois une connexion sous charge : on recharge tant qu'une image manque (3 fois au plus).
  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto(`${BASE}${PAGES[name]}?theme=${theme}`);
    await settle(page);
    if (await page.evaluate(() => [...document.images].every((i) => i.naturalWidth > 0))) break;
  }
  const tag = `${name} ${view} ${theme}`;
  const r = await page.evaluate(() => ({
    scroll: [document.documentElement.scrollWidth, document.documentElement.clientWidth],
    broken: [...document.images].filter((i) => i.offsetParent !== null && !i.naturalWidth).map((i) => i.getAttribute('src')),
    text: document.body.innerText,
  }));
  if (r.scroll[0] > r.scroll[1]) problems.push(`${tag}: débordement horizontal ${r.scroll}`);
  if (r.broken.length) problems.push(`${tag}: image absente ${r.broken.slice(0, 3)}`);
  if (r.text.includes(String.fromCharCode(0x2014))) problems.push(`${tag}: tiret cadratin affiché`);
  if (name.endsWith('-en')) {
    const fr = r.text.split('\n').filter((l) => /(^|\s)(les|des|une|vous|votre|vos|avec|dans|pour|aucun|aucune|et|est)(\s|$)/i.test(l) && !/CYBERSHIELD|Îlot|Version française/.test(l));
    if (fr.length) problems.push(`${tag}: texte français en EN ${JSON.stringify(fr.slice(0, 3))}`);
  }
  const shot = `${name}-${view}-${theme}.png`;
  await fullShot(page, path.join(out, 'site', shot), vp.width, scale);
  compare(shot);
  if (view === 'phone' && name === 'accueil-fr') {
    await page.click('.top__menu');
    await page.screenshot({ path: path.join(out, 'site', `${name}-${view}-${theme}-menu.png`) });
    compare(`${name}-${view}-${theme}-menu.png`);
  }
  await ctx.close();
}

// 404 servie en profondeur (nginx error_page) : mêmes chemins absolus, même rendu que /404.html.
if (!only.length || only.includes('404')) {
  const ctx = await browser.newContext({ viewport: VIEWS.phone, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.route((u) => u.pathname === '/a/b/c/inconnu', (route) => route.fulfill({ status: 404, contentType: 'text/html', body: fs.readFileSync(path.join(dir, '..', '404.html')) }));
  page.on('response', (r) => { if (r.status() >= 400 && !r.url().includes('/a/b/c/')) problems.push(`404 profonde: ${r.status()} ${r.url()}`); });
  await page.goto(`${BASE}/a/b/c/inconnu?theme=light`);
  await settle(page);
  await fullShot(page, path.join(out, 'site', '404-deep-phone-light.png'), 390, 2);
  try { execFileSync('magick', ['compare', '-metric', 'AE', path.join(out, 'site', '404-phone-light.png'), path.join(out, 'site', '404-deep-phone-light.png'), 'null:'], { stdio: 'pipe' }); report.push('404 profonde = /404.html : 0 px'); }
  catch (e) { report.push(`404 profonde vs /404.html : ${e.stderr}`); }
  await ctx.close();
}
await browser.close();
const text = `Référence : maquette ${REF}\n` + report.join('\n') + '\n\n' + (problems.length ? problems.join('\n') : 'Aucun problème (débordement, images, JS, 4xx, tiret cadratin, français en EN)') + '\n';
fs.writeFileSync(path.join(out, 'report.txt'), text);
console.log(text);
