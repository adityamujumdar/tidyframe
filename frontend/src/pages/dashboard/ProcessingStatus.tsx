import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { ProcessingJob } from '@/types/processing';
import { toast } from 'sonner';
import CountdownTimer from '@/components/CountdownTimer';

export default function ProcessingStatus() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const jobId = searchParams.get('jobId');

  const fetchJobs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(!silent);
    
    try {
      const fetchedJobs = await processingService.getJobs();
      setJobs(fetchedJobs);
      
      // If we have a specific job ID, scroll to it
      if (jobId && !silent) {
        setTimeout(() => {
          const element = document.getElementById(`job-${jobId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    } catch {
      toast.error('Failed to fetch job status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [jobId]);

  // Initial fetch and polling setup
  useEffect(() => {
    // Initial fetch
    fetchJobs();

    // Set up polling that checks job status
    const pollInterval = setInterval(async () => {
      try {
        const currentJobs = await processingService.getJobs();
        setJobs(currentJobs);
        
        // Only continue polling if there are active jobs
        const hasActiveJobs = currentJobs.some(job => 
          job.status === 'processing' || job.status === 'pending'
        );
        
        if (!hasActiveJobs && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch {
        // Silent fail for polling
      }
    }, 3000);

    intervalRef.current = pollInterval;

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const handleDownload = async (job: ProcessingJob) => {
    try {
      const blob = await processingService.downloadResults(job.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `processed_${job.filename}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('File downloaded successfully');
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDeleteJob = async (job: ProcessingJob) => {
    try {
      await processingService.deleteJob(job.id);
      setJobs(jobs.filter(j => j.id !== job.id));
      toast.success('Job deleted successfully');
    } catch {
      toast.error('Failed to delete job');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
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

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  };

  const getEstimatedTime = (job: ProcessingJob) => {
    if (job.status !== 'processing') return null;
    
    const elapsed = Date.now() - new Date(job.createdAt).getTime();
    const estimatedTotal = (job.totalRows || 1000) * 50; // ~50ms per row estimate
    const remaining = Math.max(0, estimatedTotal - elapsed);
    
    if (!isFinite(remaining) || remaining === 0) {
      return 'Processing...';
    }
    
    if (remaining < 60000) {
      return `~${Math.ceil(remaining / 1000)}s remaining`;
    } else {
      return `~${Math.ceil(remaining / 60000)}m remaining`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Processing Status</h1>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-6 bg-muted rounded w-full"></div>
                  <div className="h-2 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Processing Status</h1>
          <p className="text-muted-foreground">
            Monitor your file processing jobs and download results. All files are automatically deleted after 10 minutes.
          </p>
        </div>
        <Button 
          onClick={() => fetchJobs()}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No processing jobs</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first file to start processing names with AI
            </p>
            <Link to="/dashboard/upload">
              <Button>Upload File</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card 
              key={job.id} 
              id={`job-${job.id}`}
              className={jobId === job.id ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <CardTitle className="text-lg">{job.filename}</CardTitle>
                      <CardDescription>
                        Uploaded {formatDateTime(job.createdAt)}
                        {job.completedAt && job.status === 'completed' && (
                          <span> • Completed {formatDateTime(job.completedAt)}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(job.status)}>
                    {job.status}
                  </Badge>
                </div>
                
                {/* File Expiration Countdown - shows for all jobs */}
                {(job.expiresAt || job.expires_at) && (
                  <div className="mt-3">
                    <CountdownTimer 
                      expiresAt={job.expiresAt || job.expires_at || null}
                      className="w-full"
                      showIcon={true}
                      warningThreshold={2}
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} />
                  {job.status === 'processing' && (
                    <p className="text-xs text-muted-foreground">
                      {getEstimatedTime(job)}
                    </p>
                  )}
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Rows</p>
                    <p className="font-medium">{job.totalRows ? job.totalRows.toLocaleString() : (job.processedRows ? job.processedRows.toLocaleString() : 'Processing...')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium">
                      {job.status === 'completed' && (job.successRate !== undefined || (job.totalRows && job.successfulParses !== undefined))
                        ? `${job.successRate !== undefined ? Math.round(job.successRate) : Math.round((job.successfulParses || 0) / (job.totalRows || 1) * 100)}%`
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processed</p>
                    <p className="font-medium">
                      {job.processedRows ? job.processedRows.toLocaleString() : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Job ID</p>
                    <p className="font-mono text-xs">{job.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Analytics Section for Completed Jobs */}
                {job.status === 'completed' && job.analytics && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-3">Entity Type Analytics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div className="text-center p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg border border-blue-500/20">
                        <p className="text-2xl font-bold text-blue-500 dark:text-blue-400">
                          {job.analytics.entity_stats?.person_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">People</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg border border-emerald-500/20">
                        <p className="text-2xl font-bold text-emerald-500 dark:text-emerald-400">
                          {job.analytics.entity_stats?.company_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Companies</p>
                      </div>
                      <div className="text-center p-3 bg-violet-500/10 dark:bg-violet-400/10 rounded-lg border border-violet-500/20">
                        <p className="text-2xl font-bold text-violet-500 dark:text-violet-400">
                          {job.analytics.entity_stats?.trust_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Trusts</p>
                      </div>
                      <div className="text-center p-3 bg-amber-500/10 dark:bg-amber-400/10 rounded-lg border border-amber-500/20">
                        <p className="text-2xl font-bold text-amber-500 dark:text-amber-400">
                          {job.analytics.entity_stats?.unknown_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Unknown</p>
                      </div>
                      <div className="text-center p-3 bg-rose-500/10 dark:bg-rose-400/10 rounded-lg border border-rose-500/20">
                        <p className="text-2xl font-bold text-rose-500 dark:text-rose-400">
                          {job.analytics.entity_stats?.error_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Errors</p>
                      </div>
                    </div>
                    
                    {/* Quality & Method Analytics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                      <div className="text-center p-3 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg border border-blue-500/20">
                        <p className="text-xl font-bold text-blue-500 dark:text-blue-400">
                          {Math.min(100, Math.max(0, Math.round((job.geminiSuccessCount || 0) / Math.max(job.totalRows || 1, 1) * 100)))}%
                        </p>
                        <p className="text-xs text-muted-foreground">AI Success</p>
                      </div>
                      <div className="text-center p-3 bg-orange-500/10 dark:bg-orange-400/10 rounded-lg border border-orange-500/20">
                        <p className="text-xl font-bold text-orange-500 dark:text-orange-400">
                          {Math.min(100, Math.max(0, Math.round((job.fallbackUsageCount || 0) / Math.max(job.totalRows || 1, 1) * 100)))}%
                        </p>
                        <p className="text-xs text-muted-foreground">Fallback Used</p>
                      </div>
                      <div className="text-center p-3 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg border border-emerald-500/20">
                        <p className="text-xl font-bold text-emerald-500 dark:text-emerald-400">
                          {job.analytics.high_confidence_count || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">High Quality</p>
                      </div>
                      <div className="text-center p-3 bg-amber-500/10 dark:bg-amber-400/10 rounded-lg border border-amber-500/20">
                        <p className="text-xl font-bold text-amber-500 dark:text-amber-400">
                          {job.analytics.avg_confidence 
                            ? Math.round(job.analytics.avg_confidence * 100)
                            : 0}
                        </p>
                        <p className="text-xs text-muted-foreground">Quality Score</p>
                      </div>
                    </div>
                    
                    {/* Warning for high fallback usage */}
                    {job.analytics.low_confidence_count && job.totalRows && 
                     (job.analytics.low_confidence_count / job.totalRows) > 0.3 && (
                      <Alert className="mt-4" variant="default">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          High fallback usage detected ({Math.round((job.analytics.low_confidence_count / job.totalRows) * 100)}%). 
                          Consider checking the detailed results for quality concerns.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {job.status === 'failed' && job.errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{job.errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {job.status === 'completed' && (
                    <Button onClick={() => handleDownload(job)} variant="success" size="default">
                      <Download className="h-4 w-4 mr-2" />
                      Download Results
                    </Button>
                  )}
                  
                  {job.status === 'completed' && (
                    <Link to={`/dashboard/results?jobId=${job.id}`}>
                      <Button variant="secondary" className="border border-blue-200 hover:border-blue-400 dark:border-blue-800 dark:hover:border-blue-600">
                        <FileText className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                    </Link>
                  )}

                  {(job.status === 'failed' || job.status === 'completed') && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleDeleteJob(job)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}