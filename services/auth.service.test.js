import { describe, it, expect } from 'vitest';
import { formaterTelephone } from './auth.service.js';

// La mise au format du telephone est la seule logique pure du service : tout le reste
// touche la base de donnees. C'est donc la seule partie qui se teste sans elle.
describe('formaterTelephone', () => {
  it('met un numero colle au format a points', () => {
    expect(formaterTelephone('0769461234')).toBe('07.69.46.12.34');
  });

  it('accepte les espaces et les tirets', () => {
    expect(formaterTelephone('07 69 46 12 34')).toBe('07.69.46.12.34');
    expect(formaterTelephone('07-69-46-12-34')).toBe('07.69.46.12.34');
  });

  it('laisse inchange un numero deja au format', () => {
    expect(formaterTelephone('07.69.46.12.34')).toBe('07.69.46.12.34');
  });

  // Le champ est facultatif : une valeur absente doit ressortir en NULL, et non en
  // chaine vide, sinon l'index unique de la colonne refuserait le deuxieme compte.
  it('renvoie null quand le numero est absent', () => {
    expect(formaterTelephone(undefined)).toBeNull();
    expect(formaterTelephone('')).toBeNull();
    expect(formaterTelephone(null)).toBeNull();
  });

  it('renvoie la saisie telle quelle si elle ne fait pas dix chiffres', () => {
    expect(formaterTelephone('12345')).toBe('12345');
  });
});
