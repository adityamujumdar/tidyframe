import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/contexts/AuthContext';
import { processingService } from '@/services/processingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload,
  FileSpreadsheet,
  AlertCircle,
  X,
  Info,
  Download,
  Users,
  Crown,
  Zap,
  Building,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { generateSampleCSV, downloadCSVFile, validateCSVHeaders } from '@/utils/csvUtils';

interface FileWithPreview extends File {
  preview?: string;
}


interface UniversalFileUploadProps {
  showTitle?: boolean;
  compact?: boolean;
  onUploadSuccess?: (jobId: string) => void;
}

export default function UniversalFileUpload({ 
  showTitle = true, 
  compact = false,
  onUploadSuccess 
}: UniversalFileUploadProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [columnName, setColumnName] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Determine user plan and limits
  const getUserLimits = () => {
    if (!user) {
      // Anonymous user
      return {
        maxFileSize: 1 * 1024 * 1024, // 1MB
        maxParses: 5,
        planName: 'Anonymous Trial',
        planIcon: Info,
        planColor: 'bg-gray-500',
        currentUsage: 0
      };
    }

    switch (user.plan) {
      case 'enterprise':
        return {
          maxFileSize: 200 * 1024 * 1024, // 200MB
          maxParses: 10000000, // 10M
          planName: 'Enterprise',
          planIcon: Building,
          planColor: 'bg-purple-500',
          currentUsage: user.parsesThisMonth || 0
        };
      case 'standard':
      default:
        return {
          maxFileSize: 50 * 1024 * 1024, // 50MB
          maxParses: 100000, // 100k
          planName: 'Standard',
          planIcon: Crown,
          planColor: 'bg-blue-500',
          currentUsage: user.parsesThisMonth || 0
        };
    }
  };

  const limits = getUserLimits();
  const PlanIcon = limits.planIcon;

  const acceptedTypes = {
    'text/csv': ['.csv'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-excel': ['.xls'],
    'text/plain': ['.txt']
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError(`File is too large. Maximum size is ${limits.maxFileSize / (1024 * 1024)}MB for ${limits.planName} plan.`);
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setError('Invalid file type. Please upload CSV, Excel, or TXT files.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // For CSV files, validate column structure
      if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
        const validationError = await validateFileColumns(file);
        if (validationError) {
          setError(validationError);
          return;
        }
      }
      
      setFiles([Object.assign(file, {
        preview: URL.createObjectURL(file)
      })]);
    }
  }, [limits.maxFileSize, limits.planName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes,
    maxSize: limits.maxFileSize,
    maxFiles: 1,
    multiple: false
  });

  const removeFile = () => {
    setFiles([]);
    setError('');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select a file to upload');
      return;
    }

    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      const response = await processingService.uploadFile(
        file,
        (progressEvent) => {
          setUploadProgress(progressEvent.percentage || 0);
        },
        columnName ? { primary_name_column: columnName } : undefined
      );

      toast.success('File uploaded successfully! Processing started.');
      
      // Call onUploadSuccess callback or navigate
      if (onUploadSuccess) {
        onUploadSuccess(response.job_id);
      } else if (user) {
        // Navigate to dashboard for authenticated users
        navigate(`/dashboard/processing?jobId=${response.job_id}`);
      } else {
        // For anonymous users, show a different flow or message
        toast.info('Processing started! You can check the status or sign up for more features.');
        // Could navigate to a public status page or show inline results
      }
    } catch (err: unknown) {
      const error = err as Error & { response?: { data?: { message?: string }; status?: number } };
      const errorMsg = error.response?.data?.message || 'Upload failed. Please try again.';
      setError(errorMsg);
      
      // Handle quota exceeded specifically
      if (error.response?.status === 403) {
        if (!user) {
          toast.error('Anonymous limit reached. Sign up for more capacity!');
        } else {
          toast.error('Monthly quota exceeded. Upgrade your plan for more capacity.');
        }
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadSampleTemplate = () => {
    const csvContent = generateSampleCSV(true);
    downloadCSVFile(csvContent, 'sample_template.csv');
    toast.success('Sample template downloaded successfully!');
  };

  const validateFileColumns = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const validation = validateCSVHeaders(text);
        
        if (!validation.isValid) {
          const detectedHeaders = validation.detectedHeaders?.join(', ') || 'none detected';
          resolve(
            `${validation.message}\n\nDetected headers: ${detectedHeaders}\nRequired: One of: 'names', 'addressee', or 'process addressee'`
          );
        } else {
          resolve(null); // No error
        }
      };
      
      reader.onerror = () => {
        resolve('Unable to read file. Please try again.');
      };
      
      // Only read first 1024 characters to check headers
      const blob = file.slice(0, 1024);
      reader.readAsText(blob);
    });
  };

  const getRemainingParses = () => {
    if (!user) return limits.maxParses; // Anonymous users get full trial
    return Math.max(0, limits.maxParses - limits.currentUsage);
  };

  const getUsagePercentage = () => {
    if (!user) return 0; // Anonymous users start at 0%
    return Math.min(100, (limits.currentUsage / limits.maxParses) * 100);
  };

  return (
    <div className={`space-y-6 ${compact ? 'space-y-4' : ''}`}>
      {showTitle && (
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload CSV, Excel, or text files for AI-powered name parsing
          </p>
        </div>
      )}

      {/* Plan Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 ${limits.planColor} rounded-lg flex items-center justify-center`}>
                <PlanIcon className="h-4 w-4 text-white" />
              </div>
              <span>{limits.planName} Plan</span>
            </div>
            {!user && (
              <Badge variant="secondary" className="text-xs">
                Try Free
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="font-medium">File Size Limit</h4>
            <p className="text-sm text-muted-foreground">
              Up to {limits.maxFileSize / (1024 * 1024)}MB per file
            </p>
          </div>
          <div>
            <h4 className="font-medium">Monthly Parses</h4>
            <p className="text-sm text-muted-foreground">
              {user 
                ? `${limits.currentUsage.toLocaleString()} / ${limits.maxParses === 10000000 ? '∞' : limits.maxParses.toLocaleString()}`
                : `${limits.maxParses} trial parses`
              }
            </p>
            {user && (
              <div className="mt-1">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all" 
                    style={{ width: `${getUsagePercentage()}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <div>
            <h4 className="font-medium">Remaining</h4>
            <p className="text-sm text-muted-foreground">
              {getRemainingParses().toLocaleString()} parses left
            </p>
            {!user && (
              <p className="text-xs text-blue-600 mt-1">
                Sign up for 100,000/month!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {!compact && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              File Requirements
            </CardTitle>
            <CardDescription>
              Your file must contain names or addressees for processing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
              <AlertCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <AlertDescription>
                <div className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-2">Required Column Name</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Your file must have a column named one of the following:
                </div>
                <ul className="mt-2 ml-4 list-none space-y-1">
                  <li className="text-sm">• <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono text-xs">names</code></li>
                  <li className="text-sm">• <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono text-xs">addressee</code></li>
                  <li className="text-sm">• <code className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300 font-mono text-xs">process addressee</code></li>
                </ul>
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-500">
                  Note: If multiple matching columns exist, only the first will be used.
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Supported Formats:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• CSV files (.csv)</li>
                  <li>• Excel files (.xlsx, .xls)</li>
                  <li>• Text files (.txt)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Example Data:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>John Smith</div>
                  <div>Jane Doe</div>
                  <div>ABC Corporation</div>
                  <div>XYZ Trust</div>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadSampleTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Sample Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* File Upload Area */}
      <Card>
        <CardHeader className={compact ? 'pb-3' : ''}>
          <CardTitle className={compact ? 'text-lg' : ''}>
            {compact ? 'Try tidyframe.com' : 'Select File'}
          </CardTitle>
          <CardDescription>
            {compact 
              ? `Drop your file here for instant AI name parsing (${!user ? `${limits.maxParses} free anonymous parses` : 'based on your plan'})`
              : 'Drop your file here or click to browse'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-300
              ${compact ? 'p-6' : 'p-8'}
              ${isDragActive 
                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 scale-[1.02] shadow-lg border-opacity-80' 
                : 'border-muted-foreground/30 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-blue-950/20 dark:hover:to-purple-950/20 hover:shadow-md'
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <Upload className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} transition-colors ${isDragActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-blue-500'}`} />
              {isDragActive ? (
                <p className={compact ? 'text-base' : 'text-lg'}>Drop the file here...</p>
              ) : (
                <div>
                  <p className={`${compact ? 'text-base' : 'text-lg'} font-medium`}>
                    Drag and drop your file here, or click to select
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supports CSV, Excel, and TXT files up to {limits.maxFileSize / (1024 * 1024)}MB
                  </p>
                  {compact && !user && (
                    <p className="text-xs text-blue-600 mt-2">
                      🚀 No signup required • Process {limits.maxParses} names free
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Preview */}
          {files.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-medium">Selected File</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Column Settings */}
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full flex items-center gap-2"
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                  Column Settings (Optional)
                </Button>
                
                {showAdvancedOptions && (
                  <Card className="border-dashed">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Custom Column Name</CardTitle>
                      <CardDescription className="text-xs">
                        Specify the column that contains names to process. Leave blank to use default detection.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="column-name" className="text-sm">Column Name</Label>
                      <Input
                        id="column-name"
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                        placeholder="e.g., names, addressee, full_name..."
                        className="mt-1"
                        disabled={uploading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Default detection looks for: 'names', 'addressee', or 'process addressee'
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className="flex-1"
                  size={compact ? "default" : "lg"}
                  variant="prominent"
                >
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-pulse" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      {compact ? 'Process Names' : 'Start AI Processing'}
                    </>
                  )}
                </Button>
                {!compact && (
                  <Button
                    variant="outline"
                    onClick={removeFile}
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}