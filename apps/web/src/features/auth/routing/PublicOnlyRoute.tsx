import { Navigate, Outlet } from 'react-router-dom';

import { AuthLoadingScreen } from '../components/AuthLoadingScreen';
import { SessionErrorScreen } from '../components/SessionErrorScreen';
import { useAuth } from '../context/useAuth';

export function PublicOnlyRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <AuthLoadingScreen />;
  }

  if (status === 'error') {
    return <SessionErrorScreen />;
  }

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
