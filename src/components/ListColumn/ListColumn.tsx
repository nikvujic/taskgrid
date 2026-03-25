import { useState, useRef } from 'react';
import { Pencil } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateList } from '../../store/boardsSlice';
import type { Board, List } from '../../types';
import CardItem from '../CardItem/CardItem';
import AddCardForm from '../AddCardForm/AddCardForm';
import './ListColumn.css';

interface Props {
  board: Board;
  list: List;
}

export default function ListColumn({ board, list }: Props) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(list.name);
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

  return (
    <div className="list-column">
      <div className="list-header">
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
          <CardItem key={card.id} card={card} />
        ))}
      </div>
      <div className="list-footer">
        <AddCardForm boardId={board.id} listId={list.id} />
        <button className="list-edit-btn" onClick={startEditing} title="Rename list">
          <Pencil size={12} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
