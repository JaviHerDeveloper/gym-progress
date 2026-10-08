import { useState } from 'react';

import { useAuth } from '../auth/context/useAuth';

export function AppPage() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleLogout() {
    setIsLoggingOut(true);
    setErrorMessage(null);

    try {
      await logout();
    } catch {
      setErrorMessage('No pudimos cerrar sesión. Inténtalo de nuevo.');
    } finally {
      setIsLoggingOut(false);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <main className="temporary-app-page">
      <section className="temporary-app-card" aria-labelledby="active-session-title">
        <p className="auth-brand">GYM PROGRESS</p>
        <h1 id="active-session-title">Sesión activa</h1>
        <p>Hola, {user.name}</p>
        <p className="temporary-app-email">{user.email}</p>
        {errorMessage ? <p className="auth-form-error" role="alert">{errorMessage}</p> : null}
        <button
          className="auth-primary-button"
          type="button"
          onClick={() => void handleLogout()}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
        >
          {isLoggingOut ? 'CERRANDO SESIÓN...' : 'CERRAR SESIÓN'}
        </button>
      </section>
    </main>
  );
}
