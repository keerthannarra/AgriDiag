import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: '📸', title: 'Upload a Leaf', desc: 'Drag & drop or select a JPG/PNG photo of the affected plant leaf.' },
  { icon: '🧠', title: 'AI Analysis', desc: 'Our CNN model (via Hugging Face) analyzes your image in seconds.' },
  { icon: '🌿', title: 'Get Diagnosis', desc: 'Receive disease identification, confidence score, treatment & prevention info.' },
];

const PLANTS = [
  '🍅 Tomato', '🥔 Potato', '🍎 Apple', '🌽 Corn',
  '🍇 Grape', '🌶️ Bell Pepper', '🍓 Strawberry', '🍊 Orange',
  '🍑 Peach', '🎃 Squash', '🍒 Cherry', '🫐 Blueberry',
];

const STATS = [
  { value: '38+', label: 'Disease Classes' },
  { value: '14+', label: 'Supported Plants' },
  { value: '3', label: 'User Roles' },
  { value: '< 5s', label: 'Avg. Diagnosis Time' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-orb hero-orb-1" />
        <div className="hero-bg-orb hero-orb-2" />
        <div className="container">
          <div className="hero-content animate-fade-in">
            <span className="section-label">🌿 AI-Powered Agriculture</span>
            <h1>
              Diagnose Plant Diseases<br />
              <span className="text-gradient">Instantly with AI</span>
            </h1>
            <p className="hero-subtitle">
              Upload a leaf image and get instant disease identification, confidence scores,
              treatment recommendations, and prevention strategies — powered by CNN deep learning.
            </p>
            <div className="hero-cta">
              {isAuthenticated ? (
                <Link to="/diagnose" className="btn btn-primary btn-lg">
                  🌿 Diagnose Now
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-lg">
                    Sign In
                  </Link>
                </>
              )}
            </div>
            <p className="hero-note">⚠️ For informational purposes only. Always consult agricultural experts for critical decisions.</p>
          </div>

          {/* Floating leaf cards */}
          <div className="hero-floaters">
            <div className="floater-card animate-float" style={{ animationDelay: '0s' }}>
              <span>🍅</span>
              <div>
                <div className="floater-disease">Early Blight</div>
                <div className="floater-conf">94.7% confidence</div>
              </div>
            </div>
            <div className="floater-card animate-float" style={{ animationDelay: '1s' }}>
              <span>🥔</span>
              <div>
                <div className="floater-disease">Late Blight</div>
                <div className="floater-conf">88.3% confidence</div>
              </div>
            </div>
            <div className="floater-card animate-float" style={{ animationDelay: '2s' }}>
              <span>🍎</span>
              <div>
                <div className="floater-disease">Healthy ✅</div>
                <div className="floater-conf">97.1% confidence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value text-gradient">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="section container">
        <div className="section-header">
          <span className="section-label">Simple Workflow</span>
          <h2>How AgriDiag Works</h2>
          <p className="section-subtitle">Three steps from leaf to diagnosis — designed for non-technical farmers.</p>
        </div>
        <div className="steps-row">
          {FEATURES.map((f, i) => (
            <div key={i} className="step-card card card-hover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="step-icon">{f.icon}</div>
              <div className="step-num-badge">{i + 1}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Supported plants ─────────────────────────────────────────── */}
      <section className="section plants-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Plant Database</span>
            <h2>Supported Plants & Diseases</h2>
            <p className="section-subtitle">Trained on the PlantVillage dataset with 38+ disease classes across 14 plant species.</p>
          </div>
          <div className="plants-grid">
            {PLANTS.map(p => (
              <div key={p} className="plant-chip">{p}</div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/plants" className="btn btn-outline">Browse Full Plant Database →</Link>
          </div>
        </div>
      </section>

      {/* ── Feature list ─────────────────────────────────────────────── */}
      <section className="section container">
        <div className="section-header">
          <span className="section-label">Platform Features</span>
          <h2>Everything You Need</h2>
        </div>
        <div className="grid-3">
          {[
            { icon: '🔬', title: 'CNN Disease Detection', desc: 'Deep learning model trained on PlantVillage dataset with high accuracy.' },
            { icon: '📊', title: 'Confidence Scoring', desc: 'Know how certain the AI is — low-confidence results trigger expert consultation warnings.' },
            { icon: '📖', title: 'Treatment Info', desc: 'Detailed disease descriptions, symptoms, causes, and step-by-step treatment recommendations.' },
            { icon: '🗂️', title: 'Diagnosis History', desc: 'Track all your past diagnoses with search, filter, and delete capabilities.' },
            { icon: '🌱', title: 'Plant Database', desc: 'Interactive encyclopedia of plants and diseases with prevention strategies.' },
            { icon: '👥', title: 'Role-Based Access', desc: 'Farmer, Scientist, and Agriculturist roles with tailored features and insights.' },
            { icon: '💬', title: 'Live Chat', desc: 'Real-time AI-assisted support with escalation to agricultural experts.' },
            { icon: '🤗', title: 'Direct Model Access', desc: 'Power users can interact directly with the Hugging Face CNN model.' },
            { icon: '📝', title: 'Blog & Resources', desc: 'Educational articles on crop management, disease prevention, and sustainable agriculture.' },
          ].map(f => (
            <div key={f.title} className="card card-hover">
              <div style={{ fontSize: '2rem', marginBottom: 'var(--sp-3)' }}>{f.icon}</div>
              <h4 style={{ marginBottom: 'var(--sp-2)' }}>{f.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner card-glass">
            <div className="cta-orb" />
            <h2>Ready to Diagnose Your Plants?</h2>
            <p>Join farmers and agricultural professionals using AI to protect their crops.</p>
            {isAuthenticated ? (
              <Link to="/diagnose" className="btn btn-primary btn-lg">🌿 Start Diagnosis</Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            )}
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero-section {
          min-height: 92vh;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          padding: var(--sp-20) 0;
        }
        .hero-section .container {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--sp-16);
          align-items: center;
        }
        .hero-bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .hero-orb-1 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%);
          top: -100px; left: -100px;
        }
        .hero-orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%);
          bottom: -80px; right: -80px;
        }
        .hero-content { position: relative; z-index: 1; }
        .hero-content h1 { margin: var(--sp-4) 0 var(--sp-5); }
        .hero-subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          line-height: 1.75;
          max-width: 520px;
          margin-bottom: var(--sp-8);
        }
        .hero-cta { display: flex; gap: var(--sp-4); flex-wrap: wrap; margin-bottom: var(--sp-5); }
        .hero-note { color: var(--text-muted); font-size: 0.8rem; }

        /* Floaters */
        .hero-floaters {
          display: flex;
          flex-direction: column;
          gap: var(--sp-4);
          position: relative;
          z-index: 1;
        }
        .floater-card {
          display: flex;
          align-items: center;
          gap: var(--sp-3);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: var(--sp-4) var(--sp-5);
          backdrop-filter: blur(12px);
          font-size: 2rem;
        }
        .floater-disease { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
        .floater-conf { font-size: 0.78rem; color: var(--color-primary); font-weight: 600; }

        /* Stats bar */
        .stats-bar {
          padding: var(--sp-8) 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--sp-6);
          text-align: center;
        }
        .stat-item { display: flex; flex-direction: column; gap: var(--sp-1); }
        .stat-item .stat-value {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 900;
        }
        .stat-item .stat-label { color: var(--text-muted); font-size: 0.85rem; }

        /* Section */
        .section { padding: var(--sp-20) 0; }

        /* Steps */
        .steps-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--sp-6);
        }
        .step-card { text-align: center; position: relative; padding: var(--sp-8) var(--sp-6); }
        .step-icon { font-size: 3rem; margin-bottom: var(--sp-4); display: block; }
        .step-num-badge {
          position: absolute;
          top: var(--sp-4);
          right: var(--sp-4);
          width: 28px; height: 28px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 800;
          color: white;
        }
        .step-card h3 { margin-bottom: var(--sp-3); }
        .step-card p { color: var(--text-muted); font-size: 0.9rem; line-height: 1.7; }

        /* Plants */
        .plants-section { background: var(--bg-secondary); padding: var(--sp-20) 0; }
        .plants-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--sp-3);
          justify-content: center;
          margin-bottom: var(--sp-8);
        }
        .plant-chip {
          padding: var(--sp-2) var(--sp-5);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--r-full);
          font-size: 0.92rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all var(--t-fast);
        }
        .plant-chip:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          transform: translateY(-2px);
        }

        /* CTA banner */
        .cta-banner { padding: var(--sp-20) 0; }
        .cta-inner {
          text-align: center;
          padding: var(--sp-16) var(--sp-8);
          position: relative;
          overflow: hidden;
        }
        .cta-orb {
          position: absolute;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(34,197,94,0.15), transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .cta-inner h2 { margin-bottom: var(--sp-4); position: relative; }
        .cta-inner p { color: var(--text-muted); margin-bottom: var(--sp-8); position: relative; }

        @media (max-width: 900px) {
          .hero-section .container { grid-template-columns: 1fr; }
          .hero-floaters { flex-direction: row; flex-wrap: wrap; }
          .floater-card { flex: 1; min-width: 200px; }
          .steps-row { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-floaters { display: none; }
        }
      `}</style>
    </div>
  );
}
