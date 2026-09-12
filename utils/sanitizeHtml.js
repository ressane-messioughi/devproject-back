// Nettoyage du HTML des messages du journal, côté serveur.
//
// Le navigateur nettoie déjà avant d'envoyer, mais cela ne protège de rien : un appel
// direct à l'API contourne entièrement le formulaire. Le serveur est le seul endroit où
// la règle ne peut pas être évitée, c'est donc lui qui doit avoir le dernier mot.
//
// Liste blanche, comme côté navigateur : tout est refusé sauf ce qui est nommé ici.
const BALISES_AUTORISEES = [
  'b',
  'strong',
  'i',
  'em',
  'u',
  's',
  'p',
  'br',
  'div',
  'span',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote',
  'img',
];

const SOURCES_IMAGES = ['https://res.cloudinary.com/'];

// Alignement du texte, traité exactement comme côté navigateur.
//
// Le navigateur produit style="text-align: center" quand on clique sur le bouton
// Centrer. Ce nettoyage réécrit chaque balise sans aucun attribut : l'alignement
// disparaissait donc à l'enregistrement, et les trois boutons de la barre
// d'outils ne servaient à rien.
//
// L'attribut style n'est pas autorisé pour autant : la valeur est relue, puis
// réécrite sous forme d'une classe prise dans une liste fermée. Ce qui est écrit
// dans le document ne vient jamais de ce qui a été reçu.
const BLOCS_ALIGNABLES = ['p', 'div', 'h2', 'h3', 'li', 'blockquote'];

const CLASSES_ALIGNEMENT = {
  center: 'aligne-centre',
  right: 'aligne-droite',
};

// Les classes que ce nettoyage a lui-même le droit de produire.
const CLASSES_CONNUES = Object.values(CLASSES_ALIGNEMENT);

const classeAlignement = (balise, nom) => {
  if (!BLOCS_ALIGNABLES.includes(nom)) return '';

  const style = balise.match(/\sstyle\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
  const trouve = /text-align:\s*(left|center|right)/i.exec(style);

  if (trouve) {
    const classe = CLASSES_ALIGNEMENT[trouve[1].toLowerCase()];
    // À gauche est déjà la valeur par défaut : il n'y a rien à écrire.
    return classe ? ` class="${classe}"` : '';
  }

  // Contenu déjà nettoyé une première fois par le navigateur : il ne porte plus
  // de style, mais la classe que ce nettoyage produit lui-même.
  //
  // Sans ce second cas, l'alignement disparaissait à l'enregistrement : le
  // navigateur traduisait le style en classe, puis le serveur jetait la classe
  // faute de style à relire. Le va-et-vient annulait le travail.
  //
  // La valeur reçue n'est pas recopiée pour autant : elle doit figurer à
  // l'identique dans la liste fermée, sinon elle est ignorée.
  const classeRecue = balise.match(/\sclass\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
  return CLASSES_CONNUES.includes(classeRecue.trim()) ? ` class="${classeRecue.trim()}"` : '';
};

export function sanitizeHtml(html) {
  if (!html) return '';

  let propre = String(html);

  // Les contenus exécutables partent en entier, balise et contenu compris
  propre = propre.replace(/<(script|style|iframe|object|embed|link|meta)[\s\S]*?<\/\1>/gi, '');
  propre = propre.replace(/<(script|style|iframe|object|embed|link|meta)[^>]*\/?>/gi, '');

  // Toute balise hors liste blanche est retirée, son texte est conservé
  propre = propre.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (balise, nom) => {
    if (!BALISES_AUTORISEES.includes(nom.toLowerCase())) return '';

    // Les fermetures n'ont jamais d'attribut à nettoyer
    if (balise.startsWith('</')) return `</${nom.toLowerCase()}>`;

    if (nom.toLowerCase() === 'img') {
      const source = balise.match(/\ssrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
      if (!SOURCES_IMAGES.some((prefixe) => source.startsWith(prefixe))) return '';

      const alt = balise.match(/\salt\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
      return `<img src="${source}" alt="${alt}" loading="lazy" />`;
    }

    // Pour toutes les autres, la balise est réécrite sans aucun attribut :
    // aucun gestionnaire d'évènement ne peut donc survivre. Seul l'alignement
    // est reposé, et uniquement depuis la liste fermée ci-dessus.
    const minuscule = nom.toLowerCase();
    return `<${minuscule}${classeAlignement(balise, minuscule)}>`;
  });

  return propre;
}
