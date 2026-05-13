import { Suspense, lazy } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ThreeLayerMoorings from "@/components/ThreeLayerMoorings";
import HowItWorks from "@/components/HowItWorks";

import HomePricing from "@/components/HomePricing";
import ProviderCTA from "@/components/ProviderCTA";
import AICaptainTeaser from "@/components/AICaptainTeaser";
import Footer from "@/components/Footer";
import WeatherWidget from "@/components/WeatherWidget";
import MapErrorBoundary from "@/components/MapErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

// Lazy load the map to prevent blocking errors
const HomeMap = lazy(() => import("@/components/HomeMap"));

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Weather Widget Section */}
        <section className="py-8 bg-muted">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              <WeatherWidget />
            </div>
          </div>
        </section>

        {/* Interactive Mediterranean Map Section */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">
                Explore the Mediterranean
              </h2>
            </div>
            
            {/* Interactive Map with Error Boundary Fallback to Grid */}
            <MapErrorBoundary>
              <Suspense fallback={
                <div className="w-full h-[400px] rounded-xl overflow-hidden">
                  <Skeleton className="w-full h-full" />
                </div>
              }>
                <HomeMap />
              </Suspense>
            </MapErrorBoundary>
            
            {/* View All Button */}
            <div className="text-center mt-8">
              <Link 
                to="/explore"
                className="inline-flex items-center gap-2 bg-gradient-ocean text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-card"
              >
                <MapPin size={20} />
                Explore All Moorings
              </Link>
            </div>
          </div>
        </section>
        
        <ThreeLayerMoorings />

        <HowItWorks />
        <AICaptainTeaser />

        <HomePricing />
        <ProviderCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;