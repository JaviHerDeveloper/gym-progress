import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../services/api/api-error';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
}));

vi.mock('../context/useAuth', () => ({
  useAuth: () => ({
    login: authMocks.login,
    register: authMocks.register,
  }),
}));

function renderLogin() {
  return render(<MemoryRouter><LoginPage /></MemoryRouter>);
}

function renderRegister() {
  return render(<MemoryRouter><RegisterPage /></MemoryRouter>);
}

describe('formularios de autenticación', () => {
  beforeEach(() => {
    authMocks.login.mockReset();
    authMocks.register.mockReset();
  });

  it('bloquea login inválido localmente y no llama al API', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(await screen.findByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    expect(authMocks.login).not.toHaveBeenCalled();
  });

  it('envía exactamente las credenciales introducidas y muestra el error de login seguro', async () => {
    const user = userEvent.setup();
    authMocks.login.mockRejectedValue(new ApiError(401, 'INVALID_CREDENTIALS', 'internal ignored'));
    renderLogin();

    await user.type(screen.getByLabelText('Correo electrónico'), ' Ana@Example.com ');
    await user.type(screen.getByLabelText('Contraseña'), ' pass word ');
    await user.click(screen.getByRole('button', { name: 'INICIAR SESIÓN' }));

    expect(authMocks.login).toHaveBeenCalledWith({ email: ' Ana@Example.com ', password: ' pass word ' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
  });

  it('convierte altura y peso solamente en el límite con el API', async () => {
    const user = userEvent.setup();
    authMocks.register.mockResolvedValue(undefined);
    renderRegister();

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), ' pass word ');
    await user.type(screen.getByLabelText('Altura'), '170.5');
    await user.type(screen.getByLabelText('Peso'), '65.25');
    await user.click(screen.getByRole('button', { name: 'CREAR CUENTA' }));

    expect(authMocks.register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@example.com',
      password: ' pass word ',
      heightCm: 170.5,
      weightKg: 65.25,
    });
  });

  it('muestra EMAIL_ALREADY_EXISTS junto al correo y lo borra al corregirlo', async () => {
    const user = userEvent.setup();
    authMocks.register.mockRejectedValue(new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'ignored'));
    renderRegister();

    await user.type(screen.getByLabelText('Nombre'), 'Ana');
    await user.type(screen.getByLabelText('Correo electrónico'), 'ana@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'password-123');
    await user.type(screen.getByLabelText('Altura'), '170');
    await user.type(screen.getByLabelText('Peso'), '65');
    await user.click(screen.getByRole('button', { name: 'CREAR CUENTA' }));

    expect(await screen.findByText('Ya existe una cuenta con este correo electrónico.')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Correo electrónico'), 'x');
    expect(screen.queryByText('Ya existe una cuenta con este correo electrónico.')).not.toBeInTheDocument();
  });
});
