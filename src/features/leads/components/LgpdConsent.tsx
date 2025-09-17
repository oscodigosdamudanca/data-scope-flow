import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface LgpdConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
}

const LgpdConsent: React.FC<LgpdConsentProps> = ({
  checked,
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-2 bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Shield className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">Consentimento LGPD</h4>
          <p className="text-sm text-gray-600 mt-1">
            Ao fornecer seus dados, você concorda com nossa política de privacidade e permite que entremos em contato para fins comerciais.
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Checkbox
              id="lgpd_consent"
              checked={checked}
              onCheckedChange={(checked) => onChange(!!checked)}
              disabled={disabled}
              className={error ? "border-red-500" : ""}
            />
            <Label
              htmlFor="lgpd_consent"
              className={`text-sm font-medium cursor-pointer ${error ? "text-red-500" : ""}`}
            >
              Concordo com os termos de consentimento LGPD
            </Label>
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LgpdConsent;