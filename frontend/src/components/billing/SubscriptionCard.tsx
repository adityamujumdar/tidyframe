import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Crown,
  Zap
} from 'lucide-react';
import { SubscriptionStatus, UsageStats } from '@/types/billing';
import { billingService } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ProgressBar } from '@/components/shared/ProgressBar';

interface SubscriptionCardProps {
  subscription: SubscriptionStatus | null;
  usage: UsageStats;
  onManageSubscription: () => void;
  onUpgrade: () => void;
}

export function SubscriptionCard({ 
  subscription, 
  usage, 
  onManageSubscription, 
  onUpgrade 
}: SubscriptionCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'trialing':
        return 'bg-info/10 text-info border-info/20';
      case 'past_due':
      case 'unpaid':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'canceled':
        return 'bg-muted/10 text-muted-foreground border-muted/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'trialing':
        return <Clock className="h-4 w-4" />;
      case 'past_due':
      case 'unpaid':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will still have access until the end of your billing period.')) {
      return;
    }

    setIsLoading(true);
    try {
      await billingService.cancelSubscription();
      toast.success('Subscription cancelled successfully. You will have access until the end of your billing period.');
      window.location.reload(); // Refresh to show updated status
    } catch {
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show admin status for enterprise users
  if (user?.plan === 'enterprise' && !subscription) {
    return (
      <Card className="border-warning/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-warning" />
            <CardTitle>Admin Account</CardTitle>
          </div>
          <CardDescription>
            You have administrative privileges with unlimited access to all features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className="bg-warning/10 text-warning border-warning/20">
                <Crown className="h-3 w-3 mr-1" />
                Admin
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Parses this month</span>
              <span className="font-medium">{usage.currentMonth.parses.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monthly limit</span>
              <span className="font-medium">Unlimited</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show free tier status
  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Free Tier</CardTitle>
          <CardDescription>
            You're currently on the free tier with limited features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar
            value={usage.currentMonth.parses}
            max={usage.currentMonth.limit}
            showLabel
            label={`Usage this month: ${usage.currentMonth.parses} / ${usage.currentMonth.limit}`}
            dangerZone={90}
            size="sm"
          />
          
          <div className="pt-2 space-y-2">
            <p className="text-sm font-medium">Free tier includes:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 100 file parses per month</li>
              <li>• Basic CSV processing</li>
              <li>• Email support</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onUpgrade} className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {subscription.plan.name} Plan
            </CardTitle>
            <CardDescription>
              {formatCurrency(subscription.plan.amount, subscription.plan.currency)} / {subscription.plan.interval}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(subscription.status)}>
            {getStatusIcon(subscription.status)}
            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Usage Statistics */}
        {subscription.plan.name !== 'Enterprise' ? (
          <ProgressBar
            value={usage.currentMonth.parses}
            max={usage.currentMonth.limit}
            showLabel
            label={`Usage this month: ${usage.currentMonth.parses.toLocaleString()} / ${usage.currentMonth.limit.toLocaleString()}`}
            dangerZone={90}
            size="sm"
          />
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage this month</span>
            <span className="font-medium">{usage.currentMonth.parses.toLocaleString()} / ∞</span>
          </div>
        )}

        {/* Billing Period */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Current period</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(subscription.currentPeriodStart), 'MMM dd')} - {format(new Date(subscription.currentPeriodEnd), 'MMM dd')}
          </span>
        </div>

        {/* Trial Information */}
        {subscription.status === 'trialing' && subscription.trialEnd && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Trial ends</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(subscription.trialEnd), 'MMM dd, yyyy')}
            </span>
          </div>
        )}

        {/* Cancellation Notice */}
        {subscription.cancelAtPeriodEnd && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <div className="text-sm">
              <p className="text-warning font-medium">Subscription will end</p>
              <p className="text-muted-foreground">
                Your subscription will end on {format(new Date(subscription.currentPeriodEnd), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
        )}

        {/* Plan Features */}
        <div className="pt-2">
          <p className="text-sm font-medium mb-2">Plan includes:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            {subscription.plan.features.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onManageSubscription}
          disabled={isLoading}
        >
          Manage Billing
        </Button>
        
        {!subscription.cancelAtPeriodEnd && (
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleCancelSubscription}
            disabled={isLoading}
          >
            Cancel Subscription
          </Button>
        )}
        
        {subscription.cancelAtPeriodEnd && (
          <Button 
            variant="default" 
            onClick={onUpgrade}
            disabled={isLoading}
          >
            Reactivate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}