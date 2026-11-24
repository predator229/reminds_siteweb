// Accueil du site vitrine (FR et EN). Contenu repris de reminds_siteweb/index.html, conditions et confidentialité.
import { icon, cta, browser, phone, IMPORT_LIVE } from './kit.mjs';

const FIRST = 2009, LAST = 2026;
const pos = (y) => (((y - FIRST) / (LAST - FIRST)) * 100).toFixed(2) + '%';

// La frise (signature du système) : toute la période d'un export, 2009 à 2026, et quatre souvenirs fictifs.
function frise(c) {
  const { t } = c;
  const mems = [
    [2010, 'Yann Mensah', t('« Tu as eu ton train ? Raconte ! »', '“Did you catch your train? Tell me!”')],
    [2014, 'Maya Laurent', t('« Des crêpes ce soir ? »', '“Crêpes tonight?”')],
    [2018, t('Coloc rue Victor Hugo', 'Victor Hugo St flat'), t('« Qui a pris le dernier café ? »', '“Who took the last coffee?”')],
    [2022, t('Famille', 'Family'), t('« Joyeux anniversaire mamie ! »', '“Happy birthday, Grandma!”')],
  ];
  const ago = (y) => t(`il y a ${2026 - y} ans`, `${2026 - y} years ago`);
  const years = [];
  for (let y = FIRST; y <= LAST; y++) {
    const major = mems.some(([m]) => m === y) || y === LAST;
    years.push(`<span class="frise__y${major ? ' is-major' : ''}${y === FIRST ? ' is-first' : ''}" style="--at:${pos(y)}">${y}</span>`);
  }
  return `<div class="frise" role="img" aria-label="${t('Frise de 2009 à 2026 : quatre souvenirs retrouvés dans vos conversations', 'Timeline from 2009 to 2026: four memories found in your conversations')}">
    <ol class="frise__mems">${mems.map(([y, who, q], i) => `<li class="frise__mem${i % 2 ? ' is-alt' : ''}" style="--at:${pos(y)}"><span class="frise__when">${y}, ${ago(y)}</span><span class="frise__quote">${q}</span><span class="frise__who">${who}</span></li>`).join('')}</ol>
    <div class="frise__track"><span class="frise__run" style="--from:${pos(2010)}"></span>${mems.map(([y]) => `<span class="frise__dot" style="--at:${pos(y)}"></span>`).join('')}</div>
    <div class="frise__years" aria-hidden="true">${years.join('')}</div>
  </div>`;
}

function hero(c) {
  const { t } = c;
  return `<section class="hero"><div class="wrap">
  <div class="hero__grid">
    <h1 class="h-hero">${t('Relisez vos conversations, en toute intimité.', 'Reread your conversations, in complete privacy.')}</h1>
    <div class="hero__side">
      <p class="lead">${t('Reminds transforme l’export de vos discussions Messenger en un fil clair, que l’on parcourt et que l’on fouille : messages, photos, audios, dates et souvenirs. Pour vous, et pour la personne avec qui vous la partagez.', 'Reminds turns your Messenger export into a clear thread you can browse and search: messages, photos, voice messages, dates and memories. For you, and for the person you share it with.')}</p>
      ${cta(c)}
      <p class="hint">${t('Déjà accès, ou une conversation partagée avec vous ? Ouvrez Reminds : code par e-mail ou compte Google.', 'Already have access, or did someone share a conversation with you? Open Reminds: code by e-mail or Google account.')}</p>
    </div>
  </div>
  ${frise(c)}
  <div class="stage">
    ${browser(c, 'home-desktop', { y: 0, h: 820, alt: t('L’accueil de Reminds : souvenirs « Ce jour-là », conversations lues récemment et chiffres de l’archive', 'The Reminds home screen: “On this day” memories, recently read conversations and archive figures') })}
    ${phone(c, 'conversations-phone', { h: 844, cls: 'stage__phone', alt: t('La liste des conversations sur iPhone, chacune avec sa période sur une frise', 'The conversation list on iPhone, each with its period on a timeline') })}
  </div>
</div></section>`;
}

