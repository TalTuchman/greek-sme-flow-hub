
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "@/components/ProfileForm";
import type { Tables } from "@/integrations/supabase/types";
import { DashboardLayout } from "@/components/DashboardLayout";

const Index = () => {
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
    return <DashboardLayout><div className="text-red-500 p-8">Error loading profile: {error.message}</div></DashboardLayout>;
  }
  
  if (!profile) {
    return (
      <DashboardLayout>
        <h1 className="text-2xl font-bold">Error</h1>
        <p>Could not load your profile. It might not have been created yet. Please try logging out and in again.</p>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h2 className="text-xl font-semibold">Welcome, {profile.full_name || 'User'}!</h2>
        <p className="text-muted-foreground">This is your business dashboard. You can manage your profile and customers.</p>
      </div>
      
      <ProfileForm profile={profile} />
    </DashboardLayout>
  );
};

export default Index;
