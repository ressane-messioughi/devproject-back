// import js from '@eslint/js';
// import globals from 'globals';

// export default [
//   js.configs.recommended,

//   {
//     files: ['**/*.js'],

//     languageOptions: {
//       ecmaVersion: 'latest',
//       sourceType: 'module',

//       globals: {
//         ...globals.node,
//       },
//     },

//     rules: {
//       // Variables inutilisées
//       'no-unused-vars': [
//         'warn',
//         {
//           argsIgnorePattern: '^_',
//           varsIgnorePattern: '^_',
//         },
//       ],

//       // Autoriser console.log en backend
//       'no-console': 'off',

//       // Bonne pratique backend
//       eqeqeq: ['error', 'always'],

//       // Eviter les variables non déclarées
//       'no-undef': 'error',

//       // Meilleure lisibilité
//       semi: ['error', 'always'],
//       quotes: ['error', 'single'],

//       // Evite les espaces inutiles
//       'no-trailing-spaces': 'error',

//       // Fin de fichier propre
//       'eol-last': ['error', 'always'],
//     },
//   },
// ];