function steps(c) {
  const { t, href } = c;
  const soon = IMPORT_LIVE ? '' : ` <span class="badge">${t('Bientôt disponible', 'Coming soon')}</span>`;
  const items = [
    [t('Demandez un accès', 'Request access'), t('Dans l’app, indiquez votre adresse e-mail, votre nom et, si vous le souhaitez, un message. L’éditeur valide la demande et vous prévient par e-mail.', 'In the app, enter your e-mail address, your name and, if you like, a message. The publisher reviews the request and lets you know by e-mail.'), ''],
    [t('Importez votre export Facebook', 'Import your Facebook export') + soon, t('Téléchargez vos informations Facebook (Messages, format JSON), puis envoyez le zip depuis l’app web ou l’iPhone.', 'Download your Facebook information (Messages, JSON format), then upload the zip from the web app or the iPhone.'), `<a class="link" href="${href('guide')}">${t('Le guide pas à pas', 'The step-by-step guide')}${icon('right', 'i-xs')}</a>`],
    [t('Relisez, et partagez', 'Reread, and share'), t('Gardez les conversations qui comptent, relisez-les où vous voulez, et partagez-en une avec la personne qui l’a vécue avec vous.', 'Keep the conversations that matter, reread them anywhere, and share one with the person who lived it with you.'), ''],
  ];
  return `<section class="section section--sheet" id="etapes" aria-labelledby="etapes-t"><div class="wrap">
  <div class="section__head">
    <h2 class="h2" id="etapes-t">${t('Trois étapes, et des années de messages se relisent.', 'Three steps, and years of messages are yours to reread.')}</h2>
  </div>
  <ol class="steps">${items.map(([h, p, more], i) => `<li class="step"><span class="step__n">${i + 1}</span><div class="step__body"><h3 class="h3">${h}</h3><p>${p}</p>${more}</div></li>`).join('')}</ol>
</div></section>`;
}

const ticks = (list) => `<ul class="ticks">${list.map((x) => `<li>${icon('check', 'i-sm')}<span>${x}</span></li>`).join('')}</ul>`;

