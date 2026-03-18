import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, Chrome, Anchor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AuthPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const isConfirmed = searchParams.get("confirmed") === "true";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome Back! ⚓",
          description: "You are now signed in.",
        });
        navigate("/dashboard");
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google Login Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Social login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                {/* confirmation banner shown after email link click */}
                {isConfirmed && (
                  <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2 justify-center">
                    <span>✅</span>
                    <span><strong>Email confirmed!</strong> You can now sign in to your account.</span>
                  </div>
                )}
                <div className="w-16 h-16 bg-gradient-ocean rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Anchor className="text-primary-foreground" size={32} />
                </div>
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
                  {t('auth.signIn', 'Welcome Back')}
                </h1>
                <p className="text-muted-foreground">
                  {t('auth.signInSubtitle', 'Sign in to access your account')}
                </p>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                {/* Google Login */}
                <div className="mb-6">
                  <Button
                    variant="outline"
                    className="w-full h-12 font-medium"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                  >
                    <Chrome className="mr-2" size={20} />
                    {t('auth.continueGoogle', 'Continue with Google')}
                  </Button>
                </div>

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {t('auth.orEmail', 'or continue with email')}
                    </span>
                  </div>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">{t('auth.email', 'Email')}</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="captain@sea.com"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password">{t('auth.password', 'Password')}</Label>
                    <div className="relative mt-1">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pl-10"
                        required
                        minLength={6}
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-gradient-ocean font-semibold" disabled={loading}>
                    {loading ? (
                      <Loader2 className="animate-spin mr-2" size={20} />
                    ) : null}
                    {t('auth.signInBtn', 'Sign In')}
                  </Button>
                </form>

                {/* Beta notice */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                  🔒 This is a closed beta. Access is by invite only.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;
