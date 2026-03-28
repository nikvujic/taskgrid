import type { Card } from '../../types';
import './CardItem.css';

interface Props {
  card: Card;
  index: number;
  listId: string;
  onClick: () => void;
}

export default function CardItem({ card, index, listId, onClick }: Props) {
  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData(
      'application/taskgrid-card',
      JSON.stringify({ cardId: card.id, sourceListId: listId, sourceIndex: index }),
    );
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => {
      (e.target as HTMLElement).classList.add('card-item--dragging');
    });
  }

  function handleDragEnd(e: React.DragEvent) {
    (e.target as HTMLElement).classList.remove('card-item--dragging');
  }

  return (
    <div
      className="card-item"
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
    >
      <span className="card-title">{card.title}</span>
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
    </div>
  );
}