function features(c) {
  const { t } = c;
  const row = ({ id, title, text, list, visual, flip = false, wide = false }) => `<article class="feature${flip ? ' feature--flip' : ''}${wide ? ' feature--wide' : ''}" aria-labelledby="${id}">
    <div class="feature__text"><h3 class="h3 h3--lg" id="${id}">${title}</h3><p>${text}</p>${ticks(list)}</div>
    <div class="feature__visual">${visual}</div>
  </article>`;
  const both = (desk, ph) => `<div class="only-desk">${desk}</div><div class="only-phone">${ph}</div>`;
  const rows = [
    row({ id: 'f-import', title: t('Des milliers de fils, triés d’un coup d’œil', 'Thousands of threads, sorted at a glance'),
      text: t('L’export Facebook est un dossier de fichiers bruts. Reminds en fait une liste claire : chaque conversation, sa période sur une frise, son nombre de messages et de médias.', 'A Facebook export is a folder of raw files. Reminds turns it into a clear list: each conversation, its period on a timeline, its number of messages and media.'),
      list: [t('Les comptes supprimés et les fils d’un seul message sont écartés d’office', 'Deleted accounts and one-message threads are left out by default'), t('Plusieurs zips : Reminds ajoute ce qui manque, sans rien effacer', 'Several zips: Reminds adds what is missing, without erasing anything'), t('Vous gardez seulement ce que vous cochez', 'You keep only what you tick')],
      visual: both(browser(c, 'import-select-desktop', { x: 548, y: 120, w: 880, h: 620, alt: t('Choix des conversations à importer', 'Choosing the conversations to import') }), phone(c, 'import-select-phone', { h: 700 })) }),
    row({ id: 'f-read', flip: true, title: t('Un fil qui se lit comme un livre', 'A thread that reads like a book'),
      text: t('Messages, photos, GIF et audios, à leur place, jour après jour. On ouvre l’histoire à n’importe quelle page, et l’app retient où vous vous étiez arrêté.', 'Messages, photos, GIFs and voice messages, in place, day after day. Open the story at any page, and the app remembers where you left off.'),
      list: [t('Les audios se réécoutent dans la conversation', 'Voice messages play right in the conversation'), t('Parcourir le temps par année et par mois', 'Browse time by year and by month'), t('Un thème de couleur par conversation', 'A colour theme for each conversation')],
      visual: both(browser(c, 'conversation-desktop', { x: 232, y: 112, w: 955, h: 700, alt: t('Une conversation ouverte, avec le rail des années', 'An open conversation, with the year rail') }), phone(c, 'conversation-phone', { h: 700 })) }),
    row({ id: 'f-find', title: t('Un mot, un nom, une date', 'A word, a name, a date'),
      text: t('Un mot suffit, même sans les accents. Chaque résultat ouvre le message à sa place dans le fil. Le calendrier marque chaque jour échangé : touchez une date, le fil s’ouvre ce jour-là.', 'One word is enough, even without accents. Each result opens the message right where it sits in the thread. The calendar marks every day you talked: tap a date and the thread opens on that day.'),
      list: [t('Filtrer par conversation, par période, par auteur', 'Filter by conversation, period and author'), t('Photos, audios et liens se cherchent aussi', 'Photos, voice messages and links are searchable too')],
      visual: both(browser(c, 'search-desktop', { x: 500, y: 64, w: 940, h: 720, alt: t('Résultats de recherche pour « café »', 'Search results for “café”') }), phone(c, 'search-phone', { h: 700 })) }),
    row({ id: 'f-relive', wide: true, title: t('Ce jour-là, et toute une histoire en chiffres', 'On this day, and a whole story in numbers'),
      text: t('Ce que vous vous écriviez à la même date, les années précédentes. Et pour chaque conversation : qui écrit le plus, les mois les plus bavards, les heures préférées, la plus longue série de jours.', 'What you were writing to each other on the same date, in years past. And for each conversation: who writes the most, the chattiest months, favourite times of day, the longest streak.'),
      list: [t('Statistiques mises à jour après chaque import', 'Statistics updated after each import'), t('Les souvenirs du jour sur l’accueil', 'Today’s memories on the home screen')],
      visual: both(browser(c, 'stats-desktop', { x: 232, y: 0, w: 1208, h: 600, alt: t('Statistiques d’une conversation', 'Statistics for a conversation') }), phone(c, 'stats-phone', { h: 700 })) }),
  ];
  const more = [
    ['image', t('Galerie', 'Gallery'), t('Tout ce qui a été partagé, avec un lien vers le moment de l’envoi.', 'Everything you shared, with a link to the moment it was sent.')],
    ['bookmark', t('Signets', 'Bookmarks'), t('Gardez les messages qui comptent, avec une note.', 'Keep the messages that matter, with a note.')],
    ['share', t('Partage', 'Sharing'), t('Invitez la personne qui l’a vécue avec vous, par e-mail.', 'Invite the person who lived it with you, by e-mail.')],
    ['palette', t('Thèmes', 'Themes'), t('Huit couleurs, une par conversation si vous le voulez.', 'Eight colours, one per conversation if you like.')],
    ['phone', t('Hors ligne sur iPhone', 'Offline on iPhone'), t('Ce que vous avez déjà ouvert se relit sans réseau.', 'What you have already opened can be reread without a connection.')],
    ['history', t('Reprise de lecture', 'Pick up where you left off'), t('L’app retient où vous vous étiez arrêté.', 'The app remembers where you stopped reading.')],
  ];
  return `<section class="section" id="fonctionnalites" aria-labelledby="fonc-t"><div class="wrap">
  <div class="section__head">
    <h2 class="h2" id="fonc-t">${t('Des années de messages, enfin lisibles.', 'Years of messages, finally readable.')}</h2>
    <p class="lead">${t('Reminds range l’export et le rend agréable à relire, comme un livre que l’on ouvre à n’importe quelle page.', 'Reminds puts the export in order and makes it a pleasure to reread, like a book you can open at any page.')}</p>
  </div>
  ${rows.join('\n')}
  <ul class="more">${more.map(([i, h, p]) => `<li>${icon(i, 'more__i')}<div><h3 class="more__h">${h}</h3><p>${p}</p></div></li>`).join('')}</ul>
</div></section>`;
}

