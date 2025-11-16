import { useState, useEffect } from 'react';
import { logger } from '@/utils/logger';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isInPaymentGracePeriod, clearPaymentGracePeriod } from '@/utils/gracePeriodManager';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileText,
  Activity,
  CheckCircle,
  AlertCircle,
  PartyPopper,
  ArrowRight,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProcessingJob } from '@/types/processing';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatDate } from '@/utils/format';
import { UI } from '@/config/constants';

type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export default function DashboardHome() {
  const { user, refreshUser, hasActiveSubscription } = useAuth();
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inGracePeriod, setInGracePeriod] = useState(isInPaymentGracePeriod());

  // Show welcome modal for users who just completed payment (grace period active)
  // Also poll subscription status during grace period and clear it when active
  useEffect(() => {
    const checkGracePeriod = isInPaymentGracePeriod();
    setInGracePeriod(checkGracePeriod);
    const hasSeenWelcome = localStorage.getItem('welcome_modal_shown');

    if (checkGracePeriod && !hasSeenWelcome) {
      setShowWelcomeModal(true);
      localStorage.setItem('welcome_modal_shown', 'true');
    }

    // Poll subscription status during grace period to auto-clear when activated
    if (checkGracePeriod) {
      logger.debug('DashboardHome: Grace period active, starting subscription status polling');

      const pollInterval = setInterval(async () => {
        try {
          // Refresh user data to check if subscription is now active
          await refreshUser();

          // If subscription is now active, clear grace period
          if (hasActiveSubscription) {
            logger.debug('DashboardHome: Subscription confirmed active, clearing grace period');
            clearPaymentGracePeriod();
            setInGracePeriod(false);
            clearInterval(pollInterval);
          } else {
            // Check if grace period expired
            setInGracePeriod(isInPaymentGracePeriod());
          }
        } catch (error) {
          logger.error('DashboardHome: Error polling subscription status', error);
        }
      }, 5000); // Poll every 5 seconds

      // Clear polling when component unmounts or grace period expires
      return () => {
        clearInterval(pollInterval);
      };
    }
  }, [hasActiveSubscription, refreshUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobs] = await Promise.all([
          processingService.getJobs().catch(() => {
            logger.debug('Jobs endpoint not available yet, using empty array');
            return [];
          })
        ]);

        setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, UI.MAX_RECENT_JOBS) : []); // Show only recent jobs
      } catch (error) {
        logger.error('Error fetching dashboard data:', error);
        // Set fallback data instead of showing errors
        setRecentJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const handleRefreshSubscription = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      toast.success('Subscription status updated successfully');
    } catch {
      toast.error('Failed to refresh subscription status. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Modal for New Users */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <PartyPopper className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Welcome to TidyFrame!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your account is now active with 100,000 monthly parses. Let's process your first file!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">95%+ Accuracy</p>
                <p className="text-xs text-muted-foreground">AI-powered name parsing with entity detection</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Lightning Fast</p>
                <p className="text-xs text-muted-foreground">Process 1000 names in under 1 minute</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Easy Export</p>
                <p className="text-xs text-muted-foreground">Download results in CSV or Excel format</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                setShowWelcomeModal(false);
                navigate('/dashboard/upload');
              }}
            >
              Upload Your First File
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your name parsing projects today.
        </p>
      </div>

      {/* Activation Banner - Show during grace period */}
      {inGracePeriod && (
        <Card className="border-success/50 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Loader2 className="h-6 w-6 text-success animate-spin" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-1">Activating Your Subscription</h3>
                <p className="text-sm text-muted-foreground">
                  Your payment was successful! We're processing your subscription and updating your account.
                  This usually takes just a few seconds.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  You can start using the dashboard - your subscription will be activated automatically.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Status Refresh - Show for FREE plan users who may have just paid (but not in grace period) */}
      {user?.plan === 'free' && !inGracePeriod && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm">Subscription Status</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you just completed payment, click refresh to update your subscription status.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshSubscription}
                disabled={refreshing}
                className="flex-shrink-0"
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Status
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parses This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.parsesThisMonth || 0}
            </div>
            <p className="text-caption text-muted-foreground">
              of {user?.monthlyLimit === -1 ? '∞' : user?.monthlyLimit || 100000} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentJobs.filter(job => job.status === 'processing' || job.status === 'pending').length}
            </div>
            <p className="text-caption text-muted-foreground">
              Currently processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentJobs.filter(job => 
                job.status === 'completed' && 
                new Date(job.completedAt!).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-caption text-muted-foreground">
              Files processed
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Usage Progress */}
      {user && user.monthlyLimit !== -1 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Usage</CardTitle>
            <CardDescription>
              Your parsing usage for this billing period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgressBar
              value={user.parsesThisMonth}
              max={user.monthlyLimit}
              showLabel
              label={`Parses Used: ${user.parsesThisMonth} / ${user.monthlyLimit}`}
              dangerZone={80}
              size="sm"
            />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link to="/dashboard/upload">
              <Button className="w-full justify-start" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload New File
              </Button>
            </Link>
            <Link to="/dashboard/results">
              <Button className="w-full justify-start border border-info/20 hover:border-info/40" variant="secondary">
                <FileText className="mr-2 h-4 w-4" />
                View Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Your latest file processing jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentJobs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No jobs yet. Upload your first file to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-2 rounded border"
                    role="article"
                    aria-label={`Job ${job.filename}, ${job.status}`}
                  >
                    <div className="flex items-center gap-4">
                      <StatusIndicator
                        status={job.status as JobStatus}
                        mode="icon"
                        iconSize="sm"
                        animate
                      />
                      <div>
                        <p className="text-sm font-medium truncate max-w-32">
                          {job.filename}
                        </p>
                        <p className="text-caption text-muted-foreground">
                          {formatDate(job.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusIndicator
                      status={job.status as JobStatus}
                      mode="badge"
                    />
                  </div>
                ))}
                <Link to="/dashboard/processing">
                  <Button variant="ghost" size="sm" className="w-full">
                    View All Jobs
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}