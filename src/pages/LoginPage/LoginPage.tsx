import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { login, loginAsGuest } from '../../store/authSlice';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = useAppSelector((state) => state.auth.mode);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (mode !== null && !isExiting) navigate('/', { replace: true });
  }, [mode, navigate, isExiting]);

  if (mode !== null && !isExiting) return null;

  function validate(fields = { email, password }) {
    const errors: { email?: string; password?: string } = {};
    if (!fields.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!fields.password) {
      errors.password = 'Password is required.';
    } else if (fields.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  }

  function handleBlur(field: 'email' | 'password') {
    setTouched((t) => ({ ...t, [field]: true }));
    const errors = validate();
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
  }

  function handleFieldChange(field: 'email' | 'password', value: string) {
    if (field === 'email') setEmail(value);
    else setPassword(value);
    if (touched[field]) {
      const errors = validate({ email: field === 'email' ? value : email, password: field === 'password' ? value : password });
      setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
    }
    if (loginError) setLoginError('');
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    setIsSubmitting(true);
    setLoginError('');
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch {
      setLoginError('Invalid email or password.');
      setIsSubmitting(false);
    }
  }

  function handleGuest() {
    setIsExiting(true);
    dispatch(loginAsGuest());
  }

  function handleExitEnd(e: React.AnimationEvent) {
    if (e.animationName === 'panelSwipe') {
      setTimeout(() => navigate('/'), 500);
    }
  }

  return (
    <div className={`login-page${isExiting ? ' login-page--exiting' : ''}`}>
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

      {isExiting && <div className="exit-panel" onAnimationEnd={handleExitEnd} />}

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
            <div className={`form-field${fieldErrors.email ? ' form-field--error' : ''}`}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <div className={`form-field${fieldErrors.password ? ' form-field--error' : ''}`}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="btn-login" type="submit" disabled={!email.trim() || !password || !!fieldErrors.email || !!fieldErrors.password || isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
            <p className="login-invite-note">Registration is invite-only.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
