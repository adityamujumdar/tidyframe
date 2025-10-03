import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Brain,
  Zap,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { ParseResult, ProcessingJob } from '@/types/processing';
import { 
  calculateQualityMetrics, 
  getQualityRecommendations, 
  shouldShowQualityAlert,
  QualityMetrics 
} from '@/utils/warningHelpers';

// Helper function to extract quality metrics from job analytics data
function getMetricsFromJob(job: ProcessingJob): QualityMetrics {
  const totalRows = job.totalRows || job.processedRows || 0;
  const geminiSuccessCount = job.geminiSuccessCount || 0;
  const fallbackUsageCount = job.fallbackUsageCount || 0;
  const lowConfidenceCount = job.lowConfidenceCount || 0;
  const qualityScore = typeof job.qualityScore === 'number' ? job.qualityScore * 100 : 0;
  
  // Get analytics from analytics field 
  const analytics = job.analytics || job.stats || {};
  const avgConfidence = analytics.avg_confidence || 0;
  const successRate = (analytics as any).success_rate ? (analytics as any).success_rate / 100 : 1;
  
  return {
    totalRows,
    geminiSuccessCount,
    fallbackCount: fallbackUsageCount,
    lowConfidenceCount,
    successRate,
    fallbackUsagePercentage: totalRows > 0 ? fallbackUsageCount / totalRows : 0,
    avgConfidence,
    qualityScore: Math.round(qualityScore)
  };
}

interface QualityMetricsPanelProps {
  results: ParseResult[];
  job?: ProcessingJob;
  className?: string;
}

export default function QualityMetricsPanel({ results, job, className = '' }: QualityMetricsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use job analytics data if available, otherwise calculate from results
  const metrics = job && job.analytics ? 
    getMetricsFromJob(job) : 
    calculateQualityMetrics(results);
  const recommendations = getQualityRecommendations(metrics);
  const alertInfo = shouldShowQualityAlert(metrics);

  if (results.length === 0) {
    return null;
  }

  const getQualityScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getQualityScoreIcon = (score: number) => {
    if (score >= 85) return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quality Alert */}
      {alertInfo.show && (
        <Alert variant={alertInfo.severity === 'error' ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{alertInfo.message}</AlertDescription>
        </Alert>
      )}

      {/* Main Quality Metrics Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Data Quality Report
              </CardTitle>
              <CardDescription>
                Parsing quality and method analysis for {metrics.totalRows.toLocaleString()} processed rows
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Quality Score */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              {getQualityScoreIcon(metrics.qualityScore)}
              <div>
                <p className="font-semibold">Overall Quality Score</p>
                <p className="text-sm text-muted-foreground">Combined parsing quality rating</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getQualityScoreColor(metrics.qualityScore)}`}>
                {metrics.qualityScore}%
              </p>
              <Badge variant={metrics.qualityScore >= 85 ? 'default' : metrics.qualityScore >= 70 ? 'secondary' : 'destructive'}>
                {metrics.qualityScore >= 85 ? 'Excellent' : metrics.qualityScore >= 70 ? 'Good' : 'Needs Review'}
              </Badge>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Gemini API Usage */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.geminiSuccessCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">AI Parsed</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                {Math.round((metrics.geminiSuccessCount / metrics.totalRows) * 100)}%
              </p>
            </div>

            {/* Fallback Usage */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.fallbackCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Fallback Used</p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                {Math.round(metrics.fallbackUsagePercentage * 100)}%
              </p>
            </div>

            {/* High Quality Results */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(metrics.totalRows - metrics.lowConfidenceCount).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">High Quality</p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {Math.round(metrics.successRate * 100)}%
              </p>
            </div>

            {/* Low Confidence Warnings */}
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {metrics.lowConfidenceCount.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Low Confidence</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {Math.round((metrics.lowConfidenceCount / metrics.totalRows) * 100)}%
              </p>
            </div>
          </div>

          {/* Average Confidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Average Confidence Score
              </span>
              <span className={`font-bold ${getQualityScoreColor(metrics.avgConfidence * 100)}`}>
                {Math.round(metrics.avgConfidence * 100)}%
              </span>
            </div>
            <Progress 
              value={metrics.avgConfidence * 100} 
              className="h-2"
            />
          </div>

          {/* Expanded Details */}
          {isExpanded && (
            <div className="space-y-4 border-t pt-4">
              {/* API Usage Breakdown */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  API Usage Breakdown
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Gemini API Success:</span>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                      {Math.round((metrics.geminiSuccessCount / metrics.totalRows) * 100)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Fallback Usage:</span>
                    <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30">
                      {Math.round(metrics.fallbackUsagePercentage * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Cost Analysis</h4>
                <p className="text-xs text-muted-foreground">
                  Fallback parsing saved approximately{' '}
                  <span className="font-medium text-green-600 dark:text-green-400">
                    ${(metrics.fallbackCount * 0.001).toFixed(3)}
                  </span>{' '}
                  in API costs ({metrics.fallbackCount} API calls avoided)
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <p>{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}