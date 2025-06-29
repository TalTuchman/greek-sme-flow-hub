
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportData } from './MigrationWizard';
import { useTranslation } from 'react-i18next';

interface CSVUploadStepProps {
  onNext: (data: ImportData) => void;
  onBack: () => void;
}

export const CSVUploadStep: React.FC<CSVUploadStepProps> = ({ onNext, onBack }) => {
  const [files, setFiles] = useState<{
    customers?: File;
    services?: File;
    staff?: File;
  }>({});
  const [parsing, setParsing] = useState(false);
  const { t } = useTranslation();

  const handleFileChange = (type: 'customers' | 'services' | 'staff', file: File | null) => {
    setFiles(prev => ({
      ...prev,
      [type]: file || undefined
    }));
  };

  const parseCSV = async (file: File): Promise<any[]> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = values[index] || '';
            });
            return obj;
          });
        resolve(data);
      };
      reader.readAsText(file);
    });
  };

  const handleNext = async () => {
    setParsing(true);
    try {
      const importData: ImportData = {
        customers: files.customers ? await parseCSV(files.customers) : [],
        services: files.services ? await parseCSV(files.services) : [],
        staff: files.staff ? await parseCSV(files.staff) : []
      };
      onNext(importData);
    } catch (error) {
      console.error('Error parsing CSV files:', error);
    } finally {
      setParsing(false);
    }
  };

  const downloadTemplate = (type: 'customers' | 'services' | 'staff') => {
    const templates = {
      customers: 'full_name,email,phone,gender,notes\nJohn Doe,john@example.com,1234567890,male,Regular customer',
      services: 'name,description,price,duration\nHaircut,Professional haircut,25,45\nColor,Hair coloring,60,120',
      staff: 'full_name,email,phone\nJane Smith,jane@example.com,0987654321\nBob Johnson,bob@example.com,1122334455'
    };

    const blob = new Blob([templates[type]], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t('migration.upload_csv_files')}</h3>
        <p className="text-muted-foreground">{t('migration.upload_description')}</p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">{t('migration.customers')}</TabsTrigger>
          <TabsTrigger value="services">{t('migration.services')}</TabsTrigger>
          <TabsTrigger value="staff">{t('migration.staff_members')}</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.customers_csv')}</CardTitle>
              <CardDescription>
                {t('migration.customers_csv_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadTemplate('customers')}
                >
                  {t('migration.download_template')}
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange('customers', e.target.files?.[0] || null)}
              />
              {files.customers && (
                <p className="text-sm text-green-600">{t('migration.file_selected', { fileName: files.customers.name })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.services_csv')}</CardTitle>
              <CardDescription>
                {t('migration.services_csv_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadTemplate('services')}
                >
                  {t('migration.download_template')}
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange('services', e.target.files?.[0] || null)}
              />
              {files.services && (
                <p className="text-sm text-green-600">{t('migration.file_selected', { fileName: files.services.name })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.staff_csv')}</CardTitle>
              <CardDescription>
                {t('migration.staff_csv_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadTemplate('staff')}
                >
                  {t('migration.download_template')}
                </Button>
              </div>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileChange('staff', e.target.files?.[0] || null)}
              />
              {files.staff && (
                <p className="text-sm text-green-600">{t('migration.file_selected', { fileName: files.staff.name })}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('migration.back')}
        </Button>
        <Button 
          onClick={handleNext} 
          disabled={!Object.keys(files).length || parsing}
        >
          {parsing ? t('migration.processing') : t('migration.next')}
        </Button>
      </div>
    </div>
  );
};
