
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ImportData } from './MigrationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        title: "Import Complete",
        description: `Successfully imported ${totalSuccess} records with ${totalErrors} errors.`,
      });

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: "An error occurred during the import process.",
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
          <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
          <p className="text-muted-foreground">Your data has been imported successfully</p>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Customers:</span>
                <span className="text-green-600">{results.customers.success} imported</span>
              </div>
              <div className="flex justify-between">
                <span>Services:</span>
                <span className="text-green-600">{results.services.success} imported</span>
              </div>
              <div className="flex justify-between">
                <span>Staff:</span>
                <span className="text-green-600">{results.staff.success} imported</span>
              </div>
            </CardContent>
          </Card>

          {(results.customers.errors.length > 0 || results.services.errors.length > 0 || results.staff.errors.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {results.customers.errors.map((error, index) => (
                    <div key={index} className="text-red-600">Customer: {error}</div>
                  ))}
                  {results.services.errors.map((error, index) => (
                    <div key={index} className="text-red-600">Service: {error}</div>
                  ))}
                  {results.staff.errors.map((error, index) => (
                    <div key={index} className="text-red-600">Staff: {error}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-center">
          <Button onClick={onComplete}>
            Continue to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (importing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Importing Data...</h3>
          <p className="text-muted-foreground">Please wait while we import your data</p>
        </div>

        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
        </div>
      </div>
    );
  }

  const totalRecords = importData.customers.length + importData.services.length + importData.staff.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Review Import Data</h3>
        <p className="text-muted-foreground">
          Ready to import {totalRecords} records
        </p>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="customers">
            Customers ({importData.customers.length})
          </TabsTrigger>
          <TabsTrigger value="services">
            Services ({importData.services.length})
          </TabsTrigger>
          <TabsTrigger value="staff">
            Staff ({importData.staff.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers to Import</CardTitle>
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
              <CardTitle>Services to Import</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {importData.services.map((service, index) => (
                  <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">{service.name}</span>
                    <span className="text-muted-foreground">
                      {service.price ? `$${service.price}` : 'No price'}
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
              <CardTitle>Staff to Import</CardTitle>
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
          Back
        </Button>
        <Button 
          onClick={handleImport}
          disabled={totalRecords === 0}
        >
          Import {totalRecords} Records
        </Button>
      </div>
    </div>
  );
};
