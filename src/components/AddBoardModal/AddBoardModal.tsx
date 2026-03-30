import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addBoard } from '../../store/boardsSlice';
import ColorPicker from '../ColorPicker/ColorPicker';
import './AddBoardModal.css';

const DEFAULT_COLOR = '#2563eb';

interface Props {
  onClose: () => void;
}

export default function AddBoardModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(addBoard({ name: name.trim(), description: description.trim(), color }));
    onClose();
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
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
                maxLength={50}
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
                maxLength={120}
              />
            </div>

            <div className="form-field">
              <label>Color</label>
              <ColorPicker value={color} onChange={setColor} />
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
    </div>,
    document.body,
  );
}
