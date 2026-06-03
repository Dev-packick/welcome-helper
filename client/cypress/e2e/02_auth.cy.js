// ══════════════════════════════════════════
// TESTS FONCTIONNELS — Authentification
// On teste l'inscription et la connexion
// depuis l'interface utilisateur
// ══════════════════════════════════════════

describe('Inscription', () => {

    it('affiche le formulaire d\'inscription', () => {
        cy.visit('/register');
        cy.get('h1').should('contain', 'Créer un compte');
    });

    it('affiche les deux choix de rôle', () => {
        cy.visit('/register');
        cy.contains('Nouvel arrivant').should('be.visible');
        cy.contains('Helper').should('be.visible');
    });

    it('affiche le formulaire après choix du rôle', () => {
        cy.visit('/register');
        cy.contains('Nouvel arrivant').click();
        cy.get('input[name="nom"]').should('be.visible');
        cy.get('input[name="prenom"]').should('be.visible');
        cy.get('input[name="email"]').should('be.visible');
        cy.get('input[name="password"]').should('be.visible');
    });

    it('inscrit un nouvel étudiant étranger avec succès', () => {
        // Générer un email unique pour éviter les doublons
        const email = `test.${Date.now()}@cypress.com`;

        cy.visit('/register');
        cy.contains('Nouvel arrivant').click();

        cy.get('input[name="nom"]').type('CypressTest');
        cy.get('input[name="prenom"]').type('Etranger');
        cy.get('input[name="email"]').type(email);
        cy.get('input[name="password"]').type('password');
        cy.get('input[name="confirmPassword"]').type('password');

        cy.contains('Créer mon compte').click();

        // Après inscription réussie on est redirigé
        cy.url().should('include', '/onboarding');
    });

    it('refuse un email déjà utilisé', () => {
        cy.visit('/register');
        cy.contains('Nouvel arrivant').click();

        cy.get('input[name="nom"]').type('Test');
        cy.get('input[name="prenom"]').type('Doublon');
        cy.get('input[name="email"]').type('alexandre@test.com');
        cy.get('input[name="password"]').type('password');
        cy.get('input[name="confirmPassword"]').type('password');

        cy.contains('Créer mon compte').click();

        cy.get('.auth-error').should('be.visible');
    });
    });

    describe('Connexion', () => {

    it('affiche le formulaire de connexion', () => {
        cy.visit('/login');
        cy.get('h1').should('contain', 'Bon retour');
    });

    it('connecte un utilisateur existant', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type('alexandre@test.com');
        cy.get('input[name="password"]').type('Alipatrick7');

        cy.contains('Se connecter').click();

        cy.url().should('include', '/dashboard');
        });

    it('affiche une erreur avec un mauvais mot de passe', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type('alexandre@test.com');
        cy.get('input[name="password"]').type('mauvaismdp');

        cy.contains('Se connecter').click();

        cy.get('.auth-error').should('be.visible');
        cy.get('.auth-error').should('contain', 'incorrect');
    });

    it('affiche une erreur avec un email inexistant', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type('inexistant@test.com');
        cy.get('input[name="password"]').type('password');

        cy.contains('Se connecter').click();

        cy.get('.auth-error').should('be.visible');
    });
});
