import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
    const { token, user: authUser } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchDashboard()
    }, [token])

    const fetchDashboard = async () => {
        try {
        const response = await axios.get('/api/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
        })
        setData(response.data)
        } catch (error) {
        console.error('Erreur dashboard:', error)
        } finally {
        setLoading(false)
        }
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const diff = new Date() - date
        if (diff < 3600000) return `Il y a ${Math.floor(diff/60000)} min`
        if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)}h`
        return date.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })
    }

    const getStatutStyle = (statut) => {
        const styles = {
        ouverte:  { bg:'rgba(34,197,94,0.15)',  color:'#4ade80',  label:'Ouverte' },
        en_cours: { bg:'rgba(59,130,246,0.15)', color:'#60a5fa',  label:'En cours' },
        terminee: { bg:'rgba(100,116,139,0.15)',color:'#94a3b8',  label:'Terminée' },
        annulee:  { bg:'rgba(239,68,68,0.15)',  color:'#f87171',  label:'Annulée' },
        }
        return styles[statut] || styles.ouverte
    }

    const getInitials = (prenom, nom) => {
        if (!prenom || !nom) return 'WH'
        return `${prenom[0]}${nom[0]}`.toUpperCase()
    }

    // Checklist d'installation pour les étrangers
    const checklist = [
        { id:1, label:'Ouvrir un compte bancaire',    done: true },
        { id:2, label:'Obtenir une carte de transport', done: true },
        { id:3, label:'S\'inscrire à la sécurité sociale', done: false },
        { id:4, label:'Trouver un logement permanent', done: false },
        { id:5, label:'Obtenir la CAF',               done: false },
    ]

    const checklistProgress = checklist.filter(c => c.done).length

    if (loading) return (
        <div style={{ minHeight:'100vh', background:'#0a0f1e' }}>
        <Navbar />
        <p style={{ color:'#64748b', textAlign:'center', padding:'80px' }}>
            Chargement...
        </p>
        </div>
    )

    if (!data) return null

    const { user, missions, stats, messages_recents } = data
    const isEtranger = user.role === 'etranger'

    return (
        <div className="dash-container">
        <Navbar />

        <main className="dash-main">

            {/* ── BIENVENUE ── */}
            <div className="dash-welcome">
            <div>
                <h1 className="dash-welcome-title">
                Bonjour, {user.prenom} 👋
                </h1>
                <p className="dash-welcome-sub">
                {isEtranger
                    ? `Continuez votre installation en France`
                    : `Prêt à aider de nouveaux arrivants ?`
                }
                </p>
            </div>
            {isEtranger && (
                <Link to="/missions/publier" className="missions-publish-btn">
                + Publier une mission
                </Link>
            )}
            </div>

            {/* ── STATS ── */}
            <div className="dash-stats-grid">
            <div className="dash-stat-card">
                {/* <div className="dash-stat-icon" style={{ background:'rgba(245,158,11,0.15)' }}>
                ⭐
                </div> */}
                <div>
                <p className="dash-stat-value">{stats.solde_points}</p>
                <p className="dash-stat-label">Points gagnés</p>
                </div>
            </div>
            <div className="dash-stat-card">
                {/* <div className="dash-stat-icon" style={{ background:'rgba(34,197,94,0.15)' }}>
                🏆
                </div> */}
                <div>
                <p className="dash-stat-value">{stats.missions_terminees}</p>
                <p className="dash-stat-label">Missions complétées</p>
                </div>
            </div>
            <div className="dash-stat-card">
                {/* <div className="dash-stat-icon" style={{ background:'rgba(59,130,246,0.15)' }}>
                🕐
                </div> */}
                <div>
                <p className="dash-stat-value">{user.jours_en_france}</p>
                <p className="dash-stat-label">Jours en France</p>
                </div>
            </div>
            </div>

            <div className="dash-grid">

            {/* ── COLONNE GAUCHE ── */}
            <div className="dash-col-left">

                {/* Checklist (étrangers seulement) */}
                {isEtranger && (
                <div className="dash-card">
                    <div className="dash-card-head">
                    <h2 className="dash-card-title">Ma checklist d'installation</h2>
                    <span className="dash-card-badge">
                        {checklistProgress}/{checklist.length}
                    </span>
                    </div>
                    <div className="dash-progress-bar">
                    <div
                        className="dash-progress-fill"
                        style={{
                        width: `${(checklistProgress / checklist.length) * 100}%`
                        }}
                    />
                    </div>
                    <div className="dash-checklist">
                    {checklist.map(item => (
                        <div key={item.id} className="dash-checklist-item">
                        <div className={item.done
                            ? 'dash-check-icon done'
                            : 'dash-check-icon'
                        }>
                            {item.done ? '✓' : ''}
                        </div>
                        <span className={item.done
                            ? 'dash-check-label done'
                            : 'dash-check-label'
                        }>
                            {item.label}
                        </span>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                {/* Mes missions */}
                <div className="dash-card">
                <div className="dash-card-head">
                    <h2 className="dash-card-title">Mes missions</h2>
                    <Link to="/missions" className="dash-voir-tout">
                    Voir toutes
                    </Link>
                </div>

                {missions.length === 0 ? (
                    <div className="dash-empty">
                    <p>Aucune mission pour l'instant</p>
                    {isEtranger && (
                        <Link to="/missions/publier" className="dash-empty-btn">
                        Publier ma première mission
                        </Link>
                    )}
                    {!isEtranger && (
                        <Link to="/missions" className="dash-empty-btn">
                        Trouver une mission
                        </Link>
                    )}
                    </div>
                ) : (
                    <div className="dash-missions-list">
                    {missions.map(m => {
                        const statut = getStatutStyle(m.statut)
                        const helper = isEtranger
                        ? (m.realisant_prenom ? `Helper: ${m.realisant_prenom} ${m.realisant_nom?.[0]}.` : 'En attente d\'un helper')
                        : `Publié par: ${m.publiant_prenom} ${m.publiant_nom?.[0]}.`
                        return (
                        <Link
                            to={`/missions/${m.id_mission}`}
                            key={m.id_mission}
                            className="dash-mission-item"
                        >
                            <div>
                            <p className="dash-mission-titre">{m.titre}</p>
                            <p className="dash-mission-meta">{helper}</p>
                            </div>
                            <span
                            className="dash-mission-statut"
                            style={{ background:statut.bg, color:statut.color }}
                            >
                            {statut.label}
                            </span>
                        </Link>
                        )
                    })}
                    </div>
                )}
                </div>

            </div>

            {/* ── COLONNE DROITE ── */}
            <div className="dash-col-right">

                {/* Messages récents */}
                <div className="dash-card">
                <div className="dash-card-head">
                    <h2 className="dash-card-title">Messages</h2>
                    <Link to="/messages" className="dash-voir-tout">Voir tout</Link>
                </div>

                {messages_recents.length === 0 ? (
                    <p className="dash-empty-text">Aucun message</p>
                ) : (
                    <div className="dash-messages-list">
                    {messages_recents.map(msg => (
                        <Link
                        to="/messages"
                        key={msg.id_conversation}
                        className="dash-message-item"
                        >
                        <div className="dash-message-avatar">
                            {getInitials(msg.autre_prenom, msg.autre_nom)}
                        </div>
                        <div className="dash-message-info">
                            <p className="dash-message-name">
                            {msg.autre_prenom} {msg.autre_nom}
                            </p>
                            <p className="dash-message-preview">
                            {msg.dernier_message
                                ? msg.dernier_message.slice(0, 35) + '...'
                                : 'Nouvelle conversation'
                            }
                            </p>
                        </div>
                        <div className="dash-message-right">
                            <p className="dash-message-time">
                            {formatTime(msg.date_dernier_message)}
                            </p>
                            {parseInt(msg.non_lus) > 0 && (
                            <span className="dash-message-badge">
                                {msg.non_lus}
                            </span>
                            )}
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
                </div>

                {/* Récompenses / Points */}
                <div className="dash-card">
                <div className="dash-card-head">
                    <h2 className="dash-card-title">Récompenses</h2>
                </div>
                <div className="dash-recomp-body">
                    <div className="dash-recomp-icon">🏆</div>
                    <p className="dash-recomp-points">{stats.solde_points}</p>
                    <p className="dash-recomp-label">Points totaux</p>
                    <div className="dash-recomp-progress-wrap">
                    <p className="dash-recomp-next">Prochain niveau :</p>
                    <div className="dash-progress-bar">
                        <div
                        className="dash-progress-fill"
                        style={{
                            width: `${Math.min((stats.solde_points % 100) , 100)}%`
                        }}
                        />
                    </div>
                    <p className="dash-recomp-reste">
                        {100 - (stats.solde_points % 100)} points restants
                    </p>
                    </div>
                    <Link to="/premium" className="dash-premium-btn">
                    👑 Découvrir Premium
                    </Link>
                </div>
                </div>

            </div>
            </div>
        </main>
        </div>
    )
}

export default Dashboard