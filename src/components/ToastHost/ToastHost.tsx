import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toastRemoved } from '../../store/toastsSlice';
import './ToastHost.css';

const AUTO_DISMISS_MS = 4000;

export default function ToastHost() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector((s) => s.toasts.items);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(toastRemoved(t.id)), AUTO_DISMISS_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.kind}`} role="status">
          <span className="toast-message">{t.message}</span>
          <button
            className="toast-close"
            onClick={() => dispatch(toastRemoved(t.id))}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