function security(c) {
  const { t, href } = c;
  const path = [
    [t('Vous envoyez le zip', 'You upload the zip'), t('Depuis l’app web ou l’iPhone, en HTTPS. Un envoi coupé reprend là où il s’était arrêté.', 'From the web app or the iPhone, over HTTPS. An interrupted upload resumes where it stopped.')],
    [t('Il est ouvert dans un bac à sable isolé', 'It is opened in an isolated sandbox'), t('Un environnement séparé du reste du serveur : analyse antivirus, puis lecture des messages.', 'An environment kept apart from the rest of the server: virus scan, then message reading.')],
    [t('Vous choisissez ce qui reste', 'You choose what stays'), t('Seules les conversations que vous cochez sont gardées.', 'Only the conversations you tick are kept.')],
    [t('Le zip est effacé', 'The zip is deleted'), t('Dès la fin de l’import, ou au bout de 24 heures si l’import n’est pas terminé.', 'As soon as the import ends, or after 24 hours if it is not finished.')],
  ];
  const promises = [
    ['key', t('Accès sur validation', 'Access on approval'), t('Pas d’inscription libre. Connexion avec un code à 6 chiffres reçu par e-mail, ou avec votre compte Google.', 'No open sign-up. Sign in with a 6-digit code sent by e-mail, or with your Google account.')],
    ['lock', t('Chiffré en transit', 'Encrypted in transit'), t('Tout passe par HTTPS. Photos et audios ne sont servis qu’avec une session valide, jamais par un lien public.', 'Everything goes over HTTPS. Photos and voice messages are only served with a valid session, never through a public link.')],
    ['shield', t('Hébergé en privé', 'Privately hosted'), t('Sur un serveur administré par l’éditeur, dans l’Union européenne. Rien n’est lu, analysé ni revendu.', 'On a server run by the publisher, in the European Union. Nothing is read, analysed or sold.')],
    ['eye', t('Ni publicité, ni traceur', 'No ads, no trackers'), t('Aucun cookie publicitaire, aucune mesure d’audience, ni sur le site ni dans l’app.', 'No advertising cookie, no audience measurement, on the site or in the app.')],
    ['user', t('Verrou Face ID', 'Face ID lock'), t('L’app iPhone s’ouvre avec votre visage. La reconnaissance reste dans l’iPhone.', 'The iPhone app opens with your face. Recognition stays on the iPhone.')],
    ['file', t('Vos droits', 'Your rights'), t('Une copie de vos données ou leur suppression, à tout moment, sur simple e-mail.', 'A copy of your data or its deletion, at any time, by simple e-mail.')],
  ];
  return `<section class="section section--sheet" id="securite" aria-labelledby="sec-t"><div class="wrap">
  <div class="sec">
    <div class="sec__intro">
      <h2 class="h2" id="sec-t">${t('Vos souvenirs restent les vôtres.', 'Your memories stay yours.')}</h2>
      <p class="lead">${t('Une conversation contient aussi les mots d’une autre personne. Reminds est pensé pour qu’elle ne sorte jamais du cercle de celles et ceux qui y ont été invités.', 'A conversation also holds someone else’s words. Reminds is designed so it never leaves the circle of people invited to it.')}</p>
      <a class="link" href="${href('privacy')}">${t('Lire la politique de confidentialité', 'Read the privacy policy')}${icon('right', 'i-xs')}</a>
    </div>
    <div class="journey">
      <h3 class="h3">${t('Le trajet de votre export', 'Where your export goes')}</h3>
      <ol class="journey__list">${path.map(([h, p], i) => `<li${i === path.length - 1 ? ' class="is-end"' : ''}><span class="journey__n">${i + 1}</span><div><p class="journey__h">${h}</p><p>${p}</p></div></li>`).join('')}</ol>
    </div>
  </div>
  <ul class="more more--tight">${promises.map(([i, h, p]) => `<li>${icon(i, 'more__i')}<div><h3 class="more__h">${h}</h3><p>${p}</p></div></li>`).join('')}</ul>
</div></section>`;
}

