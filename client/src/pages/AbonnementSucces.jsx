import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const AbonnementSucces = () => {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')

    return (
        <div style={{ minHeight:'100vh', background:'#0a0f1e' }}>
        <Navbar />
        <div style={{
            maxWidth:'500px', margin:'80px auto', padding:'24px',
            textAlign:'center'
        }}>
            <div style={{ fontSize:'64px', marginBottom:'24px' }}>🎉</div>
            <h1 style={{ fontSize:'28px', fontWeight:'700', color:'#ffffff', marginBottom:'12px' }}>
            Abonnement activé !
            </h1>
            <p style={{ color:'#94a3b8', fontSize:'15px', marginBottom:'32px', lineHeight:'1.6' }}>
            Bienvenue dans Premium. Vos avantages sont maintenant actifs —
            points multipliés, missions illimitées et support prioritaire.
            </p>
            <Link
            to="/dashboard"
            className="auth-btn"
            style={{ display:'inline-block', textDecoration:'none', padding:'12px 32px' }}
            >
            Aller au tableau de bord
            </Link>
        </div>
        </div>
    )
}

export default AbonnementSucces
