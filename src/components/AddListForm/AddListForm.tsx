import { useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addList } from '../../store/boardsSlice';
import './AddListForm.css';

interface Props {
  boardId: string;
}

export default function AddListForm({ boardId }: Props) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('');

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!name.trim()) return;
    dispatch(addList({ boardId, name: name.trim() }));
    setName('');
    setExpanded(false);
  }

  function handleCancel() {
    setName('');
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <div className="add-list-trigger-wrap">
        <button className="add-list-trigger" onClick={() => setExpanded(true)}>
          + Add a list
        </button>
      </div>
    );
  }

  return (
    <div className="add-list-wrap">
      <form className="add-list-form" onSubmit={handleSubmit}>
        <input
          className="add-list-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name"
          maxLength={50}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCancel();
          }}
        />
        <div className="add-list-actions">
          <button type="submit" className="btn-add" disabled={!name.trim()}>
            Add List
          </button>
          <button type="button" className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
