import { useAuth } from '../context/useAuth';

export function SessionErrorScreen() {
  const { errorMessage, refreshSession } = useAuth();

  return (
    <main className="auth-status-screen" role="alert">
      <p>{errorMessage ?? 'No pudimos comprobar tu sesión.'}</p>
      <button className="auth-primary-button" type="button" onClick={() => void refreshSession()}>
        REINTENTAR
      </button>
    </main>
  );
}
