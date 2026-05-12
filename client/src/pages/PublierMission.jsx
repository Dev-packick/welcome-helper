import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORIES = [
    'Administratif', 'Banque', 'Logement',
    'Transport', 'Orientation', 'Courses', 'Autre'
    ]

    const PublierMission = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        titre: '',
        desc_mission: '',
        cat_mission: '',
        points_offerts: '',
        date_echeance: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!token) { navigate('/login'); return null }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {e.preventDefault()
        setLoading(true)
        setError('')
        try {
        await axios.post('/api/missions', {
            ...formData,
            points_offerts: parseInt(formData.points_offerts)
        }, {
            headers: { Authorization: `Bearer ${token}` }
        })
        navigate('/missions')
        } catch (err) {
        setError(err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.message ||
                'Erreur lors de la publication')
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="missions-container">
            <Navbar />
            <main className="edit-main">
                <div className="edit-header">
                    <Link to="/missions" className="edit-retour">← Retour aux missions</Link>
                    <h1 className="edit-title">Publier une mission</h1>
                    <p style={{ fontSize:'14px', color:'#64748b', marginTop:'4px' }}>Décrivez votre besoin et trouvez un helper</p>
                </div>

                <div className="edit-card">
                    {error && <div className="edit-error">{error}</div>}
                    <form onSubmit={handleSubmit} className="edit-form">
                        <div className="edit-field">
                            <label className="edit-label">Titre de la mission</label>
                            <input type="text" name="titre" value={formData.titre} onChange={handleChange} className="edit-input" placeholder="Ex: Aide pour ouverture compte bancaire" required/>
                        </div>

                        <div className="edit-field">
                            <label className="edit-label">Description</label>
                            <textarea name="desc_mission" value={formData.desc_mission} onChange={handleChange} className="edit-textarea" placeholder="Décrivez votre besoin en détail..." rows={5} required/>
                        </div>

                        <div className="edit-form-row">
                            <div className="edit-field">
                                <label className="edit-label">Catégorie</label>
                                <select name="cat_mission" value={formData.cat_mission} onChange={handleChange} className="edit-input" required>
                                    <option value="">Choisir une catégorie</option>
                                    {CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                                </select>
                            </div>

                            <div className="edit-field">
                                <label className="edit-label">Points offerts</label>
                                <input type="number" name="points_offerts" value={formData.points_offerts} onChange={handleChange} className="edit-input" placeholder="Ex: 30" min="1" max="500" required/>
                            </div>
                        </div>

                        <div className="edit-field">
                            <label className="edit-label">Date limite (optionnel)</label>
                            <input type="date" name="date_echeance" value={formData.date_echeance} onChange={handleChange} className="edit-input" min={new Date().toISOString().split('T')[0]}/>
                        </div>

                        <div className="edit-actions">
                            <Link to="/missions" className="edit-cancel-btn">Annuler</Link>
                            <button type="submit" className={loading ? 'edit-save-btn-disabled' : 'edit-save-btn'} disabled={loading}>
                                {loading ? 'Publication...' : 'Publier la mission'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    )
}

export default PublierMission
