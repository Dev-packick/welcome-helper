import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
        const response = await axios.post('/api/auth/login', formData)
        login(response.data.user, response.data.token)
        navigate('/dashboard')
        } catch (err) {
        setError(err.response?.data?.message || 'Erreur de connexion')
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <Link to="/" className="auth-retour">← Retour</Link>

            <div className="auth-card">
                <div className="auth-logo-icon">WH</div>
                <h1 className="auth-title">Bon retour !</h1>
                <p className="auth-subtitle">Connectez-vous à votre compte</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">✉</span>
                            <input type="email" name="email" placeholder="votre.email@exemple.com" value={formData.email} onChange={handleChange} className="auth-input" required/>
                        </div>
                    </div>

                    <div className="auth-field">
                        <div className="auth-label-row">
                            <label className="auth-label">Mot de passe</label>
                            <Link to="/forgot-password" className="auth-forgot-link"> Mot de passe oublié ?</Link>
                        </div>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">🔒</span>
                            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} className="auth-input" required/>
                            <span className="auth-eye-icon" onClick={() => setShowPassword(!showPassword)}> {showPassword ? '🙈' : '👁'}</span>
                        </div>
                    </div>

                    <button type="submit" className={loading ? 'auth-btn-disabled' : 'auth-btn'} disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div className="login-demo">
                    <p className="login-demo-title">Démo :</p>
                    <p className="login-demo-text">• Nouvel arrivant : newcomer@email.com</p>
                    <p className="login-demo-text">• Helper : helper@email.com</p>
                    <p className="login-demo-text">• Mot de passe : password123</p>
                </div>

                <p className="auth-footer"> Pas encore de compte ?{' '}
                    <Link to="/register" className="auth-footer-link">S'inscrire</Link>
                </p>
            </div>
        </div>
    )
}

export default Login
