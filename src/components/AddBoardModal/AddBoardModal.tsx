import { useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addBoard } from '../../store/boardsSlice';
import './AddBoardModal.css';

const COLORS = [
  '#aa3bff',
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#6366f1',
  '#14b8a6',
];

interface Props {
  onClose: () => void;
}

export default function AddBoardModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(addBoard({ name: name.trim(), description: description.trim(), color }));
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h2 id="modal-title">New Board</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="board-name">Name</label>
              <input
                id="board-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Product Roadmap"
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="board-desc">Description</label>
              <input
                id="board-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional short description"
              />
            </div>

            <div className="form-field">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`color-swatch${color === c ? ' selected' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                    aria-label={`Select color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!name.trim()}>
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
