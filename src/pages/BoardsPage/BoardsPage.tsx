import { useEffect, useRef, useState } from 'react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadBoards, deleteBoard, reorderLists } from '../../store/boardsSlice';
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
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, CollisionDetection } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useDragScroll } from '../../hooks/useDragScroll';
import './BoardsPage.css';

const closestHorizontalCenter: CollisionDetection = ({ collisionRect, droppableRects, droppableContainers }) => {
  const collisions: { id: string; data: { value: number } }[] = [];
  const centerX = collisionRect.left + collisionRect.width / 2;

  for (const container of droppableContainers) {
    const rect = droppableRects.get(container.id);
    if (!rect) continue;
    const targetCenterX = rect.left + rect.width / 2;
    const distance = Math.abs(centerX - targetCenterX);
    collisions.push({ id: String(container.id), data: { value: distance } });
  }

  return collisions.sort((a, b) => a.data.value - b.data.value);
};

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
  const [isDndDragging, setIsDndDragging] = useState(false);
  const { ref: listsRef, nodeRef: listsNodeRef, onMouseDown: listsMouseDown, onMouseMove: listsMouseMove, onMouseUp: listsMouseUp, onMouseLeave: listsMouseLeave } = useDragScroll(isDndDragging);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const scrollLockRef = useRef<(() => void) | null>(null);

  function handleDragStart() {
    setIsDndDragging(true);
    const el = listsNodeRef.current;
    if (el) {
      const snap = el.scrollLeft;
      const lock = () => { el.scrollLeft = snap; };
      el.addEventListener('scroll', lock);
      scrollLockRef.current = lock;
      setTimeout(() => {
        el.removeEventListener('scroll', lock);
        if (scrollLockRef.current === lock) scrollLockRef.current = null;
      }, 150);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setIsDndDragging(false);
    const el = listsNodeRef.current;
    if (el && scrollLockRef.current) {
      el.removeEventListener('scroll', scrollLockRef.current);
      scrollLockRef.current = null;
    }
    const { active, over } = event;
    if (!over || active.id === over.id || !selectedBoard) return;
    const fromIndex = selectedBoard.lists.findIndex((l) => l.id === active.id);
    const toIndex = selectedBoard.lists.findIndex((l) => l.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      dispatch(reorderLists({ boardId: selectedBoard.id, fromIndex, toIndex }));
    }
  }

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
              <DndContext sensors={sensors} collisionDetection={closestHorizontalCenter} autoScroll={false} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setIsDndDragging(false)}>
                <SortableContext items={selectedBoard.lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
                  <div className={`board-lists${isDndDragging ? ' is-dnd-dragging' : ''}`} ref={listsRef} onMouseDown={listsMouseDown} onMouseMove={listsMouseMove} onMouseUp={listsMouseUp} onMouseLeave={listsMouseLeave}>
                    {selectedBoard.lists.map((list) => (
                      <ListColumn key={list.id} board={selectedBoard} list={list} />
                    ))}
                    <AddListForm boardId={selectedBoard.id} color={selectedBoard.color} />
                  </div>
                </SortableContext>
              </DndContext>
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
