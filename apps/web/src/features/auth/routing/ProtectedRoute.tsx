import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import { SessionErrorScreen } from '../components/SessionErrorScreen';
import { useAuth } from '../context/useAuth';

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'error') {
    return <SessionErrorScreen />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
