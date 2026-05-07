import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const Register = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '',
        password: '', confirmPassword: '', role: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError('')
    }

    const handleRoleSelect = (role) => {
        setFormData({ ...formData, role })
        setStep(2)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        if (formData.password !== formData.confirmPassword)
        return setError('Les mots de passe ne correspondent pas')
        if (formData.password.length < 8)
        return setError('Le mot de passe doit faire au moins 8 caractères')
        setLoading(true)
        try {
        const response = await axios.post('/api/auth/register', {
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            password: formData.password,
            role: formData.role
        })
        login(response.data.user, response.data.token)
        navigate('/onboarding')
        } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de l'inscription")
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="auth-container">
        <Link to="/" className="auth-retour">← Retour</Link>

        <div className="auth-card auth-card-register">
            <div className="auth-logo-icon">WH</div>
            <h1 className="auth-title">Créer un compte</h1>
            <p className="auth-subtitle">Rejoignez la communauté WelcomeHelper</p>

            {step === 1 && (
            <div className="register-role-section">
                <p className="register-role-label">Je suis...</p>
                <div className="register-role-card" onClick={() => handleRoleSelect('etranger')}>
                    <div className="register-role-icon">👤</div>
                    <div>
                        <p className="register-role-name">Nouvel arrivant</p>
                        <p className="register-role-desc">Je viens d'arriver en France et j'ai besoin d'aide</p>
                    </div>
                </div>
                <div className="register-role-card" onClick={() => handleRoleSelect('resident')}>
                    <div className="register-role-icon-green">🤝</div>
                    <div>
                        <p className="register-role-name">Helper (Étudiant résident)</p>
                        <p className="register-role-desc">Je veux aider les nouveaux arrivants</p>
                    </div>
                </div>
            </div>
            )}

            {step === 2 && (
            <>
                <div className="register-role-badge">Inscription en tant que{' '}
                    <strong>
                        {formData.role === 'etranger' ? 'Nouvel arrivant' : 'Helper'}
                    </strong>
                    <span className="register-change-role" onClick={() => setStep(1)}>
                        Changer
                    </span>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label className="auth-label">Nom complet</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">👤</span>
                            <input type="text" name="nom" placeholder="Ex: Dupont" value={formData.nom} onChange={handleChange} className="auth-input" required />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Prénom</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">👤</span>
                            <input type="text" name="prenom" placeholder="Ex: Marie" value={formData.prenom} onChange={handleChange} className="auth-input" required />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Email</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">✉</span>
                            <input type="email" name="email" placeholder="votre.email@exemple.com" value={formData.email} onChange={handleChange} className="auth-input" required />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Mot de passe</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">🔒</span>
                            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Minimum 8 caractères" value={formData.password} onChange={handleChange} className="auth-input" required />
                            <span className="auth-eye-icon"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '🙈' : '👁'}
                            </span>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Confirmer le mot de passe</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">🔒</span>
                            <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="auth-input" required />
                        </div>
                    </div>

                    <button type="submit" className={loading ? 'auth-btn-disabled' : 'auth-btn'} disabled={loading}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>

                <p className="auth-footer"> Vous avez déjà un compte ?{' '}
                    <Link to="/login" className="auth-footer-link">Se connecter</Link>
                </p>
            </>
            )}
        </div>
        </div>
    )
}

export default Register
