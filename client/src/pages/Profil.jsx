import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Profil = () => {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const [profil, setProfil] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('historique')

    useEffect(() => {
        if (!token) {
        navigate('/login')
        return
        }
        fetchProfil()
    }, [token])

    const fetchProfil = async () => {
        try {
        const response = await axios.get('/api/profil/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        setProfil(response.data.profil)
        } catch (error) {
        console.error('Erreur chargement profil:', error)
        } finally {
        setLoading(false)
        }
    }

    const getInitials = (nom, prenom) => {
        if (!nom || !prenom) return 'WH'
        return `${prenom[0]}${nom[0]}`.toUpperCase()
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    }

    const badges = [
        {
        id: 1,
        nom: 'Premier pas',
        desc: 'Première mission complétée',
        obtenu: true,
        couleur: '#f59e0b',
        },
        {
        id: 2,
        nom: 'Explorateur',
        desc: '5 missions complétées',
        obtenu: false,
        couleur: '#94a3b8',
        },
        {
        id: 3,
        nom: 'Intégré',
        desc: '10 missions complétées',
        obtenu: false,
        couleur: '#94a3b8',
        },
    ]

    const historique = [
        {
        id: 1,
        titre: 'Ouverture compte bancaire',
        avec: 'Marie D.',
        date: '10 Nov',
        points: 20,
        statut: 'Complétée',
        },
        {
        id: 2,
        titre: 'Visite du campus',
        avec: 'Thomas L.',
        date: '8 Nov',
        points: 15,
        statut: 'Complétée',
        },
        {
        id: 3,
        titre: 'Aide carte transport',
        avec: 'Julie P.',
        date: '5 Nov',
        points: 10,
        statut: 'Complétée',
        },
    ]

    if (loading) {
        return (
        <div className="profil-loading">
            <Navbar />
            <div className="profil-loading-text">Chargement du profil...</div>
        </div>
        )
    }

    return (
        <div className="profil-container">
            <Navbar />

            <main className="profil-main">
                {/* ── CARTE PROFIL ── */}
                <section className="profil-card">
                    <div className="profil-card-left">
                        <div className="profil-avatar">
                            {profil?.avatar_url ? (
                                <img src={`http://localhost:5000${profil.avatar_url}`} alt={`Avatar de ${profil.prenom}`} className="profil-avatar-img"/>
                            ) : (
                                <span className="profil-avatar-initials"> {getInitials(profil?.nom, profil?.prenom)} </span>
                            )}
                        </div>
                        <div className="profil-info">
                            <h1 className="profil-name">
                                {profil?.prenom} {profil?.nom}
                            </h1>
                            <div className="profil-badges-row">
                                <span className="profil-role-badge"> {profil?.role === 'etranger' ? 'Nouvel arrivant' : 'Helper'} </span>
                                {profil?.is_certifie && (
                                    <span className="profil-certifie-badge">✓ Certifié</span>
                                )}
                            </div>
                            <div className="profil-details">
                                <span className="profil-detail-item"> ✉ {profil?.email} </span>
                                {profil?.pays_origine && (
                                    <span className="profil-detail-item"> 📍 {profil?.pays_origine} </span>
                                )}
                                {profil?.universite && (
                                    <span className="profil-detail-item"> 🎓 {profil?.universite} </span>
                                )}
                                <span className="profil-detail-item"> 📅 Membre depuis {formatDate(profil?.created_at)} </span>
                            </div>
                            {profil?.bio && (
                                <p className="profil-bio">{profil.bio}</p>
                            )}
                        </div>
                    </div>
                    <Link to="/profil/edit" className="profil-edit-btn"> ✏ Modifier </Link>
                </section>

                {/* ── STATS ── */}
                <div className="profil-stats-grid">
                    <div className="profil-stat-card">
                        <span className="profil-stat-icon">⭐</span>
                        <p className="profil-stat-value">{profil?.solde_points || 0}</p>
                        <p className="profil-stat-label">Points totaux</p>
                    </div>
                    <div className="profil-stat-card">
                        <span className="profil-stat-icon">🏆</span>
                        <p className="profil-stat-value">3</p>
                        <p className="profil-stat-label">Missions</p>
                    </div>
                    <div className="profil-stat-card">
                        <span className="profil-stat-icon">🎖</span>
                        <p className="profil-stat-value">1</p>
                        <p className="profil-stat-label">Badges obtenus</p>
                    </div>
                </div>

                {/* ── TABS ── */}
                <div className="profil-tabs">
                    <button className={activeTab === 'historique' ? 'profil-tab active' : 'profil-tab'} onClick={() => setActiveTab('historique')}>
                        Historique
                    </button>
                    <button className={activeTab === 'badges' ? 'profil-tab active' : 'profil-tab'} onClick={() => setActiveTab('badges')}>
                        Badges
                    </button>
                </div>

                {/* ── HISTORIQUE ── */}
                {activeTab === 'historique' && (
                    <section className="profil-section">
                        <h2 className="profil-section-title">Historique des activités</h2>
                        <div className="profil-historique-list">
                            {historique.map((h) => (
                                <div key={h.id} className="profil-historique-item">
                                    <div>
                                        <p className="profil-historique-titre">{h.titre}</p>
                                        <p className="profil-historique-meta"> Avec {h.avec} • {h.date}</p>
                                    </div>
                                    <div className="profil-historique-right">
                                        <span className="profil-historique-points"> ⭐ {h.points}</span>
                                        <span className="profil-historique-statut"> {h.statut}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── BADGES ── */}
                {activeTab === 'badges' && (
                    <section className="profil-section">
                        <h2 className="profil-section-title">Badges et récompenses</h2>
                        <div className="profil-badges-grid">
                        {badges.map((b) => (
                            <div key={b.id} className={b.obtenu ? 'profil-badge-card obtenu' : 'profil-badge-card'}>
                                <div className="profil-badge-icon" style={{ background: b.obtenu ? b.couleur : '#1e293b' }}> 🎖 </div>
                                <div>
                                    <p className="profil-badge-nom">{b.nom}</p>
                                    <p className="profil-badge-desc">{b.desc}</p>
                                    {b.obtenu && ( <span className="profil-badge-obtenu">Obtenu</span>)}
                                </div>
                            </div>
                        ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    )
}

export default Profil
