import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/authSlice';
import { exportData } from '../../store/boardsSlice';
import './SignOutModal.css';

interface Props {
  onClose: () => void;
}

export default function SignOutModal({ onClose }: Props) {
  const dispatch = useAppDispatch();

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleExport() {
    dispatch(exportData());
  }

  function handleSignOut() {
    dispatch(logout());
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="signout-title">
        <div className="modal-header">
          <h2 id="signout-title">Sign out</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <p className="signout-warning">
            Your boards are stored locally and will be permanently deleted when you sign out.
          </p>
          <button className="btn-export-boards" onClick={handleExport}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 1v7.5M4 6l3 3 3-3M2 10v1.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export boards before signing out
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
