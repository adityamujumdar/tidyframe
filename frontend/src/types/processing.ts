export interface ProcessingJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filename: string;
  originalFilename?: string;
  fileSize?: number;
  createdAt: string;
  created_at?: string;
  startedAt?: string;
  started_at?: string;
  completedAt?: string;
  completed_at?: string;
  updated_at?: string;
  expiresAt?: string;
  expires_at?: string;
  estimatedCompletionTime?: number;
  estimated_time_remaining?: number;
  
  // Results (when completed)
  totalRows?: number;
  total_names?: number;
  processedRows?: number;
  processed_names?: number;
  successfulParses?: number;
  failedParses?: number;
  successRate?: number;
  
  // Quality metrics from backend
  geminiSuccessCount?: number;
  fallbackUsageCount?: number;
  lowConfidenceCount?: number;
  warningCount?: number;
  qualityScore?: number;
  
  // Analytics (when completed)
  analytics?: {
    entity_stats?: {
      person_count: number;
      company_count: number;
      trust_count: number;
      unknown_count: number;
      error_count: number;
    };
    avg_confidence?: number;
    high_confidence_count?: number;
    medium_confidence_count?: number;
    low_confidence_count?: number;
    successRate?: number;
    processing_statistics?: {
      average_processing_time?: number;
      total_processing_time?: number;
      names_per_second?: number;
      peak_memory_usage?: number;
    };
  };
  
  stats?: {
    entity_stats?: {
      person_count: number;
      company_count: number;
      trust_count: number;
      unknown_count: number;
      error_count: number;
    };
    avg_confidence?: number;
    high_confidence_count?: number;
    medium_confidence_count?: number;
    low_confidence_count?: number;
    success_rate?: number;
    total_processed?: number;
    processing_statistics?: {
      average_processing_time?: number;
      total_processing_time?: number;
      names_per_second?: number;
      peak_memory_usage?: number;
    };
  };
  
  result?: any;
  user_id?: string;
  file_id?: string;
  
  // Error info (when failed)
  errorMessage?: string;
  error?: string;
}

export interface ParseResult {
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  entityType: 'person' | 'company' | 'trust' | 'unknown';
  gender?: 'male' | 'female' | 'unknown';
  genderConfidence?: number;
  parsingConfidence: number;
  originalText: string;
  warnings: string[];
  // Optional: Parsing method indicators for fallback detection
  parsingMethod?: 'gemini' | 'fallback' | 'regex';
  fallbackReason?: string;
  apiCallSuccess?: boolean;
}

export interface FileUploadResponse {
  job_id: string;
  message: string;
  estimated_processing_time?: number;
}

// JobStatusResponse is just an alias for ProcessingJob since backend returns job status directly
export type JobStatusResponse = ProcessingJob;

export interface JobListResponse {
  jobs: ProcessingJob[];
  total: number;
  page: number;
  page_size: number;
}

export interface UsageStats {
  parsesThisMonth: number;
  monthlyLimit: number;
  remainingParses: number;
  usagePercentage: number;
  daysUntilReset: number;
}