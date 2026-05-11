import { useParams } from "react-router-dom";
import { Loader2, Anchor, MapPin, Phone, Mail, Globe, Crown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MooringCardWithBooking from "@/components/MooringCardWithBooking";
import { useProviderBySlug } from "@/hooks/useProviderBySlug";
import NotFound from "@/pages/NotFound";
import { RESERVED_SLUGS } from "@/lib/reservedSlugs";

const ProviderProfile = () => {
  const { slug } = useParams<{ slug: string }>();

  if (!slug || RESERVED_SLUGS.has(slug)) {
    return <NotFound />;
  }

  return <ProviderProfileContent slug={slug} />;
};

const ProviderProfileContent = ({ slug }: { slug: string }) => {
  const { data, isLoading } = useProviderBySlug(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!data) {
    return <NotFound />;
  }

  const { profile, moorings } = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="bg-gradient-ocean text-white py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="text-gold" size={28} />
              <span className="text-gold text-sm font-medium">Premium Partner</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold mb-3">
              {profile.full_name || "Marina Partner"}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/80 text-sm">
              {profile.phone && (
                <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 hover:text-white">
                  <Phone size={16} /> {profile.phone}
                </a>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 hover:text-white">
                  <Mail size={16} /> {profile.email}
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Anchor className="text-primary" size={22} />
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Available Moorings ({moorings.length})
              </h2>
            </div>

            {moorings.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                No moorings currently listed.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {moorings.map((mooring) => (
                  <MooringCardWithBooking
                    key={mooring.id}
                    id={mooring.id}
                    name={mooring.name}
                    location={mooring.location}
                    country={mooring.country}
                    countryFlag={mooring.countryFlag}
                    rating={mooring.rating}
                    reviewCount={mooring.reviewCount}
                    price={mooring.price}
                    discountPercent={mooring.discountPercent}
                    isLastMinute={mooring.isLastMinute}
                    isNow4Today={mooring.isNow4Today}
                    windProtection={mooring.windProtection}
                    amenities={mooring.amenities}
                    image={mooring.image}
                    distance={mooring.distance}
                    lat={mooring.lat}
                    lng={mooring.lng}
                    ownerName={mooring.ownerName}
                    ownerPhone={mooring.ownerPhone}
                    description={mooring.description}
                    winterStorage={mooring.winterStorage}
                    mooringLayer={mooring.mooringLayer}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderProfile;
