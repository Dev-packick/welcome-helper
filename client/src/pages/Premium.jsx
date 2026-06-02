import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Premium = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [abonnement, setAbonnement] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingPlan, setLoadingPlan] = useState(null)

    useEffect(() => {
        if (token) fetchAbonnement()
    }, [token])

    const fetchAbonnement = async () => {
        try {
        const response = await axios.get('/api/abonnement/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        setAbonnement(response.data.abonnement)
        } catch (error) {
        console.error('Erreur abonnement:', error)
        }
    }

    const handleCheckout = async (type_offre) => {
        if (!token) { navigate('/login'); return }
        setLoadingPlan(type_offre)
        try {
        const response = await axios.post(
            '/api/abonnement/checkout',
            { type_offre },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        // Rediriger vers Stripe Checkout
        window.location.href = response.data.url
        } catch (error) {
        console.error('Erreur checkout:', error)
        } finally {
        setLoadingPlan(null)
        }
    }

    const isPremium = abonnement?.statut_paiement === 'paye' &&
        new Date(abonnement.date_expiration) > new Date()

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    const plans = [
        {
        id: 'decouverte',
        nom: 'Découverte',
        desc: 'Pour commencer votre expérience',
        prix: '0€',
        periode: 'Gratuit',
        couleur: '#185FA5',
        features: [
            'Accès aux missions de base',
            '3 publications par mois',
            'Messagerie standard',
            'Support communautaire',
        ],
        isFree: true,
        },
        {
        id: 'mensuel',
        nom: 'Mensuel',
        desc: 'L\'essentiel pour progresser',
        prix: '9.99€',
        periode: '/mois',
        couleur: '#f59e0b',
        populaire: true,
        features: [
            'Toutes les fonctionnalités gratuites',
            'Publications illimitées',
            'Priorité sur les missions',
            'Pas de publicités',
            'Badge Premium visible',
            'Support prioritaire',
            '2x points bonus',
        ],
        },
        {
        id: 'trimestriel',
        nom: 'Trimestriel',
        desc: 'Le meilleur rapport qualité-prix',
        prix: '24.99€',
        periode: '/3 mois',
        couleur: '#22c55e',
        economie: 'Économisez 17%',
        features: [
            'Toutes les fonctionnalités mensuelles',
            'Accès anticipé nouvelles fonctionnalités',
            '3x points bonus',
            'Coaching personnalisé (1 session/mois)',
            'Événements exclusifs',
            'Certificat de reconnaissance',
        ],
        },
    ]

    return (
        <div className="premium-container">
        <Navbar />

        <main className="premium-main">

            {/* ── EN-TÊTE ── */}
            <div className="premium-header">
            <div className="premium-crown">👑</div>
            <h1 className="premium-title">Passez à Premium</h1>
            <p className="premium-subtitle">
                Débloquez tout le potentiel de WelcomeHelper et accélérez votre intégration
            </p>
            </div>

            {/* ── STATUT ABONNEMENT ACTUEL ── */}
            {isPremium && (
            <div className="premium-status-card">
                <span className="premium-status-icon">✅</span>
                <div>
                <p className="premium-status-title">
                    Abonnement {abonnement.type_offre} actif
                </p>
                <p className="premium-status-date">
                    Expire le {formatDate(abonnement.date_expiration)}
                </p>
                </div>
            </div>
            )}

            {/* ── PLANS ── */}
            <div className="premium-plans">
            {plans.map(plan => (
                <div
                key={plan.id}
                className={plan.populaire ? 'premium-plan populaire' : 'premium-plan'}
                >
                {plan.populaire && (
                    <div className="premium-plan-badge">Le plus populaire</div>
                )}

                <div className="premium-plan-icon" style={{ background: plan.couleur + '22' }}>
                    👑
                </div>

                <h2 className="premium-plan-nom">{plan.nom}</h2>
                <p className="premium-plan-desc">{plan.desc}</p>

                <div className="premium-plan-prix">
                    <span className="premium-prix-valeur">{plan.prix}</span>
                    <span className="premium-prix-periode">{plan.periode}</span>
                </div>

                {plan.economie && (
                    <span className="premium-economie">{plan.economie}</span>
                )}

                <ul className="premium-features">
                    {plan.features.map((f, i) => (
                    <li key={i} className="premium-feature-item">
                        <span className="premium-check">✓</span>
                        {f}
                    </li>
                    ))}
                </ul>

                {plan.isFree ? (
                    <button className="premium-plan-btn gratuit" disabled>
                    Plan actuel
                    </button>
                ) : isPremium && abonnement.type_offre === plan.id ? (
                    <button className="premium-plan-btn actif" disabled>
                    Plan actuel
                    </button>
                ) : (
                    <button
                    className={plan.id === 'mensuel'
                        ? 'premium-plan-btn mensuel'
                        : 'premium-plan-btn trimestriel'
                    }
                    onClick={() => handleCheckout(plan.id)}
                    disabled={loadingPlan === plan.id}
                    >
                    {loadingPlan === plan.id
                        ? 'Chargement...'
                        : 'Choisir ce plan'
                    }
                    </button>
                )}
                </div>
            ))}
            </div>

            {/* ── AVANTAGES ── */}
            <div className="premium-avantages">
            {[
                { icon: '⚡', titre: 'Priorité absolue', desc: 'Vos missions apparaissent en premier et sont traitées plus rapidement' },
                { icon: '⭐', titre: 'Points multipliés', desc: 'Gagnez jusqu\'à 3x plus de points pour chaque mission complétée' },
                { icon: '🛡', titre: 'Support dédié', desc: 'Une équipe à votre écoute pour vous accompagner 7j/7' },
            ].map((a, i) => (
                <div key={i} className="premium-avantage">
                <div className="premium-avantage-icon">{a.icon}</div>
                <h3 className="premium-avantage-titre">{a.titre}</h3>
                <p className="premium-avantage-desc">{a.desc}</p>
                </div>
            ))}
            </div>

            {/* ── TÉMOIGNAGES ── */}
            <div className="premium-temoignages">
            <h2 className="premium-temoignages-title">Ils ont essayé Premium</h2>
            <div className="premium-temoignages-grid">
                {[
                { note: 5, texte: 'WelcomeHelper Premium m\'a permis de m\'installer beaucoup plus rapidement. Le support prioritaire est excellent !', nom: 'Maria S.', role: 'Étudiante - Espagne' },
                { note: 5, texte: 'Grâce aux points bonus, j\'ai pu débloquer plein de récompenses. Une super motivation pour aider !', nom: 'Ahmed K.', role: 'Helper - Maroc' },
                ].map((t, i) => (
                <div key={i} className="premium-temoignage">
                    <div className="premium-stars">{'⭐'.repeat(t.note)}</div>
                    <p className="premium-temoignage-texte">"{t.texte}"</p>
                    <p className="premium-temoignage-nom">{t.nom}</p>
                    <p className="premium-temoignage-role">{t.role}</p>
                </div>
                ))}
            </div>
            </div>

            {/* ── FAQ ── */}
            <div className="premium-faq">
            <h2 className="premium-faq-title">Questions fréquentes</h2>
            {[
                { q: 'Puis-je annuler mon abonnement à tout moment ?', r: 'Oui, vous pouvez annuler votre abonnement à tout moment. Il restera actif jusqu\'à la fin de la période payée.' },
                { q: 'Comment fonctionnent les points bonus ?', r: 'Les membres Premium gagnent 2x ou 3x plus de points pour chaque mission complétée, selon leur formule.' },
                { q: 'Y a-t-il une période d\'essai ?', r: 'Oui, nous offrons 7 jours d\'essai gratuit sur tous les plans payants.' },
            ].map((faq, i) => (
                <div key={i} className="premium-faq-item">
                <h3 className="premium-faq-q">{faq.q}</h3>
                <p className="premium-faq-r">{faq.r}</p>
                </div>
            ))}
            </div>

            {/* ── CTA FINAL ── */}
            <div className="premium-cta">
            <h2 className="premium-cta-title">Prêt à passer à Premium ?</h2>
            <p className="premium-cta-sub">Essayez gratuitement pendant 7 jours, sans engagement</p>
            <button
                className="premium-cta-btn"
                onClick={() => handleCheckout('mensuel')}
                disabled={loadingPlan === 'mensuel'}
            >
                👑 Démarrer l'essai gratuit
            </button>
            </div>

        </main>
        </div>
    )
}

export default Premium