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
      'application/sk-card',
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

  const isSeparator = /^-{3,}$/.test(card.title.trim());

  return (
    <div
      className={`card-item${isSeparator ? ' card-item--separator' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      title={isSeparator ? 'Separator — click to edit' : undefined}
    >
      {isSeparator ? (
        <span className="card-separator-line" aria-label="separator" />
      ) : (
        <>
          <span className="card-title">{card.title}</span>
          {card.description && (
            <p className="card-description">{card.description}</p>
          )}
        </>
      )}
    </div>
  );
}
