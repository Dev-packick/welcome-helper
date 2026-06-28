// ══════════════════════════════════════════
// COMMANDES CYPRESS PERSONNALISÉES
// ══════════════════════════════════════════

// Commande pour se connecter rapidement
// sans passer par l'interface (plus rapide)
Cypress.Commands.add('loginAPI', (email, password) => {
    cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/auth/login',
    body: { email, password }
    }).then((response) => {
        window.localStorage.setItem('token', response.body.token);
        window.localStorage.setItem('user', JSON.stringify(response.body.user));
    });
});

    // Commande pour s'inscrire via l'API
    Cypress.Commands.add('registerAPI', (userData) => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:5000/api/auth/register',
        body: userData,
        failOnStatusCode: false
    });
});
