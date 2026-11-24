// Génère le thème à partir de la source unique tokens.json :
//  - theme.css : variables CSS consommées par system.css, les pages et (côté web) l'app React ;
//  - generated/reminds_theme.dart : jetons et ThemeData Flutter pour l'app iOS.
// Usage : node mockups/redesign/tokens.mjs [chemin/vers/tokens.json] [--css-out fichier.css]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const dir = path.dirname(fileURLToPath(import.meta.url));

export function loadTokens(file = path.join(dir, 'tokens.json')) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

const px = (n) => `${n}px`;
const vars = (obj, prefix = '--') => Object.entries(obj).filter(([k]) => !k.startsWith('$')).map(([k, v]) => `  ${prefix}${k}: ${v};`).join('\n');

export function toCss(t) {
  const fontFaces = Object.entries(t.font.files).map(([w, f]) => `@font-face { font-family: '${t.font.family}'; font-weight: ${w}; font-display: swap; src: url(${f}) format('woff2'); }`).join('\n');
  const type = Object.entries(t.type).map(([k, v]) => `  --t-${k}: ${v.weight} ${px(v.size)}/${px(v.line)} var(--font);\n  --tr-${k}: ${v.tracking}em;\n  --fs-${k}: ${px(v.size)};`).join('\n');
  const space = Object.entries(t.space).map(([k, v]) => `  --s${k}: ${px(v)};`).join('\n');
  const radius = Object.entries(t.radius).map(([k, v]) => `  --r-${k}: ${px(v)};`).join('\n');
  const sizeNames = { control: 'h-control', controlSm: 'h-control-sm', controlLg: 'h-control-lg', row: 'h-row', rowDense: 'h-row-dense', tabbar: 'h-tab', sidebar: 'side-w', icon: 'i', iconSm: 'i-sm', iconXs: 'i-xs', iconLg: 'i-lg', avatar: 'av', avatarSm: 'av-sm', avatarLg: 'av-lg', avatarXl: 'av-xl' };
  const size = Object.entries(t.size).map(([k, v]) => `  --${sizeNames[k] || k}: ${px(v)};`).join('\n');
  const m = t.motion;
  const scalars = [
    `  --font: '${t.font.family}', ${t.font.fallback};`, type, space, radius, size,
    `  --motion-fast: ${m.fast} ${m.easing};\n  --motion: ${m.base} ${m.easing};\n  --motion-slow: ${m.slow} ${m.easing};`,
    `  --focus: 0 0 0 ${px(t.focus.gap)} var(--sheet), 0 0 0 ${px(t.focus.gap + t.focus.width)} var(--ember);`,
    `  --page-gutter: ${px(t.layout.gutter)};\n  --page-max: ${px(t.layout.maxStandard)};\n  --page-top: ${px(t.layout.top)};\n  --page-bottom: ${px(t.layout.bottom)};`,
  ].join('\n');
  const lay = t.layout;
  const media = `@media (max-width: ${px(lay.tabletMax)}) { :root { --page-gutter: ${px(lay.gutterTablet)}; } }\n@media (max-width: ${px(lay.phoneMax)}) { :root { --page-gutter: ${px(lay.gutterPhone)}; --page-top: ${px(lay.topPhone)}; --page-bottom: ${px(lay.topPhone)}; } }`;
  const scheme = (mode) => `${vars(t.color[mode])}\n${vars(t.shadow[mode], '--shadow-')}\n  color-scheme: ${mode};`;
  const themes = Object.entries(t.conversationThemes).filter(([k]) => !k.startsWith('$')).map(([id, th]) =>
    `[data-ctheme='${id}'] {\n${vars(th.light)}\n}\n:root[data-theme='dark'] [data-ctheme='${id}'] {\n${vars(th.dark)}\n}`).join('\n');
  return `/* GÉNÉRÉ depuis tokens.json par tokens.mjs : ne pas modifier à la main. */\n${fontFaces}\n\n:root {\n${scalars}\n${scheme('light')}\n}\n\n${media}\n\n:root[data-theme='dark'] {\n${scheme('dark')}\n}\n\n/* Thèmes de conversation : surcharges, dans les écrans du fil (data-ctheme). */\n${themes}\n`;
}

