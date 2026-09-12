// Nettoyage du HTML des messages du journal, côté serveur.
//
// Le navigateur nettoie déjà avant d'envoyer, mais cela ne protège de rien : un appel
// direct à l'API contourne entièrement le formulaire. Le serveur est le seul endroit où
// la règle ne peut pas être évitée, c'est donc lui qui doit avoir le dernier mot.
//
// Liste blanche, comme côté navigateur : tout est refusé sauf ce qui est nommé ici.
const BALISES_AUTORISEES = [
  'b', 'strong', 'i', 'em', 'u', 's',
  'p', 'br', 'div', 'span',
  'ul', 'ol', 'li',
  'h2', 'h3',
  'blockquote',
  'img',
];

const SOURCES_IMAGES = ['https://res.cloudinary.com/'];

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
    // aucun gestionnaire d'évènement ne peut donc survivre.
    return `<${nom.toLowerCase()}>`;
  });

  return propre;
}
