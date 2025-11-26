import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute wrapper for auth pages (/login, /register)
 * If user already has token, redirects to home /
 * If no token, allows access to the page
 */
export function PublicRoute({ children }: PublicRouteProps) {
  const { accessToken } = useUserContext();

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
