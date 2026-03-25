import { useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateBoard } from '../../store/boardsSlice';
import type { Board } from '../../types';
import '../../components/AddBoardModal/AddBoardModal.css';

const COLORS = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#dc2626',
  '#d97706',
  '#16a34a',
  '#0891b2',
  '#6b7280',
];

interface Props {
  board: Board;
  onClose: () => void;
}

export default function EditBoardModal({ board, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [color, setColor] = useState(board.color);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(updateBoard({ id: board.id, updates: { name: name.trim(), description: description.trim(), color } }));
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-board-title">
        <div className="modal-header">
          <h2 id="edit-board-title">Edit Board</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-field">
              <label htmlFor="edit-board-name">Name</label>
              <input
                id="edit-board-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                autoFocus
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-board-desc">Description</label>
              <input
                id="edit-board-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={120}
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
