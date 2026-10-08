import { useState, type FormEvent } from 'react';

import { AuthField } from '../components/AuthField';
import { AuthFooterNav } from '../components/AuthFooterNav';
import { AuthLayout } from '../components/AuthLayout';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { useAuth } from '../context/useAuth';
import { validateEmail, validatePassword } from '../validation';
import { ApiError } from '../../../services/api/api-error';

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
  const { login } = useAuth();
  const [values, setValues] = useState<LoginValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof LoginValues, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errors = validateLogin(values);

  function showError(field: keyof LoginValues): string | undefined {
    return touched[field] || hasSubmitted ? errors[field] : undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      await login({ email: values.email, password: values.password });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
        setSubmissionError('Correo o contraseña incorrectos.');
      } else if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        setSubmissionError('Los datos enviados no son válidos.');
      } else {
        setSubmissionError('No pudimos iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Continúa con tu progreso.">
      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
        {submissionError ? <p className="auth-form-error" role="alert">{submissionError}</p> : null}
        <AuthField
          id="login-email"
          label="Correo electrónico"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => {
            setValues((current) => ({ ...current, email: event.target.value }));
            setSubmissionError(null);
          }}
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
          onChange={(event) => {
            setValues((current) => ({ ...current, password: event.target.value }));
            setSubmissionError(null);
          }}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          helperText="Debe tener entre 8 y 128 caracteres."
          error={showError('password')}
        />
        <AuthPrimaryButton disabled={isSubmitting}>{isSubmitting ? 'INICIANDO SESIÓN…' : 'INICIAR SESIÓN'}</AuthPrimaryButton>
      </form>
      <AuthFooterNav prompt="¿No tienes una cuenta?" action="REGÍSTRATE" to="/register" />
    </AuthLayout>
  );
}
