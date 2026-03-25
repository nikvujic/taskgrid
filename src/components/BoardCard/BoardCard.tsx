import type { Board } from '../../types';
import './BoardCard.css';

interface Props {
  board: Board;
  onSelect: () => void;
  isSelected: boolean;
}

export default function BoardCard({ board, onSelect, isSelected }: Props) {
  return (
    <button
      className={`board-card${isSelected ? ' board-card--selected' : ''}`}
      style={{ '--card-color': board.color } as React.CSSProperties}
      onClick={onSelect}
    >
      <div className="board-card-body">
        <div className="board-card-dot" />
        <span className="board-card-name">{board.name}</span>
        {board.description && (
          <span className="board-card-desc">{board.description}</span>
        )}
        <span className="board-card-meta">
          {board.lists.length} {board.lists.length === 1 ? 'list' : 'lists'}
        </span>
      </div>
    </button>
  );
}
