import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Admin = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [missions, setMissions] = useState([])
    const [activeTab, setActiveTab] = useState('stats')
    const [loading, setLoading] = useState(true)
    const [roleFilter, setRoleFilter] = useState('')
    const [statutFilter, setStatutFilter] = useState('')

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        if (!token) {
            navigate('/login')
            return
        }

        const storedUser = JSON.parse(localStorage.getItem('user'))
        
        if (!storedUser || storedUser.role !== 'admin') {
            navigate('/dashboard')
            return
        }

        fetchStats()
        fetchUsers()
        fetchMissions()
    }, [token])

    const headers = { Authorization: `Bearer ${token}` }

    const fetchStats = async () => {
        try {
        const response = await axios.get('/api/admin/stats', { headers })
        setStats(response.data)
        } catch (error) {
        console.error('Erreur stats:', error)
        } finally {
        setLoading(false)
        }
    }

    const fetchUsers = async () => {
        try {
        let url = '/api/admin/users'
        if (roleFilter) url += `?role=${roleFilter}`
        const response = await axios.get(url, { headers })
        setUsers(response.data.users)
        } catch (error) {
        console.error('Erreur users:', error)
        }
    }

    const fetchMissions = async () => {
        try {
        let url = '/api/admin/missions'
        if (statutFilter) url += `?statut=${statutFilter}`
        const response = await axios.get(url, { headers })
        setMissions(response.data.missions)
        } catch (error) {
        console.error('Erreur missions:', error)
        }
    }

    const handleCertifier = async (id) => {
        try {
        await axios.put(`/api/admin/users/${id}/certifier`, {}, { headers })
        fetchUsers()
        } catch (error) {
        console.error('Erreur certifier:', error)
        }
    }

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Supprimer cet utilisateur ?')) return
        try {
        await axios.delete(`/api/admin/users/${id}`, { headers })
        fetchUsers()
        } catch (error) {
        console.error('Erreur delete user:', error)
        }
    }

    const handleDeleteMission = async (id) => {
        if (!window.confirm('Supprimer cette mission ?')) return
        try {
        await axios.delete(`/api/admin/missions/${id}`, { headers })
        fetchMissions()
        } catch (error) {
        console.error('Erreur delete mission:', error)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('fr-FR')
    }

    if (loading) return (
        <div style={{ minHeight:'100vh', background:'#0a0f1e' }}>
        <Navbar />
        <p style={{ color:'#64748b', textAlign:'center', padding:'80px' }}>
            Chargement...
        </p>
        </div>
    )

    return (
        <div className="admin-container">
        <Navbar />

        <main className="admin-main">
            <div className="admin-header">
            <h1 className="admin-title">Dashboard Administrateur</h1>
            <p className="admin-subtitle">Gestion de la plateforme WelcomeHelper</p>
            </div>

            {/* ── TABS ── */}
            <div className="admin-tabs">
            {['stats', 'users', 'missions'].map(tab => (
                <button
                key={tab}
                className={activeTab === tab ? 'admin-tab active' : 'admin-tab'}
                onClick={() => setActiveTab(tab)}
                >
                {tab === 'stats' ? '📊 Statistiques'
                    : tab === 'users' ? '👥 Utilisateurs'
                    : '📋 Missions'}
                </button>
            ))}
            </div>

            {/* ── STATISTIQUES ── */}
            {activeTab === 'stats' && stats && (
            <div className="admin-section">
                <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total utilisateurs</p>
                    <p className="admin-stat-value">{stats.users.total}</p>
                    <div className="admin-stat-detail">
                    <span>🌍 {stats.users.etrangers} étrangers</span>
                    <span>🤝 {stats.users.residents} résidents</span>
                    <span>✓ {stats.users.certifies} certifiés</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total missions</p>
                    <p className="admin-stat-value">{stats.missions.total}</p>
                    <div className="admin-stat-detail">
                    <span>🟢 {stats.missions.ouvertes} ouvertes</span>
                    <span>🔵 {stats.missions.en_cours} en cours</span>
                    <span>✅ {stats.missions.terminees} terminées</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Points distribués</p>
                    <p className="admin-stat-value">
                    {parseInt(stats.points_distribues).toLocaleString('fr-FR')}
                    </p>
                    <div className="admin-stat-detail">
                    <span>⭐ Points créés par les missions</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Revenus abonnements</p>
                    <p className="admin-stat-value">
                    {parseFloat(stats.revenus).toFixed(2)} €
                    </p>
                    <div className="admin-stat-detail">
                    <span>💳 Abonnements payés</span>
                    </div>
                </div>
                </div>
            </div>
            )}

            {/* ── UTILISATEURS ── */}
            {activeTab === 'users' && (
            <div className="admin-section">
                <div className="admin-filters">
                <select
                    value={roleFilter}
                    onChange={e => { setRoleFilter(e.target.value); fetchUsers(); }}
                    className="admin-select"
                >
                    <option value="">Tous les rôles</option>
                    <option value="etranger">Étrangers</option>
                    <option value="resident">Résidents</option>
                </select>
                </div>

                <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Utilisateur</th>
                        <th>Email</th>
                        <th>Rôle</th>
                        <th>Missions</th>
                        <th>Points</th>
                        <th>Inscrit le</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map(u => (
                        <tr key={u.user_id}>
                        <td>
                            <div className="admin-user-cell">
                            <div className="admin-user-avatar">
                                {u.prenom?.[0]}{u.nom?.[0]}
                            </div>
                            <div>
                                <p className="admin-user-name">
                                {u.prenom} {u.nom}
                                {u.is_certifie && (
                                    <span className="admin-certifie-badge">✓</span>
                                )}
                                </p>
                                <p className="admin-user-pays">
                                {u.pays_origine || '—'}
                                </p>
                            </div>
                            </div>
                        </td>
                        <td className="admin-td-secondary">{u.email}</td>
                        <td>
                            <span className={u.role === 'etranger'
                            ? 'admin-role-badge etranger'
                            : 'admin-role-badge resident'
                            }>
                            {u.role}
                            </span>
                        </td>
                        <td className="admin-td-secondary">
                            📤 {u.missions_publiees} / 📥 {u.missions_realisees}
                        </td>
                        <td className="admin-td-secondary">
                            ⭐ {u.solde_points}
                        </td>
                        <td className="admin-td-secondary">
                            {formatDate(u.created_at)}
                        </td>
                        <td>
                            <div className="admin-actions">
                            {!u.is_certifie && (
                                <button
                                className="admin-btn-certifier"
                                onClick={() => handleCertifier(u.user_id)}
                                >
                                Certifier
                                </button>
                            )}
                            <button
                                className="admin-btn-supprimer"
                                onClick={() => handleDeleteUser(u.user_id)}
                            >
                                Supprimer
                            </button>
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}

            {/* ── MISSIONS ── */}
            {activeTab === 'missions' && (
            <div className="admin-section">
                <div className="admin-filters">
                <select
                    value={statutFilter}
                    onChange={e => { setStatutFilter(e.target.value); fetchMissions(); }}
                    className="admin-select"
                >
                    <option value="">Tous les statuts</option>
                    <option value="ouverte">Ouvertes</option>
                    <option value="en_cours">En cours</option>
                    <option value="terminee">Terminées</option>
                    <option value="annulee">Annulées</option>
                </select>
                </div>

                <div className="admin-table-wrapper">
                <table className="admin-table">
                    <thead>
                    <tr>
                        <th>Mission</th>
                        <th>Publié par</th>
                        <th>Catégorie</th>
                        <th>Points</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {missions.map(m => (
                        <tr key={m.id_mission}>
                        <td>
                            <p className="admin-mission-titre">{m.titre}</p>
                            <p className="admin-td-secondary">
                            {m.desc_mission?.slice(0, 50)}...
                            </p>
                        </td>
                        <td className="admin-td-secondary">
                            {m.prenom} {m.nom}
                        </td>
                        <td>
                            <span className="mission-cat-tag">{m.cat_mission}</span>
                        </td>
                        <td className="admin-td-secondary">
                            ⭐ {m.points_offerts}
                        </td>
                        <td>
                            <span className="admin-statut-badge" style={{
                            background: m.statut === 'ouverte'
                                ? 'rgba(34,197,94,0.15)'
                                : m.statut === 'en_cours'
                                ? 'rgba(59,130,246,0.15)'
                                : 'rgba(100,116,139,0.15)',
                            color: m.statut === 'ouverte'
                                ? '#4ade80'
                                : m.statut === 'en_cours'
                                ? '#60a5fa'
                                : '#94a3b8'
                            }}>
                            {m.statut}
                            </span>
                        </td>
                        <td className="admin-td-secondary">
                            {formatDate(m.date_publication)}
                        </td>
                        <td>
                            <button
                            className="admin-btn-supprimer"
                            onClick={() => handleDeleteMission(m.id_mission)}
                            >
                            Supprimer
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
            )}

        </main>
        </div>
    )
}

export default Admin