/* ---------- Dart (Flutter, app iOS) ---------- */
function dartColor(c) {
  const hex = c.match(/^#([0-9a-f]{6})$/i);
  if (hex) return `Color(0xFF${hex[1].toUpperCase()})`;
  const rgba = c.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
  if (rgba) {
    const [r, g, b] = rgba.slice(1, 4).map(Number);
    const a = Math.round((rgba[4] === undefined ? 1 : Number(rgba[4])) * 255);
    return `Color(0x${[a, r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()})`;
  }
  return null;
}
const camel = (k) => k.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function toDart(t) {
  const palette = (mode) => Object.entries(t.color[mode]).map(([k, v]) => [camel(k), dartColor(v)]).filter(([, v]) => v);
  const names = palette('light').map(([k]) => k);
  const cls = (mode) => `  static const ${mode} = RemindsColors(\n${palette(mode).map(([k, v]) => `    ${k}: ${v},`).join('\n')}\n  );`;
  const ACC = ['ember', 'emberHover', 'emberInk', 'emberWash', 'emberText', 'bubbleMine', 'selected'];
  const accent = (o) => `RemindsAccent(${Object.entries(o).filter(([k, v]) => !k.startsWith('$') && dartColor(v) && ACC.includes(camel(k))).map(([k, v]) => `${camel(k)}: ${dartColor(v)}`).join(', ')})`;
  const themes = Object.entries(t.conversationThemes).filter(([k]) => !k.startsWith('$')).map(([id, th]) =>
    `  '${id}': (label: (fr: ${JSON.stringify(th.label.fr)}, en: ${JSON.stringify(th.label.en)}), light: ${accent(th.light)}, dark: ${accent(th.dark)}),`).join('\n');
  const type = Object.entries(t.type).map(([k, v]) => `  static const ${k} = TextStyle(fontFamily: '${t.font.family}', fontWeight: FontWeight.w${Math.min(900, Math.round(v.weight / 100) * 100)}, fontSize: ${v.size}, height: ${(v.line / v.size).toFixed(3)}, letterSpacing: ${(v.tracking * v.size).toFixed(2)});`).join('\n');
  const num = (v) => (Number.isInteger(v) ? `${v}.0` : `${v}`);
  const consts = (obj, filter = () => true) => Object.entries(obj).filter(([k, v]) => !k.startsWith('$') && typeof v === 'number' && filter(k)).map(([k, v]) => `  static const double ${k} = ${num(v)};`).join('\n');
  return `// GÉNÉRÉ depuis tokens.json par tokens.mjs : ne pas modifier à la main.
// ignore_for_file: public_member_api_docs
import 'package:flutter/material.dart';

/// Couleurs Reminds (clair et sombre), extension du ThemeData.
@immutable
class RemindsColors extends ThemeExtension<RemindsColors> {
  const RemindsColors({
${names.map((k) => `    required this.${k},`).join('\n')}
  });

${names.map((k) => `  final Color ${k};`).join('\n')}

${cls('light')}

${cls('dark')}

  /// Applique la surcharge d'un thème de conversation (accent, bulle « moi », sélection).
  RemindsColors withAccent(RemindsAccent a) => copyWith(${ACC.map((k) => `${k}: a.${k}`).join(', ')});

  @override
  RemindsColors copyWith({${names.map((k) => `Color? ${k}`).join(', ')}}) => RemindsColors(
${names.map((k) => `        ${k}: ${k} ?? this.${k},`).join('\n')}
      );

  @override
  RemindsColors lerp(ThemeExtension<RemindsColors>? other, double t) {
    if (other is! RemindsColors) return this;
    return RemindsColors(
${names.map((k) => `      ${k}: Color.lerp(${k}, other.${k}, t)!,`).join('\n')}
    );
  }
}

/// Surcharge d'un thème de conversation : seules les clés présentes remplacent les couleurs de base.
@immutable
class RemindsAccent {
  const RemindsAccent({${ACC.map((k) => `this.${k}`).join(', ')}});
  final Color? ${ACC.join(', ')};
}

typedef RemindsConversationTheme = ({({String fr, String en}) label, RemindsAccent light, RemindsAccent dark});

/// Les 8 thèmes de conversation (PLAN v1.5), libellés FR/EN.
const Map<String, RemindsConversationTheme> conversationThemes = {
${themes}
};

abstract final class RemindsSpace {
${Object.entries(t.space).map(([k, v]) => `  static const double s${k} = ${num(v)};`).join('\n')}
}

abstract final class RemindsRadius {
${consts(t.radius)}
}

/// Gabarit de page : même bord gauche et même gouttière droite sur tous les écrans.
abstract final class RemindsLayout {
${consts(t.layout)}
  /// Gouttière selon la largeur disponible (téléphone, tablette, ordinateur).
  static double gutterFor(double width) => width <= phoneMax ? gutterPhone : (width <= tabletMax ? gutterTablet : gutter);
}

abstract final class RemindsSize {
${consts(t.size)}
}

abstract final class RemindsMotion {
  static const fast = Duration(milliseconds: ${parseInt(t.motion.fast, 10)});
  static const base = Duration(milliseconds: ${parseInt(t.motion.base, 10)});
  static const slow = Duration(milliseconds: ${parseInt(t.motion.slow, 10)});
  static const curve = Cubic(.2, .8, .2, 1);
}

abstract final class RemindsType {
${type}
}

/// ThemeData de l'app. [conversationTheme] : identifiant d'un des 8 thèmes ; règle PLAN v1.5 :
/// une seule conversation, son thème s'applique à toute l'app ; plusieurs, 'classic'.
ThemeData remindsTheme(Brightness brightness, {String conversationTheme = 'classic'}) {
  final dark = brightness == Brightness.dark;
  final theme = conversationThemes[conversationTheme] ?? conversationThemes['classic']!;
  final c = (dark ? RemindsColors.dark : RemindsColors.light).withAccent(dark ? theme.dark : theme.light);
  return ThemeData(
    brightness: brightness,
    fontFamily: '${t.font.family}',
    scaffoldBackgroundColor: c.paper,
    colorScheme: ColorScheme.fromSeed(seedColor: c.ember, brightness: brightness).copyWith(
      primary: c.ember,
      onPrimary: c.emberInk,
      surface: c.sheet,
      onSurface: c.ink,
      error: c.danger,
      outline: c.ruleStrong,
    ),
    dividerColor: c.rule,
    extensions: [c],
  );
}
`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  const src = args.find((a) => a.endsWith('.json')) || path.join(dir, 'tokens.json');
  const outIdx = args.indexOf('--css-out');
  const cssOut = outIdx >= 0 ? args[outIdx + 1] : path.join(dir, 'theme.css');
  const t = loadTokens(src);
  fs.writeFileSync(cssOut, toCss(t));
  if (outIdx < 0) {
    fs.mkdirSync(path.join(dir, 'generated'), { recursive: true });
    const dart = path.join(dir, 'generated', 'reminds_theme.dart');
    fs.writeFileSync(dart, toDart(t));
    try { execFileSync('dart', ['format', '--page-width', '120', dart], { stdio: 'ignore' }); } catch { /* dart absent : fichier non formaté, mais valide */ }
  }
  console.log(`theme.css${outIdx < 0 ? ' + generated/reminds_theme.dart' : ''} depuis ${path.relative(dir, src)}`);
}