function access(c) {
  const { t } = c;
  const blocks = [
    ['globe', t('App web, installable', 'Installable web app'), t('Sur ordinateur comme sur téléphone, dans le navigateur. Installez-la pour l’ouvrir comme une app : elle se met à jour toute seule.', 'On a computer or a phone, right in the browser. Install it to open it like an app: it keeps itself up to date.')],
    ['phone', t('App iPhone', 'iPhone app'), t('Avec Face ID et la relecture hors ligne. Installée en privé pour l’instant : elle n’est pas encore sur l’App Store.', 'With Face ID and offline reading. Installed privately for now: it is not on the App Store yet.')],
    ['mail', t('Partagée avec vous ?', 'Shared with you?'), t('Une personne vous a invité sur une conversation : ouvrez Reminds avec l’adresse e-mail qui a reçu l’invitation.', 'Someone invited you to a conversation: open Reminds with the e-mail address that received the invitation.')],
  ];
  return `<section class="section" id="acces" aria-labelledby="acces-t"><div class="wrap">
  <div class="access">
    <div class="access__main">
      <h2 class="h2" id="acces-t">${t('Sur le web et sur iPhone, avec le même compte.', 'On the web and on iPhone, with the same account.')}</h2>
      <p class="lead">${t('Accès sur validation : vous demandez un accès dans l’app, l’éditeur le valide et vous prévient par e-mail. Gratuit, sans abonnement ni publicité.', 'Access on approval: you request access in the app, the publisher approves it and lets you know by e-mail. Free, with no subscription and no ads.')}</p>
      <ul class="more more--stack">${blocks.map(([i, h, p]) => `<li>${icon(i, 'more__i')}<div><h3 class="more__h">${h}</h3><p>${p}</p></div></li>`).join('')}</ul>
      ${cta(c)}
    </div>
    <div class="access__visual">${phone(c, 'request-access-phone', { h: 800, alt: t('Le formulaire de demande d’accès dans l’app', 'The access request form in the app') })}</div>
  </div>
</div></section>`;
}

function guide(c) {
  const { t, href } = c;
  const rows = [
    [t('Informations', 'Information'), t('Messages seulement', 'Messages only')],
    [t('Période', 'Date range'), t('Depuis le début', 'All time')],
    [t('Format', 'Format'), 'JSON'],
    [t('Qualité des contenus multimédias', 'Media quality'), t('Qualité supérieure', 'Higher quality')],
  ];
  return `<section class="section section--sheet" id="guide" aria-labelledby="guide-t"><div class="wrap">
  <div class="split">
    <div>
      <h2 class="h2" id="guide-t">${t('Récupérer votre export Facebook', 'Get your Facebook export')}</h2>
      <p class="lead">${t('Facebook prépare une copie de vos conversations. Quatre réglages comptent : le guide les montre écran par écran, sur ordinateur et sur iPhone, avec les discussions chiffrées.', 'Facebook prepares a copy of your conversations. Four settings matter: the guide shows them screen by screen, on a computer and on iPhone, including encrypted chats.')}</p>
      <a class="btn btn--lg btn--secondary" href="${href('guide')}">${t('Lire le guide pas à pas', 'Read the step-by-step guide')}</a>
    </div>
    <figure class="recap">
      <figcaption class="recap__cap">${t('Le récapitulatif de Facebook, une fois réglé', 'Facebook’s summary, once set')}</figcaption>
      <dl>${rows.map(([k, v]) => `<div class="recap__row"><dt>${k}</dt><dd>${v}${icon('check', 'i-sm')}</dd></div>`).join('')}</dl>
    </figure>
  </div>
</div></section>`;
}

