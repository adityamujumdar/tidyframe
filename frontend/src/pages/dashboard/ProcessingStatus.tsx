import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Download,
  FileText,
  Trash2,
  RefreshCw,
  AlertCircle,
  Brain,
  Zap,
  CheckCircle,
  Users,
  Building2,
  Scale
} from 'lucide-react';
import { ProcessingJob } from '@/types/processing';
import { toast } from 'sonner';
import CountdownTimer from '@/components/CountdownTimer';
import { StatusIndicator } from '@/components/shared/StatusIndicator';
import { MetricCard } from '@/components/shared/MetricCard';
import { ProgressBar } from '@/components/shared/ProgressBar';
import { formatDateTime, formatEstimate } from '@/utils/format';
import { calculatePercentage } from '@/utils/calculations';

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

  // Utility function for ETA calculation
  const getEstimatedTime = (job: ProcessingJob): string => {
    if (job.status !== 'processing') return '';

    const elapsed = Date.now() - new Date(job.createdAt).getTime();
    const estimatedTotal = (job.totalRows || 1000) * 50; // ~50ms per row estimate
    const remaining = Math.max(0, estimatedTotal - elapsed);

    return formatEstimate(remaining);
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
                <div className="space-y-4">
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
            <h3 className="text-xl font-semibold mb-2">No processing jobs</h3>
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
              role="article"
              aria-label={`Processing job for ${job.filename}, ${job.status}, ${job.progress}% complete`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <StatusIndicator
                      status={job.status as any}
                      mode="icon"
                      iconSize="lg"
                      animate
                    />
                    <div>
                      <CardTitle className="text-xl">{job.filename}</CardTitle>
                      <CardDescription>
                        Uploaded {formatDateTime(job.createdAt)}
                        {job.completedAt && job.status === 'completed' && (
                          <span> • Completed {formatDateTime(job.completedAt)}</span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <StatusIndicator
                    status={job.status as any}
                    mode="badge"
                  />
                </div>
                
                {/* File Expiration Countdown - shows for all jobs */}
                {(job.expiresAt || job.expires_at) && (
                  <div className="mt-4">
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
                {/* Progress Bar with ETA */}
                <ProgressBar
                  value={job.progress}
                  max={100}
                  showLabel
                  label={`Progress: ${job.progress}%${job.status === 'processing' ? ` • ${getEstimatedTime(job)}` : ''}`}
                  animated={job.status === 'processing'}
                  dangerZone={95}
                />

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
                    <p className="font-mono text-caption">{job.id.slice(0, 8)}...</p>
                  </div>
                </div>

                {/* Analytics Section for Completed Jobs */}
                {job.status === 'completed' && job.analytics && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-semibold mb-4">Entity Type Analytics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <MetricCard
                        value={job.analytics.entity_stats?.person_count || 0}
                        label="People"
                        variant="info"
                        icon={Users}
                      />
                      <MetricCard
                        value={job.analytics.entity_stats?.company_count || 0}
                        label="Companies"
                        variant="success"
                        icon={Building2}
                      />
                      <MetricCard
                        value={job.analytics.entity_stats?.trust_count || 0}
                        label="Trusts"
                        variant="default"
                        icon={Scale}
                      />
                      <MetricCard
                        value={job.analytics.entity_stats?.unknown_count || 0}
                        label="Unknown"
                        variant="warning"
                      />
                      <MetricCard
                        value={job.analytics.entity_stats?.error_count || 0}
                        label="Errors"
                        variant="error"
                      />
                    </div>
                    
                    {/* Quality & Method Analytics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <MetricCard
                        value={`${calculatePercentage(job.geminiSuccessCount, job.totalRows)}%`}
                        label="AI Success"
                        variant="info"
                        icon={Brain}
                        formatValue={false}
                      />
                      <MetricCard
                        value={`${calculatePercentage(job.fallbackUsageCount, job.totalRows)}%`}
                        label="Fallback Used"
                        variant="warning"
                        icon={Zap}
                        formatValue={false}
                      />
                      <MetricCard
                        value={job.analytics.high_confidence_count || 0}
                        label="High Quality"
                        variant="success"
                        icon={CheckCircle}
                      />
                      <MetricCard
                        value={job.analytics.avg_confidence
                          ? Math.round(job.analytics.avg_confidence * 100)
                          : 0}
                        label="Quality Score"
                        variant="info"
                      />
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
                      <Button variant="secondary" className="border border-primary-200 hover:border-primary-400">
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