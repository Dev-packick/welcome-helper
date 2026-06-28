import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const VILLES = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux',
    'Nantes', 'Strasbourg', 'Montpellier', 'Lille', 'Rennes'
    ]

    const PRIORITES = [
    'Trouver un logement',
    'Ouvrir un compte bancaire',
    'Obtenir ma carte SIM',
    'M\'inscrire à l\'université',
    'Obtenir mon titre de séjour',
    'Trouver un emploi étudiant',
    'Découvrir la ville'
    ]

    const ETAPES = [
    {
        id: 1,
        icon: '✅',
        titre: 'Bienvenue !',
        sousTitre: 'Répondez à quelques questions pour personnaliser votre expérience',
        type: 'intro'
    },
    {
        id: 2,
        icon: '',
        titre: 'Votre localisation',
        sousTitre: 'Dans quelle ville allez-vous étudier ?',
        question: 'Dans quelle ville allez-vous étudier ?',
        type: 'select',
        options: VILLES,
        champ: 'ville'
    },
    {
        id: 3,
        icon: '',
        titre: 'Logement',
        sousTitre: 'Avez-vous trouvé un logement ?',
        question: 'Avez-vous trouvé un logement permanent ?',
        type: 'radio',
        options: ['Oui, j\'ai un logement', 'J\'ai un logement temporaire', 'Non, je cherche encore'],
        champ: 'logement'
    },
    {
        id: 4,
        icon: '📞',
        titre: 'Télécommunications',
        sousTitre: 'Avez-vous une carte SIM française ?',
        question: 'Avez-vous une carte SIM française ?',
        type: 'radio',
        options: ['Oui', 'Non'],
        champ: 'sim'
    },
    {
        id: 5,
        icon: '',
        titre: 'Banque',
        sousTitre: 'Avez-vous ouvert un compte bancaire ?',
        question: 'Avez-vous ouvert un compte bancaire français ?',
        type: 'radio',
        options: ['Oui', 'Non'],
        champ: 'banque'
    },
    {
        id: 6,
        icon: '📄',
        titre: 'Documents',
        sousTitre: 'Avez-vous votre titre de séjour ?',
        question: 'Avez-vous obtenu votre titre de séjour ?',
        type: 'radio',
        options: ['Oui', 'En cours', 'Pas encore'],
        champ: 'titre_sejour'
    },
    {
        id: 7,
        icon: '',
        titre: 'Priorités',
        sousTitre: 'Quel est votre besoin principal ?',
        question: 'Quel est votre besoin principal actuellement ?',
        type: 'select',
        options: PRIORITES,
        champ: 'priorite'
    }
    ]

    const Onboarding = () => {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const [etape, setEtape] = useState(1)
    const [reponses, setReponses] = useState({})
    const [loading, setLoading] = useState(false)

    const etapeActuelle = ETAPES[etape - 1]
    const progress = Math.round((etape / ETAPES.length) * 100)
    const isEtranger = user?.role === 'etranger'

    // Si ce n'est pas un étranger → pas d'onboarding
    if (!isEtranger) {
        navigate('/dashboard')
        return null
    }

    const handleReponse = (valeur) => {
        setReponses(prev => ({ ...prev, [etapeActuelle.champ]: valeur }))
    }

    const handleSuivant = () => {
        if (etape < ETAPES.length) {
        setEtape(prev => prev + 1)
        }
    }

    const handlePrecedent = () => {
        if (etape > 1) setEtape(prev => prev - 1)
    }

    const handleTerminer = async () => {
        setLoading(true)
        try {
        // Sauvegarder les réponses dans le profil
        await axios.put(`/api/profil/${user.user_id}`, {
            nom: user.nom,
            prenom: user.prenom,
            universite: reponses.ville || '',
            bio: `Priorité principale : ${reponses.priorite || 'Non renseignée'}`,
            pays_origine: user.pays_origine || '',
            langue: 'fr'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        } catch (error) {
        console.error('Erreur sauvegarde onboarding:', error)
        } finally {
        setLoading(false)
        navigate('/dashboard')
        }
    }

    const peutContinuer = () => {
        if (etapeActuelle.type === 'intro') return true
        return !!reponses[etapeActuelle.champ]
    }

    return (
        <div className="onboarding-container">
        <div className="onboarding-card">

            {/* Barre de progression */}
            <div className="onboarding-progress-head">
            <span className="onboarding-etape-label">
                Étape {etape} sur {ETAPES.length}
            </span>
            <span className="onboarding-percent">{progress}%</span>
            </div>
            <div className="onboarding-progress-bar">
            <div
                className="onboarding-progress-fill"
                style={{ width: `${progress}%` }}
            />
            </div>

            {/* Contenu de l'étape */}
            <div className="onboarding-body">

            {/* En-tête étape */}
            <div className="onboarding-step-head">
                <div className="onboarding-step-icon">{etapeActuelle.icon}</div>
                <div>
                <h2 className="onboarding-step-title">{etapeActuelle.titre}</h2>
                <p className="onboarding-step-sub">{etapeActuelle.sousTitre}</p>
                </div>
            </div>

            {/* Étape 1 - Intro */}
            {etapeActuelle.type === 'intro' && (
                <div className="onboarding-intro">
                <div className="onboarding-intro-icon">✓</div>
                <h3 className="onboarding-intro-title">
                    Bienvenue sur WelcomeHelper !
                </h3>
                <p className="onboarding-intro-desc">
                    Nous allons vous poser quelques questions pour personnaliser
                    votre checklist d'installation en France.
                </p>
                </div>
            )}

            {/* Select */}
            {etapeActuelle.type === 'select' && (
                <div className="onboarding-field">
                <label className="onboarding-question">
                    {etapeActuelle.question}
                </label>
                <select
                    className="onboarding-select"
                    value={reponses[etapeActuelle.champ] || ''}
                    onChange={e => handleReponse(e.target.value)}
                >
                    <option value="">
                    {etapeActuelle.champ === 'ville'
                        ? 'Sélectionnez votre ville'
                        : 'Sélectionnez votre priorité'
                    }
                    </option>
                    {etapeActuelle.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                </div>
            )}

            {/* Radio */}
            {etapeActuelle.type === 'radio' && (
                <div className="onboarding-field">
                <label className="onboarding-question">
                    {etapeActuelle.question}
                </label>
                <div className="onboarding-options">
                    {etapeActuelle.options.map(opt => (
                    <div
                        key={opt}
                        className={reponses[etapeActuelle.champ] === opt
                        ? 'onboarding-option selected'
                        : 'onboarding-option'
                        }
                        onClick={() => handleReponse(opt)}
                    >
                        <div className="onboarding-radio">
                        {reponses[etapeActuelle.champ] === opt && (
                            <div className="onboarding-radio-dot" />
                        )}
                        </div>
                        <span>{opt}</span>
                    </div>
                    ))}
                </div>
                </div>
            )}

            </div>

            {/* Navigation */}
            <div className="onboarding-nav">
            {etape > 1 && (
                <button
                className="onboarding-btn-prev"
                onClick={handlePrecedent}
                >
                ← Précédent
                </button>
            )}

            {etape < ETAPES.length ? (
                <button
                className={peutContinuer()
                    ? 'onboarding-btn-next'
                    : 'onboarding-btn-next disabled'
                }
                onClick={handleSuivant}
                disabled={!peutContinuer()}
                >
                Suivant →
                </button>
            ) : (
                <button
                className="onboarding-btn-next"
                onClick={handleTerminer}
                disabled={loading || !peutContinuer()}
                >
                {loading ? 'Sauvegarde...' : 'Terminer'}
                </button>
            )}
            </div>

        </div>
        </div>
    )
}

export default Onboarding
