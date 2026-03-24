import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';

export default function ProtectedRoute() {
  const mode = useAppSelector((state) => state.auth.mode);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  if (mode === null) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
