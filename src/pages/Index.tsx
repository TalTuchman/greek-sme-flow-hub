
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import ProfileForm from "@/components/ProfileForm";
import type { Tables } from "@/integrations/supabase/types";

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </header>
        <main>
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-8">Error loading profile: {error.message}</div>;
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold">Error</h1>
        <p>Could not load your profile. It might not have been created yet. Please try logging out and in again.</p>
        <Button onClick={handleLogout} className="mt-4">Logout</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">Logout</Button>
      </header>
      
      <main>
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Welcome, {profile.full_name || 'User'}!</h2>
          <p className="text-muted-foreground">This is your business dashboard. You can manage your profile below.</p>
        </div>
        
        <ProfileForm profile={profile} />
      </main>
    </div>
  );
};

export default Index;
