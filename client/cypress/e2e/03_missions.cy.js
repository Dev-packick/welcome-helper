// ══════════════════════════════════════════
// TESTS FONCTIONNELS — Missions
// On teste la liste et la publication
// de missions depuis l'interface
// ══════════════════════════════════════════

describe('Page missions publique', () => {

    it('affiche la liste des missions', () => {
        cy.visit('/missions');
        cy.get('h1').should('contain', 'Trouver de l\'aide');
    });

    it('affiche les filtres de catégorie', () => {
        cy.visit('/missions');
        cy.get('.missions-cats').should('be.visible');
        cy.contains('Toutes').should('be.visible');
        cy.contains('Banque').should('be.visible');
    });

    it('affiche la barre de recherche', () => {
        cy.visit('/missions');
        cy.get('.missions-search-input').should('be.visible');
    });

    it('filtre les missions par catégorie', () => {
        cy.visit('/missions');
        cy.get('.missions-cat-pill').contains('Banque').click({ force: true });
        cy.wait(500);
    });

    it('recherche dans les missions', () => {
        cy.visit('/missions');
        cy.get('.missions-search-input').type('bancaire');
        cy.wait(500);
    });
    });

    describe('Publication de mission', () => {

    beforeEach(() => {
        // Se connecter via l'API avant chaque test
        cy.loginAPI('alexandre@test.com', 'Alipatrick7');
        cy.visit('/missions/publier');
    });

    it('affiche le formulaire de publication', () => {
        cy.get('h1').should('contain', 'Publier une mission');
    });

    it('affiche l\'info sur la limite gratuite', () => {
        cy.contains('3 missions maximum par mois').should('be.visible');
    });

    it('remplit et soumet le formulaire avec succès', () => {
        cy.get('input[name="titre"]')
        .type('Test Cypress — Aide administrative');

        cy.get('textarea[name="desc_mission"]')
        .type('Description de test créée par Cypress pour vérifier le formulaire.');

        cy.get('select[name="cat_mission"]')
        .select('Administratif');

        cy.get('input[name="points_offerts"]')
        .type('25');

        cy.contains('Publier la mission').click();

        cy.url().should('include', '/missions');
    });

    it('refuse une mission sans titre', () => {
        cy.get('textarea[name="desc_mission"]')
        .type('Description sans titre');

        cy.get('select[name="cat_mission"]')
        .select('Banque');

        cy.get('input[name="points_offerts"]')
        .type('20');

        cy.contains('Publier la mission').click();

        // Le formulaire ne doit pas être soumis
        cy.url().should('include', '/publier');
    });
});
