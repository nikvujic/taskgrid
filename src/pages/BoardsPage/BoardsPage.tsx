import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards } from '../../store/boardsSlice';
import { logout } from '../../store/authSlice';
import BoardCard from '../../components/BoardCard/BoardCard';
import AddBoardModal from '../../components/AddBoardModal/AddBoardModal';
import ImportExport from '../../components/ImportExport/ImportExport';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import ListColumn from '../../components/ListColumn/ListColumn';
import AddListForm from '../../components/AddListForm/AddListForm';
import './BoardsPage.css';

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const mode = useAppSelector((state) => state.auth.mode);
  const user = useAppSelector((state) => state.auth.user);
  const [showModal, setShowModal] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadBoards());
  }, [dispatch]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  return (
    <div className="workspace">
      <header className="workspace-header">
        <span className="workspace-logo">taskgrid</span>
        <div className="workspace-header-right">
          <ImportExport />
          <span className="workspace-user">
            {mode === 'guest' ? 'Guest' : (user?.name ?? 'Account')}
          </span>
          <button className="btn-logout" onClick={() => dispatch(logout())}>
            Sign out
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className="workspace-body">
        <aside className="boards-sidebar">
          <div className="sidebar-top">
            <span className="sidebar-label">Boards</span>
            <button
              className="btn-new-board"
              onClick={() => setShowModal(true)}
              title="New board"
            >
              +
            </button>
          </div>

          <div className="sidebar-cards">
            {boards.length === 0 ? (
              <button
                className="btn-create-first"
                onClick={() => setShowModal(true)}
              >
                Create a board
              </button>
            ) : (
              boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onSelect={() => setSelectedBoardId(board.id)}
                  isSelected={selectedBoardId === board.id}
                />
              ))
            )}
          </div>
        </aside>

        <main className="board-view">
          {selectedBoard ? (
            <>
              <div className="board-view-header">
                <div
                  className="board-view-dot"
                  style={{ '--card-color': selectedBoard.color } as React.CSSProperties}
                />
                <h1 className="board-view-title">{selectedBoard.name}</h1>
              </div>
              <div className="board-lists">
                {selectedBoard.lists.map((list) => (
                  <ListColumn key={list.id} board={selectedBoard} list={list} />
                ))}
                <AddListForm boardId={selectedBoard.id} />
              </div>
            </>
          ) : (
            <div className="board-view-empty">
              {boards.length === 0 ? (
                <>
                  <p>No boards yet.</p>
                  <button
                    className="btn-add-board"
                    onClick={() => setShowModal(true)}
                  >
                    Create your first board
                  </button>
                </>
              ) : (
                <p>Select a board</p>
              )}
            </div>
          )}
        </main>
      </div>

      {showModal && <AddBoardModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
