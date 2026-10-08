import type { ButtonHTMLAttributes } from 'react';

type AuthPrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function AuthPrimaryButton({ children, ...buttonProps }: AuthPrimaryButtonProps) {
  return (
    <button className="auth-primary-button" type="submit" {...buttonProps}>
      {children}
    </button>
  );
}
