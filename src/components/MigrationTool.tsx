
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Upload, FileUp, Import } from 'lucide-react';
import { MigrationWizard } from './migration/MigrationWizard';
import { useTranslation } from 'react-i18next';

export const MigrationTool: React.FC = () => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { t } = useTranslation();

  const downloadAllTemplates = () => {
    const templates = {
      customers: 'full_name,email,phone,gender,notes\nJohn Doe,john@example.com,1234567890,male,Regular customer',
      services: 'name,description,price,duration\nHaircut,Professional haircut,25,45\nColor,Hair coloring,60,120',
      staff: 'full_name,email,phone\nJane Smith,jane@example.com,0987654321\nBob Johnson,bob@example.com,1122334455'
    };

    Object.entries(templates).forEach(([type, content]) => {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_template.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-blue-600" />
            {t('migration.title')}
          </CardTitle>
          <CardDescription>
            {t('migration.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('migration.start_import')}
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={downloadAllTemplates}>
              <FileUp className="h-4 w-4" />
              {t('migration.download_templates')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{t('migration.wizard_title')}</SheetTitle>
            <SheetDescription>
              {t('migration.wizard_description')}
            </SheetDescription>
          </SheetHeader>
          <MigrationWizard onComplete={() => setIsWizardOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};
