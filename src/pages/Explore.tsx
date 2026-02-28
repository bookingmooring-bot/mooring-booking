import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MooringCardWithBooking from "@/components/MooringCardWithBooking";
import { Search, MapPin, SlidersHorizontal, Grid, Map as MapIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { useMoorings } from "@/hooks/useMoorings";
import ExploreMap from "@/components/ExploreMap";
import AdBanner from "@/components/AdBanner";
import { useTranslation } from "react-i18next";

const countries = ["All Countries", "Croatia", "Greece", "Italy", "Spain", "France", "Monaco", "Turkey", "Albania", "Malta", "Cyprus", "Slovenia", "Montenegro"];
const amenitiesOptions = ["water", "electricity", "wifi", "toilet", "shower", "fuel", "restaurant"];


const ExplorePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Initialize from URL params
  const initialSearch = searchParams.get("search") || "";
  const initialCheckIn = searchParams.get("checkIn") || "";
  const initialCheckOut = searchParams.get("checkOut") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showLastMinuteOnly, setShowLastMinuteOnly] = useState(false);
  const [showWinterStorageOnly, setShowWinterStorageOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Update search when URL params change
  useEffect(() => {
    if (initialSearch) {
      setSearchQuery(initialSearch);
    }
  }, [initialSearch]);

  // Fetch moorings from Supabase (falls back to hardcoded data)
  const { data: mooringsData, isLoading: mooringsLoading } = useMoorings();
  const allMoorings = mooringsData || [];

  // Filter moorings from Supabase data source
  const filteredMoorings = allMoorings
    .filter((mooring) => {
      // Country filter
      if (selectedCountry !== "All Countries" && mooring.country !== selectedCountry) return false;

      // Search query - match location, country, or name
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesLocation = mooring.location.toLowerCase().includes(query);
        const matchesCountry = mooring.country.toLowerCase().includes(query);
        const matchesName = mooring.name.toLowerCase().includes(query);
        if (!matchesLocation && !matchesCountry && !matchesName) return false;
      }

      // Last minute filter
      if (showLastMinuteOnly && !mooring.isLastMinute) return false;

      // Winter storage filter
      if (showWinterStorageOnly && !mooring.winterStorage) return false;

      // Amenities filter
      if (selectedAmenities.length > 0 && !selectedAmenities.every(a => mooring.amenities.includes(a))) return false;

      return true;
    })
    .sort((a, b) => {
      // Premium listings always first
      if (a.isPremiumListing && !b.isPremiumListing) return -1;
      if (!a.isPremiumListing && b.isPremiumListing) return 1;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {/* Search Header */}
        <section className="bg-gradient-ocean py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-6 text-center">
                {t('explore.exploreTitle', 'Explore 1,000+ Affordable Moorings Across the Mediterranean')}
              </h1>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder={t('explore.searchPlaceholder', 'Search by name or location...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card border-0"
                  />
                </div>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger className="w-full md:w-48 h-12 bg-card border-0">
                    <MapPin size={18} className="mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="h-12 bg-card border-0 hover:bg-card/80"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal size={18} className="mr-2" />
                  {t('explore.filters', 'Filters')}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Panel */}
        {showFilters && (
          <section className="bg-card border-b border-border py-6 animate-fade-in">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-6 items-center justify-between">
                <div className="flex flex-wrap gap-6">
                  {/* Amenities */}
                  <div>
                    <span className="text-sm font-medium text-foreground mb-2 block">{t('explore.amenities', 'Amenities')}</span>
                    <div className="flex flex-wrap gap-2">
                      {amenitiesOptions.map((amenity) => (
                        <label key={amenity} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/80">
                          <Checkbox
                            checked={selectedAmenities.includes(amenity)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedAmenities([...selectedAmenities, amenity]);
                              } else {
                                setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
                              }
                            }}
                          />
                          <span className="text-sm capitalize">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Now4Today */}
                  <div>
                    <span className="text-sm font-medium text-foreground mb-2 block">{t('explore.special', 'Special')}</span>
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1.5 rounded-full cursor-pointer">
                        <Checkbox
                          checked={showLastMinuteOnly}
                          onCheckedChange={(checked) => setShowLastMinuteOnly(checked as boolean)}
                        />
                        <span className="text-sm font-medium">{t('explore.now4TodayOnly', 'Now4Today Only')}</span>
                      </label>
                      <label className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full cursor-pointer">
                        <Checkbox
                          checked={showWinterStorageOnly}
                          onCheckedChange={(checked) => setShowWinterStorageOnly(checked as boolean)}
                        />
                        <span className="text-sm font-medium">{t('explore.winterStorage', 'Winter Storage')}</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <span className="text-sm font-medium text-foreground mb-2 block">{t('explore.sortBy', 'Sort by')}</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">{t('explore.topRated', 'Top Rated')}</SelectItem>
                      <SelectItem value="price-low">{t('explore.priceLowHigh', 'Price: Low to High')}</SelectItem>
                      <SelectItem value="price-high">{t('explore.priceHighLow', 'Price: High to Low')}</SelectItem>
                      <SelectItem value="reviews">{t('explore.mostReviews', 'Most Reviews')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Results Header */}
            {mooringsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    <span className="font-semibold text-foreground">{filteredMoorings.length}</span> {t('explore.mooringsFound', 'moorings found')}
                    {selectedCountry !== "All Countries" && ` ${t('explore.in', 'in')} ${selectedCountry}`}
                    {searchQuery && ` ${t('explore.for', 'for')} "${searchQuery}"`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      <Grid size={18} className="mr-1" /> {t('explore.grid', 'Grid')}
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                      className={viewMode === "map" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      <MapIcon size={18} className="mr-1" /> {t('explore.map', 'Map')}
                    </Button>
                  </div>
                </div>

                {/* Map View */}
                {viewMode === "map" && (
                  <div className="mb-8">
                    <ExploreMap moorings={filteredMoorings} />
                  </div>
                )}

                {/* Ad Banner */}
                <div className="mb-6">
                  <AdBanner position="sidebar" size="small" />
                </div>

                {/* Moorings Grid */}
                {viewMode === "grid" && (
                  <>
                    {filteredMoorings.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMoorings.map((mooring) => (
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
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <X className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">{t('explore.noMoorings', 'No moorings found')}</h3>
                        <p className="text-muted-foreground">{t('explore.tryAdjusting', 'Try adjusting your filters or search query.')}</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExplorePage;