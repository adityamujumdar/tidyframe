import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, loading, hasActiveSubscription } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute:', { 
    user: user ? { id: user.id, email: user.email, plan: user.plan } : null, 
    loading, 
    hasActiveSubscription,
    requireSubscription,
    path: location.pathname 
  });

  if (loading) {
    console.log('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to login');
    // Redirect to login page with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check subscription requirement
  if (requireSubscription) {
    // Enterprise users always have access
    if (user.plan !== 'enterprise' && !hasActiveSubscription) {
      console.log('ProtectedRoute: No active subscription, redirecting to pricing');
      return <Navigate to="/pricing" replace />;
    }
  }

  console.log('ProtectedRoute: User authenticated with valid subscription, rendering children');
  return <>{children}</>;
}