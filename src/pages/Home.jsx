import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const STEPS = [
  {
    number: '01',
    icon: '⌕',
    title: 'Take a clear photo',
    description: 'Choose a photo of the affected leaf in natural light. No special equipment needed.',
  },
  {
    number: '02',
    icon: '✳',
    title: 'Let AI take a look',
    description: 'Our image model checks for visual signs linked to common plant diseases.',
  },
  {
    number: '03',
    icon: '↗',
    title: 'Find your next step',
    description: 'Get a possible diagnosis and practical guidance to help plan what to do next.',
  },
];

const PLANTS = [
  '🍅 Tomato',
  '🥔 Potato',
  '🍎 Apple',
  '🌽 Corn',
  '🍇 Grape',
  '🫑 Pepper',
  '🍓 Strawberry',
  '🍊 Orange',
];

const STATS = [
  { value: '38+', label: 'disease classes' },
  { value: '14+', label: 'plant varieties' },
  { value: '3', label: 'grower roles' },
  { value: 'One', label: 'simple place to start' },
];

const SERVICES = [
  {
    number: '01',
    title: 'Spot the signs sooner',
    description: 'Get a quick AI-assisted look at visible leaf symptoms, wherever you are in the growing season.',
    icon: '◌',
  },
  {
    number: '02',
    title: 'Understand your options',
    description: 'Explore symptom descriptions, prevention ideas, and treatment information in one place.',
    icon: '✳',
  },
  {
    number: '03',
    title: 'Keep your field notes',
    description: 'Save past checks and return to your diagnosis history as you care for your plants.',
    icon: '⌑',
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  const diagnosisLink = isAuthenticated ? '/diagnose' : '/register';
  const diagnosisLabel = isAuthenticated ? 'Check a leaf' : 'Start a free check';

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-inner container">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              <span className="eyebrow-dot" />
              A little more clarity for every growing season
            </span>
            <h1>
              Better care
              <br />
              starts with
              <br />
              <em>one leaf.</em>
            </h1>
            <p className="home-hero-description">
              Get an AI-assisted look at plant health, find useful care guidance, and feel more
              prepared for what comes next.
            </p>
            <div className="home-hero-actions">
              <Link to={diagnosisLink} className="home-button home-button-primary">
                {diagnosisLabel}
                <span aria-hidden="true">↗</span>
              </Link>
              <Link to="/plants" className="home-button home-button-secondary">
                Explore plant library
              </Link>
            </div>
            <div className="home-trust-note">
              <span className="trust-leaf" aria-hidden="true">✿</span>
              <span>Thoughtful tools for farmers and curious growers</span>
            </div>
          </div>

          <div className="home-hero-visual">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=85"
                alt="Sunlight falling across lush green leaves"
                fetchpriority="high"
              />
              <div className="image-caption">
                <span className="caption-mark" aria-hidden="true">✿</span>
                <span>Small observations can make a difference</span>
              </div>
            </div>

            <div className="hero-result-card">
              <span className="result-card-kicker">
                <span className="result-status-dot" />
                SAMPLE AI INSIGHT
              </span>
              <div className="result-card-main">
                <div className="result-plant-icon" aria-hidden="true">🍅</div>
                <div>
                  <strong>Tomato leaf</strong>
                  <span>Early blight · possible match</span>
                </div>
              </div>
              <div className="result-card-footer">
                <span>Example result</span>
                <span>Learn what to check <b aria-hidden="true">↗</b></span>
              </div>
            </div>

            <div className="hero-floating-note">
              <span className="floating-note-icon" aria-hidden="true">✦</span>
              <span><strong>Made for growers</strong><small>Clear, practical guidance</small></span>
            </div>
            <span className="hero-sunburst" aria-hidden="true">✳</span>
          </div>
        </div>
      </section>

      <section className="home-stats" aria-label="AgriDiag at a glance">
        <div className="container home-stats-grid">
          {STATS.map((stat) => (
            <div className="home-stat" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="home-how section">
        <div className="container">
          <div className="home-section-heading">
            <span className="home-section-kicker">A simple place to begin</span>
            <h2>From leaf to a clearer next step.</h2>
            <p>Plant health can feel complicated. We make the first step a little simpler.</p>
          </div>
          <div className="home-steps-grid">
            {STEPS.map((step) => (
              <article className="home-step-card" key={step.number}>
                <div className="step-card-top">
                  <span className="step-icon" aria-hidden="true">{step.icon}</span>
                  <span className="step-number">{step.number}</span>
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-plants">
        <div className="container home-plants-layout">
          <div>
            <span className="home-section-kicker">A growing library</span>
            <h2>For the plants<br />you care about.</h2>
            <p>Browse plant profiles and common disease information to learn what to look for.</p>
            <Link to="/plants" className="home-text-link">
              Visit the plant library <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="home-plant-list">
            {PLANTS.map((plant) => (
              <span className="home-plant-chip" key={plant}>{plant}</span>
            ))}
            <Link to="/plants" className="home-plant-more">and more <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <section className="home-services section">
        <div className="container">
          <div className="home-section-heading">
            <span className="home-section-kicker">Your growing companion</span>
            <h2>Useful knowledge, all in one place.</h2>
            <p>From a first photo to your next field note, AgriDiag brings the essentials together.</p>
          </div>
          <div className="home-services-grid">
            {SERVICES.map((service) => (
              <article className="home-service-card" key={service.number}>
                <div className="service-card-meta">
                  <span>{service.number}</span>
                  <span className="service-icon" aria-hidden="true">{service.icon}</span>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-final-cta">
        <div className="container">
          <div className="home-cta-panel">
            <div className="cta-leaf-shape" aria-hidden="true">✿</div>
            <span className="home-section-kicker">Take the first step</span>
            <h2>Let’s help your plants thrive.</h2>
            <p>Start with a photo and explore a little more about what your plants may need.</p>
            <Link to={diagnosisLink} className="home-button home-button-light">
              {diagnosisLabel}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
