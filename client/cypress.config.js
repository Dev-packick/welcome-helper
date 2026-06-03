const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    // URL de base de ton application React
    baseUrl: 'http://localhost:5173',
    // Dossier des tests
    specPattern: 'cypress/e2e/**/*.cy.js',
    // Délai d'attente max pour chaque action
    defaultCommandTimeout: 8000,
    // Taille de la fenêtre du navigateur
    viewportWidth: 1280,
    viewportHeight: 720,
    // Ne pas enregistrer les vidéos
    video: false,
    // Ne pas faire de captures d'écran en cas d'échec
    screenshotOnRunFailure: false,
    // Ralentir les actions pour mieux voir
    slowMo: 15000,
  }
});
