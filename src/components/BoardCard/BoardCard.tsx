import { useNavigate } from 'react-router-dom';
import type { Board } from '../../types';
import './BoardCard.css';

interface Props {
  board: Board;
}

export default function BoardCard({ board }: Props) {
  const navigate = useNavigate();

  return (
    <button
      className="board-card"
      style={{ '--card-color': board.color } as React.CSSProperties}
      onClick={() => navigate(`/board/${board.id}`)}
    >
      <div className="board-card-accent" />
      <div className="board-card-body">
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
