import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profil from './pages/Profil'
import EditProfil from './pages/EditProfil'
import Missions from './pages/Missions'
import MissionDetail from './pages/MissionDetail'
import PublierMission from './pages/PublierMission'
import Messages from './pages/Messages'
import Recompenses from './pages/Recompenses'
import Premium from './pages/Premium'
import AbonnementSucces from './pages/AbonnementSucces'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/profil/edit" element={<EditProfil />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:id" element={<MissionDetail />} />
        <Route path="/missions/publier" element={<PublierMission />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/recompenses" element={<Recompenses />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/abonnement/succes" element={<AbonnementSucces />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
