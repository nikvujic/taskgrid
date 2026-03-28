import { useState, useRef, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { updateList, moveCard } from '../../store/boardsSlice';
import type { Board, List, Card } from '../../types';
import CardItem from '../CardItem/CardItem';
import AddCardForm from '../AddCardForm/AddCardForm';
import EditCardModal from '../EditCardModal/EditCardModal';
import './ListColumn.css';

interface Props {
  board: Board;
  list: List;
  index: number;
}

function getDropIndex(container: HTMLElement, clientY: number): number {
  const cards = container.querySelectorAll('.card-item');
  for (let i = 0; i < cards.length; i++) {
    const rect = cards[i].getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return i;
  }
  return cards.length;
}

export default function ListColumn({ board, list, index }: Props) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(list.name);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dropIndexRef = useRef<number | null>(null);
  const listCardsRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listCardsRef.current;
    if (!el) return;

    let rafId = 0;
    let mouseX = 0;
    let mouseY = 0;
    let active = false;

    function tick() {
      if (!active) return;
      const rect = el!.getBoundingClientRect();
      const edge = 60;
      const maxSpeed = 10;
      if (mouseX >= rect.left && mouseX <= rect.right) {
        if (mouseY > rect.top && mouseY < rect.top + edge) {
          el!.scrollTop -= maxSpeed * Math.max(0, 1 - (mouseY - rect.top) / edge);
        } else if (mouseY > rect.bottom - edge && mouseY < rect.bottom) {
          el!.scrollTop += maxSpeed * Math.max(0, 1 - (rect.bottom - mouseY) / edge);
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function onDragOver(e: DragEvent) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!active) {
        active = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function onDragStop() {
      active = false;
      cancelAnimationFrame(rafId);
    }

    document.addEventListener('dragover', onDragOver);
    document.addEventListener('dragend', onDragStop);
    document.addEventListener('drop', onDragStop);
    return () => {
      document.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragend', onDragStop);
      document.removeEventListener('drop', onDragStop);
      cancelAnimationFrame(rafId);
    };
  }, []);

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

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes('application/taskgrid-card')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const idx = getDropIndex(e.currentTarget, e.clientY);
    if (idx !== dropIndexRef.current) {
      dropIndexRef.current = idx;
      setDropIndex(idx);
    }
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      dropIndexRef.current = null;
      setDropIndex(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/taskgrid-card');
    if (!raw) return;
    const { sourceListId, sourceIndex } = JSON.parse(raw) as {
      cardId: string;
      sourceListId: string;
      sourceIndex: number;
    };
    let destIndex = dropIndexRef.current ?? list.cards.length;

    if (sourceListId === list.id && destIndex > sourceIndex) {
      destIndex--;
    }

    dropIndexRef.current = null;
    setDropIndex(null);

    if (sourceListId === list.id && destIndex === sourceIndex) return;

    dispatch(
      moveCard({
        boardId: board.id,
        sourceListId,
        destinationListId: list.id,
        sourceIndex,
        destinationIndex: destIndex,
      }),
    );
  }

  const cardElements: React.ReactNode[] = [];
  list.cards.forEach((card, cardIndex) => {
    if (dropIndex === cardIndex) {
      cardElements.push(<div key="drop-indicator" className="card-drop-indicator" />);
    }
    cardElements.push(
      <CardItem
        key={card.id}
        card={card}
        index={cardIndex}
        listId={list.id}
        onClick={() => setEditingCard(card)}
      />,
    );
  });
  if (dropIndex !== null && dropIndex >= list.cards.length) {
    cardElements.push(<div key="drop-indicator" className="card-drop-indicator" />);
  }

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`list-column${snapshot.isDragging ? ' is-dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="list-header" {...provided.dragHandleProps}>
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
          <div
            className="list-cards"
            ref={listCardsRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {cardElements}
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
      )}
    </Draggable>
  );
}
