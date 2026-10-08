import { useState, type FormEvent } from 'react';

import { AuthField } from '../components/AuthField';
import { AuthFooterNav } from '../components/AuthFooterNav';
import { AuthLayout } from '../components/AuthLayout';
import { AuthPrimaryButton } from '../components/AuthPrimaryButton';
import {
  validateEmail,
  validateHeight,
  validateName,
  validatePassword,
  validateWeight,
} from '../validation';

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
  const [values, setValues] = useState<RegisterValues>(initialValues);
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterValues, boolean>>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const errors = validateRegister(values);

  function showError(field: keyof RegisterValues): string | undefined {
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
    <AuthLayout title="Crea tu cuenta" subtitle="Empieza a registrar tu progreso.">
      <form className="auth-form" noValidate onSubmit={handleSubmit}>
        <AuthField
          id="register-name"
          label="Nombre"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          onBlur={() => setTouched((current) => ({ ...current, name: true }))}
          helperText="Entre 2 y 100 caracteres."
          error={showError('name')}
        />
        <AuthField
          id="register-email"
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
          id="register-password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
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
          onChange={(event) => setValues((current) => ({ ...current, heightCm: event.target.value }))}
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
          onChange={(event) => setValues((current) => ({ ...current, weightKg: event.target.value }))}
          onBlur={() => setTouched((current) => ({ ...current, weightKg: true }))}
          helperText="Ingresa tu peso en kilogramos."
          error={showError('weightKg')}
        />
        <AuthPrimaryButton>CREAR CUENTA</AuthPrimaryButton>
      </form>
      <AuthFooterNav prompt="¿Ya tienes una cuenta?" action="INICIA SESIÓN" to="/login" />
    </AuthLayout>
  );
}
