import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

function Skeleton() {
  return (
    <div className="workspace">
      <header className="workspace-header">
        <span className="workspace-logo">simple kanban</span>
      </header>
      <div className="workspace-body">
        <aside className="boards-sidebar" />
        <main className="board-view" />
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const mode = useAppSelector((state) => state.auth.mode);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  if (isLoading) {
    return <Skeleton />;
  }

  if (mode === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
