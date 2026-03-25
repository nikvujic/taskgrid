import { useState, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateList } from '../../store/boardsSlice';
import type { Board, List, Card } from '../../types';
import CardItem from '../CardItem/CardItem';
import AddCardForm from '../AddCardForm/AddCardForm';
import EditCardModal from '../EditCardModal/EditCardModal';
import './ListColumn.css';

interface Props {
  board: Board;
  list: List;
}

export default function ListColumn({ board, list }: Props) {
  const dispatch = useAppDispatch();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: list.id });
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(list.name);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setNameValue(list.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  function commitEdit() {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== list.name) {
      dispatch(updateList({ boardId: board.id, listId: list.id, name: trimmed }));
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit();
    if (e.key === 'Escape') setEditing(false);
  }

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : undefined,
  };

  return (
    <div className="list-column" ref={setNodeRef} style={style}>
      <div className="list-header" data-drag-handle {...attributes} {...listeners}>
        {editing ? (
          <input
            ref={inputRef}
            className="list-name-input"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            maxLength={50}
            autoFocus
          />
        ) : (
          <span className="list-name">{list.name}</span>
        )}
        <span className="list-count">{list.cards.length}</span>
      </div>
      <div className="list-cards">
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={() => setEditingCard(card)} />
        ))}
      </div>
      <div className="list-footer">
        <AddCardForm boardId={board.id} listId={list.id} />
        <button className="list-edit-btn" onClick={startEditing} title="Rename list">
          <Pencil size={12} strokeWidth={1.8} />
        </button>
      </div>
      {editingCard && (
        <EditCardModal
          boardId={board.id}
          listId={list.id}
          card={editingCard}
          onClose={() => setEditingCard(null)}
        />
      )}
    </div>
  );
}
