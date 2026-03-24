import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { login, loginAsGuest } from '../../store/authSlice';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector((state) => state.auth.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode !== null) navigate('/', { replace: true });
  }, [mode, navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/');
    } catch {
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuest() {
    await dispatch(loginAsGuest()).unwrap();
    navigate('/');
  }

  return (
    <div className="login-page">
      <div className="login-topbar">
        <ThemeToggle />
      </div>
      <div className="login-box-outer">
        <div className="login-box">
          <div className="login-header">
            <span className="login-logo">taskgrid</span>
            <h1 className="login-title">Sign in</h1>
          </div>

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
            {error && <p className="login-error">{error}</p>}
            <button className="btn-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="guest-section">
            <button className="btn-secondary" type="button" onClick={handleGuest}>
              Continue as Guest
            </button>
            <p className="guest-note">
              Guest data is stored locally in your browser. You can export and import it at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
