import { ParseResult } from '@/types/processing';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  Zap, 
  User, 
  Building, 
  Shield, 
  FileText, 
  Users,
  Info,
  AlertCircle
} from 'lucide-react';
import { 
  getParsingMethod, 
  getParsingWarning, 
  getConfidenceColor, 
  getMethodColor, 
  getWarningColor, 
  formatFallbackReason 
} from '@/utils/warningHelpers';

interface ResultsTableProps {
  results: ParseResult[];
  searchTerm?: string;
  className?: string;
}

export default function ResultsTable({ results, searchTerm = '', className = '' }: ResultsTableProps) {
  // Filter results based on search term
  const filteredResults = results.filter(result =>
    result.originalText.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'person':
        return <User className="h-4 w-4" />;
      case 'company':
      case 'corporation':
      case 'business':
        return <Building className="h-4 w-4" />;
      case 'trust':
      case 'foundation':
        return <Shield className="h-4 w-4" />;
      case 'unknown':
        return <FileText className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getEntityBadgeVariant = (entityType: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (entityType?.toLowerCase()) {
      case 'person':
        return 'default';
      case 'company':
      case 'corporation':
      case 'business':
        return 'secondary';
      case 'trust':
      case 'foundation':
        return 'outline';
      case 'unknown':
        return 'destructive';
      default:
        return 'destructive';
    }
  };

  const getGenderDisplay = (gender: string | undefined, confidence?: number) => {
    if (!gender || gender === 'unknown') return '-';
    
    const displayGender = gender.charAt(0).toUpperCase() + gender.slice(1);
    
    return (
      <div className="flex items-center gap-2">
        <span>{displayGender}</span>
        {confidence && (
          <span className={`text-xs ${getConfidenceColor(confidence)}`}>
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>
    );
  };

  const renderParsingMethodBadge = (result: ParseResult) => {
    const method = getParsingMethod(result);
    const warning = getParsingWarning(result);
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1 ${getMethodColor(method)}`}
            >
              {method === 'gemini' ? (
                <Brain className="h-3 w-3" />
              ) : (
                <Zap className="h-3 w-3" />
              )}
              {method === 'gemini' ? 'AI' : 'Pattern'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-semibold mb-1">
                {method === 'gemini' ? 'Gemini AI Parsing' : 'Pattern-based Fallback'}
              </p>
              <p className="text-xs">
                {method === 'gemini' 
                  ? 'Processed using advanced AI for intelligent name parsing'
                  : 'Processed using rule-based pattern matching as fallback'
                }
              </p>
              {warning?.reason && (
                <p className="text-xs mt-1 text-muted-foreground">
                  {formatFallbackReason(warning.reason)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderWarningIndicator = (result: ParseResult) => {
    const warning = getParsingWarning(result);
    
    if (!warning) return null;

    const WarningIcon = warning.level === 'error' ? AlertCircle : 
                       warning.level === 'warning' ? AlertTriangle : 
                       Info;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <WarningIcon className={`h-4 w-4 ${getWarningColor(warning.level)}`} />
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className={`font-semibold mb-1 ${getWarningColor(warning.level)}`}>
                {warning.message}
              </p>
              {warning.reason && (
                <p className="text-xs text-muted-foreground">
                  {formatFallbackReason(warning.reason)}
                </p>
              )}
              {warning.confidence && (
                <p className="text-xs mt-1">
                  Confidence: {Math.round(warning.confidence * 100)}%
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderConfidenceScore = (result: ParseResult) => {
    const warning = getParsingWarning(result);
    
    return (
      <div className="flex items-center gap-2">
        <span className={getConfidenceColor(result.parsingConfidence)}>
          {Math.round(result.parsingConfidence * 100)}%
        </span>
        {warning && renderWarningIndicator(result)}
      </div>
    );
  };

  const displayResults = filteredResults.slice(0, 100);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Original Text</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Confidence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayResults.map((result, index) => (
              <TableRow 
                key={index}
                className={getParsingMethod(result) === 'fallback' ? 'bg-orange-50/30 dark:bg-orange-950/10' : ''}
              >
                <TableCell className="font-medium max-w-xs">
                  <div className="truncate" title={result.originalText}>
                    {result.originalText}
                  </div>
                </TableCell>
                <TableCell>{result.firstName || '-'}</TableCell>
                <TableCell>{result.lastName || '-'}</TableCell>
                <TableCell>
                  <Badge 
                    variant={getEntityBadgeVariant(result.entityType)}
                    className="flex items-center gap-1 w-fit"
                  >
                    {getEntityIcon(result.entityType)}
                    {result.entityType}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getGenderDisplay(result.gender, result.genderConfidence)}
                </TableCell>
                <TableCell>
                  {renderParsingMethodBadge(result)}
                </TableCell>
                <TableCell>
                  {renderConfidenceScore(result)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredResults.length > 100 && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t bg-muted/20">
            Showing first 100 results of {filteredResults.length.toLocaleString()} total. 
            Download the full file to see all results.
          </div>
        )}
        
        {filteredResults.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No results found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'No results match your search criteria' : 'No results available for this job'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}