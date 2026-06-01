import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Remove any Lovable / GPT-engineer injected badges from the DOM
function useLovableBadgeRemover() {
  useEffect(() => {
    const remove = () => {
      const selectors = [
        '[class*="lovable"]',
        '[id*="lovable"]',
        '[data-lovable]',
        '[class*="tagger"]',
        '[id*="tagger"]',
        '[class*="gpt-engineer"]',
        '[id*="gpt-engineer"]',
        'a[href*="lovable.app"]',
        'a[href*="gpt.engineer"]',
      ];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      });
    };
    remove();
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const About = lazy(() => import("./pages/About"));
const BecomeProvider = lazy(() => import("./pages/BecomeProvider"));
const Explore = lazy(() => import("./pages/Explore"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Affiliate = lazy(() => import("./pages/Affiliate"));
const Support = lazy(() => import("./pages/Support"));
const Blog = lazy(() => import("./pages/Blog"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const GDPR = lazy(() => import("./pages/GDPR"));
const Admin = lazy(() => import("./pages/Admin"));
const AIQualityDashboard = lazy(() => import("./pages/AIQualityDashboard"));
const UserPricing = lazy(() => import("./pages/UserPricing"));
const SailingManual = lazy(() => import("./pages/SailingManual"));
const MarinaPartnership = lazy(() => import("./pages/MarinaPartnership"));
const AICaptainPage = lazy(() => import("./pages/AICaptainPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AddMooring = lazy(() => import("./pages/AddMooring"));
const EditMooring = lazy(() => import("./pages/EditMooring"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));
const QuoteRespond = lazy(() => import("./pages/QuoteRespond"));
const ConciergeSent = lazy(() => import("./pages/ConciergeSent"));
const ProviderProfile = lazy(() => import("./pages/ProviderProfile"));

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppRouteGuard from "./components/AppRouteGuard";
const AIChatWidget = lazy(() => import("./components/AIChatWidget"));
import OfflineIndicator from "./components/OfflineIndicator";

// Hide chat widget on public provider/auth pages
const ConditionalChatWidget = () => {
  const location = useLocation();
  const hiddenRoutes = ["/auth", "/become-provider"];
  if (hiddenRoutes.some(r => location.pathname.startsWith(r))) return null;
  return (
    <Suspense fallback={null}>
      <AIChatWidget />
    </Suspense>
  );
};

const queryClient = new QueryClient();

const App = () => {
  useLovableBadgeRemover();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <BrowserRouter>
            <AppRouteGuard>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
              <Routes>
                {/* ─── ALWAYS ACCESSIBLE ─── */}
                <Route path="/become-provider" element={<BecomeProvider />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/marina-partnership" element={<MarinaPartnership />} />
                <Route path="/join-as-provider" element={<Navigate to="/become-provider" replace />} />
                {/* ─── FULL ACCESS (provider / admin only) ─── */}
                <Route path="/" element={<Index />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/about" element={<About />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/affiliate" element={<Affiliate />} />
                <Route path="/support" element={<Support />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/gdpr" element={<GDPR />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin/ai-quality" element={<AdminRoute><AIQualityDashboard /></AdminRoute>} />
                <Route path="/user-pricing" element={<UserPricing />} />
                <Route path="/sailing-manual" element={<SailingManual />} />
                <Route path="/ai-captain" element={<AICaptainPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/add-mooring" element={<ProtectedRoute><AddMooring /></ProtectedRoute>} />
                <Route path="/edit-mooring/:id" element={<ProtectedRoute><EditMooring /></ProtectedRoute>} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/quote-respond" element={<QuoteRespond />} />
                <Route path="/booking/concierge-sent" element={<ConciergeSent />} />
                <Route path="/:slug" element={<ProviderProfile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <ConditionalChatWidget />
            </AppRouteGuard>
          </BrowserRouter>
        </TooltipProvider>
        </NavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
