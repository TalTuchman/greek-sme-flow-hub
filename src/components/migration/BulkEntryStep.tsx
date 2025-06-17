
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { ImportData } from './MigrationWizard';
import { useTranslation } from 'react-i18next';

interface BulkEntryStepProps {
  onNext: (data: ImportData) => void;
  onBack: () => void;
}

export const BulkEntryStep: React.FC<BulkEntryStepProps> = ({ onNext, onBack }) => {
  const [customers, setCustomers] = useState([
    { full_name: '', email: '', phone: '', gender: '', notes: '' }
  ]);
  const [services, setServices] = useState([
    { name: '', description: '', price: '', duration: '' }
  ]);
  const [staff, setStaff] = useState([
    { full_name: '', email: '', phone: '' }
  ]);
  const { t } = useTranslation();

  const addRow = (type: 'customers' | 'services' | 'staff') => {
    if (type === 'customers') {
      setCustomers(prev => [...prev, { full_name: '', email: '', phone: '', gender: '', notes: '' }]);
    } else if (type === 'services') {
      setServices(prev => [...prev, { name: '', description: '', price: '', duration: '' }]);
    } else {
      setStaff(prev => [...prev, { full_name: '', email: '', phone: '' }]);
    }
  };

  const removeRow = (type: 'customers' | 'services' | 'staff', index: number) => {
    if (type === 'customers') {
      setCustomers(prev => prev.filter((_, i) => i !== index));
    } else if (type === 'services') {
      setServices(prev => prev.filter((_, i) => i !== index));
    } else {
      setStaff(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateField = (type: 'customers' | 'services' | 'staff', index: number, field: string, value: string) => {
    if (type === 'customers') {
      setCustomers(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    } else if (type === 'services') {
      setServices(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    } else {
      setStaff(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
    }
  };

  const handleNext = () => {
    const importData: ImportData = {
      customers: customers.filter(c => c.full_name.trim()),
      services: services.filter(s => s.name.trim()),
      staff: staff.filter(s => s.full_name.trim())
    };
    onNext(importData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">{t('migration.bulk_entry_forms')}</h3>
        <p className="text-muted-foreground">{t('migration.bulk_entry_description')}</p>
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
              <CardTitle className="flex items-center justify-between">
                {t('migration.customers')}
                <Button size="sm" onClick={() => addRow('customers')}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('migration.add_row')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {customers.map((customer, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <Input
                      placeholder={t('migration.full_name_required')}
                      value={customer.full_name}
                      onChange={(e) => updateField('customers', index, 'full_name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder={t('migration.email')}
                      type="email"
                      value={customer.email}
                      onChange={(e) => updateField('customers', index, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={t('migration.phone')}
                      value={customer.phone}
                      onChange={(e) => updateField('customers', index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={t('migration.gender')}
                      value={customer.gender}
                      onChange={(e) => updateField('customers', index, 'gender', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow('customers', index)}
                      disabled={customers.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('migration.services')}
                <Button size="sm" onClick={() => addRow('services')}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('migration.add_row')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-3">
                    <Input
                      placeholder={t('migration.service_name_required')}
                      value={service.name}
                      onChange={(e) => updateField('services', index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder={t('migration.description')}
                      value={service.description}
                      onChange={(e) => updateField('services', index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={t('migration.price')}
                      type="number"
                      value={service.price}
                      onChange={(e) => updateField('services', index, 'price', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      placeholder={t('migration.duration_min')}
                      type="number"
                      value={service.duration}
                      onChange={(e) => updateField('services', index, 'duration', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow('services', index)}
                      disabled={services.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t('migration.staff_members')}
                <Button size="sm" onClick={() => addRow('staff')}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t('migration.add_row')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {staff.map((member, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4">
                    <Input
                      placeholder={t('migration.full_name_required')}
                      value={member.full_name}
                      onChange={(e) => updateField('staff', index, 'full_name', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      placeholder={t('migration.email')}
                      type="email"
                      value={member.email}
                      onChange={(e) => updateField('staff', index, 'email', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      placeholder={t('migration.phone')}
                      value={member.phone}
                      onChange={(e) => updateField('staff', index, 'phone', e.target.value)}
                    />
                  </div>
                  <div className="col-span-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRow('staff', index)}
                      disabled={staff.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          {t('migration.back')}
        </Button>
        <Button onClick={handleNext}>
          {t('migration.next')}
        </Button>
      </div>
    </div>
  );
};
