-- =============================================
-- SCHEMA SQL - WelcomeHelper
-- =============================================

-- Types ENUM
CREATE TYPE role_type AS ENUM ('etranger', 'resident', 'admin');
CREATE TYPE statut_mission_type AS ENUM ('ouverte', 'en_cours', 'terminee', 'annulee');
CREATE TYPE statut_paiement_type AS ENUM ('en_attente', 'paye', 'expire');
CREATE TYPE statut_conv_type AS ENUM ('active', 'archivee');

-- Table USER
CREATE TABLE IF NOT EXISTS "user" (
    user_id SERIAL PRIMARY KEY,
    nom VARCHAR(80) NOT NULL,
    prenom VARCHAR(80) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role role_type NOT NULL DEFAULT 'etranger',
    date_arrivee DATE,
    is_certifie BOOLEAN DEFAULT FALSE,
    solde_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table PROFIL
CREATE TABLE IF NOT EXISTS profil (
    id_profil SERIAL PRIMARY KEY,
    id_user INT UNIQUE NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    pays_origine VARCHAR(60),
    universite VARCHAR(120),
    bio TEXT,
    avatar_url VARCHAR(255),
    langue VARCHAR(40)
);

-- Table MISSION
CREATE TABLE IF NOT EXISTS mission (
    id_mission SERIAL PRIMARY KEY,
    id_publiant INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    id_realisant INT REFERENCES "user"(user_id) ON DELETE SET NULL,
    titre VARCHAR(150) NOT NULL,
    desc_mission TEXT,
    cat_mission VARCHAR(60),
    statut statut_mission_type DEFAULT 'ouverte',
    points_offerts INT DEFAULT 0,
    date_publication TIMESTAMP DEFAULT NOW(),
    date_echeance DATE
);

-- Table CONVERSATION
CREATE TABLE IF NOT EXISTS conversation (
    id_conversation SERIAL PRIMARY KEY,
    id_mission INT REFERENCES mission(id_mission) ON DELETE SET NULL,
    id_user1 INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    id_user2 INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    date_creation TIMESTAMP DEFAULT NOW(),
    statut statut_conv_type DEFAULT 'active'
);

-- Table MESSAGE
CREATE TABLE IF NOT EXISTS message (
    id_message SERIAL PRIMARY KEY,
    id_conversation INT NOT NULL REFERENCES conversation(id_conversation) ON DELETE CASCADE,
    id_expediteur INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    date_envoi TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Table POINT
CREATE TABLE IF NOT EXISTS point (
    id_point SERIAL PRIMARY KEY,
    id_user INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    valeur INT NOT NULL,
    date_transaction TIMESTAMP DEFAULT NOW(),
    motif VARCHAR(120)
);

-- Table PARTENAIRE
CREATE TABLE IF NOT EXISTS partenaire (
    id_partenaire SERIAL PRIMARY KEY,
    nom_enseigne VARCHAR(120) NOT NULL,
    logo_url VARCHAR(255),
    contact VARCHAR(120)
);

-- Table RECOMPENSE
CREATE TABLE IF NOT EXISTS recompense (
    id_recomp SERIAL PRIMARY KEY,
    id_partenaire INT NOT NULL REFERENCES partenaire(id_partenaire) ON DELETE CASCADE,
    nom_recomp VARCHAR(120) NOT NULL,
    desc_recomp TEXT,
    cout_en_points INT NOT NULL,
    stock_disponible INT DEFAULT 0,
    cat_partenaire VARCHAR(60)
);

-- Table ECHANGER
CREATE TABLE IF NOT EXISTS echanger (
    id_echange SERIAL PRIMARY KEY,
    id_user INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    id_recomp INT NOT NULL REFERENCES recompense(id_recomp) ON DELETE CASCADE,
    date_echange TIMESTAMP DEFAULT NOW()
);

-- Table ABONNEMENT
CREATE TABLE IF NOT EXISTS abonnement (
    id_abonnement SERIAL PRIMARY KEY,
    id_user INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    type_offre VARCHAR(60),
    prix DECIMAL(8,2),
    date_debut DATE,
    date_expiration DATE,
    statut_paiement statut_paiement_type DEFAULT 'en_attente'
);

-- Table EVALUATION
CREATE TABLE IF NOT EXISTS evaluation (
    id_evaluation SERIAL PRIMARY KEY,
    id_mission INT NOT NULL REFERENCES mission(id_mission) ON DELETE CASCADE,
    id_evaluateur INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    id_evaluer INT NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
    note SMALLINT CHECK (note >= 1 AND note <= 5),
    commentaire TEXT,
    date_evaluation TIMESTAMP DEFAULT NOW()
);
