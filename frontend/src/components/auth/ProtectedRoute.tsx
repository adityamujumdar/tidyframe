import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export default function ProtectedRoute({ children, requireSubscription = true }: ProtectedRouteProps) {
  const { user, loading, hasActiveSubscription } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [gracePeriod, setGracePeriod] = useState(false);
  const [checkingPendingUser, setCheckingPendingUser] = useState(true);

  // Check for pending user from registration (before Stripe payment)
  useEffect(() => {
    const checkPendingUser = () => {
      if (!user && !loading) {
        const pendingUserStr = localStorage.getItem('pending_user');
        const registrationComplete = localStorage.getItem('registration_complete');

        if (pendingUserStr && registrationComplete) {
          logger.debug('ProtectedRoute: Pending user detected, allowing temporary access');
          // User has completed registration but hasn't gone through payment yet
          // OR has completed payment but hasn't been activated yet
          // Grant temporary grace period
          setGracePeriod(true);
          // Extended grace period for pending users (60 seconds)
          const timer = setTimeout(() => {
            logger.debug('Pending user grace period expired');
            setGracePeriod(false);
            setCheckingPendingUser(false);
          }, 60000);
          setCheckingPendingUser(false);
          return () => clearTimeout(timer);
        }
      }
      setCheckingPendingUser(false);
    };

    checkPendingUser();
  }, [user, loading]);

  // Check if user just completed payment - give grace period for webhook processing
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment_success');
    if (paymentSuccess === 'true') {
      logger.debug('Payment success detected - activating 30 second grace period');
      setGracePeriod(true);
      // Give 30 second grace period for Stripe webhook to process
      const timer = setTimeout(() => {
        logger.debug('Grace period expired');
        setGracePeriod(false);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  logger.debug('ProtectedRoute:', {
    user: user ? { id: user.id, email: user.email, plan: user.plan } : null,
    loading,
    hasActiveSubscription,
    gracePeriod,
    requireSubscription,
    path: location.pathname
  });

  if (loading || checkingPendingUser) {
    logger.debug('ProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user && !gracePeriod) {
    logger.debug('ProtectedRoute: No user found and no grace period, redirecting to login');
    // Redirect to login page with return url
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check subscription requirement
  if (requireSubscription && user) {
    // Enterprise users always have access
    // OR user in grace period after payment (webhook processing)
    // OR has active subscription
    if (user.plan !== 'enterprise' && !hasActiveSubscription && !gracePeriod) {
      logger.debug('ProtectedRoute: No active subscription and not in grace period, redirecting to pricing');
      return <Navigate to="/pricing" replace />;
    }

    if (gracePeriod) {
      logger.debug('ProtectedRoute: User in grace period after payment - allowing access');
    }
  }

  // If no user but in grace period, show activation loading UI instead of rendering null user
  if (!user && gracePeriod) {
    logger.debug('ProtectedRoute: No user but in grace period, showing activation UI');
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Activating Your Account</h3>
            <p className="text-sm text-muted-foreground">
              Please wait while we process your subscription and set up your account...
            </p>
            <p className="text-xs text-muted-foreground">
              This usually takes just a few seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  logger.debug('ProtectedRoute: User authenticated with valid subscription, rendering children');
  return <>{children}</>;
}