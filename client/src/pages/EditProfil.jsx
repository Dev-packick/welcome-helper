import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const EditProfil = () => {
    const { user, token } = useAuth()
    const navigate = useNavigate()
    const fileInputRef = useRef(null)

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        pays_origine: '',
        universite: '',
        bio: '',
        langue: '',
    })
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [avatarFile, setAvatarFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingAvatar, setLoadingAvatar] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

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
        const p = response.data.profil
        setFormData({
            nom: p.nom || '',
            prenom: p.prenom || '',
            pays_origine: p.pays_origine || '',
            universite: p.universite || '',
            bio: p.bio || '',
            langue: p.langue || '',
        })
        if (p.avatar_url) {
            setAvatarPreview(`http://localhost:5000${p.avatar_url}`)
        }
        } catch (error) {
        console.error('Erreur chargement profil:', error)
        }
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
        setSuccess('')
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 2 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 2 Mo')
        return
        }
        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleAvatarUpload = async () => {
        if (!avatarFile) return
        setLoadingAvatar(true)
        try {
        const formDataFile = new FormData()
        formDataFile.append('avatar', avatarFile)
        await axios.post('/api/profil/avatar', formDataFile, {
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
            }
        })
        setSuccess('Avatar mis à jour !')
        setAvatarFile(null)
        } catch (err) {
        setError('Erreur lors de l\'upload de l\'avatar')
        } finally {
        setLoadingAvatar(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')
        try {
        await axios.put(`/api/profil/${user.user_id}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (avatarFile) await handleAvatarUpload()
        setSuccess('Profil mis à jour avec succès !')
        setTimeout(() => navigate('/profil'), 1500)
        } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour')
        } finally {
        setLoading(false)
        }
    }

    const getInitials = () => {
        if (!formData.prenom || !formData.nom) return 'WH'
        return `${formData.prenom[0]}${formData.nom[0]}`.toUpperCase()
    }

    return (
        <div className="profil-container">
        <Navbar />

        <main className="edit-main">
            <div className="edit-header">
            <Link to="/profil" className="edit-retour">← Retour au profil</Link>
            <h1 className="edit-title">Modifier mon profil</h1>
            </div>

            <div className="edit-card">

            {/* ── AVATAR ── */}
            <div className="edit-avatar-section">
                <div className="edit-avatar-wrapper">
                {avatarPreview ? (
                    <img
                    src={avatarPreview}
                    alt="Aperçu avatar"
                    className="edit-avatar-img"
                    />
                ) : (
                    <div className="edit-avatar-placeholder">
                    {getInitials()}
                    </div>
                )}
                <button
                    className="edit-avatar-btn"
                    onClick={() => fileInputRef.current.click()}
                    type="button"
                    aria-label="Changer l'avatar"
                >
                    📷
                </button>
                </div>
                <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
                />
                <p className="edit-avatar-hint">
                JPG, PNG ou WebP — max 2 Mo
                </p>
            </div>

            {success && <div className="edit-success">{success}</div>}
            {error && <div className="edit-error">{error}</div>}

            {/* ── FORMULAIRE ── */}
            <form onSubmit={handleSubmit} className="edit-form">
                <div className="edit-form-row">
                <div className="edit-field">
                    <label className="edit-label">Prénom</label>
                    <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    className="edit-input"
                    required
                    />
                </div>
                <div className="edit-field">
                    <label className="edit-label">Nom</label>
                    <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    className="edit-input"
                    required
                    />
                </div>
                </div>

                <div className="edit-form-row">
                <div className="edit-field">
                    <label className="edit-label">Pays d'origine</label>
                    <input
                    type="text"
                    name="pays_origine"
                    value={formData.pays_origine}
                    onChange={handleChange}
                    className="edit-input"
                    placeholder="Ex: Maroc"
                    />
                </div>
                <div className="edit-field">
                    <label className="edit-label">Université</label>
                    <input
                    type="text"
                    name="universite"
                    value={formData.universite}
                    onChange={handleChange}
                    className="edit-input"
                    placeholder="Ex: Université Paris-Saclay"
                    />
                </div>
                </div>

                <div className="edit-field">
                <label className="edit-label">Langue</label>
                <select
                    name="langue"
                    value={formData.langue}
                    onChange={handleChange}
                    className="edit-input"
                >
                    <option value="">Sélectionner une langue</option>
                    <option value="fr">Français</option>
                    <option value="en">Anglais</option>
                    <option value="ar">Arabe</option>
                    <option value="es">Espagnol</option>
                    <option value="pt">Portugais</option>
                    <option value="zh">Chinois</option>
                </select>
                </div>

                <div className="edit-field">
                <label className="edit-label">
                    Bio
                    <span className="edit-label-hint">
                    ({formData.bio.length}/500)
                    </span>
                </label>
                <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="edit-textarea"
                    placeholder="Parlez-vous en quelques mots..."
                    maxLength={500}
                    rows={4}
                />
                </div>

                <div className="edit-actions">
                <Link to="/profil" className="edit-cancel-btn">
                    Annuler
                </Link>
                <button
                    type="submit"
                    className={loading ? 'edit-save-btn-disabled' : 'edit-save-btn'}
                    disabled={loading}
                >
                    {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                </button>
                </div>
            </form>

            </div>
        </main>
        </div>
    )
}

export default EditProfil