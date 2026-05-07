import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div className="home-container">
      <Navbar />

      {/* HERO */}
      <section className="home-hero">
        <p className="home-tag">❤ Rejoignez plus de 3000 étudiants</p>
        <h1 className="home-title">Bienvenue en France</h1>
        <p className="home-subtitle">
          WelcomeHelper est une application qui facilite l'installation des étudiants étrangers
          et les connecte avec des étudiants résidents
          prêts à les aider - logement, banque, administration et bien plus.
        </p>
        <div className="home-buttons">
          <Link to="/register" className="home-btn-primary">
            Commencer maintenant →
          </Link>
          <Link to="/login" className="home-btn-secondary">
            Se connecter
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="home-stats">
        <div style={{textAlign:'center'}}>
          <p className="home-stat-number">2 847</p>
          <p className="home-stat-label">Étudiants aidés</p>
        </div>
        <div style={{textAlign:'center'}}>
          <p className="home-stat-number">156</p>
          <p className="home-stat-label">Helpers actifs</p>
        </div>
        <div style={{textAlign:'center'}}>
          <p className="home-stat-number">94%</p>
          <p className="home-stat-label">Satisfaction</p>
        </div>
        <div style={{textAlign:'center'}}>
          <p className="home-stat-number">1 247</p>
          <p className="home-stat-label">Missions réalisées</p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="home-features">
        <h2 className="home-features-title">Pourquoi choisir WelcomeHelper ?</h2>
        <p className="home-features-subtitle">
          Une plateforme complète conçue pour faciliter votre arrivée en France
        </p>
        <div className="home-features-grid">
          {[
            { icon: '👥', title: 'Communauté solidaire',
              desc: "Connectez-vous avec des étudiants qui comprennent votre situation" },
            { icon: '✅', title: 'Accompagnement personnalisé',
              desc: "Checklist adaptée à votre parcours d'installation" },
            { icon: '💬', title: 'Support direct',
              desc: "Messagerie intégrée pour échanger facilement" },
            { icon: '🏆', title: 'Système de récompenses',
              desc: "Gagnez des points et débloquez des avantages" },
            { icon: '🛡', title: 'Sécurisé et vérifié',
              desc: "Helpers certifiés et données protégées" },
            { icon: '🌍', title: 'Multi-langues',
              desc: "Interface disponible en français et anglais" },
          ].map((f, i) => (
            <div key={i} className="home-feature-card">
              <div className="home-feature-icon">{f.icon}</div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section className="home-testimonials">
        <h2 className="home-testimonials-title">Ce qu'ils en pensent</h2>
        <div className="home-testimonials-grid">
          {[
            { name: 'Lina Martinez', country: 'Espagne',
              text: "Grâce à WelcomeHelper, j'ai pu m'installer en France en seulement 2 semaines. Les helpers sont incroyables !" },
            { name: 'Ahmed Khalil', country: 'Maroc',
              text: "Aider les nouveaux arrivants me permet de partager mon expérience et de gagner des récompenses. C'est gagnant-gagnant !" },
          ].map((t, i) => (
            <div key={i} className="home-testimonial-card">
              <p className="home-testimonial-name">{t.name}</p>
              <p className="home-testimonial-country">{t.country}</p>
              <p className="home-testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="home-cta">
        <h2 className="home-cta-title">Prêt à commencer votre aventure ?</h2>
        <p className="home-cta-subtitle">
          Rejoignez notre communauté d'étudiants solidaires dès aujourd'hui
        </p>
        <Link to="/register" className="home-cta-btn">
          Créer mon compte gratuitement →
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="home-footer-logo">
          <div className="home-footer-icon">WH</div>
          © 2026 WelcomeHelper.
        </div>
        <div className="home-footer-links">
          <Link to="/mentions-legales" className="home-footer-link">Mentions légales</Link>
          <Link to="/confidentialite" className="home-footer-link">Confidentialité</Link>
          <Link to="/cgu" className="home-footer-link">CGU</Link>
        </div>
      </footer>
      
    </div>
  )
}

export default Home
