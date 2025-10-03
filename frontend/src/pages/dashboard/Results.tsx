import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download,
  Search,
  Filter,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { ProcessingJob, ParseResult } from '@/types/processing';
import { toast } from 'sonner';
import QualityMetricsPanel from '@/components/QualityMetricsPanel';
import ResultsTable from '@/components/ResultsTable';
import CountdownTimer from '@/components/CountdownTimer';

export default function Results() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState<ProcessingJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
  const [results, setResults] = useState<ParseResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<ParseResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const jobId = searchParams.get('jobId');

  const fetchJobs = useCallback(async () => {
    try {
      const fetchedJobs = await processingService.getJobs();
      const completedJobs = fetchedJobs.filter(job => job.status === 'completed');
      setJobs(completedJobs);
      
      // Auto-select job if jobId in URL
      if (jobId) {
        const targetJob = completedJobs.find(job => job.id === jobId);
        if (targetJob) {
          setSelectedJob(targetJob);
        }
      } else if (completedJobs.length > 0) {
        setSelectedJob(completedJobs[0]);
      }
    } catch {
      toast.error('Failed to fetch completed jobs');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  const fetchJobResults = async (jobId: string) => {
    try {
      const resultsData = await processingService.getJobResults(jobId, 100);
      
      // Convert the raw results to ParseResult format
      const parsedResults: ParseResult[] = resultsData.results.map((result: any, index: number) => ({
        id: index.toString(),
        originalText: result.original_name_text || '',
        firstName: result.first_name || '',
        lastName: result.last_name || '',
        entityType: result.entity_type || 'unknown',
        parsingConfidence: result.parsing_confidence || 0,
        gender: result.gender || 'unknown',
        genderConfidence: result.gender_confidence || 0,
        parsingMethod: result.parsing_method || 'unknown',
        hasWarnings: result.has_warnings || false,
        warnings: result.warnings ? result.warnings.split(',') : [],
        geminiUsed: result.gemini_used || false,
        fallbackReason: result.fallback_reason || null
      }));
      
      setResults(parsedResults);
    } catch (error: any) {
      console.error('Failed to fetch job results:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 404) {
        toast.error('Results file has expired and been deleted. Please process the file again.');
      } else if (error?.response?.status === 400) {
        toast.error('Job is not completed yet or has failed processing.');
      } else {
        toast.error('Failed to fetch job results. The file may have expired.');
      }
      setResults([]);
    }
  };

  const filterResults = useCallback(() => {
    if (!searchTerm) {
      setFilteredResults(results);
      return;
    }

    const filtered = results.filter(result =>
      result.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResults(filtered);
  }, [results, searchTerm]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (selectedJob) {
      fetchJobResults(selectedJob.id);
    }
  }, [selectedJob]);

  useEffect(() => {
    filterResults();
  }, [filterResults]);

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


  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <div className="animate-pulse space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed jobs</h3>
            <p className="text-muted-foreground">
              Complete processing jobs will appear here for viewing and download
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="text-muted-foreground">
          View and download your processed file results
        </p>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Job</CardTitle>
          <CardDescription>Choose a completed job to view results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => {
              const isExpired = job.expiresAt && new Date(job.expiresAt) < new Date();
              const isExpiringSoon = job.expiresAt && 
                !isExpired && 
                new Date(job.expiresAt).getTime() - new Date().getTime() < 2 * 60 * 1000; // Less than 2 minutes
              
              return (
                <Button
                  key={job.id}
                  variant={selectedJob?.id === job.id ? 'default' : 'outline'}
                  className={`justify-start h-auto p-4 relative ${
                    isExpired ? 'opacity-50' : ''
                  }`}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className="text-left w-full">
                    <p className="font-medium truncate">{job.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(job.completedAt!).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {job.totalRows?.toLocaleString()} rows
                    </p>
                    {isExpired && (
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Expired</span>
                      </div>
                    )}
                    {!isExpired && isExpiringSoon && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Expiring soon</span>
                      </div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {selectedJob && (
        <Card>
          {/* Expiry Warning Banner */}
          {selectedJob.expiresAt && (
            <div className="border-b">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/10">
                <CountdownTimer 
                  expiresAt={selectedJob.expiresAt}
                  className="w-full"
                  showIcon={true}
                  warningThreshold={5}
                />
              </div>
            </div>
          )}
          
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedJob.filename}</CardTitle>
                <CardDescription>
                  Processing completed {new Date(selectedJob.completedAt!).toLocaleString()}
                </CardDescription>
              </div>
              <Button onClick={() => handleDownload(selectedJob)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search results..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Summary Statistics */}
            {results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {results.filter(r => r.entityType === 'person').length}
                  </p>
                  <p className="text-sm text-muted-foreground">People</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {results.filter(r => r.entityType === 'company').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Companies</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {results.filter(r => r.entityType === 'trust').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Trusts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">
                    {Math.round((results.reduce((sum, r) => sum + r.parsingConfidence, 0) / results.length) * 100)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Confidence</p>
                </div>
              </div>
            )}

            {/* Quality Metrics Panel */}
            <QualityMetricsPanel results={results} job={selectedJob} />

            {/* Results Table */}
            {results.length > 0 ? (
              <ResultsTable 
                results={results} 
                searchTerm={searchTerm}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results available for this job</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}