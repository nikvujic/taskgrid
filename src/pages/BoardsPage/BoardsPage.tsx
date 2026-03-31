import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards, loadBoardContent, deleteBoard, reorderLists, reorderBoards } from '../../store/boardsSlice';
import type { Board } from '../../types';
import BoardCard from '../../components/BoardCard/BoardCard';
import AddBoardModal from '../../components/AddBoardModal/AddBoardModal';
import EditBoardModal from '../../components/EditBoardModal/EditBoardModal';
import ConfirmModal from '../../components/ConfirmModal/ConfirmModal';
import SignOutModal from '../../components/SignOutModal/SignOutModal';
import ImportExport from '../../components/ImportExport/ImportExport';
import ListColumn from '../../components/ListColumn/ListColumn';
import AddListForm from '../../components/AddListForm/AddListForm';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useDragScroll } from '../../hooks/useDragScroll';
import './BoardsPage.css';

export default function BoardsPage() {
  const dispatch = useAppDispatch();
  const boards = useAppSelector((state) => state.boards.boards);
  const isBoardsLoading = useAppSelector((state) => state.boards.isLoading);
  const isContentLoading = useAppSelector((state) => state.boards.isContentLoading);
  const boardsError = useAppSelector((state) => state.boards.boardsError);
  const contentError = useAppSelector((state) => state.boards.contentError);
  const { boardId: selectedBoardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [deletingBoard, setDeletingBoard] = useState<Board | null>(null);

  useEffect(() => {
    dispatch(loadBoards());
  }, [dispatch]);

  const selectedBoard = boards.find((b) => b.id === selectedBoardId) ?? null;

  useEffect(() => {
    if (selectedBoardId) {
      dispatch(loadBoardContent(selectedBoardId));
    }
  }, [selectedBoardId, dispatch]);

  useEffect(() => {
    if (!isBoardsLoading && selectedBoardId && !selectedBoard) {
      navigate('/', { replace: true });
    }
  }, [isBoardsLoading, selectedBoardId, selectedBoard, navigate]);
  const [isDndDragging, setIsDndDragging] = useState(false);
  const { ref: listsRef, onMouseDown: listsMouseDown, onMouseMove: listsMouseMove, onMouseUp: listsMouseUp, onMouseLeave: listsMouseLeave } = useDragScroll(isDndDragging);

  const boardListsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = boardListsRef.current;
    if (!el) return;

    let rafId = 0;
    let mouseX = 0;
    let active = false;

    function tick() {
      if (!active) return;
      const rect = el!.getBoundingClientRect();
      const edge = 120;
      const maxSpeed = 14;
      if (mouseX > 0 && mouseX < rect.left + edge) {
        el!.scrollLeft -= maxSpeed * Math.max(0, 1 - (mouseX - rect.left) / edge);
      } else if (mouseX > rect.right - edge) {
        el!.scrollLeft += maxSpeed * Math.max(0, 1 - (rect.right - mouseX) / edge);
      }
      rafId = requestAnimationFrame(tick);
    }

    function onDragOver(e: DragEvent) {
      mouseX = e.clientX;
      if (!active) {
        active = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function onDragStop() {
      active = false;
      cancelAnimationFrame(rafId);
    }

    el.addEventListener('dragover', onDragOver);
    document.addEventListener('dragend', onDragStop);
    document.addEventListener('drop', onDragStop);
    return () => {
      el.removeEventListener('dragover', onDragOver);
      document.removeEventListener('dragend', onDragStop);
      document.removeEventListener('drop', onDragStop);
      cancelAnimationFrame(rafId);
    };
  }, [selectedBoard]);

  function handleDragEnd(result: DropResult) {
    setIsDndDragging(false);
    const { source, destination, type } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    if (type === 'BOARD') {
      dispatch(reorderBoards({ fromIndex: source.index, toIndex: destination.index }));
    } else if (type === 'LIST' && selectedBoard) {
      dispatch(reorderLists({ boardId: selectedBoard.id, fromIndex: source.index, toIndex: destination.index }));
    }
  }

  function confirmDelete(board: Board) {
    dispatch(deleteBoard(board.id));
    if (selectedBoardId === board.id) navigate('/');
  }

  return (
    <div className="workspace">
      <header className="workspace-header">
        <span className="workspace-logo">simple kanban</span>
        <div className="workspace-header-right">
          <ImportExport />
          <span className="header-sep" />
          <button className="btn-logout" onClick={() => setShowSignOut(true)}>
            Sign out
          </button>
        </div>
      </header>

      <DragDropContext onDragStart={() => setIsDndDragging(true)} onDragEnd={handleDragEnd}>
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

            {isBoardsLoading ? (
              <div className="sidebar-cards sidebar-loading">
                <div className="spinner" />
              </div>
            ) : boardsError ? (
              <div className="sidebar-cards sidebar-error">
                <p>Failed to load boards</p>
                <button className="btn-retry" onClick={() => dispatch(loadBoards())}>
                  <RefreshCw size={13} strokeWidth={2} />
                  Retry
                </button>
              </div>
            ) : boards.length === 0 ? (
              <div className="sidebar-cards">
                <button
                  className="btn-create-first"
                  onClick={() => setShowAddBoard(true)}
                >
                  Create a board
                </button>
              </div>
            ) : (
              <Droppable droppableId="boards" type="BOARD">
                {(provided) => (
                  <div className="sidebar-cards" ref={provided.innerRef} {...provided.droppableProps}>
                    {boards.map((board, index) => (
                      <BoardCard
                        key={board.id}
                        board={board}
                        index={index}
                        onSelect={() => navigate(`/${board.id}`)}
                        isSelected={selectedBoardId === board.id}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </aside>

          <main className="board-view">
            {selectedBoard && !isContentLoading ? (
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
                <Droppable droppableId="lists" type="LIST" direction="horizontal">
                  {(provided) => (
                    <div
                      className={`board-lists${isDndDragging ? ' is-dnd-dragging' : ''}`}
                      ref={(node: HTMLDivElement | null) => {
                        provided.innerRef(node);
                        listsRef(node);
                        boardListsRef.current = node;
                      }}
                      {...provided.droppableProps}
                      onMouseDown={listsMouseDown}
                      onMouseMove={listsMouseMove}
                      onMouseUp={listsMouseUp}
                      onMouseLeave={listsMouseLeave}
                    >
                      {selectedBoard.lists.map((list, index) => (
                        <ListColumn key={list.id} board={selectedBoard} list={list} index={index} />
                      ))}
                      {provided.placeholder}
                      <AddListForm boardId={selectedBoard.id} color={selectedBoard.color} />
                    </div>
                  )}
                </Droppable>
              </>
            ) : selectedBoardId && contentError ? (
              <div className="board-view-empty">
                <p>Failed to load board content</p>
                <button className="btn-retry" onClick={() => dispatch(loadBoardContent(selectedBoardId))}>
                  <RefreshCw size={13} strokeWidth={2} />
                  Retry
                </button>
              </div>
            ) : selectedBoardId ? (
              <div className="board-view-loading">
                <div className="spinner" />
              </div>
            ) : (
              <div className="board-view-empty">
                {!isBoardsLoading && boards.length === 0 ? (
                  <>
                    <p>No boards yet.</p>
                    <button
                      className="btn-add-board"
                      onClick={() => setShowAddBoard(true)}
                    >
                      Create your first board
                    </button>
                  </>
                ) : !isBoardsLoading ? (
                  <p>Select a board</p>
                ) : null}
              </div>
            )}
          </main>
        </div>
      </DragDropContext>

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
