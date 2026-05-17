import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'guardian' | 'senior';
  /** Senior-mode pages: require a valid seniorSession (phone+PIN). */
  requireAuth?: boolean;
}

function FullScreenSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function ProtectedRoute({ children, requireRole, requireAuth }: ProtectedRouteProps) {
  const { loading, user, role, linkedSeniorsLoaded, seniorSession } = useAuth();
  const location = useLocation();

  if (loading) return <FullScreenSpinner />;

  if (requireRole === 'guardian') {
    if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;
    if (!linkedSeniorsLoaded) return <FullScreenSpinner />;
    if (role && role !== 'guardian') return <Navigate to="/unauthorized" replace />;
    return <>{children}</>;
  }

  if (requireAuth) {
    if (!seniorSession) return <Navigate to="/senior/auth" replace state={{ from: location }} />;
    return <>{children}</>;
  }

  return <>{children}</>;
}

export default ProtectedRoute;