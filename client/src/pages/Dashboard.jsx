import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
    const { user } = useAuth()

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0f1e' }}>
            <Navbar />
            <div style={{ padding: '40px', color: '#ffffff' }}>
                <h1>Bonjour, {user?.prenom} 👋</h1>
                <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                Dashboard en cours de construction...
                </p>
            </div>
        </div>
    )
}

export default Dashboard
