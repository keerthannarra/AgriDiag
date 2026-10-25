import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute() {
  const { isAuthenticated, loading, authError, refreshUser } = useAuth();
  if (loading) return <LoadingSpinner fullPage />;
  if (authError) {
    return (
      <section className="container" style={{ padding: 'var(--sp-12) var(--sp-6)' }}>
        <div className="alert alert-error" role="alert" style={{ display: 'block' }}>
          <p>{authError}</p>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={refreshUser}
            style={{ marginTop: 'var(--sp-3)' }}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}
