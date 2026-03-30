import { useState, useRef, useEffect } from 'react';
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
  const formRef = useRef<HTMLFormElement>(null);

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

  useEffect(() => {
    if (!expanded) return;
    function onMouseDown(e: MouseEvent) {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        handleCancel();
      }
    }
    // Defer so the click that opened the form doesn't immediately close it
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onMouseDown);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [expanded]);

  if (!expanded) {
    return (
      <button className="add-card-trigger" onClick={() => setExpanded(true)}>
        + Add a card
      </button>
    );
  }

  return (
    <form
      className="add-card-form"
      ref={formRef}
      onSubmit={handleSubmit}
    >
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
