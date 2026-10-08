import { useState, type FormEvent } from 'react';

import { AuthField } from '../components/AuthField';
import { AuthFooterNav } from '../components/AuthFooterNav';
import { AuthLayout } from '../components/AuthLayout';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { validateEmail, validatePassword } from '../validation';

type LoginValues = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginValues, string>>;

const initialValues: LoginValues = {
  email: '',
  password: '',
};

function validateLogin(values: LoginValues): LoginErrors {
  return {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
}

export function LoginPage() {
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof LoginValues, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errors = validateLogin(values);

  function showError(field: keyof LoginValues): string | undefined {
    return touched[field] || hasSubmitted ? errors[field] : undefined;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      return;
    }
  }

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Continúa con tu progreso.">
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="login-email"
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          error={showError('email')}
        />
        <AuthField
          id="login-password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          helperText="Debe tener entre 8 y 128 caracteres."
          error={showError('password')}
        />
        <AuthPrimaryButton>INICIAR SESIÓN</AuthPrimaryButton>
      </form>
      <AuthFooterNav prompt="¿No tienes una cuenta?" action="REGÍSTRATE" to="/register" />
    </AuthLayout>
  );
}
