import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loginAsGuest } from '../../store/authSlice';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector((state) => state.auth.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== null) navigate('/', { replace: true });
  }, [mode, navigate]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    // TODO: wire up real login
    setTimeout(() => setIsSubmitting(false), 1500);
  }

  async function handleGuest() {
    await dispatch(loginAsGuest()).unwrap();
    navigate('/');
  }

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="login-brand-content">
          <span className="login-brand-logo">simple kanban</span>
          <h2 className="login-brand-title">
            Organize your work,
            <br />
            your way.
          </h2>
          <p className="login-brand-desc">
            Boards, lists, and cards - nothing more, nothing less.
          </p>
        </div>
        <div className="login-brand-decor">
          <div className="decor-card decor-card--1" />
          <div className="decor-card decor-card--2" />
          <div className="decor-card decor-card--3" />
        </div>
      </div>

      <div className="login-panel">
        <div className="login-panel-inner">
          <div className="login-header">
            <h1 className="login-title">Get started</h1>
            <p className="login-subtitle">
              No account needed. Your data stays in your browser.
            </p>
          </div>

          <div className="guest-section">
            <button className="btn-primary" type="button" onClick={handleGuest}>
              Continue as Guest
            </button>
            <p className="guest-note">
              You can export and import your data at any time.
            </p>
          </div>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="login-form-header">Sign in</div>
          <form className="login-form" onSubmit={handleLogin} noValidate>
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button className="btn-login" type="submit" disabled={!email || !password || isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="login-invite-note">Registration is invite-only.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
