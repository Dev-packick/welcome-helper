import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Admin = () => {
    const { token } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [missions, setMissions] = useState([])
    const [partenaires, setPartenaires] = useState([])
    const [activeTab, setActiveTab] = useState('stats')
    const [loading, setLoading] = useState(true)
    const [roleFilter, setRoleFilter] = useState('')
    const [statutFilter, setStatutFilter] = useState('')
    const [showPartenaireForm, setShowPartenaireForm] = useState(false)
    const [editingPartenaire, setEditingPartenaire] = useState(null)
    const [partenaireForm, setPartenaireForm] = useState({
        nom_enseigne: '', logo_url: '', contact: ''
    })
    const [uploadingLogo, setUploadingLogo] = useState(false)
    const [selectedPartenaire, setSelectedPartenaire] = useState(null)
    const [recompenses, setRecompenses] = useState([])
    const [showRecompForm, setShowRecompForm] = useState(false)
    const [editingRecomp, setEditingRecomp] = useState(null)
    const [recompForm, setRecompForm] = useState({
        nom_recomp: '', desc_recomp: '', cout_en_points: '',
        stock_disponible: '', cat_partenaire: '', image_url: ''
    })

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        if (storedUser?.role !== 'admin') { navigate('/dashboard'); return }
        fetchStats()
        fetchUsers()
        fetchMissions()
        fetchPartenaires()
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

    const fetchPartenaires = async () => {
        try {
        const response = await axios.get('/api/admin/partenaires', { headers })
        setPartenaires(response.data.partenaires)
        } catch (error) {
        console.error('Erreur partenaires:', error)
        }
    }

    const fetchRecompenses = async (partenaireId) => {
        try {
        const response = await axios.get(
            `/api/admin/partenaires/${partenaireId}/recompenses`,
            { headers }
        )
        setRecompenses(response.data.recompenses)
        } catch (error) {
        console.error('Erreur recompenses:', error)
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

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingLogo(true)
        try {
        const formData = new FormData()
        formData.append('logo', file)
        const response = await axios.post(
            '/api/admin/partenaires/upload-logo',
            formData,
            {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
            }
        )
        setPartenaireForm(prev => ({ ...prev, logo_url: response.data.logo_url }))
        } catch (error) {
        console.error('Erreur upload logo:', error)
        } finally {
        setUploadingLogo(false)
        }
    }

    const handlePartenaireSubmit = async (e) => {
        e.preventDefault()
        try {
        if (editingPartenaire) {
            await axios.put(
            `/api/admin/partenaires/${editingPartenaire.id_partenaire}`,
            partenaireForm,
            { headers }
            )
        } else {
            await axios.post('/api/admin/partenaires', partenaireForm, { headers })
        }
        setShowPartenaireForm(false)
        setEditingPartenaire(null)
        setPartenaireForm({ nom_enseigne: '', logo_url: '', contact: '' })
        fetchPartenaires()
        } catch (error) {
        console.error('Erreur partenaire:', error)
        }
    }

    const handleEditPartenaire = (p) => {
        setEditingPartenaire(p)
        setPartenaireForm({
        nom_enseigne: p.nom_enseigne,
        logo_url: p.logo_url || '',
        contact: p.contact || ''
        })
        setShowPartenaireForm(true)
    }

    const handleDeletePartenaire = async (id) => {
        if (!window.confirm('Supprimer ce partenaire et ses récompenses ?')) return
        try {
        await axios.delete(`/api/admin/partenaires/${id}`, { headers })
        fetchPartenaires()
        setSelectedPartenaire(null)
        } catch (error) {
        console.error('Erreur delete partenaire:', error)
        }
    }

    const handleSelectPartenaire = (p) => {
        setSelectedPartenaire(p)
        fetchRecompenses(p.id_partenaire)
        setShowRecompForm(false)
        setEditingRecomp(null)
    }

    const handleRecompImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        try {
        const formData = new FormData()
        formData.append('image', file)
        const response = await axios.post(
            '/api/admin/recompenses/upload-image',
            formData,
            {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
            }
        )
        setRecompForm(prev => ({ ...prev, image_url: response.data.image_url }))
        } catch (error) {
        console.error('Erreur upload image récompense:', error)
        }
    }

    const handleRecompSubmit = async (e) => {
        e.preventDefault()
        try {
        if (editingRecomp) {
            await axios.put(
            `/api/admin/recompenses/${editingRecomp.id_recomp}`,
            recompForm,
            { headers }
            )
        } else {
            await axios.post(
            `/api/admin/partenaires/${selectedPartenaire.id_partenaire}/recompenses`,
            recompForm,
            { headers }
            )
        }
        setShowRecompForm(false)
        setEditingRecomp(null)
        setRecompForm({
            nom_recomp: '', desc_recomp: '', cout_en_points: '',
            stock_disponible: '', cat_partenaire: '', image_url: ''
        })
        fetchRecompenses(selectedPartenaire.id_partenaire)
        } catch (error) {
        console.error('Erreur recompense submit:', error)
        }
    }

    const handleEditRecomp = (r) => {
        setEditingRecomp(r)
        setRecompForm({
        nom_recomp: r.nom_recomp,
        desc_recomp: r.desc_recomp || '',
        cout_en_points: r.cout_en_points,
        stock_disponible: r.stock_disponible,
        cat_partenaire: r.cat_partenaire || '',
        image_url: r.image_url || ''
        })
        setShowRecompForm(true)
    }

    const handleDeleteRecomp = async (id) => {
        if (!window.confirm('Supprimer cette récompense ?')) return
        try {
        await axios.delete(`/api/admin/recompenses/${id}`, { headers })
        fetchRecompenses(selectedPartenaire.id_partenaire)
        } catch (error) {
        console.error('Erreur delete recompense:', error)
        }
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '-'
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
            {[
                { id:'stats', label:' Statistiques' },
                { id:'users', label:' Utilisateurs' },
                { id:'missions', label:' Missions' },
                { id:'partenaires', label:' Partenaires' },
            ].map(tab => (
                <button
                key={tab.id}
                className={activeTab === tab.id ? 'admin-tab active' : 'admin-tab'}
                onClick={() => setActiveTab(tab.id)}
                >
                {tab.label}
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
                    <span>🟢 {stats.users.etrangers} étrangers</span>
                    <span>🔵 {stats.users.residents} résidents</span>
                    <span>🟢 {stats.users.certifies} certifiés</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Total missions</p>
                    <p className="admin-stat-value">{stats.missions.total}</p>
                    <div className="admin-stat-detail">
                    <span>🟢 {stats.missions.ouvertes} ouvertes</span>
                    <span>🔵 {stats.missions.en_cours} en cours</span>
                    <span>🟢 {stats.missions.terminees} terminées</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Points distribués</p>
                    <p className="admin-stat-value">
                    {parseInt(stats.points_distribues).toLocaleString('fr-FR')}
                    </p>
                    <div className="admin-stat-detail">
                    <span>Points créés par les missions</span>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <p className="admin-stat-label">Revenus abonnements</p>
                    <p className="admin-stat-value">
                    {parseFloat(stats.revenus).toFixed(2)} €
                    </p>
                    <div className="admin-stat-detail">
                    <span> Abonnements payés</span>
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
                                <p className="admin-user-pays">{u.pays_origine || '-'}</p>
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
                             {u.missions_publiees} /  {u.missions_realisees}
                        </td>
                        <td className="admin-td-secondary">⭐ {u.solde_points}</td>
                        <td className="admin-td-secondary">{formatDate(u.created_at)}</td>
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
                        <td className="admin-td-secondary">{m.prenom} {m.nom}</td>
                        <td>
                            <span className="mission-cat-tag">{m.cat_mission}</span>
                        </td>
                        <td className="admin-td-secondary">⭐ {m.points_offerts}</td>
                        <td>
                            <span className="admin-statut-badge" style={{
                            background: m.statut === 'ouverte'
                                ? 'rgba(34,197,94,0.15)'
                                : m.statut === 'en_cours'
                                ? 'rgba(59,130,246,0.15)'
                                : 'rgba(100,116,139,0.15)',
                            color: m.statut === 'ouverte' ? '#4ade80'
                                : m.statut === 'en_cours' ? '#60a5fa' : '#94a3b8'
                            }}>
                            {m.statut}
                            </span>
                        </td>
                        <td className="admin-td-secondary">{formatDate(m.date_publication)}</td>
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

            {/* ── PARTENAIRES ── */}
            {activeTab === 'partenaires' && (
            <div className="admin-section">
                <div className="admin-filters">
                <button
                    className="missions-publish-btn"
                    onClick={() => {
                    setEditingPartenaire(null)
                    setPartenaireForm({ nom_enseigne: '', logo_url: '', contact: '' })
                    setShowPartenaireForm(true)
                    }}
                >
                    + Ajouter un partenaire
                </button>
                </div>

                {/* Formulaire partenaire */}
                {showPartenaireForm && (
                <div className="admin-partenaire-form">
                    <h3 className="admin-partenaire-form-title">
                    {editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
                    </h3>
                    <form onSubmit={handlePartenaireSubmit} className="edit-form">
                    <div className="edit-form-row">
                        <div className="edit-field">
                        <label className="edit-label">Nom de l'enseigne</label>
                        <input
                            type="text"
                            value={partenaireForm.nom_enseigne}
                            onChange={e => setPartenaireForm({
                            ...partenaireForm, nom_enseigne: e.target.value
                            })}
                            className="edit-input"
                            placeholder="Ex: Amazon"
                            required
                        />
                        </div>
                        <div className="edit-field">
                        <label className="edit-label">Contact</label>
                        <input
                            type="text"
                            value={partenaireForm.contact}
                            onChange={e => setPartenaireForm({
                            ...partenaireForm, contact: e.target.value
                            })}
                            className="edit-input"
                            placeholder="Email ou téléphone"
                        />
                        </div>
                    </div>
                    <div className="edit-field">
                        <label className="edit-label">Logo du partenaire</label>
                        <div className="admin-logo-upload">
                        {partenaireForm.logo_url && (
                            <img
                            src={partenaireForm.logo_url.startsWith('http')
                                ? partenaireForm.logo_url
                                : `http://localhost:5000${partenaireForm.logo_url}`
                            }
                            alt="Aperçu logo"
                            className="admin-logo-preview"
                            />
                        )}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            onChange={handleLogoUpload}
                            className="edit-input"
                            style={{ padding:'8px' }}
                        />
                        <p style={{ fontSize:'11px', color:'#475569', marginTop:'4px' }}>
                            JPG, PNG, WebP ou SVG - max 2 Mo
                        </p>
                        </div>
                    </div>
                    <div className="edit-actions">
                        <button
                        type="button"
                        className="edit-cancel-btn"
                        onClick={() => setShowPartenaireForm(false)}
                        >
                        Annuler
                        </button>
                        <button type="submit" className="edit-save-btn">
                        {editingPartenaire ? 'Modifier' : 'Créer'}
                        </button>
                    </div>
                    </form>
                </div>
                )}

                {/* Liste partenaires */}
                <div className="admin-partenaires-grid">
                {partenaires.map(p => (
                    <div key={p.id_partenaire} className="admin-partenaire-card">
                    <div className="admin-partenaire-logo">
                        {p.logo_url ? (
                        <img
                            src={p.logo_url.startsWith('http')
                            ? p.logo_url
                            : `http://localhost:5000${p.logo_url}`
                            }
                            alt={p.nom_enseigne}
                            style={{
                            width:'100%', height:'100%', objectFit:'contain'
                            }}
                        />
                        ) : (
                        <span style={{ fontSize:'24px' }}></span>
                        )}
                    </div>
                    <div className="admin-partenaire-info">
                        <p className="admin-partenaire-nom">{p.nom_enseigne}</p>
                        <p className="admin-partenaire-contact">{p.contact || '-'}</p>
                        <p className="admin-partenaire-recomp">
                        {p.nb_recompenses} récompense(s)
                        </p>
                    </div>
                    <div className="admin-actions">
                        <button
                        className="admin-btn-recompenses"
                        onClick={() => handleSelectPartenaire(p)}
                        >
                        Récompenses
                        </button>
                        <button
                        className="admin-btn-certifier"
                        onClick={() => handleEditPartenaire(p)}
                        >
                        Modifier
                        </button>
                        <button
                        className="admin-btn-supprimer"
                        onClick={() => handleDeletePartenaire(p.id_partenaire)}
                        >
                        Supprimer
                        </button>
                    </div>
                    </div>
                ))}
                </div>

                {/* Panneau récompenses */}
                {selectedPartenaire && (
                <div className="admin-recomp-panel">
                    <div className="admin-recomp-panel-head">
                    <h3 className="admin-recomp-panel-title">
                        🎁 Récompenses - {selectedPartenaire.nom_enseigne}
                    </h3>
                    <div style={{ display:'flex', gap:'10px' }}>
                        <button
                        className="missions-publish-btn"
                        onClick={() => {
                            setEditingRecomp(null)
                            setRecompForm({
                            nom_recomp: '', desc_recomp: '',
                            cout_en_points: '', stock_disponible: '',
                            cat_partenaire: '', image_url: ''
                            })
                            setShowRecompForm(true)
                        }}
                        >
                        + Ajouter
                        </button>
                        <button
                        className="edit-cancel-btn"
                        onClick={() => setSelectedPartenaire(null)}
                        >
                        Fermer
                        </button>
                    </div>
                    </div>

                    {/* Formulaire récompense */}
                    {showRecompForm && (
                    <div className="admin-partenaire-form" style={{ marginBottom:'16px' }}>
                        <h4 className="admin-partenaire-form-title">
                        {editingRecomp ? 'Modifier la récompense' : 'Nouvelle récompense'}
                        </h4>
                        <form onSubmit={handleRecompSubmit} className="edit-form">
                        <div className="edit-form-row">
                            <div className="edit-field">
                            <label className="edit-label">Nom de la récompense</label>
                            <input
                                type="text"
                                value={recompForm.nom_recomp}
                                onChange={e => setRecompForm({
                                ...recompForm, nom_recomp: e.target.value
                                })}
                                className="edit-input"
                                placeholder="Ex: Carte cadeau 10€"
                                required
                            />
                            </div>
                            <div className="edit-field">
                            <label className="edit-label">Catégorie</label>
                            <select
                                value={recompForm.cat_partenaire}
                                onChange={e => setRecompForm({
                                ...recompForm, cat_partenaire: e.target.value
                                })}
                                className="edit-input"
                            >
                                <option value="">Choisir</option>
                                <option value="Shopping">Shopping</option>
                                <option value="Loisirs">Loisirs</option>
                                <option value="Alimentation">Alimentation</option>
                                <option value="Transport">Transport</option>
                            </select>
                            </div>
                        </div>
                        <div className="edit-field">
                            <label className="edit-label">Description</label>
                            <textarea
                            value={recompForm.desc_recomp}
                            onChange={e => setRecompForm({
                                ...recompForm, desc_recomp: e.target.value
                            })}
                            className="edit-textarea"
                            placeholder="Description de la récompense..."
                            rows={2}
                            />
                        </div>
                        <div className="edit-form-row">
                            <div className="edit-field">
                            <label className="edit-label">Coût en points</label>
                            <input
                                type="number"
                                value={recompForm.cout_en_points}
                                onChange={e => setRecompForm({
                                ...recompForm, cout_en_points: e.target.value
                                })}
                                className="edit-input"
                                placeholder="Ex: 200"
                                min="1"
                                required
                            />
                            </div>
                            <div className="edit-field">
                            <label className="edit-label">Stock disponible</label>
                            <input
                                type="number"
                                value={recompForm.stock_disponible}
                                onChange={e => setRecompForm({
                                ...recompForm, stock_disponible: e.target.value
                                })}
                                className="edit-input"
                                placeholder="Ex: 50"
                                min="0"
                            />
                            </div>
                        </div>
                        <div className="edit-field">
                            <label className="edit-label">Image de la récompense</label>
                            <div className="admin-logo-upload">
                            {recompForm.image_url && (
                                <img
                                src={`http://localhost:5000${recompForm.image_url}`}
                                alt="Aperçu récompense"
                                style={{
                                    width:'80px', height:'80px',
                                    objectFit:'cover', borderRadius:'8px',
                                    border:'1px solid #334155'
                                }}
                                />
                            )}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleRecompImageUpload}
                                className="edit-input"
                                style={{ padding:'8px' }}
                            />
                            <p style={{ fontSize:'11px', color:'#475569', marginTop:'4px' }}>
                                JPG, PNG ou WebP - max 2 Mo
                            </p>
                            </div>
                        </div>
                        <div className="edit-actions">
                            <button
                            type="button"
                            className="edit-cancel-btn"
                            onClick={() => setShowRecompForm(false)}
                            >
                            Annuler
                            </button>
                            <button type="submit" className="edit-save-btn">
                            {editingRecomp ? 'Modifier' : 'Créer'}
                            </button>
                        </div>
                        </form>
                    </div>
                    )}

                    {/* Liste récompenses */}
                    {recompenses.length === 0 ? (
                    <p style={{ color:'#64748b', textAlign:'center', padding:'20px' }}>
                        Aucune récompense pour ce partenaire
                    </p>
                    ) : (
                    <div className="admin-table-wrapper">
                        <table className="admin-table">
                        <thead>
                            <tr>
                            <th>Image</th>
                            <th>Récompense</th>
                            <th>Catégorie</th>
                            <th>Coût</th>
                            <th>Stock</th>
                            <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recompenses.map(r => (
                            <tr key={r.id_recomp}>
                                <td>
                                {r.image_url ? (
                                    <img
                                    src={`http://localhost:5000${r.image_url}`}
                                    alt={r.nom_recomp}
                                    style={{
                                        width:'48px', height:'48px',
                                        objectFit:'cover', borderRadius:'6px'
                                    }}
                                    />
                                ) : (
                                    <span style={{ fontSize:'28px' }}>🎁</span>
                                )}
                                </td>
                                <td>
                                <p className="admin-mission-titre">{r.nom_recomp}</p>
                                <p className="admin-td-secondary">{r.desc_recomp}</p>
                                </td>
                                <td>
                                <span className="recomp-cat">{r.cat_partenaire || '-'}</span>
                                </td>
                                <td className="admin-td-secondary">⭐ {r.cout_en_points}</td>
                                <td>
                                <span style={{
                                    color: r.stock_disponible <= 5 ? '#f87171' : '#4ade80',
                                    fontWeight: '600'
                                }}>
                                    {r.stock_disponible}
                                </span>
                                </td>
                                <td>
                                <div className="admin-actions">
                                    <button
                                    className="admin-btn-certifier"
                                    onClick={() => handleEditRecomp(r)}
                                    >
                                    Modifier
                                    </button>
                                    <button
                                    className="admin-btn-supprimer"
                                    onClick={() => handleDeleteRecomp(r.id_recomp)}
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
                    )}
                </div>
                )}
            </div>
            )}
        </main>
        </div>
    )
}

export default Admin