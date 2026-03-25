import { useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { addCard } from '../../store/boardsSlice';
import './AddCardForm.css';

interface Props {
  boardId: string;
  listId: string;
}

export default function AddCardForm({ boardId, listId }: Props) {
  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');

  function submit() {
    if (!title.trim()) return;
    dispatch(addCard({ boardId, listId, title: title.trim() }));
    setTitle('');
    setExpanded(false);
  }

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    submit();
  }

  function handleCancel() {
    setTitle('');
    setExpanded(false);
  }

  if (!expanded) {
    return (
      <button className="add-card-trigger" onClick={() => setExpanded(true)}>
        + Add a card
      </button>
    );
  }

  return (
    <form className="add-card-form" onSubmit={handleSubmit}>
      <textarea
        className="add-card-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title"
        maxLength={200}
        autoFocus
        rows={2}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
          if (e.key === 'Escape') handleCancel();
        }}
      />
      <div className="add-card-actions">
        <button type="submit" className="btn-add" disabled={!title.trim()}>
          Add
        </button>
        <button type="button" className="btn-cancel" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
