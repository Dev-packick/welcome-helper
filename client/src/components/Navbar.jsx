import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
    const { user, token, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    const currentUser = user || storedUser

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const isActive = (path) => location.pathname === path

    return (
        <nav className="navbar" role="navigation" aria-label="Navigation principale">

        {/* ── LOGO ── */}
        <Link to="/" className="navbar-logo" aria-label="Accueil WelcomeHelper">
            <img
            src="/images/LG_SF.png"
            alt="Logo WelcomeHelper"
            className="navbar-logo-img"
            />
            <span className="navbar-logo-text">WelcomeHelper</span>
        </Link>

        {/* ── LIENS ── */}
        <div className="navbar-links">
            {!token ? (
            // Non connecté
            <>
                <Link
                to="/missions"
                className={isActive('/missions') ? 'navbar-link-active' : 'navbar-link'}
                >
                Missions
                </Link>
                <Link
                to="/login"
                className={isActive('/login') ? 'navbar-link-active' : 'navbar-link'}
                >
                Connexion
                </Link>
                <Link
                to="/register"
                className="navbar-btn-primary"
                >
                S'inscrire
                </Link>
            </>
            ) : currentUser?.role === 'admin' ? (
            // Admin
            <>
                <Link
                to="/admin"
                className={isActive('/admin') ? 'navbar-link-active' : 'navbar-link'}
                >
                Dashboard
                </Link>
                <Link
                to="/missions"
                className={isActive('/missions') ? 'navbar-link-active' : 'navbar-link'}
                >
                Missions
                </Link>
                <button className="navbar-logout" onClick={handleLogout}>
                → Déconnexion
                </button>
            </>
            ) : currentUser?.role === 'etranger' ? (
            // Étranger
            <>
                <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'navbar-link-active' : 'navbar-link'}
                >
                Dashboard
                </Link>
                <Link
                to="/missions"
                className={isActive('/missions') ? 'navbar-link-active' : 'navbar-link'}
                >
                Missions
                </Link>
                <Link
                to="/messages"
                className={isActive('/messages') ? 'navbar-link-active' : 'navbar-link'}
                >
                Messages
                </Link>
                <Link
                to="/premium"
                className={isActive('/premium') ? 'navbar-link-active' : 'navbar-link'}
                >
                Premium
                </Link>
                <Link
                to="/profil"
                className={isActive('/profil') ? 'navbar-btn-primary' : 'navbar-btn-primary'}
                >
                Profil
                </Link>
                <button className="navbar-logout" onClick={handleLogout}>
                → Déconnexion
                </button>
            </>
            ) : (
            // Résident
            <>
                <Link
                to="/dashboard"
                className={isActive('/dashboard') ? 'navbar-link-active' : 'navbar-link'}
                >
                Dashboard
                </Link>
                <Link
                to="/missions"
                className={isActive('/missions') ? 'navbar-link-active' : 'navbar-link'}
                >
                Missions
                </Link>
                <Link
                to="/recompenses"
                className={isActive('/recompenses') ? 'navbar-link-active' : 'navbar-link'}
                >
                Récompenses
                </Link>
                <Link
                to="/messages"
                className={isActive('/messages') ? 'navbar-link-active' : 'navbar-link'}
                >
                Messages
                </Link>
                <Link
                to="/profil"
                className={isActive('/profil') ? 'navbar-btn-primary' : 'navbar-btn-primary'}
                >
                Profil
                </Link>
                <button className="navbar-logout" onClick={handleLogout}>
                → Déconnexion
                </button>
            </>
            )}
        </div>
        </nav>
    )
}

export default Navbar
