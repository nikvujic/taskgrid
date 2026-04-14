import { createPortal } from 'react-dom';
import '../../components/AddBoardModal/AddBoardModal.css';
import './ConfirmModal.css';

interface Props {
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  variant?: 'danger' | 'primary' | 'dismiss';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmModal(props: Props) {
  const { title, message, confirmLabel = 'Delete', variant = 'danger', loading = false, onConfirm, onClose } = props;
  const callerManagesLifecycle = props.loading !== undefined;

  function handleBackdropClick(e: React.MouseEvent) {
    if (loading) return;
    if (e.target === e.currentTarget) onClose();
  }

  function handleConfirm() {
    if (loading) return;
    onConfirm();
    if (!callerManagesLifecycle) onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="modal-header">
          <h2 id="confirm-title">{title}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>✕</button>
        </div>
        <div className="modal-body">
          <div className="confirm-message">{message}</div>
        </div>
        <div className="modal-footer">
          {variant === 'dismiss' ? (
            <button className="btn-ghost" onClick={onClose}>{confirmLabel}</button>
          ) : (
            <>
              <button className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
              <button
                className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span className="confirm-loading">
                    <span className="spinner confirm-spinner" />
                    {confirmLabel}
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
