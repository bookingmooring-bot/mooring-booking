import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";

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
    // Also observe for dynamically added elements
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import BecomeProvider from "./pages/BecomeProvider";
import Explore from "./pages/Explore";
import Pricing from "./pages/Pricing";
import Affiliate from "./pages/Affiliate";
import Support from "./pages/Support";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import GDPR from "./pages/GDPR";
import Admin from "./pages/Admin";
import UserPricing from "./pages/UserPricing";
import SailingManual from "./pages/SailingManual";
import MarinaPartnership from "./pages/MarinaPartnership";
import AICaptainPage from "./pages/AICaptainPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AddMooring from "./pages/AddMooring";
import EditMooring from "./pages/EditMooring";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppRouteGuard from "./components/AppRouteGuard";
import AIChatWidget from "./components/AIChatWidget";

const queryClient = new QueryClient();

const App = () => {
  useLovableBadgeRemover();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRouteGuard>
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
                <Route path="/user-pricing" element={<UserPricing />} />
                <Route path="/sailing-manual" element={<SailingManual />} />
                <Route path="/ai-captain" element={<AICaptainPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/add-mooring" element={<ProtectedRoute><AddMooring /></ProtectedRoute>} />
                <Route path="/edit-mooring/:id" element={<ProtectedRoute><EditMooring /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AIChatWidget />
            </AppRouteGuard>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
