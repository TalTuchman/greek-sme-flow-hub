
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Upload, FileUp, Import } from 'lucide-react';
import { MigrationWizard } from './migration/MigrationWizard';
import { useTranslation } from 'react-i18next';

interface MigrationToolProps {
  hasMinimalData: boolean;
}

export const MigrationTool: React.FC<MigrationToolProps> = ({ hasMinimalData }) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { t } = useTranslation();

  if (!hasMinimalData) {
    return null;
  }

  return (
    <>
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Import className="h-5 w-5 text-blue-600" />
            Import Your Business Data
          </CardTitle>
          <CardDescription>
            Get started quickly by importing your existing customers, services, and staff members from spreadsheets or CSV files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Start Data Import
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Download Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      <Sheet open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <SheetContent className="sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Import Business Data</SheetTitle>
            <SheetDescription>
              Import your existing customers, services, and staff members to get started quickly.
            </SheetDescription>
          </SheetHeader>
          <MigrationWizard onComplete={() => setIsWizardOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
};
