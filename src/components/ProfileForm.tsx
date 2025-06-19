
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { WorkingHoursSelector, type WorkingHours } from "./WorkingHoursSelector";
import { useTranslation } from "react-i18next";

type Profile = Tables<'profiles'>;

const ProfileForm = ({ profile }: { profile: Profile }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessOperatingHours, setBusinessOperatingHours] = useState<Partial<WorkingHours> | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBusinessName(profile.business_name || "");
      setBusinessAddress(profile.business_address || "");
      setBusinessPhone(profile.business_phone || "");
      setBusinessDescription(profile.business_description || "");
      setBusinessOperatingHours(profile.business_operating_hours as Partial<WorkingHours> | null);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");
      const { error } = await supabase.from('profiles').update(updatedProfile).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({ title: t('profile.profile_updated') });
    },
    onError: (error) => {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      full_name: fullName,
      business_name: businessName,
      business_address: businessAddress,
      business_phone: businessPhone,
      business_description: businessDescription,
      business_operating_hours: businessOperatingHours,
      updated_at: new Date().toISOString(),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.title')}</CardTitle>
        <CardDescription>{t('profile.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="fullName">{t('profile.owner_full_name')}</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="businessName">{t('profile.business_name')}</Label>
              <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="businessPhone">{t('profile.business_phone')}</Label>
              <Input id="businessPhone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="businessAddress">{t('profile.business_address')}</Label>
              <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="businessDescription">{t('profile.business_description')}</Label>
            <Textarea id="businessDescription" value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('profile.business_operating_hours')}</Label>
            <WorkingHoursSelector value={businessOperatingHours} onChange={setBusinessOperatingHours as (value: WorkingHours) => void} />
          </div>
          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? t('profile.saving') : t('profile.save_changes')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
