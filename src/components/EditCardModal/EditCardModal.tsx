import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateCard, deleteCard } from '../../store/boardsSlice';
import type { Card } from '../../types';
import '../../components/AddBoardModal/AddBoardModal.css';
import './EditCardModal.css';

interface Props {
  boardId: string;
  listId: string;
  card: Card;
  onClose: () => void;
}

export default function EditCardModal({ boardId, listId, card, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description ?? '');
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    dispatch(updateCard({
      boardId,
      listId,
      cardId: card.id,
      updates: { title: trimmedTitle, description: description.trim() || undefined },
    }));
    onClose();
  }

  function handleDelete() {
    dispatch(deleteCard({ boardId, listId, cardId: card.id }));
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal edit-card-modal" role="dialog" aria-modal="true" aria-labelledby="edit-card-title" onKeyDown={handleKeyDown}>
        <div className="modal-header">
          <h2 id="edit-card-title">Edit card</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="form-field">
            <label htmlFor="card-title-input">Title</label>
            <input
              id="card-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  descRef.current?.focus();
                }
              }}
            />
          </div>
          <div className="form-field">
            <label htmlFor="card-desc-input">Description</label>
            <textarea
              id="card-desc-input"
              className="card-desc-textarea"
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Add a description..."
            />
          </div>
        </div>
        <div className="modal-footer edit-card-footer">
          {confirmingDelete ? (
            <div className="delete-confirm-group">
              <button className="delete-confirm-btn delete-confirm-yes" onClick={handleDelete} title="Confirm delete">
                <Check size={14} strokeWidth={2.5} />
              </button>
              <button className="delete-confirm-btn delete-confirm-no" onClick={() => setConfirmingDelete(false)} title="Cancel delete">
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button className="btn-danger" onClick={() => setConfirmingDelete(true)}>Delete</button>
          )}
          <div className="edit-card-footer-right">
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" ref={saveRef} onClick={handleSave} disabled={!title.trim()}>Save</button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
