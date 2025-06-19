
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Clock, User } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookingValidationAlertProps {
  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    staff?: any;
    service?: any;
  } | null;
  isLoading: boolean;
}

export const BookingValidationAlert = ({ validation, isLoading }: BookingValidationAlertProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          {t('bookings.validation_checking', 'Checking availability...')}
        </AlertDescription>
      </Alert>
    );
  }

  if (!validation) return null;

  if (validation.errors.length > 0) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">{t('bookings.validation_errors', 'Booking validation errors:')}</p>
            <ul className="list-disc list-inside space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (validation.isValid) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="space-y-2">
            <p className="font-medium">{t('bookings.validation_success', 'Booking time is available!')}</p>
            {validation.warnings.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Notices:</p>
                <ul className="list-disc list-inside space-y-1">
                  {validation.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
