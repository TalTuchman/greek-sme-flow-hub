
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "@/components/ProfileForm";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useTranslation } from "react-i18next";
import { MigrationTool } from "@/components/MigrationTool";

const Index = () => {
  const { t } = useTranslation();
  
  const getProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user logged in");

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error;
    }
    return data;
  };

  const { data: profile, isLoading, error } = useQuery<Tables<'profiles'> | null>({
    queryKey: ['profile'],
    queryFn: getProfile
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return <DashboardLayout><div className="text-red-500 p-8">{t('dashboard.error_loading_profile', { message: error.message })}</div></DashboardLayout>;
  }
  
  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold">{t('dashboard.profile_error_title')}</h1>
        <p>{t('dashboard.profile_error_desc')}</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-xl font-semibold">{profile.full_name ? t('dashboard.welcome', { name: profile.full_name }) : t('dashboard.welcome_user')}!</h2>
        <p className="text-muted-foreground">{t('dashboard.description')}</p>
      </div>
      
      <div className="mb-8">
        <MigrationTool />
      </div>
      
      <ProfileForm profile={profile} />
    </DashboardLayout>
  );
};

export default Index;
