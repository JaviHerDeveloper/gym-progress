import { Navigate, Route, Routes } from 'react-router-dom';

import { AppPage } from '../features/app/AppPage';
import { ProtectedRoute } from '../features/auth/routing/ProtectedRoute';
import { PublicOnlyRoute } from '../features/auth/routing/PublicOnlyRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';

export function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
