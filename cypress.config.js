const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'ServeRest | Relatório de Testes',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  requestTimeout: 15000,
  viewportWidth: 1366,
  viewportHeight: 768,
  e2e: {
    // Front público do ServeRest. Ele consome a API pública em https://serverest.dev.
    baseUrl: 'https://front.serverest.dev',
    env: {
      // Sobrescrito para http://localhost:3000 nos testes de API (npm run test:api:local).
      apiUrl: 'https://serverest.dev',
    },
    specPattern: 'cypress/e2e/**/*.cy.js',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
