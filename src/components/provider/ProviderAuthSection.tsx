import {
  Anchor, Check, Star, Users, ArrowRight,
  Zap, ShieldCheck, Phone as PhoneIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import type { AuthFormData } from "@/hooks/useProviderForm";

interface ProviderAuthSectionProps {
  authMode: 'register' | 'login';
  setAuthMode: (mode: 'register' | 'login') => void;
  authFormData: AuthFormData;
  setAuthFormData: React.Dispatch<React.SetStateAction<AuthFormData>>;
  authSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProviderAuthSection({
  authMode, setAuthMode,
  authFormData, setAuthFormData,
  authSubmitting, onSubmit,
}: ProviderAuthSectionProps) {
  const { toast } = useToast();

  return (
    <div className="min-h-screen">
      <main>
        <section className="py-16 bg-gradient-ocean relative overflow-hidden">
          <div className="absolute top-10 left-10 opacity-10 animate-float">
            <Anchor size={100} className="text-gold" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              {/* Left - Video & Value Prop */}
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full w-fit">
                  <Star size={16} />
                  <span className="text-sm font-medium">Join our mooring providers</span>
                </div>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground">
                  List your moorings
                  <span className="block text-gold">and turn them into income</span>
                </h1>
                <p className="text-primary-foreground/80">
                  List your berths on docks, buoys or in a marina and watch the AI captain find them — bookings come to you.
                </p>

                <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black mt-2">
                  <video
                    src="/videos/Reel8WalkthroughLandscape.mp4"
                    className="w-full hidden md:block"
                    autoPlay loop muted playsInline controls
                  />
                  <video
                    src="/videos/Reel7Walkthrough.mp4"
                    className="w-full block md:hidden"
                    autoPlay loop muted playsInline controls
                  />
                </div>
                <div className="space-y-2 text-primary-foreground/90 text-sm">
                  <div className="flex items-center gap-3">
                    <Check className="text-gold flex-shrink-0" size={16} />
                    <span>Free listing — no subscription</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="text-gold flex-shrink-0" size={16} />
                    <span>88% earnings are yours (only 12% commission)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="text-gold flex-shrink-0" size={16} />
                    <span>Available in 11 Mediterranean countries</span>
                  </div>
                </div>
              </div>

              {/* Right - Auth Form */}
              <div className="bg-card rounded-2xl p-8 shadow-hover">
                <div className="text-center mb-6">
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
                    {authMode === 'register' ? 'Register for free' : 'Welcome back'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {authMode === 'register' ? 'Create an account to add your mooring' : 'Log in to manage your moorings'}
                  </p>
                </div>

                <div className="mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 font-medium bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
                    onClick={async () => {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: `${window.location.origin}/become-provider` },
                      });
                      if (error) {
                        toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
                      }
                    }}
                  >
                    <svg className="mr-2" width="18" height="18" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </Button>

                  <div className="flex items-center gap-3 my-4">
                    <div className="h-px bg-border flex-1" />
                    <span className="text-xs text-muted-foreground uppercase font-medium">or with email</span>
                    <div className="h-px bg-border flex-1" />
                  </div>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <>
                      <div>
                        <Label htmlFor="auth_name">Full Name *</Label>
                        <div className="relative mt-1">
                          <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="auth_name"
                            placeholder="Ivan Horvat"
                            value={authFormData.full_name}
                            onChange={(e) => setAuthFormData(prev => ({ ...prev, full_name: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="auth_phone">Phone *</Label>
                        <div className="relative mt-1">
                          <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                          <Input
                            id="auth_phone"
                            type="tel"
                            placeholder="+385 91 234 5678"
                            value={authFormData.phone}
                            onChange={(e) => setAuthFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <Label htmlFor="auth_email">Email Address *</Label>
                    <div className="relative mt-1">
                      <Zap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="auth_email"
                        type="email"
                        placeholder="ivan@email.com"
                        value={authFormData.email}
                        onChange={(e) => setAuthFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="auth_password">Password *</Label>
                    <div className="relative mt-1">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                      <Input
                        id="auth_password"
                        type="password"
                        placeholder="••••••••"
                        value={authFormData.password}
                        onChange={(e) => setAuthFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold text-lg"
                    disabled={authSubmitting}
                  >
                    {authSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      authMode === 'register' ? (
                        <>🚀 Next step: Add Mooring <ArrowRight className="ml-2" size={20} /></>
                      ) : (
                        "Log in"
                      )
                    )}
                  </Button>

                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {authMode === 'register' ? (
                      <span>Already have an account? <button type="button" className="text-gold font-medium hover:underline" onClick={() => setAuthMode('login')}>Log in</button></span>
                    ) : (
                      <span>Don't have an account? <button type="button" className="text-gold font-medium hover:underline" onClick={() => setAuthMode('register')}>Register for free</button></span>
                    )}
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
