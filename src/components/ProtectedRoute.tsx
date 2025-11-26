import { Navigate } from 'react-router-dom';
import { useUserContext } from '@/hooks/useUserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute wrapper that checks for authentication token
 * If no token exists, redirects to /login
 * If token exists, renders the protected component
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken } = useUserContext();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
