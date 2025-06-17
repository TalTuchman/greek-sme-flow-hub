
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ImportData } from './MigrationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

interface ReviewStepProps {
  importData: ImportData;
  onComplete: () => void;
  onBack: () => void;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ importData, onComplete, onBack }) => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{
    customers: { success: number; errors: string[] };
    services: { success: number; errors: string[] };
    staff: { success: number; errors: string[] };
  } | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const results = {
        customers: { success: 0, errors: [] as string[] },
        services: { success: 0, errors: [] as string[] },
        staff: { success: 0, errors: [] as string[] }
      };

      // Import customers
      setProgress(10);
      for (const customer of importData.customers) {
        try {
          const { error } = await supabase
            .from('customers')
            .insert({
              profile_id: user.id,
              full_name: customer.full_name,
              email: customer.email || null,
              phone: customer.phone || null,
              gender: customer.gender || null,
              notes: customer.notes || null
            });

          if (error) {
            results.customers.errors.push(`${customer.full_name}: ${error.message}`);
          } else {
            results.customers.success++;
          }
        } catch (err) {
          results.customers.errors.push(`${customer.full_name}: ${(err as Error).message}`);
        }
      }

      setProgress(40);

      // Import services
      for (const service of importData.services) {
        try {
          const { error } = await supabase
            .from('services')
            .insert({
              profile_id: user.id,
              name: service.name,
              description: service.description || null,
              price: service.price ? parseFloat(service.price) : null,
              duration: service.duration ? parseInt(service.duration) : null
            });

          if (error) {
            results.services.errors.push(`${service.name}: ${error.message}`);
          } else {
            results.services.success++;
          }
        } catch (err) {
          results.services.errors.push(`${service.name}: ${(err as Error).message}`);
        }
      }

      setProgress(70);

      // Import staff
      for (const member of importData.staff) {
        try {
          const { error } = await supabase
            .from('staff_members')
            .insert({
              profile_id: user.id,
              full_name: member.full_name,
              email: member.email || null,
              phone: member.phone || null
            });

          if (error) {
            results.staff.errors.push(`${member.full_name}: ${error.message}`);
          } else {
            results.staff.success++;
          }
        } catch (err) {
          results.staff.errors.push(`${member.full_name}: ${(err as Error).message}`);
        }
      }

      setProgress(100);
      setResults(results);

      const totalSuccess = results.customers.success + results.services.success + results.staff.success;
      const totalErrors = results.customers.errors.length + results.services.errors.length + results.staff.errors.length;

      toast({
        title: t('migration.import_complete_toast'),
        description: t('migration.import_success_toast', { success: totalSuccess, errors: totalErrors }),
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: t('migration.import_failed'),
        description: t('migration.import_error_desc'),
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  if (results) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('migration.import_complete')}</h3>
          <p className="text-muted-foreground">{t('migration.import_success_desc')}</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.import_summary')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>{t('migration.customers')}:</span>
                <span className="text-green-600">{t('migration.customers_imported', { count: results.customers.success })}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('migration.services')}:</span>
                <span className="text-green-600">{t('migration.services_imported', { count: results.services.success })}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('migration.staff_members')}:</span>
                <span className="text-green-600">{t('migration.staff_imported', { count: results.staff.success })}</span>
              </div>
            </CardContent>
          </Card>

          {(results.customers.errors.length > 0 || results.services.errors.length > 0 || results.staff.errors.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  {t('migration.errors')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {results.customers.errors.map((error, index) => (
                    <div key={index} className="text-red-600">{t('migration.customer_error', { error })}</div>
                  ))}
                  {results.services.errors.map((error, index) => (
                    <div key={index} className="text-red-600">{t('migration.service_error', { error })}</div>
                  ))}
                  {results.staff.errors.map((error, index) => (
                    <div key={index} className="text-red-600">{t('migration.staff_error', { error })}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center">
          <Button onClick={onComplete}>
            {t('migration.continue_to_dashboard')}
          </Button>
        </div>
      </div>
    );
  }

  if (importing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{t('migration.importing_data')}</h3>
          <p className="text-muted-foreground">{t('migration.please_wait')}</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">{t('migration.percent_complete', { percent: progress })}</p>
        </div>
      </div>
    );
  }

  const totalRecords = importData.customers.length + importData.services.length + importData.staff.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t('migration.review_import_data')}</h3>
        <p className="text-muted-foreground">
          {t('migration.ready_to_import', { count: totalRecords })}
        </p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">
            {t('migration.customers')} ({importData.customers.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            {t('migration.services')} ({importData.services.length})
          </TabsTrigger>
          <TabsTrigger value="staff">
            {t('migration.staff_members')} ({importData.staff.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.customers_to_import')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importData.customers.map((customer, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{customer.full_name}</span>
                    <span className="text-muted-foreground">{customer.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.services_to_import')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importData.services.map((service, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">
                      {service.price ? `$${service.price}` : t('migration.no_price')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle>{t('migration.staff_to_import')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importData.staff.map((member, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{member.full_name}</span>
                    <span className="text-muted-foreground">{member.email}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('migration.back')}
        </Button>
        <Button 
          onClick={handleImport}
          disabled={totalRecords === 0}
        >
          {t('migration.import_records', { count: totalRecords })}
        </Button>
      </div>
    </div>
  );
};
