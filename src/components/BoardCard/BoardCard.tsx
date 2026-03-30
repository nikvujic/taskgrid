import { Draggable } from '@hello-pangea/dnd';
import type { Board } from '../../types';
import './BoardCard.css';

interface Props {
  board: Board;
  index: number;
  onSelect: () => void;
  isSelected: boolean;
}

export default function BoardCard({ board, index, onSelect, isSelected }: Props) {
  return (
    <Draggable draggableId={board.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{ ...provided.draggableProps.style, '--card-color': board.color, cursor: snapshot.isDragging ? 'grabbing' : 'pointer' } as unknown as React.CSSProperties}
          className={`board-card${isSelected ? ' board-card--selected' : ''}${snapshot.isDragging ? ' board-card--dragging' : ''}`}
          role="button"
          tabIndex={0}
          onClick={onSelect}
        >
          <div className="board-card-dot" />
          <div className="board-card-body">
            <span className="board-card-name">{board.name}</span>
            {board.description && (
              <span className="board-card-desc">{board.description}</span>
            )}
            <span className="board-card-meta">
              {board.lists.length} {board.lists.length === 1 ? 'list' : 'lists'}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  );
}
