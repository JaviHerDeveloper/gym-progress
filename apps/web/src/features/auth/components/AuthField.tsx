import type { InputHTMLAttributes } from 'react';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  unit?: string;
  helperText?: string;
  error?: string;
};

export function AuthField({ id, label, unit, helperText, error, ...inputProps }: AuthFieldProps) {
  const feedback = error ?? helperText;
  const feedbackId = `${id}-feedback`;

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div
        className={
          unit
            ? `auth-input-wrap auth-input-wrap--unit${error ? ' auth-input-wrap--error' : ''}`
            : `auth-input-wrap${error ? ' auth-input-wrap--error' : ''}`
        }
      >
        <input
          {...inputProps}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={feedback ? feedbackId : undefined}
        />
        {unit ? <span className="auth-input-unit" aria-hidden="true">{unit}</span> : null}
      </div>
      <p
        className={error ? 'auth-field-feedback auth-field-feedback--error' : 'auth-field-feedback'}
        id={feedback ? feedbackId : undefined}
        aria-live={error ? 'polite' : undefined}
      >
        {feedback ?? '\u00a0'}
      </p>
    </div>
  );
}
