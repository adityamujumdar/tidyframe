import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Check,
  Star,
  Users,
  ArrowRight,
  Building2,
  Loader2
} from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  
  const plans = [
    {
      name: 'Standard',
      price: billingPeriod === 'monthly' ? 80 : 768,
      priceLabel: billingPeriod === 'monthly' ? '/month' : '/year',
      description: 'Professional name parsing for businesses of all sizes',
      badge: 'Most Popular',
      savings: billingPeriod === 'yearly' ? 'Save 20% ($64/month)' : null,
      features: [
        '100,000 name parses per month',
        'CSV/Excel file upload (200MB)',
        'Advanced AI-powered name parsing',
        'Entity type detection (Person/Company/Trust)',
        'Gender detection with confidence scoring',
        'API access with authentication',
        'Result download in Excel format',
        'Priority processing queue',
        '10-minute automatic data deletion',
        'Email support'
      ],
      additionalPricing: '$0.01 per name over 100,000 ($10 per 1,000)',
      cta: 'Get Started',
      href: '/auth/register',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Custom solutions for large-scale operations',
      badge: 'Contact Sales',
      features: [
        'Unlimited name parses',
        'Custom AI algorithms and models',
        'Dedicated infrastructure',
        'Custom API rate limits',
        'Advanced entity detection',
        'Custom data retention policies',
        'SLA guarantees',
        'Dedicated account manager',
        'Priority 24/7 support',
        'Custom integrations',
        'On-premise deployment option',
        'Advanced analytics dashboard'
      ],
      additionalPricing: 'Volume-based pricing',
      cta: 'Contact Sales',
      href: '/contact',
      popular: false
    }
  ];

  const handlePlanClick = async (planName: string, href: string) => {
    if (user) {
      // User is logged in, go directly to Stripe checkout for Standard plan
      if (planName === 'Standard') {
        setIsLoading(true);
        try {
          // Call the backend directly with the correct format
          const response = await fetch('/api/billing/create-checkout', {
            method: 'POST',
            credentials: 'include', // Include cookies for site password
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Use correct key
            },
            body: JSON.stringify({ 
              plan: 'standard',
              billing_period: billingPeriod 
            })
          });
          
          const data = await response.json();
          
          // Redirect to Stripe checkout
          if (data.checkout_url) {
            window.location.href = data.checkout_url;
          } else if (data.detail) {
            toast.error(data.detail);
          } else {
            toast.error('Failed to create checkout session');
          }
        } catch (error) {
          toast.error('Failed to create checkout session. Please try again.');
          console.error('Checkout error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // For Enterprise, redirect to contact
        window.location.href = href;
      }
    } else {
      // User not logged in, redirect to registration
      window.location.href = href;
    }
  };

  const faqs = [
    {
      question: 'What file formats do you support?',
      answer: 'We support CSV, Excel (.xlsx, .xls), and plain text files. Files must have a column named "names", "addressee", or "process addressee".'
    },
    {
      question: 'How accurate is the name parsing?',
      answer: 'Our AI-powered system achieves 95%+ accuracy using state-of-the-art machine learning models optimized for name parsing and entity detection.'
    },
    {
      question: 'Can I try the service before purchasing?',
      answer: 'Yes! You can try our service with 5 anonymous parses without signing up. No registration or payment required for this trial.'
    },
    {
      question: 'What happens to my data?',
      answer: 'Your data is automatically deleted after 10 minutes for security. We never share or sell your data. US-based access only.'
    },
    {
      question: 'What happens if I exceed my monthly limit?',
      answer: 'Additional names beyond your 100,000 monthly limit are charged at $0.01 per name ($10 per 1,000 additional names).'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your current billing period.'
    },
    {
      question: 'Do you offer API access?',
      answer: 'Yes! Our Standard plan includes full API access with authentication keys for seamless integration with your systems.'
    },
    {
      question: 'What kind of support do you provide?',
      answer: 'Standard plan includes email support. Enterprise plans include priority 24/7 support with dedicated account management.'
    }
  ];


  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. Try it free with 5 anonymous parses - no signup required.
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Save 20%
              </Badge>
            </button>
          </div>
        </div>

        {/* Anonymous Trial Info */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
            <CardContent className="p-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Try it Free - No Signup Required</h3>
              <p className="text-muted-foreground">
                Test our AI-powered name parsing with <strong>5 anonymous parses</strong> before committing to a plan. 
                Perfect for evaluating our accuracy and features.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-xl' : 'border-muted'}`}>
              {plan.badge && (
                <Badge 
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  variant={plan.popular ? "default" : "secondary"}
                >
                  {plan.badge}
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {plan.name === 'Enterprise' ? (
                    <Building2 className="h-8 w-8 text-purple-500" />
                  ) : (
                    <Users className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base mb-4">
                  {plan.description}
                </CardDescription>
                
                <div className="mb-4">
                  <div className="text-5xl font-bold text-primary">
                    {typeof plan.price === 'number' ? (
                      <>
                        ${plan.price}
                        <span className="text-lg text-muted-foreground">{plan.priceLabel}</span>
                      </>
                    ) : (
                      <span className="text-3xl">{plan.price}</span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                      {plan.savings}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    {plan.additionalPricing}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center">
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                    {plan.name === 'Enterprise' ? 'Everything Custom' : 'Everything Included'}
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePlanClick(plan.name, plan.href)}
                  disabled={isLoading}
                >
                  {isLoading && plan.name === 'Standard' ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating checkout...
                    </>
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <Card className="mb-16 bg-gradient-to-r from-primary/10 to-blue-600/10">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Why Choose tidyframe.com?</h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-semibold mb-2">Industry-Leading Accuracy</h4>
                <p className="text-sm text-muted-foreground">
                  AI-powered parsing with cutting-edge ML for exceptional results
                </p>
              </div>
              <div>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold mb-2">No Surprises</h4>
                <p className="text-sm text-muted-foreground">
                  Transparent pricing with clear per-parse rates for overages
                </p>
              </div>
              <div>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold mb-2">Full Support</h4>
                <p className="text-sm text-muted-foreground">
                  Dedicated support to help you succeed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
          <p className="text-muted-foreground mb-6">
            Join thousands of businesses already using tidyframe.com for professional name parsing
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" variant="outline">
                Try 5 Anonymous Parses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button size="lg">
                Start Subscription
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}