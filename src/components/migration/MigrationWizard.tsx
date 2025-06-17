
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileUp } from 'lucide-react';
import { CSVUploadStep } from './CSVUploadStep';
import { BulkEntryStep } from './BulkEntryStep';
import { ReviewStep } from './ReviewStep';
import { useTranslation } from 'react-i18next';

interface MigrationWizardProps {
  onComplete: () => void;
}

export type ImportData = {
  customers: any[];
  services: any[];
  staff: any[];
};

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'method' | 'import' | 'review'>('method');
  const [importMethod, setImportMethod] = useState<'csv' | 'bulk' | null>(null);
  const [importData, setImportData] = useState<ImportData>({
    customers: [],
    services: [],
    staff: []
  });
  const { t } = useTranslation();

  const handleMethodSelect = (method: 'csv' | 'bulk') => {
    setImportMethod(method);
    setCurrentStep('import');
  };

  const handleDataPrepared = (data: ImportData) => {
    setImportData(data);
    setCurrentStep('review');
  };

  const handleImportComplete = () => {
    onComplete();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'method':
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold mb-2">{t('migration.choose_method')}</h3>
              <p className="text-muted-foreground">{t('migration.method_question')}</p>
            </div>
            
            <div className="grid gap-4">
              <Card className="cursor-pointer hover:bg-accent" onClick={() => handleMethodSelect('csv')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    {t('migration.csv_upload')}
                  </CardTitle>
                  <CardDescription>
                    {t('migration.csv_description')}
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:bg-accent" onClick={() => handleMethodSelect('bulk')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileUp className="h-5 w-5" />
                    {t('migration.bulk_entry')}
                  </CardTitle>
                  <CardDescription>
                    {t('migration.bulk_description')}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" onClick={onComplete}>
                {t('migration.skip_for_now')}
              </Button>
            </div>
          </div>
        );

      case 'import':
        if (importMethod === 'csv') {
          return <CSVUploadStep onNext={handleDataPrepared} onBack={() => setCurrentStep('method')} />;
        } else {
          return <BulkEntryStep onNext={handleDataPrepared} onBack={() => setCurrentStep('method')} />;
        }

      case 'review':
        return (
          <ReviewStep 
            importData={importData} 
            onComplete={handleImportComplete}
            onBack={() => setCurrentStep('import')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-6">
      {renderStep()}
    </div>
  );
};
