import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="/images/LG_SF.png" alt="Logo WelcomeHelper" className="navbar-logo-img"/>
                <span className="navbar-logo-text">WelcomeHelper</span>
            </div>

            <div className="navbar-links">
                {user ? (
                    <>
                        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                        <Link to="/missions" className="navbar-link">Missions</Link>
                        <Link to="/recompenses" className="navbar-link">Récompenses</Link>
                        <Link to="/messages" className="navbar-link">Messages</Link>
                        <Link to="/premium" className="navbar-link">Premium</Link>
                        <Link to="/profil" className="navbar-link-active">Profil</Link>
                        <button onClick={handleLogout} className="navbar-logout">
                        → Déconnexion
                        </button>
                    </>
                )
                : (
                    <>
                        <Link to="/login" className="navbar-link">Se connecter</Link>
                        <Link to="/register" className="navbar-btn-primary">Commencer</Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar
