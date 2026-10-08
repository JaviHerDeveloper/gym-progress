import { useState, type FormEvent } from 'react';

import { AuthField } from '../components/AuthField';
import { AuthFooterNav } from '../components/AuthFooterNav';
import { AuthLayout } from '../components/AuthLayout';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import { useAuth } from '../context/useAuth';
import {
  validateEmail,
  validateHeight,
  validateName,
  validatePassword,
  validateWeight,
} from '../validation';
import { ApiError } from '../../../services/api/api-error';

type RegisterValues = {
  name: string;
  email: string;
  password: string;
  heightCm: string;
  weightKg: string;
};

type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

const initialValues: RegisterValues = {
  name: '',
  email: '',
  password: '',
  heightCm: '',
  weightKg: '',
};

function validateRegister(values: RegisterValues): RegisterErrors {
  return {
    name: validateName(values.name),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
    heightCm: validateHeight(values.heightCm),
    weightKg: validateWeight(values.weightKg),
  };
}

export function RegisterPage() {
  const { register } = useAuth();
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterValues, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<Partial<Record<keyof RegisterValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const errors = validateRegister(values);

  function showError(field: keyof RegisterValues): string | undefined {
    return (touched[field] || hasSubmitted ? errors[field] : undefined) ?? serverErrors[field];
  }

  function updateField(field: keyof RegisterValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmissionError(null);
    setServerErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);

    if (Object.values(errors).some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setServerErrors({});

    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
        heightCm: Number(values.heightCm),
        weightKg: Number(values.weightKg),
      });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setServerErrors({ email: 'Ya existe una cuenta con este correo electrónico.' });
      } else if (error instanceof ApiError && error.code === 'VALIDATION_ERROR') {
        setSubmissionError('Revisa los datos ingresados.');
      } else {
        setSubmissionError('No pudimos crear tu cuenta. Inténtalo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a registrar tu progreso.">
      <form className="auth-form" noValidate onSubmit={handleSubmit} aria-busy={isSubmitting}>
        {submissionError ? <p className="auth-form-error" role="alert">{submissionError}</p> : null}
        <AuthField
          id="register-name"
          label="Nombre"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => updateField('name', event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          helperText="Entre 2 y 100 caracteres."
          error={showError('name')}
        />
        <AuthField
          id="register-email"
          label="Correo electrónico"
          name="email"
          type="text"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateField('email', event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, email: true }))}
          error={showError('email')}
        />
        <AuthField
          id="register-password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => updateField('password', event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, password: true }))}
          helperText="Debe tener entre 8 y 128 caracteres."
          error={showError('password')}
        />
        <AuthField
          id="register-height"
          label="Altura"
          name="heightCm"
          type="text"
          inputMode="decimal"
          unit="cm"
          value={values.heightCm}
          onChange={(event) => updateField('heightCm', event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, heightCm: true }))}
          helperText="Ingresa tu altura en centímetros."
          error={showError('heightCm')}
        />
        <AuthField
          id="register-weight"
          label="Peso"
          name="weightKg"
          type="text"
          inputMode="decimal"
          unit="kg"
          value={values.weightKg}
          onChange={(event) => updateField('weightKg', event.target.value)}
          onBlur={() => setTouched((current) => ({ ...current, weightKg: true }))}
          helperText="Ingresa tu peso en kilogramos."
          error={showError('weightKg')}
        />
        <AuthPrimaryButton disabled={isSubmitting}>{isSubmitting ? 'CREANDO CUENTA…' : 'CREAR CUENTA'}</AuthPrimaryButton>
      </form>
      <AuthFooterNav prompt="¿Ya tienes una cuenta?" action="INICIA SESIÓN" to="/login" />
    </AuthLayout>
  );
}
