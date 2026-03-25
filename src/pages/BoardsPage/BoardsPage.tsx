import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards, deleteBoard } from '../../store/boardsSlice';
import type { Board } from '../../types';
import BoardCard from '../../components/BoardCard/BoardCard';
import AddBoardModal from '../../components/AddBoardModal/AddBoardModal';
import EditBoardModal from '../../components/EditBoardModal/EditBoardModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import SignOutModal from '../../components/SignOutModal/SignOutModal';
import ImportExport from '../../components/ImportExport/ImportExport';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import ListColumn from '../../components/ListColumn/ListColumn';
import AddListForm from '../../components/AddListForm/AddListForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import './BoardsPage.css';

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(loadBoards());
  }, [dispatch]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  function confirmDelete(board: Board) {
    dispatch(deleteBoard(board.id));
    if (selectedBoardId === board.id) setSelectedBoardId(null);
  }

  return (
    <div className="workspace">
      <header className="workspace-header">
        <span className="workspace-logo">taskgrid</span>
        <div className="workspace-header-right">
          <ThemeToggle />
          <span className="header-sep" />
          <ImportExport />
          <span className="header-sep" />
          <button className="btn-logout" onClick={() => setShowSignOut(true)}>
            Sign out
          </button>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="boards-sidebar">
          <div className="sidebar-top">
            <span className="sidebar-label">Boards</span>
            <button
              className="btn-new-board"
              onClick={() => setShowAddBoard(true)}
              title="New board"
            >
              <Plus size={14} strokeWidth={2.5} />
            </button>
          </div>

          <div className="sidebar-cards">
            {boards.length === 0 ? (
              <button
                className="btn-create-first"
                onClick={() => setShowAddBoard(true)}
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
                <div className="board-view-actions">
                  <button
                    className="board-view-btn"
                    onClick={() => setEditingBoard(selectedBoard)}
                    title="Edit board"
                  >
                    <Pencil size={13} strokeWidth={1.8} />
                  </button>
                  <button
                    className="board-view-btn board-view-btn--danger"
                    onClick={() => setDeletingBoard(selectedBoard)}
                    title="Delete board"
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </button>
                </div>
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
                    onClick={() => setShowAddBoard(true)}
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

      {showAddBoard && <AddBoardModal onClose={() => setShowAddBoard(false)} />}
      {editingBoard && <EditBoardModal board={editingBoard} onClose={() => setEditingBoard(null)} />}
      {deletingBoard && (
        <ConfirmModal
          title="Delete board"
          message={`"${deletingBoard.name}" and all its lists and cards will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={() => confirmDelete(deletingBoard)}
          onClose={() => setDeletingBoard(null)}
        />
      )}
      {showSignOut && <SignOutModal onClose={() => setShowSignOut(false)} />}
    </div>
  );
}
