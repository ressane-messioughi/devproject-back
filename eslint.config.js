import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

// Ce fichier etait entierement commente : `npm run lint` ne verifiait donc rien
// cote API, alors que la commande existait et rendait la main sans rien dire.
//
// Les regles de mise en forme d'origine (quotes, semi, no-trailing-spaces) ne
// sont pas reprises : Prettier s'en occupe deja, et les laisser ici ferait
// remonter en erreur ce que Prettier vient d'ecrire. C'est le role de
// eslint-config-prettier, place en dernier, de les eteindre.
//
// Ne restent que des regles qui attrapent de vraies erreurs.

export default [
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Une variable declaree et jamais lue est presque toujours un oubli.
      // Le prefixe _ sert a dire explicitement « je sais, et c'est voulu » : le
      // cas courant est le parametre next d'un middleware d'erreur Express, qui
      // doit figurer dans la signature pour qu'Express reconnaisse le middleware,
      // meme si on ne l'appelle jamais.
      //
      // caughtErrors: 'none' laisse passer les catch (error) dont on ignore
      // volontairement le contenu, tournure deja presente dans le projet.
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],

      // Un serveur ecrit dans sa sortie standard : c'est ainsi qu'on le lit dans
      // les journaux du conteneur.
      'no-console': 'off',

      // == compare apres conversion : "0" == 0 est vrai, null == undefined aussi.
      // Sur des donnees venant d'une requete HTTP, ou tout arrive en chaine,
      // c'est une source d'erreurs silencieuses.
      eqeqeq: ['error', 'always'],

      'no-undef': 'error',
    },
  },

  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.vitest,
      },
    },
  },

  prettier,
];
