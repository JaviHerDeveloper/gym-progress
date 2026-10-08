import { Link } from 'react-router-dom';

type AuthFooterNavProps = {
  prompt: string;
  action: string;
  to: '/login' | '/register';
};

export function AuthFooterNav({ prompt, action, to }: AuthFooterNavProps) {
  return (
    <p className="auth-footer-nav">
      <span>{prompt}</span>
      <Link to={to}>{action}</Link>
    </p>
  );
}
