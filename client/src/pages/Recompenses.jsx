import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORIES = ['Toutes', 'Shopping', 'Loisirs', 'Alimentation', 'Transport']

const Recompenses = () => {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [recompenses, setRecompenses] = useState([])
    const [solde, setSolde] = useState(0)
    const [loading, setLoading] = useState(true)
    const [catFilter, setCatFilter] = useState('Toutes')
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('disponibles')
    const [historique, setHistorique] = useState([])
    const [exchanging, setExchanging] = useState(null)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        fetchRecompenses()
        if (token) fetchSoldeEtHistorique()
    }, [catFilter, token])

    const fetchRecompenses = async () => {
        setLoading(true)
        try {
        let url = '/api/recompenses'
        if (catFilter !== 'Toutes') url += `?cat_partenaire=${catFilter}`
        const response = await axios.get(url)
        setRecompenses(response.data.recompenses)
        } catch (error) {
        console.error('Erreur récompenses:', error)
        } finally {
        setLoading(false)
        }
    }

    const fetchSoldeEtHistorique = async () => {
        try {
        const response = await axios.get('/api/points/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        setSolde(response.data.solde)
        setHistorique(response.data.historique)
        } catch (error) {
        console.error('Erreur solde:', error)
        }
    }

    const handleEchanger = async (recompense) => {
        if (!token) { navigate('/login'); return }
        if (solde < recompense.cout_en_points) {
        setError('Solde insuffisant pour cette récompense')
        return
        }
        if (!window.confirm(`Échanger ${recompense.cout_en_points} points contre "${recompense.nom_recomp}" ?`)) return

        setExchanging(recompense.id_recomp)
        setError('')
        setSuccess('')

        try {
        await axios.post(
            `/api/recompenses/${recompense.id_recomp}/echanger`, {},
            { headers: { Authorization: `Bearer ${token}` } }
        )
        setSuccess(`🎉 "${recompense.nom_recomp}" obtenu avec succès !`)
        fetchRecompenses()
        fetchSoldeEtHistorique()
        } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de l\'échange')
        } finally {
        setExchanging(null)
        }
    }

    const recompensesFiltrees = recompenses.filter(r =>
        r.nom_recomp.toLowerCase().includes(search.toLowerCase()) ||
        r.nom_enseigne?.toLowerCase().includes(search.toLowerCase())
    )

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    return (
        <div className="recomp-container">
        <Navbar />

        <main className="recomp-main">

            {/* ── EN-TÊTE ── */}
            <div className="recomp-header">
            <div>
                <h1 className="recomp-title">Catalogue de récompenses</h1>
                <p className="recomp-subtitle">Échangez vos points contre des récompenses</p>
            </div>
            {token && (
                <div className="recomp-solde-badge">
                <span className="recomp-solde-icon">⭐</span>
                <div>
                    <p className="recomp-solde-label">Mes points</p>
                    <p className="recomp-solde-value">{solde}</p>
                </div>
                </div>
            )}
            </div>

            {success && (
            <div className="edit-success" style={{ marginBottom:'16px' }}>{success}</div>
            )}
            {error && (
            <div className="edit-error" style={{ marginBottom:'16px' }}>{error}</div>
            )}

            {/* ── RECHERCHE ── */}
            <div className="recomp-search-row">
            <div className="missions-search-wrapper">
                <span className="missions-search-icon">🔍</span>
                <input
                type="text"
                placeholder="Rechercher une récompense..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="missions-search-input"
                />
            </div>
            <select
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
                className="missions-cat-select"
            >
                {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
            </div>

            {/* ── TABS ── */}
            <div className="profil-tabs" style={{ marginBottom:'24px' }}>
            <button
                className={activeTab === 'disponibles' ? 'profil-tab active' : 'profil-tab'}
                onClick={() => setActiveTab('disponibles')}
            >
                Disponibles
            </button>
            <button
                className={activeTab === 'historique' ? 'profil-tab active' : 'profil-tab'}
                onClick={() => setActiveTab('historique')}
            >
                Mon historique
            </button>
            </div>

            {/* ── CATALOGUE ── */}
            {activeTab === 'disponibles' && (
            loading ? (
                <div className="missions-loading">Chargement...</div>
            ) : recompensesFiltrees.length === 0 ? (
                <div className="missions-empty">
                <p>Aucune récompense disponible</p>
                <span>Revenez bientôt !</span>
                </div>
            ) : (
                <div className="recomp-grid">
                {recompensesFiltrees.map(recomp => {
                    const canExchange = token && solde >= recomp.cout_en_points
                    return (
                    <div key={recomp.id_recomp} className="recomp-card">

                        {/* Image */}
                        <div className="recomp-card-img">
                        {recomp.image_url ? (
                            <img
                            src={`http://localhost:5000${recomp.image_url}`}
                            alt={recomp.nom_recomp}
                            style={{
                                width:'100%', height:'100%',
                                objectFit:'cover', display:'block'
                            }}
                            />
                        ) : (
                            <div className="recomp-card-img-inner">🎁</div>
                        )}
                        <span className={recomp.stock_disponible <= 5
                            ? 'recomp-stock-badge limite'
                            : 'recomp-stock-badge'
                        }>
                            {recomp.stock_disponible <= 5 ? 'Limité' : 'Disponible'}
                        </span>
                        </div>

                        {/* Contenu */}
                        <div className="recomp-card-body">
                        <span className="recomp-cat">{recomp.cat_partenaire}</span>
                        <h3 className="recomp-card-title">{recomp.nom_recomp}</h3>
                        <p className="recomp-card-desc">{recomp.desc_recomp}</p>

                        <div className="recomp-card-footer">
                            <div>
                            <span className="recomp-points">⭐ {recomp.cout_en_points}</span>
                            <span className="recomp-partenaire">{recomp.nom_enseigne}</span>
                            </div>
                            <button
                            className={canExchange ? 'recomp-btn' : 'recomp-btn-disabled'}
                            onClick={() => handleEchanger(recomp)}
                            disabled={!canExchange || exchanging === recomp.id_recomp}
                            >
                            {exchanging === recomp.id_recomp
                                ? 'Échange...'
                                : canExchange ? 'Échanger' : 'Points insuffisants'
                            }
                            </button>
                        </div>
                        </div>
                    </div>
                    )
                })}
                </div>
            )
            )}

            {/* ── HISTORIQUE ── */}
            {activeTab === 'historique' && (
            <div className="recomp-historique">
                {!token ? (
                <div className="missions-empty">
                    <p>Connectez-vous pour voir votre historique</p>
                </div>
                ) : historique.length === 0 ? (
                <div className="missions-empty">
                    <p>Aucune transaction pour l'instant</p>
                    <span>Complétez des missions pour gagner des points</span>
                </div>
                ) : (
                historique.map(h => (
                    <div key={h.id_point} className="recomp-hist-item">
                    <div className={h.valeur > 0
                        ? 'recomp-hist-icon positif'
                        : 'recomp-hist-icon negatif'
                    }>
                        {h.valeur > 0 ? '↑' : '↓'}
                    </div>
                    <div className="recomp-hist-info">
                        <p className="recomp-hist-motif">{h.motif}</p>
                        <p className="recomp-hist-date">{formatDate(h.date_transaction)}</p>
                    </div>
                    <span className={h.valeur > 0
                        ? 'recomp-hist-valeur positif'
                        : 'recomp-hist-valeur negatif'
                    }>
                        {h.valeur > 0 ? '+' : ''}{h.valeur} pts
                    </span>
                    </div>
                ))
                )}
            </div>
            )}

        </main>
        </div>
    )
}

export default Recompenses