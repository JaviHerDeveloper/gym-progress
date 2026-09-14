import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de la aplicación.');
}

createRoot(rootElement).render(
  <StrictMode>
    <main>
      <h1>Gym Progress</h1>
    </main>
  </StrictMode>,
);
