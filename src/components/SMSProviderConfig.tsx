
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { MessageSquare, Settings } from "lucide-react";

interface SMSProviderConfigProps {
  smsConfig: any;
  onConfigUpdate: (config: any) => void;
}

export const SMSProviderConfig = ({ smsConfig, onConfigUpdate }: SMSProviderConfigProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [senderName, setSenderName] = useState(smsConfig?.sender_name || "");
  const [isTestMode, setIsTestMode] = useState(smsConfig?.test_mode || false);

  const updateConfigMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");
      
      const { error } = await supabase
        .from('profiles')
        .update({
          sms_provider_config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: (_, config) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      onConfigUpdate(config);
      toast({
        title: "SMS Configuration Updated",
        description: "Your SMS provider settings have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    const config = {
      provider: 'smsapi',
      sender_name: senderName.substring(0, 11), // SMSAPI limit
      test_mode: isTestMode,
      configured_at: new Date().toISOString()
    };
    
    updateConfigMutation.mutate(config);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Provider Configuration
        </CardTitle>
        <CardDescription>
          Configure your SMSAPI settings for sending SMS campaigns. Make sure you have added your SMSAPI token in the project secrets.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="senderName">Sender Name</Label>
          <Input
            id="senderName"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Your Business"
            maxLength={11}
          />
          <p className="text-sm text-muted-foreground">
            Maximum 11 characters. This will appear as the SMS sender. Characters remaining: {11 - senderName.length}
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">SMSAPI Integration</p>
              <p className="text-blue-700">
                Using SMSAPI service for SMS delivery. Make sure your SMSAPI token is configured in the project secrets.
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={updateConfigMutation.isPending || !senderName.trim()}
          className="w-full"
        >
          {updateConfigMutation.isPending ? "Saving..." : "Save SMS Configuration"}
        </Button>
      </CardContent>
    </Card>
  );
};
