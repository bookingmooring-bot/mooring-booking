import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Lock, User, Chrome, Apple, Anchor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type AuthMode = "signin" | "signup" | "forgot" | "recovery";

const AuthPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle, signInWithApple, resetPassword, updatePassword, user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  // ?mode=recovery is where the Supabase password-reset email lands.
  const [mode, setMode] = useState<AuthMode>(() =>
    searchParams.get('mode') === 'recovery' ? 'recovery' : 'signin'
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";
  const isForgot = mode === "forgot";
  const isRecovery = mode === "recovery";
  // A recovery link opened in a different browser has no PKCE verifier, so
  // Supabase cannot create a session; explain instead of showing a dead form.
  const recoverySessionMissing = isRecovery && !authLoading && !user;

  // Redirect if already logged in (but let a recovery session set its password first)
  useEffect(() => {
    if (user && !isRecovery) {
      navigate(redirectTo);
    }
  }, [user, isRecovery, navigate, redirectTo]);

  if (user && !isRecovery) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecovery) {
        if (password !== confirmPassword) {
          toast({
            title: t('auth.passwordMismatch', 'Passwords do not match'),
            variant: "destructive",
          });
          return;
        }
        const { error } = await updatePassword(password);
        if (error) {
          toast({ title: t('auth.resetFailed', 'Could not update password'), description: error.message, variant: "destructive" });
        } else {
          toast({ title: t('auth.passwordUpdated', 'Password updated'), description: t('auth.passwordUpdatedDesc', 'You can now sign in with your new password on both Mooring Booking and AI Captain.') });
          navigate('/dashboard', { replace: true });
        }
      } else if (isForgot) {
        const { error } = await resetPassword(email);
        // Same message whether or not the address exists (no account enumeration).
        if (error) {
          toast({ title: t('auth.resetFailed', 'Could not send reset email'), description: error.message, variant: "destructive" });
        } else {
          toast({ title: t('auth.resetSent', 'Check your email'), description: t('auth.resetSentDesc', 'If an account exists for this address, a password reset link is on its way.') });
          setMode("signin");
        }
      } else if (isSignUp) {
        const { error } = await signUp(email, password, name);
        if (error) {
          toast({
            title: "Registration Failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account Created! 🎉",
            description: "Check your email to confirm your account, then sign in.",
          });
          setMode("signin");
        }
      } else {
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
          navigate(redirectTo);
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    setLoading(true);
    try {
      const { error } = provider === "google" ? await signInWithGoogle() : await signInWithApple();
      if (error) {
        toast({
          title: `${provider === "google" ? "Google" : "Apple"} Login Failed`,
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Social login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const title = isRecovery
    ? t('auth.setNewPassword', 'Set a new password')
    : isForgot
      ? t('auth.forgotTitle', 'Reset your password')
      : isSignUp ? t('auth.signUp', 'Create Account') : t('auth.signIn', 'Welcome Back');
  const subtitle = isRecovery
    ? t('auth.setNewPasswordSubtitle', 'Choose a new password for your account')
    : isForgot
      ? t('auth.forgotSubtitle', "Enter your email and we'll send you a reset link")
      : isSignUp
        ? t('auth.signUpSubtitle', 'Registration is required for all users')
        : t('auth.signInSubtitle', 'Sign in to access your account');
  const submitLabel = isRecovery
    ? t('auth.updatePassword', 'Update Password')
    : isForgot
      ? t('auth.sendResetLink', 'Send Reset Link')
      : isSignUp ? t('auth.createAccount', 'Create Account') : t('auth.signInBtn', 'Sign In');

  const showSocial = !isForgot && !isRecovery;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-20">
        <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-muted py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-ocean rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Anchor className="text-primary-foreground" size={32} />
                </div>
                <h1 className="font-heading text-3xl font-bold text-foreground mb-2">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-card">
                {showSocial && (
                  <>
                    {/* Social Login */}
                    <div className="space-y-3 mb-6">
                      <Button
                        variant="outline"
                        className="w-full h-12 font-medium"
                        onClick={() => handleSocialLogin("google")}
                        disabled={loading}
                      >
                        <Chrome className="mr-2" size={20} />
                        {t('auth.continueGoogle', 'Continue with Google')}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-12 font-medium"
                        onClick={() => handleSocialLogin("apple")}
                        disabled={loading}
                      >
                        <Apple className="mr-2" size={20} />
                        {t('auth.continueApple', 'Continue with Apple')}
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
                  </>
                )}

                {recoverySessionMissing ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {t('auth.recoveryMissing', 'This reset link is no longer valid or was opened in a different browser. Request a new link from the browser you will use to set the password.')}
                    </p>
                    <Button className="w-full h-12 bg-gradient-ocean font-semibold" onClick={() => { setMode("forgot"); navigate('/auth', { replace: true }); }}>
                      {t('auth.requestNewLink', 'Request a new link')}
                    </Button>
                  </div>
                ) : (
                  /* Email Form */
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                      <div>
                        <Label htmlFor="name">{t('auth.fullName', 'Full Name')}</Label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t('auth.namePlaceholder', 'Captain Jack')}
                            className="pl-10"
                            required
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {!isRecovery && (
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
                    )}

                    {!isForgot && (
                      <div>
                        <Label htmlFor="password">{isRecovery ? t('auth.newPassword', 'New Password') : t('auth.password', 'Password')}</Label>
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
                            autoComplete={isRecovery ? "new-password" : isSignUp ? "new-password" : "current-password"}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    {isRecovery && (
                      <div>
                        <Label htmlFor="confirmPassword">{t('auth.confirmPassword', 'Confirm Password')}</Label>
                        <div className="relative mt-1">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pl-10"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            disabled={loading}
                          />
                        </div>
                      </div>
                    )}

                    <Button type="submit" className="w-full h-12 bg-gradient-ocean font-semibold" disabled={loading}>
                      {loading ? (
                        <Loader2 className="animate-spin mr-2" size={20} />
                      ) : null}
                      {submitLabel}
                    </Button>
                  </form>
                )}

                {!isRecovery && (
                  <div className="text-center mt-6 space-y-2">
                    {mode === "signin" && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-sm text-muted-foreground hover:text-secondary hover:underline"
                          disabled={loading}
                        >
                          {t('auth.forgotPassword', 'Forgot your password?')}
                        </button>
                      </div>
                    )}
                    <div>
                      <button
                        type="button"
                        onClick={() => setMode(isSignUp || isForgot ? "signin" : "signup")}
                        className="text-sm text-secondary hover:underline"
                        disabled={loading}
                      >
                        {isSignUp || isForgot
                          ? t('auth.haveAccount', 'Already have an account? Sign In')
                          : t('auth.noAccount', "Don't have an account? Sign Up")}
                      </button>
                    </div>
                  </div>
                )}
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
