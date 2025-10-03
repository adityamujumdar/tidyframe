import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard,
  Download,
  Calendar,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Receipt,
  BarChart3,
  DollarSign,
  Zap
} from 'lucide-react';
import { SubscriptionCard } from '@/components/billing/SubscriptionCard';
import { PaymentModal } from '@/components/billing/PaymentModal';
import { SubscriptionStatus, UsageStats, BillingHistory } from '@/types/billing';
import { billingService } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Billing() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBillingData();
    
    // Check for success/cancel params from Stripe redirect
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success === 'true') {
      toast.success('Subscription created successfully!');
      setSearchParams({}, { replace: true }); // Clear params
    } else if (canceled === 'true') {
      toast.error('Payment was cancelled.');
      setSearchParams({}, { replace: true }); // Clear params
    }
  }, [searchParams, setSearchParams]);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      
      const [subscriptionData, usageData, historyData] = await Promise.allSettled([
        billingService.getSubscriptionStatus(),
        billingService.getUsageStats(),
        billingService.getBillingHistory(10)
      ]);

      if (subscriptionData.status === 'fulfilled') {
        setSubscription(subscriptionData.value);
      }
      
      if (usageData.status === 'fulfilled') {
        setUsage(usageData.value);
      }
      
      if (historyData.status === 'fulfilled') {
        setBillingHistory(historyData.value);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error('Failed to load billing information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { url } = await billingService.createCustomerPortalSession();
      window.location.href = url;
    } catch {
      toast.error('Failed to open billing portal');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const blob = await billingService.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error('Failed to download invoice');
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <h1 className="text-2xl font-bold">Loading billing information...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription, view usage statistics, and billing history.
          </p>
        </div>
        
        {(!subscription || subscription.status !== 'active') && user?.plan !== 'enterprise' && (
          <Button onClick={() => setShowPaymentModal(true)}>
            <Zap className="h-4 w-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Subscription & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Card */}
          {usage && (
            <SubscriptionCard
              subscription={subscription}
              usage={usage}
              onManageSubscription={handleManageSubscription}
              onUpgrade={() => setShowPaymentModal(true)}
            />
          )}

          {/* Usage Statistics */}
          {usage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Statistics
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of your account usage.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">This month</span>
                      <span className="font-medium">{usage.currentMonth.parses.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last month</span>
                      <span className="font-medium">{usage.previousMonth.parses.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">All time</span>
                      <span className="font-medium">{usage.allTimeParses.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Average parse size</span>
                      <span className="font-medium">{(usage.averageParseSize / 1024).toFixed(1)}KB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Peak usage day</span>
                      <span className="font-medium">{usage.peakUsageDay.parses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Peak date</span>
                      <span className="font-medium">
                        {format(new Date(usage.peakUsageDay.date), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Billing History
              </CardTitle>
              <CardDescription>
                Your recent invoices and payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {billingHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No billing history available.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingHistory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{item.description}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-medium">
                            {formatCurrency(item.amount, item.currency)}
                          </p>
                          <Badge className={getPaymentStatusColor(item.status)}>
                            {item.status === 'paid' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                            {item.status === 'pending' && <Activity className="h-3 w-3 mr-1" />}
                            {item.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {item.invoiceUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(item.id)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          {usage && (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-2xl font-bold">{usage.currentMonth.parses.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Parses this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{usage.currentMonth.percentage.toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">Of monthly limit used</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-2xl font-bold">{usage.peakUsageDay.parses}</p>
                      <p className="text-sm text-muted-foreground">Peak daily usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
              <CardDescription>
                Contact our support team for billing assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <a href="/contact" target="_blank" rel="noopener noreferrer">
                  Contact Support
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          loadBillingData();
        }}
      />
    </div>
  );
}