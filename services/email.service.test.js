import { describe, it, expect } from 'vitest';
import { htmlVersTexte } from './email.service.js';
import {
  messageConfirmation,
  messageReinitialisation,
  messageBienvenue,
  messageCampagne,
} from '../utils/emailMessages.js';

// La partie testable de l'envoi d'emails est la fabrication des messages : le
// transport, lui, dépend d'un serveur SMTP et n'a pas sa place dans des tests.

describe('htmlVersTexte', () => {
  it('conserve les adresses des liens, qui disparaitraient sinon', () => {
    const texte = htmlVersTexte('<a href="https://exemple.fr/x">Cliquez ici</a>');
    expect(texte).toContain('Cliquez ici');
    expect(texte).toContain('https://exemple.fr/x');
  });

  it('retire les balises et le contenu de head', () => {
    const texte = htmlVersTexte('<head><title>T</title></head><p>Bonjour</p>');
    expect(texte).toBe('Bonjour');
    expect(texte).not.toContain('<');
  });

  it('rend les entites lisibles', () => {
    expect(htmlVersTexte('<p>a &amp; b &quot;c&quot;</p>')).toBe('a & b "c"');
  });

  it('ne laisse pas le pre-en-tete cache coller au titre', () => {
    const { html } = messageBienvenue({ prenom: 'Ressane' });
    expect(htmlVersTexte(html)).not.toContain('<');
  });
});

describe('messages automatiques', () => {
  const url = 'https://devproject.ressane.fr/confirmation?jeton=abc123';

  it("place le lien de confirmation dans le bouton et dans le texte de secours", () => {
    const { html, sujet } = messageConfirmation({ prenom: 'Ressane', url });
    expect(sujet).toContain('Confirmez votre adresse');
    // deux fois : une dans le href du bouton, une en toutes lettres dessous
    expect(html.split(url).length - 1).toBe(2);
  });

  it('reprend les couleurs de DevProject, pas celles d un gabarit generique', () => {
    const { html } = messageBienvenue({ prenom: 'Ressane' });
    expect(html).toContain('#1a202c');
    expect(html).toContain('#111827');
  });

  it('annonce la duree de validite reellement appliquee', () => {
    expect(messageConfirmation({ prenom: 'R', url }).html).toContain('48 heures');
    expect(messageReinitialisation({ prenom: 'R', url }).html).toContain('30 minutes');
  });

  it("echappe le prenom : un nom ne doit pas pouvoir injecter de balise", () => {
    const { html } = messageBienvenue({ prenom: '<script>alert(1)</script>' });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it("echappe aussi le sujet d une campagne", () => {
    const { html } = messageCampagne({
      sujet: '<img src=x onerror=alert(1)>',
      contenuHtml: '<p>bonjour</p>',
    });
    expect(html).not.toContain('<img src=x');
    expect(html).toContain('&lt;img src=x');
  });

  it("laisse passer la mise en forme du contenu d une campagne", () => {
    // Ce contenu a deja ete nettoye par sanitizeHtml en amont : le gras et
    // l italique doivent arriver tels quels, sinon les balises s afficheraient
    // en toutes lettres dans le message recu.
    const { html } = messageCampagne({
      sujet: 'Nouveautes',
      contenuHtml: '<p><strong>gras</strong> et <em>italique</em></p>',
    });
    expect(html).toContain('<strong>gras</strong>');
    expect(html).toContain('<em>italique</em>');
  });

  it('pointe le logo sur une adresse absolue, seule forme lisible en messagerie', () => {
    const { html } = messageBienvenue({ prenom: 'R' });
    expect(html).toMatch(/<img src="https?:\/\/[^"]+\/logo-email\.png"/);
  });

  it('garde une version texte non vide pour chaque message', () => {
    for (const message of [
      messageConfirmation({ prenom: 'R', url }),
      messageReinitialisation({ prenom: 'R', url }),
      messageBienvenue({ prenom: 'R' }),
    ]) {
      expect(htmlVersTexte(message.html).length).toBeGreaterThan(120);
    }
  });
});