function faq(c) {
  const { t, href } = c;
  const qa = [
    [t('Reminds est-il gratuit ?', 'Is Reminds free?'), t('Oui. Aucun paiement n’est demandé : pas d’abonnement, pas d’achat dans l’app, pas de publicité.', 'Yes. No payment is asked: no subscription, no in-app purchase, no ads.')],
    [t('Pourquoi faut-il demander un accès ?', 'Why do I have to request access?'), t('Parce que Reminds garde des conversations privées. Il n’y a pas d’inscription libre : l’éditeur valide chaque demande, ou une personne vous partage une conversation avec votre adresse e-mail.', 'Because Reminds holds private conversations. There is no open sign-up: the publisher approves each request, or someone shares a conversation with you using your e-mail address.')],
    [t('Reminds se connecte-t-il à mon compte Facebook ?', 'Does Reminds connect to my Facebook account?'), t('Non. Reminds ne se connecte ni à Facebook ni à Messenger, n’envoie aucun message et ne publie rien. Vous importez vous-même l’export que Facebook vous fournit.', 'No. Reminds never connects to Facebook or Messenger, sends no messages and publishes nothing. You import the export Facebook gives you yourself.')],
    [t('Que devient le fichier que j’envoie ?', 'What happens to the file I upload?'), t('Il est ouvert dans un environnement isolé, analysé par un antivirus, puis effacé dès la fin de l’import, ou au bout de 24 heures si l’import n’est pas terminé. Seules les conversations que vous choisissez sont gardées.', 'It is opened in an isolated environment, scanned for viruses, then deleted as soon as the import ends, or after 24 hours if it is not finished. Only the conversations you choose are kept.')],
    [t('Qui peut voir une conversation importée ?', 'Who can see an imported conversation?'), t('Vous, et les personnes avec qui vous la partagez : 10 au plus, et seulement des personnes qui y ont participé. Elle n’est jamais publiée.', 'You, and the people you share it with: 10 at most, and only people who took part in it. It is never published.')],
    [t('J’apparais dans une conversation importée par quelqu’un d’autre.', 'I appear in a conversation someone else imported.'), t('Vos droits s’appliquent aussi : écrivez à contact@cybersds.fr pour demander l’accès, la rectification ou l’effacement. Réponse sous 30 jours.', 'Your rights apply too: write to contact@cybersds.fr to ask for access, correction or deletion. Answer within 30 days.')],
    [t('Mes discussions chiffrées de bout en bout sont-elles prises en compte ?', 'Are my end-to-end encrypted chats included?'), t('Elles peuvent manquer dans l’export classique. Facebook propose un téléchargement séparé, que Reminds lit à titre expérimental. Le guide explique comment l’obtenir.', 'They can be missing from the regular export. Facebook offers a separate download, which Reminds reads on an experimental basis. The guide explains how to get it.')],
    [t('Reminds remplace-t-il mon export ?', 'Does Reminds replace my export?'), t('Non. Reminds n’est pas une sauvegarde : gardez votre export d’origine.', 'No. Reminds is not a backup: keep your original export.')],
  ];
  return `<section class="section" id="faq" aria-labelledby="faq-t"><div class="wrap">
  <div class="faq">
    <div class="faq__head">
      <h2 class="h2" id="faq-t">${t('Questions fréquentes', 'Frequently asked questions')}</h2>
      <p>${t('Une autre question ? Écrivez à', 'Another question? Write to')} <a class="link" href="mailto:contact@cybersds.fr">contact@cybersds.fr</a>.</p>
      <p><a class="link" href="${href('terms')}">${t('Lire les conditions d’utilisation', 'Read the terms of use')}${icon('right', 'i-xs')}</a></p>
    </div>
    <div class="faq__list">${qa.map(([q, a], i) => `<details${i < 2 ? ' open' : ''}><summary>${q}${icon('down', 'faq__chev')}</summary><p>${a}</p></details>`).join('')}</div>
  </div>
</div></section>`;
}

function closing(c) {
  const { t } = c;
  return `<section class="closing" aria-labelledby="end-t"><div class="wrap closing__in">
  <div>
    <h2 class="h2" id="end-t">${t('Prêt à relire vos conversations ?', 'Ready to reread your conversations?')}</h2>
    <p class="lead">${t('Demandez un accès en une minute depuis l’app.', 'Request access in a minute from the app.')}</p>
  </div>
  ${cta(c)}
</div></section>`;
}

export function home(c) {
  const { t } = c;
  return {
    title: t('Reminds : relire vos conversations Messenger, en privé', 'Reminds: reread your Messenger conversations, privately'),
    description: t('Relisez vos conversations Messenger en privé, sur iPhone et sur le web. Accès sur validation.', 'Reread your Messenger conversations privately, on iPhone and the web. Access on approval.'),
    body: [hero(c), steps(c), features(c), security(c), access(c), guide(c), faq(c), closing(c)].join('\n'),
  };
}
