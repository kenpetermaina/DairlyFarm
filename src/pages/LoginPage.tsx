import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Beef } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import CowSlideshow from "@/components/CowSlideshow";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent! Check your email.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const name = email.split('@')[0];
        const res: any = await register({ name: name, email: email, password: password });
        if (res.status === "success") {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      } else {
        const res: any = await login({ email: email, password: password });
        if (res.status === "success") {
          toast.success(res.message);
          setTimeout(() => {
            navigate("/");
          }, 100);
        } else {
          toast.error(res.message);
          // console.log("Error: ", ero)
        }
      }
      // if (isSignUp) {
      //   const { error } = await supabase.auth.signUp({ email, password });
      //   if (error) throw error;
      //   toast.success("Account created! Check your email to verify.");
      // } else {
      //   const { error } = await supabase.auth.signInWithPassword({
      //     email,
      //     password,
      //   });
      //   if (error) throw error;
      //   toast.success("Welcome back!");
      // }
    } catch (err: any) {
      toast.error(err.message);
      console.log("Error: ", err.response.data || err.message)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative">
      <CowSlideshow />
      <Card className="w-full max-w-md relative z-20 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-primary rounded-full p-3">
              <Beef className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Godwin Dairy Farm</CardTitle>
          <p className="text-muted-foreground text-sm">{isForgot ? "Enter your email to reset your password" : isSignUp ? "Create your account" : "Sign in to your account"}</p>
        </CardHeader>
        <CardContent>
          {isForgot ? (
            <>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                <button className="text-primary underline" onClick={() => setIsForgot(false)}>Back to Sign In</button>
              </p>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-email"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember-email" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>
              <div className="text-center text-sm text-muted-foreground mt-4 space-y-2">
                {!isSignUp && (
                  <p><button className="text-primary underline" onClick={() => setIsForgot(true)}>Forgot password?</button></p>
                )}
                <p>
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button className="text-primary underline" onClick={() => setIsSignUp(!isSignUp)}>
                    {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
