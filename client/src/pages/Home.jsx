import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

// Hook scroll reveal
const useReveal = () => {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return ref
}

// Compteur animé
const Counter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 1800
          const steps = 50
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return <span ref={ref}>{count.toLocaleString('fr-FR')}{suffix}</span>
}

const Home = () => {
  const [cookieVisible, setCookieVisible] = useState(false)
  const featuresRef = useReveal()
  const testimonialsRef = useReveal()
  const galleryRef = useReveal()

  useEffect(() => {
    const consent = localStorage.getItem('wh-cookie-consent')
    if (!consent) {
      const t = setTimeout(() => setCookieVisible(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const handleCookie = (accepted) => {
    localStorage.setItem('wh-cookie-consent', accepted ? 'accepted' : 'refused')
    setCookieVisible(false)
  }

  return (
    <div className="home-container">
      <Navbar />

      {/* ── HERO ── */}
      <section className="home-hero" aria-label="Présentation WelcomeHelper">
        <p className="home-tag">
          ❤ Rejoignez plus de 3 000 étudiants
        </p>

        <h1 className="home-title">
          Bienvenue en <span>France</span>
        </h1>

        <p className="home-subtitle">
          WelcomeHelper connecte les étudiants étrangers avec des résidents locaux
          prêts à les aider - logement, banque, administration et bien plus.
        </p>

        <div className="home-buttons">
          <Link to="/register" className="home-btn-primary" aria-label="Créer un compte gratuitement" >
            Commencer maintenant →
          </Link>
          <Link to="/login" className="home-btn-secondary" aria-label="Se connecter à votre compte" >
            Se connecter
          </Link>
        </div>

        {/* Image hero */}
        <div className="home-hero-img-wrapper">
          <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80" alt="Étudiants collaborant ensemble sur le campus" className="home-hero-img" loading="eager"/>
          <div className="home-hero-img-overlay" aria-hidden="true">
            <div className="home-hero-img-badge">
              Communauté active
              <span>+1 247 missions réalisées</span>
            </div>
            <div className="home-hero-img-badge">
              ⭐ 4.9/5
              <span>Note moyenne des helpers</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="home-stats" aria-label="Chiffres clés de WelcomeHelper">
        <div className="home-stat-item">
          <p className="home-stat-number">
            <Counter value={2847} />
          </p>
          <p className="home-stat-label">Étudiants aidés</p>
        </div>
        <div className="home-stat-item">
          <p className="home-stat-number">
            <Counter value={156} />
          </p>
          <p className="home-stat-label">Helpers actifs</p>
        </div>
        <div className="home-stat-item">
          <p className="home-stat-number">
            <Counter value={94} suffix="%" />
          </p>
          <p className="home-stat-label">Satisfaction</p>
        </div>
        <div className="home-stat-item">
          <p className="home-stat-number">
            <Counter value={1247} />
          </p>
          <p className="home-stat-label">Missions réalisées</p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="home-features reveal" ref={featuresRef} aria-label="Fonctionnalités de WelcomeHelper">
        <h2 className="home-features-title">
          Pourquoi choisir WelcomeHelper ?
        </h2>
        <p className="home-features-subtitle">
          Une plateforme complète conçue pour faciliter votre arrivée en France
        </p>
        <div className="home-features-grid">
          {[
            {
              icon: '👥',
              title: 'Communauté solidaire',
              desc: 'Connectez-vous avec des étudiants qui comprennent votre situation et vos défis du quotidien.',
            },
            {
              icon: '✅',
              title: 'Accompagnement personnalisé',
              desc: "Une checklist adaptée à votre parcours d'installation - logement, banque, titre de séjour.",
            },
            {
              icon: '💬',
              title: 'Messagerie intégrée',
              desc: 'Échangez directement avec votre helper via notre messagerie sécurisée, liée à chaque mission.',
            },
            {
              icon: '🏆',
              title: 'Système de récompenses',
              desc: 'Les helpers accumulent des points et les échangent contre des avantages exclusifs chez nos partenaires.',
            },
            {
              icon: '🛡',
              title: 'Profils certifiés',
              desc: 'Tous les helpers sont vérifiés par notre équipe. Votre sécurité est notre priorité.',
            },
            {
              icon: '🌍',
              title: 'Multi-langues',
              desc: "Interface disponible en français et en anglais. D'autres langues arrivent bientôt.",
            },
          ].map((f, i) => (
            <div key={i} className="home-feature-card">
              <div className="home-feature-icon" aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="home-feature-title">{f.title}</h3>
              <p className="home-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GALERIE IMAGES ── */}
      <section className="home-gallery reveal" ref={galleryRef} aria-label="Photos de la communauté WelcomeHelper">
        <h2 className="home-gallery-title">
          Ils vivent l'expérience WelcomeHelper
        </h2>
        <p className="home-gallery-subtitle">
          Des milliers d'étudiants ont déjà transformé leur installation en France
        </p>
        <div className="home-gallery-grid">
          <div className="home-gallery-item">
            <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80" alt="Groupe d'étudiants internationaux se retrouvant à Paris" className="home-gallery-img" loading="lazy"/>
            <div className="home-gallery-overlay" aria-hidden="true">
              <span className="home-gallery-caption">Paris, France</span>
            </div>
          </div>
          <div className="home-gallery-item">
            <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80" alt="Étudiante étrangère arrivant sur un campus universitaire français" className="home-gallery-img" loading="lazy"/>
            <div className="home-gallery-overlay" aria-hidden="true">
              <span className="home-gallery-caption">Campus universitaire</span>
            </div>
          </div>
          <div className="home-gallery-item">
            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" alt="Deux étudiants travaillant ensemble sur un projet" className="home-gallery-img" loading="lazy"/>
            <div className="home-gallery-overlay" aria-hidden="true">
              <span className="home-gallery-caption">Entraide entre pairs</span>
            </div>
          </div>
          <div className="home-gallery-item">
            <img src="https://images.unsplash.com/photo-1502209524164-acea936639a2?w=800&q=80" alt="Tour Eiffel et monuments parisiens" className="home-gallery-img" loading="lazy"/>
            <div className="home-gallery-overlay" aria-hidden="true">
              <span className="home-gallery-caption">Découvrez Paris</span>
            </div>
          </div>
          <div className="home-gallery-item">
            <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=800&q=80" alt="Étudiante souriante avec son ordinateur" className="home-gallery-img" loading="lazy"/>
            <div className="home-gallery-overlay" aria-hidden="true">
              <span className="home-gallery-caption">Votre réussite, notre mission</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TÉMOIGNAGES ── */}
      <section className="home-testimonials reveal" ref={testimonialsRef} aria-label="Témoignages d'utilisateurs">
        <h2 className="home-testimonials-title">Ce qu'ils en pensent</h2>
        <div className="home-testimonials-grid">
          {[
            {
              name: 'Lina Martinez',
              country: 'Étudiante - Espagne',
              text: "Grâce à WelcomeHelper, j'ai ouvert mon compte bancaire, trouvé mon logement et obtenu ma carte de transport en moins de 3 semaines. Un gain de temps incroyable !",
            },
            {
              name: 'Ahmed Khalil',
              country: 'Helper - Maroc',
              text: "Aider les nouveaux arrivants me rappelle mes propres débuts en France. En plus, les récompenses sont vraiment motivantes. Je recommande à tous les étudiants résidents.",
            },
          ].map((t, i) => (
            <div key={i} className="home-testimonial-card">
              <p className="home-testimonial-name">{t.name}</p>
              <p className="home-testimonial-country">{t.country}</p>
              <p className="home-testimonial-text">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="home-cta" aria-label="Appel à rejoindre WelcomeHelper">
        <h2 className="home-cta-title">
          Prêt à commencer votre aventure ?
        </h2>
        <p className="home-cta-subtitle">
          Rejoignez notre communauté d'étudiants solidaires dès aujourd'hui -
          c'est gratuit et sans engagement
        </p>
        <Link to="/register" className="home-cta-btn" aria-label="Créer un compte gratuitement">
          Créer mon compte gratuitement →
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="home-footer" role="contentinfo">
        <div className="home-footer-logo">
          <img
            src="/images/LG_SF.png"
            alt="Logo WelcomeHelper"
            className="home-footer-logo-img"
          />
          <span>© 2026 WelcomeHelper. Tous droits réservés.</span>
        </div>
        <nav className="home-footer-links" aria-label="Liens légaux">
          <Link to="/mentions-legales" className="home-footer-link">
            Mentions légales
          </Link>
          <Link to="/confidentialite" className="home-footer-link">
            Confidentialité
          </Link>
          <Link to="/cgu" className="home-footer-link">CGU</Link>
          <Link to="/contact" className="home-footer-link">Contact</Link>
        </nav>
      </footer>

      {/* ── COOKIE BANNER RGPD ── */}
      {cookieVisible && (
        <div role="dialog" aria-modal="true" aria-label="Gestion des cookies" aria-live="polite">
          <p className="cookie-text"> 🍪 Nous utilisons des cookies pour améliorer votre expérience et analyser notre trafic. En continuant, vous acceptez notre{' '}
            <Link to="/confidentialite">politique de confidentialité</Link>{' '}
            conformément au RGPD.
          </p>
          <div className="cookie-buttons">
            <button className="cookie-btn-refuse" onClick={() => handleCookie(false)} aria-label="Refuser les cookies non essentiels">
              Refuser
            </button>
            <button className="cookie-btn-accept" onClick={() => handleCookie(true)} aria-label="Accepter tous les cookies">
              Accepter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
