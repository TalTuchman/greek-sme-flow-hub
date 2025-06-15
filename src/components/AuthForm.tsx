
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const AuthForm = () => {
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
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email!", description: "A confirmation link has been sent to your email." });
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
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/");
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <form onSubmit={handleSignIn} className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label htmlFor="email-signin">Email</Label>
            <Input id="email-signin" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password-signin">Password</Label>
            <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </TabsContent>
      <TabsContent value="signup">
        <form onSubmit={handleSignUp} className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label htmlFor="fullname-signup">Full Name</Label>
            <Input id="fullname-signup" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your Name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email-signup">Email</Label>
            <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password-signup">Password</Label>
            <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
};

export default AuthForm;
