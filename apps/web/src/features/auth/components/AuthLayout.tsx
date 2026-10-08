import type { PropsWithChildren } from 'react';

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  subtitle: string;
}>;

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <header className="auth-header">
          <p className="auth-brand">GYM PROGRESS</p>
          <div className="auth-heading">
            <h1 id="auth-title">{title}</h1>
            <p>{subtitle}</p>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
