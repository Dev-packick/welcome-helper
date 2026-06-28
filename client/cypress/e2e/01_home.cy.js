// ══════════════════════════════════════════
// TESTS FONCTIONNELS - Accueil
// ══════════════════════════════════════════
describe('Page d\'accueil', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it('affiche le titre principal', () => {
        cy.get('h1').should('contain', 'Bienvenue en France');
    });

    it('affiche le bouton Commencer maintenant', () => {
        cy.contains('Commencer maintenant').should('be.visible');
    });

    it('affiche le bouton Se connecter', () => {
        cy.contains('Se connecter').should('be.visible');
    });

    it('affiche la navbar avec le logo', () => {
        cy.get('.navbar').should('be.visible');
        cy.get('.navbar-logo-text').should('contain', 'WelcomeHelper');
    });

    it('le bouton Commencer maintenant redirige vers /register', () => {
        cy.contains('Commencer maintenant').click();
        cy.url().should('include', '/register');
    });

    it('le bouton Se connecter redirige vers /login', () => {
        cy.contains('Se connecter').click();
        cy.url().should('include', '/login');
    });

    it('affiche la section statistiques', () => {
        cy.get('.home-stats').should('be.visible');
    });

    it('affiche la section fonctionnalités', () => {
    cy.get('.home-features').scrollIntoView().should('exist');
    });
});
