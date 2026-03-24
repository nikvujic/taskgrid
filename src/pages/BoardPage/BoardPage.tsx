import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards } from '../../store/boardsSlice';
import ListColumn from '../../components/ListColumn/ListColumn';
import AddListForm from '../../components/AddListForm/AddListForm';
import './BoardPage.css';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const board = boards.find((b) => b.id === boardId);

  useEffect(() => {
    if (boards.length === 0) {
      dispatch(loadBoards());
    }
  }, [dispatch, boards.length]);

  if (!board) {
    return (
      <div className="board-not-found">
        <p>Board not found.</p>
        <button className="btn-back" onClick={() => navigate('/')}>
          ← Back to boards
        </button>
      </div>
    );
  }

  return (
    <div className="board-page">
      <header className="board-header" style={{ '--card-color': board.color } as React.CSSProperties}>
        <div className="board-header-inner">
          <button className="btn-back-link" onClick={() => navigate('/')}>
            ← Boards
          </button>
          <h1 className="board-title">{board.name}</h1>
          {board.description && (
            <span className="board-desc">{board.description}</span>
          )}
        </div>
      </header>

      <div className="board-lists">
        {board.lists.map((list) => (
          <ListColumn key={list.id} board={board} list={list} />
        ))}
        <AddListForm boardId={board.id} />
      </div>
    </div>
  );
}
