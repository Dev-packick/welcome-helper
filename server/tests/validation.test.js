// ══════════════════════════════════════════
// TESTS UNITAIRES — fonctions pures
// Pas de base de données, pas de serveur
// On teste la logique métier isolément
// ══════════════════════════════════════════

//  Fonction 1 : validation email
const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
    };

    //  Fonction 2 : validation mot de passe
    const isValidPassword = (password) => {
    return typeof password === 'string' && password.length >= 8;
    };

    //  Fonction 3 : calcul points avec multiplicateur Premium
    const calculerPoints = (pointsBase, isPremium, typeOffre) => {
    if (!isPremium) return pointsBase;
    if (typeOffre === 'mensuel') return pointsBase * 2;
    if (typeOffre === 'trimestriel') return pointsBase * 3;
    return pointsBase;
    };

    //  Fonction 4 : vérifier si une mission est urgente
    const isMissionUrgente = (dateEcheance) => {
    if (!dateEcheance) return false;
    const diff = new Date(dateEcheance) - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
    };

    //  Fonction 5 : générer les initiales d'un utilisateur
    const getInitials = (prenom, nom) => {
    if (!prenom || !nom) return 'WH';
    return `${prenom[0]}${nom[0]}`.toUpperCase();
    };

    //  Fonction 6 : vérifier si le solde est suffisant
    const hasSufficientBalance = (solde, cout) => {
    return typeof solde === 'number' &&
            typeof cout === 'number' &&
            solde >= cout;
    };

    // ══════════════════════════════════════════
    // TESTS
    // ══════════════════════════════════════════

    describe('Validation email', () => {
    test('accepte un email valide', () => {
        expect(isValidEmail('alice@test.com')).toBe(true);
    });

    test('accepte un email avec sous-domaine', () => {
        expect(isValidEmail('alice@mail.test.com')).toBe(true);
    });

    test('refuse un email sans @', () => {
        expect(isValidEmail('alicetest.com')).toBe(false);
    });

    test('refuse un email sans domaine', () => {
        expect(isValidEmail('alice@')).toBe(false);
    });

    test('refuse un email vide', () => {
        expect(isValidEmail('')).toBe(false);
    });
    });

    describe('Validation mot de passe', () => {
    test('accepte un mot de passe de 8 caractères', () => {
        expect(isValidPassword('password')).toBe(true);
    });

    test('accepte un mot de passe long', () => {
        expect(isValidPassword('monMotDePasse123!')).toBe(true);
    });

    test('refuse un mot de passe trop court', () => {
        expect(isValidPassword('abc')).toBe(false);
    });

    test('refuse un mot de passe vide', () => {
        expect(isValidPassword('')).toBe(false);
    });

    test('refuse null', () => {
        expect(isValidPassword(null)).toBe(false);
    });
    });

    describe('Calcul des points Premium', () => {
    test('retourne les points de base pour un utilisateur gratuit', () => {
        expect(calculerPoints(30, false, null)).toBe(30);
    });

    test('double les points pour un abonnement mensuel', () => {
        expect(calculerPoints(30, true, 'mensuel')).toBe(60);
    });

    test('triple les points pour un abonnement trimestriel', () => {
        expect(calculerPoints(30, true, 'trimestriel')).toBe(90);
    });

    test('retourne les points de base si type offre inconnu', () => {
        expect(calculerPoints(30, true, 'inconnu')).toBe(30);
    });

    test('gère des points de base à 0', () => {
        expect(calculerPoints(0, true, 'mensuel')).toBe(0);
    });
    });

    describe('Détection mission urgente', () => {
    test('retourne false si pas de date', () => {
        expect(isMissionUrgente(null)).toBe(false);
        expect(isMissionUrgente(undefined)).toBe(false);
    });

    test('retourne false si la date est passée', () => {
        const datePassee = new Date(Date.now() - 86400000).toISOString();
        expect(isMissionUrgente(datePassee)).toBe(false);
    });

    test('retourne false si la date est dans plus de 3 jours', () => {
        const dateLointaine = new Date(Date.now() + 10 * 86400000).toISOString();
        expect(isMissionUrgente(dateLointaine)).toBe(false);
    });

    test('retourne true si la date est dans moins de 3 jours', () => {
        const dateProcheaine = new Date(Date.now() + 1 * 86400000).toISOString();
        expect(isMissionUrgente(dateProcheaine)).toBe(true);
    });
    });

    describe('Génération des initiales', () => {
    test('génère les initiales correctement', () => {
        expect(getInitials('Alice', 'Martin')).toBe('AM');
    });

    test('met en majuscules', () => {
        expect(getInitials('alice', 'martin')).toBe('AM');
    });

    test('retourne WH si prenom manquant', () => {
        expect(getInitials(null, 'Martin')).toBe('WH');
    });

    test('retourne WH si nom manquant', () => {
        expect(getInitials('Alice', null)).toBe('WH');
    });

    test('retourne WH si les deux manquent', () => {
        expect(getInitials(null, null)).toBe('WH');
    });
    });

    describe('Vérification solde suffisant', () => {
    test('retourne true si solde suffisant', () => {
        expect(hasSufficientBalance(200, 150)).toBe(true);
    });

    test('retourne true si solde exactement égal au coût', () => {
        expect(hasSufficientBalance(150, 150)).toBe(true);
    });

    test('retourne false si solde insuffisant', () => {
        expect(hasSufficientBalance(100, 150)).toBe(false);
    });

    test('retourne false si solde est une chaîne', () => {
        expect(hasSufficientBalance('100', 150)).toBe(false);
    });

    test('retourne false si coût est une chaîne', () => {
        expect(hasSufficientBalance(100, '150')).toBe(false);
    });
});
