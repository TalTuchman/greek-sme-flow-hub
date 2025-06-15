
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AuthForm = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: t("auth.toast_signup_fail_title"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("auth.toast_signup_success_title"), description: t("auth.toast_signup_success_desc") });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("auth.toast_signin_fail_title"), description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">{t('auth.tab_signin')}</TabsTrigger>
        <TabsTrigger value="signup">{t('auth.tab_signup')}</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label htmlFor="email-signin">{t('auth.email_label')}</Label>
            <Input id="email-signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.email_placeholder')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password-signin">{t('auth.password_label')}</Label>
            <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signin_loading') : t('auth.signin_button')}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label htmlFor="fullname-signup">{t('auth.fullname_label')}</Label>
            <Input id="fullname-signup" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder={t('auth.fullname_placeholder')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email-signup">{t('auth.email_label')}</Label>
            <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder={t('auth.email_placeholder')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password-signup">{t('auth.password_label')}</Label>
            <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('auth.signup_loading') : t('auth.signup_button')}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
