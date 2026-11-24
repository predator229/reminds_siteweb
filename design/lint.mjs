// Vérifie qu'aucune valeur de thème n'est écrite en dur hors de tokens.json / theme.css (règles de
// mockups/redesign/lint.mjs) : couleurs, tailles de police, rayons, durées ; plus le tiret cadratin partout.
// Usage, depuis la racine : node design/lint.mjs   (code de sortie 1 en cas de problème)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RULES = [
  [/(?<!&)#[0-9a-fA-F]{3,8}\b/g, 'couleur hexadécimale'],
  [/\b(rgba?|hsla?)\(\s*[0-9]/g, 'couleur rgb/hsl'],
  [/hsla?\([^)]*\b\d+% \d+%/g, 'saturation/luminosité en dur'],
  [/font-size:\s*[0-9.]+(px|rem|em)/g, 'taille de police'],
  [/font:\s*[0-9]{3}\s+[0-9.]+px/g, 'police en dur'],
  [/border-radius:\s*[1-9][0-9.]*(px|%)/g, 'rayon'],
  [/box-shadow:\s*[0-9]/g, 'ombre'],
  [/transition:[^;]*[0-9]+m?s/g, 'durée'],
];
const THEMED = ['styles.css', 'site.js', 'design/build.mjs', ...fs.readdirSync(path.join(root, 'design/src')).map((f) => 'design/src/' + f)];
const out = [];
for (const f of THEMED) fs.readFileSync(path.join(root, f), 'utf8').split('\n').forEach((line, i) => {
  if (/href="#|id="|#i-|'#'|#\$\{/.test(line)) return; // ancres et sprite d'icônes, pas des couleurs
  for (const [re, label] of RULES) { const m = line.match(re); if (m) out.push(`${f}:${i + 1} ${label} « ${m[0]} »`); }
});
const DASH = String.fromCharCode(0x2014);
const skip = /^(\.git|node_modules|design\/compare|images|fonts)(\/|$)/;
for (const f of fs.readdirSync(root, { recursive: true })) {
  if (skip.test(f) || !/\.(html|css|js|mjs|md|json|txt|xml|webmanifest)$/.test(f) && f !== 'design/SOURCE') continue;
  if (fs.readFileSync(path.join(root, f), 'utf8').includes(DASH)) out.push(`${f}: tiret cadratin`);
}
console.log(out.length ? out.join('\n') + `\n${out.length} problème(s)` : 'Aucune valeur de thème en dur, aucun tiret cadratin');
process.exitCode = out.length ? 1 : 0;
