import { apiService } from './api';
import {
  SubscriptionStatus,
  UsageStats,
  BillingHistory,
  PaymentMethod,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  CustomerPortalResponse,
  PricingPlan
} from '@/types/billing';

class BillingService {
  // Get current subscription status
  async getSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    try {
      return await apiService.get<SubscriptionStatus>('/api/billing/subscription');
    } catch (error) {
      // Return null if no subscription exists
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // Get usage statistics
  async getUsageStats(): Promise<UsageStats> {
    return await apiService.get<UsageStats>('/api/billing/usage');
  }

  // Get billing history
  async getBillingHistory(limit = 10): Promise<BillingHistory[]> {
    return await apiService.get<BillingHistory[]>(`/api/billing/history?limit=${limit}`);
  }

  // Get payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await apiService.get<PaymentMethod[]>('/api/billing/payment-methods');
  }

  // Create checkout session for subscription
  async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const defaultUrls = {
      successUrl: `${window.location.origin}/dashboard/billing?success=true`,
      cancelUrl: `${window.location.origin}/dashboard/billing?canceled=true`
    };
    
    return await apiService.post<CheckoutSessionResponse>('/api/billing/create-checkout', {
      ...request,
      successUrl: request.successUrl || defaultUrls.successUrl,
      cancelUrl: request.cancelUrl || defaultUrls.cancelUrl
    });
  }

  // Create customer portal session
  async createCustomerPortalSession(returnUrl?: string): Promise<CustomerPortalResponse> {
    return await apiService.post<CustomerPortalResponse>('/api/billing/portal', {
      returnUrl: returnUrl || `${window.location.origin}/dashboard/billing`
    });
  }

  // Get available pricing plans
  async getPricingPlans(): Promise<PricingPlan[]> {
    return await apiService.get<PricingPlan[]>('/api/billing/plans');
  }

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    await apiService.delete('/api/billing/subscription');
  }

  // Update subscription
  async updateSubscription(priceId: string): Promise<SubscriptionStatus> {
    return await apiService.put<SubscriptionStatus>('/api/billing/subscription', { priceId });
  }

  // Add payment method
  async addPaymentMethod(paymentMethodId: string): Promise<void> {
    await apiService.post('/api/billing/payment-methods', { paymentMethodId });
  }

  // Remove payment method
  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    await apiService.delete(`/api/billing/payment-methods/${paymentMethodId}`);
  }

  // Set default payment method
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    await apiService.put(`/api/billing/payment-methods/${paymentMethodId}/default`);
  }

  // Retry failed invoice
  async retryFailedInvoice(invoiceId: string): Promise<void> {
    await apiService.post(`/api/billing/invoices/${invoiceId}/retry`);
  }

  // Download invoice
  async downloadInvoice(invoiceId: string): Promise<Blob> {
    const response = await apiService.getAxiosInstance().get(
      `/api/billing/invoices/${invoiceId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  // Check if user has active subscription
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const subscription = await this.getSubscriptionStatus();
      return subscription?.status === 'active' || subscription?.status === 'trialing';
    } catch {
      return false;
    }
  }

  // Get subscription limits
  async getSubscriptionLimits(): Promise<{ parses: number; features: string[] }> {
    const subscription = await this.getSubscriptionStatus();
    
    if (!subscription) {
      return {
        parses: 100, // Free tier limit
        features: ['Basic CSV parsing', 'Email support']
      };
    }

    return {
      parses: subscription.plan.name === 'Enterprise' ? -1 : 100000, // -1 means unlimited
      features: subscription.plan.features
    };
  }
}

export const billingService = new BillingService();