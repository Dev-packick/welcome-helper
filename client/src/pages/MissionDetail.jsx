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
    const [terminating, setTerminating] = useState(false)
    const [success, setSuccess] = useState('')
    const [evalData, setEvalData] = useState({ note: 0, commentaire: '' })
    const [evalSubmitted, setEvalSubmitted] = useState(false)
    const [evalLoading, setEvalLoading] = useState(false)

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

    const handleTerminer = async () => {
        if (!window.confirm('Confirmer la fin de la mission ? Les points seront crédités au helper.')) return
        setTerminating(true)
        setError('')
        try {
            const response = await axios.post(
            `/api/missions/${id}/terminer`, {},
            { headers: { Authorization: `Bearer ${token}` } }
            )
            setSuccess(`Mission terminée ! ${response.data.points_credites} points crédités au helper.`)
            fetchMission()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur')
        } finally {
            setTerminating(false)
        }
    }

    const handleEvaluation = async (e) => {
        e.preventDefault()
        if (evalData.note === 0) return
        setEvalLoading(true)
        try {
            await axios.post('/api/evaluations',
            { id_mission: parseInt(id), note: evalData.note, commentaire: evalData.commentaire },
            { headers: { Authorization: `Bearer ${token}` } }
            )
            setEvalSubmitted(true)
            setSuccess('Évaluation enregistrée avec succès !')
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'évaluation')
        } finally {
            setEvalLoading(false)
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

                    {success && (
                        <div className="edit-success" style={{ marginBottom: '16px' }}>
                            {success}
                        </div>
                        )}

                        {isOwner && mission.statut === 'en_cours' && (
                        <button className={terminating ? 'auth-btn-disabled' : 'auth-btn'} onClick={handleTerminer} disabled={terminating} style={{ width: '100%', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                            {terminating ? 'Traitement...' : '✓ Marquer comme terminée'}
                        </button>
                    )}

                    {/* Formulaire évaluation */}
                    {isOwner && mission.statut === 'terminee' && !evalSubmitted && (
                    <div className="eval-form">
                        <h3 className="eval-title">Évaluer le helper</h3>
                        <form onSubmit={handleEvaluation}>
                            <div className="eval-stars">
                                {[1,2,3,4,5].map(star => (
                                    <span key={star} className={evalData.note >= star ? 'eval-star active' : 'eval-star'} onClick={() => setEvalData({ ...evalData, note: star })} aria-label={`Note ${star}`} >⭐</span>
                                ))}
                            </div>
                            <textarea value={evalData.commentaire} onChange={e => setEvalData({ ...evalData, commentaire: e.target.value })} className="edit-textarea" placeholder="Commentaire optionnel..." rows={3} maxLength={500} style={{ marginTop: '12px' }}/>
                            <button type="submit" className={evalLoading || evalData.note === 0 ? 'auth-btn-disabled' : 'auth-btn'} disabled={evalLoading || evalData.note === 0} style={{ marginTop: '12px', width: '100%' }}>
                                {evalLoading ? 'Envoi...' : 'Envoyer l\'évaluation'}
                            </button>
                        </form>
                    </div>
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
