import { useNavigate } from 'react-router-dom';
import { GripVertical, HardDrive, ArrowDownUp } from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="landing-nav">
        <span className="landing-nav-logo">simple kanban</span>
        <div className="landing-nav-actions">
          <button className="landing-nav-signin" onClick={() => navigate('/login')}>
            Sign in
          </button>
          <button className="landing-nav-cta" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-hero-content">
          <span className="landing-badge">Free & Open Source</span>
          <h1 className="landing-title">
            Organize your work,<br />your way.
          </h1>
          <p className="landing-desc">
            Kanban boards for individuals. No clutter, no noise - just
            boards, lists, and cards.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-cta" onClick={() => navigate('/login')}>
              Get Started
            </button>
          </div>
        </div>

        <div className="landing-hero-visual">
          <div className="landing-mockup">
            <div className="mockup-chrome">
              <span />
              <span />
              <span />
            </div>
            <div className="mockup-app">
              <div className="mockup-sidebar">
                <div className="mockup-sb-item mockup-sb-item--active" />
                <div className="mockup-sb-item" />
                <div className="mockup-sb-item" />
              </div>
              <div className="mockup-board">
                <div className="mockup-list">
                  <div className="mockup-list-head" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                </div>
                <div className="mockup-list">
                  <div className="mockup-list-head" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                </div>
                <div className="mockup-list">
                  <div className="mockup-list-head" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                  <div className="mockup-card" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-feature">
          <div className="feature-icon">
            <GripVertical size={20} />
          </div>
          <h3 className="feature-title">Drag & Drop</h3>
          <p className="feature-desc">
            Move cards between lists and reorder boards with smooth drag and
            drop.
          </p>
        </div>
        <div className="landing-feature">
          <div className="feature-icon">
            <HardDrive size={20} />
          </div>
          <h3 className="feature-title">Works Offline</h3>
          <p className="feature-desc">
            Your data stays in your browser. No account required to get started.
          </p>
        </div>
        <div className="landing-feature">
          <div className="feature-icon">
            <ArrowDownUp size={20} />
          </div>
          <h3 className="feature-title">Import & Export</h3>
          <p className="feature-desc">
            Back up your boards as JSON. Move data between devices effortlessly.
          </p>
        </div>
      </section>

      <footer className="landing-footer">
        <span>Nikola Vujić</span>
      </footer>
    </div>
  );
}
