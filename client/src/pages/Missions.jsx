import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORIES = [
    'Toutes', 'Administratif', 'Banque', 'Logement',
    'Transport', 'Orientation', 'Courses', 'Autre'
    ]

    const Missions = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [missions, setMissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [catFilter, setCatFilter] = useState('Toutes')
    const [page, setPage] = useState(1)

    useEffect(() => {
        fetchMissions()
    }, [catFilter, page])

    const fetchMissions = async () => {
        setLoading(true)
        try {
        let url = `/api/missions?page=${page}`
        if (catFilter !== 'Toutes') url += `&cat_mission=${catFilter}`
        const response = await axios.get(url)
        setMissions(response.data.missions)
        } catch (error) {
        console.error('Erreur chargement missions:', error)
        } finally {
        setLoading(false)
        }
    }

    const missionsFiltrees = missions.filter(m =>
        m.titre.toLowerCase().includes(search.toLowerCase()) ||
        m.desc_mission?.toLowerCase().includes(search.toLowerCase())
    )

    const getStatutStyle = (statut) => {
        const styles = {
        ouverte:   { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80' },
        en_cours:  { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
        terminee:  { bg: 'rgba(100,116,139,0.15)',color: '#94a3b8' },
        annulee:   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171' },
        }
        return styles[statut] || styles.ouverte
    }

    const getStatutLabel = (statut) => {
        const labels = {
        ouverte: 'Disponible', en_cours: 'En cours',
        terminee: 'Terminée', annulee: 'Annulée'
        }
        return labels[statut] || statut
    }

    const isUrgent = (date_echeance) => {
        if (!date_echeance) return false
        const diff = new Date(date_echeance) - new Date()
        return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000
    }

    return (
        <div className="missions-container">
            <Navbar />

            <main className="missions-main">

                {/* ── EN-TÊTE ── */}
                <div className="missions-header">
                    <div>
                        <h1 className="missions-title">Trouver de l'aide</h1>
                        <p className="missions-subtitle"> Publiez vos besoins et trouvez des helpers </p>
                    </div>
                    {user && (<Link to="/missions/publier" className="missions-publish-btn"> + Publier une mission </Link>)}
                </div>

                {/* ── BARRE DE RECHERCHE ── */}
                <div className="missions-search-row">
                    <div className="missions-search-wrapper">
                        <span className="missions-search-icon">🔍</span>
                        <input type="text" placeholder="Rechercher une mission..." value={search} onChange={e => setSearch(e.target.value)} className="missions-search-input" aria-label="Rechercher une mission"/>
                    </div>
                    <select value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} className="missions-cat-select" aria-label="Filtrer par catégorie">
                        {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat} catégorie</option>))}
                    </select>
                </div>

                {/* ── FILTRES RAPIDES ── */}
                <div className="missions-cats">
                    {CATEGORIES.map(cat => (
                        <button key={cat} className={catFilter === cat ? 'missions-cat-pill active' : 'missions-cat-pill'} onClick={() => { setCatFilter(cat); setPage(1); }}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* ── LISTE MISSIONS ── */}
                {loading ? (
                <div className="missions-loading">Chargement des missions...</div>) : missionsFiltrees.length === 0 ? (
                    <div className="missions-empty">
                        <p>Aucune mission trouvée</p>
                        <span>Essayez une autre catégorie ou publiez la première !</span>
                    </div>
                ) : (
                <div className="missions-grid">
                    {missionsFiltrees.map(mission => {
                    const statut = getStatutStyle(mission.statut)
                    const urgent = isUrgent(mission.date_echeance)

                    return (
                        <div key={mission.id_mission} className="mission-card">
                            {/* Tags */}
                            <div className="mission-card-tags">
                                <span className="mission-cat-tag">{mission.cat_mission}</span>
                                {urgent && (<span className="mission-urgent-tag">Urgent</span>)}
                                <span className="mission-statut-tag" style={{ background: statut.bg, color: statut.color }}>{getStatutLabel(mission.statut)}</span>
                            </div>

                            {/* Titre & description */}
                            <h2 className="mission-card-title">{mission.titre}</h2>
                            <p className="mission-card-desc">
                                {mission.desc_mission?.slice(0, 100)}
                                {mission.desc_mission?.length > 100 ? '...' : ''}
                            </p>

                            {/* Auteur */}
                            <div className="mission-card-author">
                                <div className="mission-author-avatar">{mission.prenom?.[0]}{mission.nom?.[0]}</div>
                                <div>
                                    <p className="mission-author-name">
                                        {mission.prenom} {mission.nom?.[0]}.
                                        {mission.is_certifie && (<span className="mission-certifie">✓</span>)}
                                    </p>
                                    {mission.note_moyenne && (<p className="mission-author-note"> ⭐ {mission.note_moyenne} </p>)}
                                </div>
                                {mission.pays_origine && (<span className="mission-pays">📍 {mission.pays_origine}</span>)}
                            </div>

                            {/* Footer carte */}
                            <div className="mission-card-footer">
                                <span className="mission-points"> ⭐ {mission.points_offerts} points </span>
                                {mission.date_echeance && (<span className="mission-date"> 🕐 {new Date(mission.date_echeance).toLocaleDateString('fr-FR')}</span>)}
                                <Link to={`/missions/${mission.id_mission}`} className="mission-voir-btn"> Voir détails </Link>
                            </div>
                        </div>
                    )
                    })}
                </div>
                )}

                {/* ── PAGINATION ── */}
                {!loading && missionsFiltrees.length > 0 && (
                    <div className="missions-pagination">
                        <button className="missions-page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}> ← Précédent </button>
                        <span className="missions-page-num">Page {page}</span>
                        <button className="missions-page-btn" onClick={() => setPage(p => p + 1)} disabled={missions.length < 10}> Suivant → </button>
                    </div>
                )}

            </main>
        </div>
    )
}

export default Missions
