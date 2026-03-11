import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import MooringCardWithBooking from "./MooringCardWithBooking";
import { useMoorings } from "@/hooks/useMoorings";
import { Loader2 } from "lucide-react";

const PopularMoorings = () => {
  const { t } = useTranslation();
  const { data: moorings, isLoading } = useMoorings();
  const popularMoorings = (moorings || []).slice(0, 6);

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('popular.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('popular.subtitle')}
          </p>
        </div>

        {/* Grid or Loader */}
        {isLoading ? (
          <div className="flex justify-center flex-col items-center py-12 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Loading popular moorings...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularMoorings.map((mooring) => (
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
                ownerId={mooring.ownerId}
                ownerName={mooring.ownerName}
                ownerPhone={mooring.ownerPhone}
                description={mooring.description}
                winterStorage={mooring.winterStorage}
              />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            to="/explore"
            className="font-heading font-semibold text-secondary hover:text-primary transition-colors underline underline-offset-4"
          >
            {t('popular.viewAll')} →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PopularMoorings;
