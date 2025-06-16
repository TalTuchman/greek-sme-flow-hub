
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessData = () => {
  const { data: businessData, isLoading } = useQuery({
    queryKey: ['business-data-summary'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [customersResult, servicesResult, staffResult] = await Promise.all([
        supabase.from('customers').select('id').eq('profile_id', user.id),
        supabase.from('services').select('id').eq('profile_id', user.id),
        supabase.from('staff_members').select('id').eq('profile_id', user.id)
      ]);

      return {
        customersCount: customersResult.data?.length || 0,
        servicesCount: servicesResult.data?.length || 0,
        staffCount: staffResult.data?.length || 0
      };
    }
  });

  const hasMinimalData = businessData 
    ? businessData.customersCount < 3 && businessData.servicesCount < 2 && businessData.staffCount < 1
    : false;

  return {
    businessData,
    hasMinimalData,
    isLoading
  };
};
