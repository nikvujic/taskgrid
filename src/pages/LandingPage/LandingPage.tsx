import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing-topbar">
        <ThemeToggle />
      </div>
      <div className="landing-inner">
        <div className="landing-content">
          <div className="landing-badge">taskgrid</div>
          <h1 className="landing-title">Organize your work,<br />your way.</h1>
          <p className="landing-desc">
            Simple kanban boards for teams and individuals. No clutter, no noise — just boards, lists, and cards.
          </p>
          <button className="landing-cta" onClick={() => navigate('/')}>
            Go to App
          </button>
        </div>
      </div>
    </div>
  );
}
