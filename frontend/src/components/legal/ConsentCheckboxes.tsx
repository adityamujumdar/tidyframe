import { Link } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Scale, Shield } from 'lucide-react';

interface ConsentCheckboxesProps {
  ageVerified: boolean;
  onAgeVerifiedChange: (checked: boolean) => void;
  termsAccepted: boolean;
  onTermsAcceptedChange: (checked: boolean) => void;
  privacyAccepted: boolean;
  onPrivacyAcceptedChange: (checked: boolean) => void;
  arbitrationAcknowledged: boolean;
  onArbitrationAcknowledgedChange: (checked: boolean) => void;
  locationConfirmed: boolean;
  onLocationConfirmedChange: (checked: boolean) => void;
}

export default function ConsentCheckboxes({
  ageVerified,
  onAgeVerifiedChange,
  termsAccepted,
  onTermsAcceptedChange,
  privacyAccepted,
  onPrivacyAcceptedChange,
  arbitrationAcknowledged,
  onArbitrationAcknowledgedChange,
  locationConfirmed,
  onLocationConfirmedChange,
}: ConsentCheckboxesProps) {
  return (
    <div className="space-y-6">
      {/* Geographic Restriction Notice */}
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-red-800">
          <strong>US Users Only:</strong> This service is only available to users located in the United States. 
          Using VPNs or other location-masking tools will result in immediate account termination.
        </AlertDescription>
      </Alert>

      {/* Legal Compliance Checkboxes */}
      <div className="space-y-4">
        {/* Age Verification - REQUIRED BY LAW */}
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-yellow-50 border-yellow-200">
          <Checkbox
            id="age-verification"
            checked={ageVerified}
            onCheckedChange={onAgeVerifiedChange}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="age-verification"
              className="text-sm font-medium text-yellow-800 cursor-pointer"
            >
              ✓ I am at least 18 years of age
            </label>
            <p className="text-xs text-yellow-700 mt-1">
              Required by law. Users under 18 cannot create accounts.
            </p>
          </div>
        </div>

        {/* Location Confirmation - GEOGRAPHIC RESTRICTION */}
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-blue-50 border-blue-200">
          <Checkbox
            id="location-confirmation"
            checked={locationConfirmed}
            onCheckedChange={onLocationConfirmedChange}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="location-confirmation"
              className="text-sm font-medium text-blue-800 cursor-pointer"
            >
              ✓ I am located in the United States
            </label>
            <p className="text-xs text-blue-700 mt-1">
              This service is only available to US residents. VPN usage is prohibited.
            </p>
          </div>
        </div>

        {/* Arbitration Acknowledgment - MANDATORY DISCLOSURE */}
        <div className="flex items-start space-x-3 p-3 border rounded-lg bg-orange-50 border-orange-200">
          <Scale className="h-4 w-4 mt-1 text-orange-600" />
          <Checkbox
            id="arbitration-acknowledgment"
            checked={arbitrationAcknowledged}
            onCheckedChange={onArbitrationAcknowledgedChange}
            className="mt-1"
          />
          <div className="flex-1">
            <label
              htmlFor="arbitration-acknowledgment"
              className="text-sm font-medium text-orange-800 cursor-pointer"
            >
              ✓ I understand and agree to mandatory arbitration
            </label>
            <p className="text-xs text-orange-700 mt-1">
              <strong>Important:</strong> By agreeing, you waive your right to participate in class action lawsuits. 
              All disputes must be resolved through individual binding arbitration in Delaware.
            </p>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms-acceptance"
            checked={termsAccepted}
            onCheckedChange={onTermsAcceptedChange}
            className="mt-1"
          />
          <label
            htmlFor="terms-acceptance"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            I have read and agree to the{' '}
            <Link 
              to="/legal/terms-of-service" 
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Service
            </Link>
          </label>
        </div>

        {/* Privacy Policy */}
        <div className="flex items-start space-x-3">
          <Shield className="h-4 w-4 mt-1 text-green-600" />
          <Checkbox
            id="privacy-acceptance"
            checked={privacyAccepted}
            onCheckedChange={onPrivacyAcceptedChange}
            className="mt-1"
          />
          <label
            htmlFor="privacy-acceptance"
            className="text-sm text-muted-foreground cursor-pointer"
          >
            I have read and agree to the{' '}
            <Link 
              to="/legal/privacy-policy" 
              className="text-primary hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </Link>
            {' '}and consent to the processing of my personal data as described.
          </label>
        </div>
      </div>

      {/* Legal Notice */}
      <div className="text-xs text-muted-foreground p-3 bg-gray-50 rounded-lg">
        <p className="font-medium mb-1">Legal Notice:</p>
        <p>
          By registering, you acknowledge that TidyFrame AI, LLC is a Delaware company subject to US laws. 
          Your consent and account activity will be recorded with timestamps and IP addresses for legal compliance. 
          All data processing occurs within the United States.
        </p>
      </div>
    </div>
  );
}