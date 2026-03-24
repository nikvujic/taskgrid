import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards } from '../../store/boardsSlice';
import { logout } from '../../store/authSlice';
import BoardCard from '../../components/BoardCard/BoardCard';
import AddBoardModal from '../../components/AddBoardModal/AddBoardModal';
import ImportExport from '../../components/ImportExport/ImportExport';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import './BoardsPage.css';

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const mode = useAppSelector((state) => state.auth.mode);
  const user = useAppSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(loadBoards());
  }, [dispatch]);

  function handleLogout() {
    dispatch(logout());
  }

  return (
    <div className="boards-page">
      <header className="boards-header">
        <span className="boards-logo">taskgrid</span>
        <div className="boards-header-right">
          <ImportExport />
          <span className="boards-user">
            {mode === 'guest' ? 'Guest' : (user?.name ?? 'Account')}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="boards-main">
        <div className="boards-title-row">
          <h1 className="boards-title">My Boards</h1>
          <button className="btn-add-board" onClick={() => setShowModal(true)}>
            + New Board
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="boards-empty">
            <p>No boards yet.</p>
            <button className="btn-add-board" onClick={() => setShowModal(true)}>
              Create your first board
            </button>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </main>

      {showModal && <AddBoardModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
