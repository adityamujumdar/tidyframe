import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  CreditCard, 
  Loader2, 
  Star, 
  Zap,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import { PricingPlan } from '@/types/billing';
import { billingService } from '@/services/billingService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PaymentModal({ isOpen, onClose, onSuccess }: PaymentModalProps) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadPlans();
    }
  }, [isOpen]);

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const fetchedPlans = await billingService.getPricingPlans();
      setPlans(fetchedPlans);
      
      // Pre-select the popular plan
      const popularPlan = fetchedPlans.find(plan => plan.popular);
      if (popularPlan) {
        setSelectedPlan(popularPlan);
      } else if (fetchedPlans.length > 0) {
        setSelectedPlan(fetchedPlans[0]);
      }
    } catch (error) {
      toast.error('Failed to load pricing plans');
      console.error('Error loading plans:', error);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsLoading(true);
    try {
      const { url } = await billingService.createCheckoutSession({
        priceId: selectedPlan.priceId,
      });
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'professional':
      case 'pro':
        return <Zap className="h-5 w-5" />;
      case 'enterprise':
        return <Shield className="h-5 w-5" />;
      case 'team':
        return <Users className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  // Don't show modal for enterprise users (admins)
  if (user?.plan === 'enterprise') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-status-warning" />
            Choose Your Plan
          </DialogTitle>
          <DialogDescription>
            Upgrade your account to unlock unlimited parses and premium features.
          </DialogDescription>
        </DialogHeader>

        {loadingPlans ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading plans...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  } ${plan.popular ? 'border-status-warning ring-2 ring-status-warning/20' : ''}`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardHeader className="text-center">
                    {plan.popular && (
                      <Badge className="self-center mb-2 bg-status-warning-bg border-status-warning-border text-status-warning">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    )}
                    <div className="flex items-center justify-center mb-2">
                      {getPlanIcon(plan.name)}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <div className="text-3xl font-bold">
                        {formatCurrency(plan.amount, plan.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        per {plan.interval}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-status-success mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Selected Plan Summary */}
            {selectedPlan && (
              <>
                <Separator />
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{selectedPlan.name} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        Billed {selectedPlan.interval}ly
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">
                        {formatCurrency(selectedPlan.amount, selectedPlan.currency)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        per {selectedPlan.interval}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-status-info-bg border border-status-info-border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-status-info mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-status-info">Secure Payment</p>
                      <p className="text-status-info">
                        Your payment is secured by Stripe. You can cancel anytime.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Immediate Access Info */}
                <div className="bg-status-success-bg border border-status-success-border rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-status-success mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-status-success">Immediate Access</p>
                      <p className="text-status-success">
                        Get instant access to all premium features. Cancel anytime.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={onClose} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubscribe} 
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-caption text-muted-foreground text-center">
                  By subscribing, you agree to our Terms of Service and Privacy Policy.
                  You will be charged immediately upon subscription.
                </p>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}