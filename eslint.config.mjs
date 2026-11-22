import pluginCypress from 'eslint-plugin-cypress';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'cypress/reports/**', 'cypress/screenshots/**'] },
  {
    files: ['cypress/**/*.js'],
    ...pluginCypress.configs.recommended,
    languageOptions: {
      ...pluginCypress.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...pluginCypress.configs.recommended.rules,
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-assigning-return-values': 'error',
      'no-unused-vars': 'error',
    },
  },
  {
    files: ['cypress.config.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
];
