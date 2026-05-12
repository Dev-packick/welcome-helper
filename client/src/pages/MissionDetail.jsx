import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MissionDetail = () => {
    const { id } = useParams()
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [mission, setMission] = useState(null)
    const [loading, setLoading] = useState(true)
    const [accepting, setAccepting] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchMission()
    }, [id])

    const fetchMission = async () => {
        try {
        const response = await axios.get(`/api/missions/${id}`)
        setMission(response.data.mission)
        } catch (error) {
        console.error('Erreur:', error)
        } finally {
        setLoading(false)
        }
    }

    const handleAccepter = async () => {
        if (!token) { navigate('/login'); return }
        setAccepting(true)
        setError('')
        try {
        await axios.post(`/api/missions/${id}/accepter`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        })
        navigate('/messages')
        } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de l\'acceptation')
        } finally {
        setAccepting(false)
        }
    }

    if (loading) return (
        <div style={{ minHeight:'100vh', background:'#0a0f1e' }}>
            <Navbar />
            <p style={{ color:'#64748b', textAlign:'center', padding:'80px' }}>Chargement...</p>
        </div>
    )

    if (!mission) return (
        <div style={{ minHeight:'100vh', background:'#0a0f1e' }}>
            <Navbar />
            <p style={{ color:'#ef4444', textAlign:'center', padding:'80px' }}>Mission non trouvée.</p>
        </div>
    )

    const isOwner = user?.user_id === mission.id_publiant

    return (
        <div className="missions-container">
            <Navbar />
            <main style={{ maxWidth:'700px', margin:'0 auto', padding:'32px 24px' }}>

                <Link to="/missions" className="edit-retour">← Retour aux missions</Link>

                <div className="mission-detail-card">
                    <div className="mission-card-tags" style={{ marginBottom:'16px' }}>
                        <span className="mission-cat-tag">{mission.cat_mission}</span>
                        <span className="mission-statut-tag" style={{background:'rgba(34,197,94,0.15)', color:'#4ade80'}}>{mission.statut}</span>
                    </div>

                    <h1 className="mission-detail-title">{mission.titre}</h1>
                    <p className="mission-detail-desc">{mission.desc_mission}</p>

                    <div className="mission-detail-meta">
                        <div className="mission-meta-item">
                            <span className="mission-meta-label">Points offerts</span>
                            <span className="mission-meta-value">⭐ {mission.points_offerts}</span>
                        </div>
                        {mission.date_echeance && (
                            <div className="mission-meta-item">
                                <span className="mission-meta-label">Date limite</span>
                                <span className="mission-meta-value">{new Date(mission.date_echeance).toLocaleDateString('fr-FR')}</span>
                            </div>
                        )}
                        <div className="mission-meta-item">
                            <span className="mission-meta-label">Publié par</span>
                            <span className="mission-meta-value">{mission.prenom} {mission.nom}{mission.is_certifie && ' ✓'}</span>
                        </div>
                    </div>

                    {error && (<div className="auth-error" style={{ marginBottom:'16px' }}>{error}</div>)}
                    {!isOwner && mission.statut === 'ouverte' && (
                        <button className={accepting ? 'auth-btn-disabled' : 'auth-btn'} onClick={handleAccepter} disabled={accepting} style={{ width:'100%' }}>
                            {accepting ? 'Acceptation...' : 'Accepter cette mission'}
                        </button>
                    )}

                    {isOwner && (
                        <div style={{ display:'flex', gap:'12px' }}>
                            <Link to={`/missions/${id}/edit`} className="edit-cancel-btn" style={{ flex:1, textAlign:'center' }}>Modifier</Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

export default MissionDetail
