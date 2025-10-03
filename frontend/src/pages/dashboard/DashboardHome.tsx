import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Activity, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ProcessingJob, UsageStats } from '@/types/processing';

export default function DashboardHome() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState<ProcessingJob[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [jobs, usage] = await Promise.all([
          processingService.getJobs().catch(err => {
            console.log('Jobs endpoint not available yet, using empty array');
            return [];
          }),
          processingService.getUserUsage().catch(err => {
            console.log('Usage endpoint not available yet, using defaults');
            return {
              parses_this_month: user?.parsesThisMonth || 0,
              monthly_limit: user?.monthlyLimit || 100000,
              remaining_parses: user?.monthlyLimit ? (user.monthlyLimit - (user.parsesThisMonth || 0)) : 100000,
              usage_percentage: user?.monthlyLimit ? ((user.parsesThisMonth || 0) / user.monthlyLimit) * 100 : 0,
              days_until_reset: 30
            };
          })
        ]);
        
        setRecentJobs(Array.isArray(jobs) ? jobs.slice(0, 5) : []); // Show only recent 5 jobs
        // Convert backend snake_case to frontend camelCase for UsageStats
        setUsageStats({
            parsesThisMonth: (usage as any)?.parses_this_month || user?.parsesThisMonth || 0,
            monthlyLimit: (usage as any)?.monthly_limit || user?.monthlyLimit || 100000,
            remainingParses: (usage as any)?.remaining_parses || (user?.monthlyLimit ? (user.monthlyLimit - (user.parsesThisMonth || 0)) : 100000),
            usagePercentage: (usage as any)?.usage_percentage || (user?.monthlyLimit ? ((user.parsesThisMonth || 0) / user.monthlyLimit) * 100 : 0),
            daysUntilReset: (usage as any)?.days_until_reset || 30
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data instead of showing errors
        setRecentJobs([]);
        setUsageStats({
          parsesThisMonth: user?.parsesThisMonth || 0,
          monthlyLimit: user?.monthlyLimit || 100000,
          remainingParses: user?.monthlyLimit ? (user.monthlyLimit - (user.parsesThisMonth || 0)) : 100000,
          usagePercentage: user?.monthlyLimit ? ((user.parsesThisMonth || 0) / user.monthlyLimit) * 100 : 0,
          daysUntilReset: 30
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const usagePercentage = user && user.monthlyLimit > 0
    ? (user.parsesThisMonth / user.monthlyLimit) * 100 
    : 0;

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
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back{user?.fullName ? `, ${user.fullName}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your name parsing projects today.
        </p>
      </div>

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
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Parses Used</span>
                <span>{user.parsesThisMonth} / {user.monthlyLimit}</span>
              </div>
              <Progress value={usagePercentage} className="h-2" />
            </div>
            {usagePercentage > 80 && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>You're approaching your monthly limit</span>
              </div>
            )}
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
              <Button className="w-full justify-start border border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600" variant="secondary">
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
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="text-sm font-medium truncate max-w-32">
                          {job.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(job.status)}>
                      {job.status}
                    </Badge>
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