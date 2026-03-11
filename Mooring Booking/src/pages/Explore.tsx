import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MooringCardWithBooking from "@/components/MooringCardWithBooking";
import {
  Search, MapPin, SlidersHorizontal, Grid, Map as MapIcon, X, Loader2,
  Calendar, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { useAvailableMoorings, useMooringsByLocation } from "@/hooks/useMoorings";
import { useDebounce } from "@/hooks/useDebounce";
import ExploreMap from "@/components/ExploreMap";
import AdBanner from "@/components/AdBanner";
import { useTranslation } from "react-i18next";

// ─── Constants ───────────────────────────────────────────────────────────────

/**
 * Map of every known alias (any language, lower-case) to the English country
 * name stored in the DB. Add more rows as needed.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  // Croatia
  croatia: "Croatia", hrvatska: "Croatia", kroatien: "Croatia",
  croazia: "Croatia", croatie: "Croatia", croacia: "Croatia",
  "hırvatistan": "Croatia", chorwacja: "Croatia",
  // Italy
  italy: "Italy", italia: "Italy", italija: "Italy",
  italien: "Italy", italie: "Italy", "İtalya": "Italy",
  italya: "Italy", itali: "Italy", "إيطاليا": "Italy",
  // Greece
  greece: "Greece", grecia: "Greece", grčka: "Greece", grcka: "Greece",
  griechenland: "Greece", grèce: "Greece", yunanistan: "Greece",
  hellas: "Greece", "Ελλάδα": "Greece", ellada: "Greece",
  // Spain
  spain: "Spain", españa: "Spain", espana: "Spain", spanija: "Spain",
  spanien: "Spain", espagne: "Spain", spagna: "Spain", "İspanya": "Spain", ispanya: "Spain",
  // France
  france: "France", francuska: "France", frankreich: "France",
  frankrig: "France", fransa: "France", "فرانسه": "France",
  // Montenegro
  montenegro: "Montenegro", crna_gora: "Montenegro", "crna gora": "Montenegro",
  karadağ: "Montenegro", karadag: "Montenegro",
  // Slovenia
  slovenia: "Slovenia", slovenija: "Slovenia", slowenien: "Slovenia",
  slovénie: "Slovenia", eslovenia: "Slovenia",
  // Albania
  albania: "Albania", albanija: "Albania", shqipëri: "Albania",
  albanien: "Albania", albanie: "Albania", arnavutluk: "Albania",
  // Turkey
  turkey: "Turkey", türkiye: "Turkey", turkiye: "Turkey", turska: "Turkey",
  türkei: "Turkey", turquie: "Turkey", turchia: "Turkey",
  // Malta
  malta: "Malta",
  // Cyprus
  cyprus: "Cyprus", kipar: "Cyprus", kıbrıs: "Turkey", kibris: "Cyprus",
  zypern: "Cyprus", chypre: "Cyprus", cipro: "Cyprus",
  // Monaco
  monaco: "Monaco",
};

/** Returns the canonical English DB country name for ANY language input, or null. */
function detectCountry(query: string): string | null {
  if (!query) return null;
  const key = query.trim().toLowerCase();
  return COUNTRY_ALIASES[key] ?? null;
}

const amenitiesOptions = ["water", "electricity", "wifi", "toilet", "shower", "fuel", "restaurant"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format a YYYY-MM-DD string to DD.MM.YYYY (European standard) */
function formatDateEU(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}.${m}.${y}`;
}

/** Today as YYYY-MM-DD */
function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Tomorrow as YYYY-MM-DD */
function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** Count nights between two YYYY-MM-DD strings */
function countNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

// ─── Component ───────────────────────────────────────────────────────────────

const ExplorePage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // ── URL params (from homepage search bar) ──────────────────────────────
  const urlSearch = searchParams.get("search") || "";
  const urlCheckIn = searchParams.get("checkIn") || "";
  const urlCheckOut = searchParams.get("checkOut") || "";

  // ── Local input state (what the user is typing / selecting) ───────────
  const [locationInput, setLocationInput] = useState(urlSearch);
  const [checkIn, setCheckIn] = useState(urlCheckIn);
  const [checkOut, setCheckOut] = useState(urlCheckOut);

  // ── Committed search state (updated only when Search is pressed) ───────
  const [committedLocation, setCommittedLocation] = useState(urlSearch);
  const [committedCheckIn, setCommittedCheckIn] = useState(urlCheckIn);
  const [committedCheckOut, setCommittedCheckOut] = useState(urlCheckOut);

  // ── Advanced filters ───────────────────────────────────────────────────
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showLastMinuteOnly, setShowLastMinuteOnly] = useState(false);
  const [showWinterStorageOnly, setShowWinterStorageOnly] = useState(false);
  const [sortBy, setSortBy] = useState("rating");

  // ── View mode ──────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // ── Referral code capture ──────────────────────────────────────────────
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) sessionStorage.setItem("referral_code", ref);
  }, [searchParams]);

  // ── Derive query params for the hooks ─────────────────────────────────
  const detectedCountry = detectCountry(committedLocation);
  const hookParams = {
    checkIn: committedCheckIn || undefined,
    checkOut: committedCheckOut || undefined,
    query: detectedCountry ? undefined : committedLocation,
    country: detectedCountry || undefined,
  };

  // Text-based hook (exact country / location ilike match)
  const { data: mooringsData, isLoading: mooringsLoading } =
    useAvailableMoorings(hookParams);

  // Geo-based hook — debounced 600 ms; kicks in for any non-country query
  const debouncedLocation = useDebounce(committedLocation, 600);
  const useGeo = !!debouncedLocation && !detectedCountry;

  const { data: geoData, isLoading: geoLoading } = useMooringsByLocation({
    query: useGeo ? debouncedLocation : '',
    radiusKm: 20,
    checkIn: committedCheckIn || undefined,
    checkOut: committedCheckOut || undefined,
  });

  // Use geo results as primary; fall back to text results only when geo is empty
  const textMoorings = mooringsData || [];
  const geoMoorings = geoData || [];
  const allMoorings = useGeo
    ? (geoMoorings.length > 0 ? geoMoorings : textMoorings)
    : textMoorings;

  const mooringsLoading_ = mooringsLoading || (useGeo && geoLoading);

  // ── Client-side post-filter (amenities, special flags, sort) ─────────
  // When using geo results, they are already pre-sorted by distance.
  // We respect the user's sort choice but keep geo-distance sort as tiebreaker.
  const filteredMoorings = allMoorings
    .filter((m) => {
      if (showLastMinuteOnly && !m.isLastMinute) return false;
      if (showWinterStorageOnly && !m.winterStorage) return false;
      if (selectedAmenities.length > 0 &&
        !selectedAmenities.every((a) => m.amenities.includes(a))) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.isPremiumListing && !b.isPremiumListing) return -1;
      if (!a.isPremiumListing && b.isPremiumListing) return 1;
      // In geo mode, ONLY preserve distance order when sort is default "rating"
      // Price and review sorts must always work regardless of geo mode
      if (sortBy === "rating") return useGeo ? 0 : b.rating - a.rating;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
      return 0;
    });

  // ── Handle Search button ───────────────────────────────────────────────
  function handleSearch() {
    // Validate: check-out must be after check-in
    if (checkIn && checkOut && checkOut <= checkIn) {
      setCheckOut("");
    }
    setCommittedLocation(locationInput);
    setCommittedCheckIn(checkIn);
    setCommittedCheckOut(checkOut);
  }

  // Allow pressing Enter in the location input to trigger search
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSearch();
  }

  // ── Result description ─────────────────────────────────────────────────
  function buildResultLabel() {
    const parts: string[] = [];
    if (committedCheckIn && committedCheckOut) {
      parts.push(
        `${t("explore.availableFor", "available for")} ${formatDateEU(committedCheckIn)} – ${formatDateEU(committedCheckOut)}`
      );
    }
    if (committedLocation) parts.push(`${t("explore.in", "in")} "${committedLocation}"`);
    return parts.length ? parts.join(" ") : "";
  }

  const nights = countNights(committedCheckIn, committedCheckOut);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">

        {/* ─── Search Header ──────────────────────────────────────────── */}
        <section className="bg-gradient-ocean py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-primary-foreground mb-6 text-center">
                {t("explore.exploreTitle", "Explore 1,000+ Affordable Moorings Across the Mediterranean")}
              </h1>

              {/* ── Search strip ─────────────────────────────────────── */}
              <div className="bg-card rounded-2xl shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-0 overflow-hidden border border-border">

                {/* Location */}
                <div className="flex-1 flex items-center gap-3 px-4 py-3 border-b md:border-b-0 md:border-r border-border min-w-0">
                  <MapPin size={18} className="text-muted-foreground shrink-0" />
                  <Input
                    placeholder={t("explore.whereTo", "Where to? (country or city)")}
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="border-0 shadow-none bg-transparent focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground"
                  />
                  {locationInput && (
                    <button
                      onClick={() => { setLocationInput(""); setCommittedLocation(""); }}
                      className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Check-in */}
                <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-border">
                  <Calendar size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">
                      {t("explore.checkIn", "Check-in")}
                    </span>
                    <input
                      type="date"
                      value={checkIn}
                      min={todayISO()}
                      onChange={(e) => {
                        setCheckIn(e.target.value);
                        // Auto-advance checkout to next day if needed
                        if (checkOut && e.target.value >= checkOut) {
                          const next = new Date(e.target.value);
                          next.setDate(next.getDate() + 1);
                          setCheckOut(next.toISOString().split("T")[0]);
                        }
                      }}
                      className="text-sm bg-transparent border-0 outline-none text-foreground cursor-pointer w-[130px]"
                      style={{ colorScheme: "light dark" }}
                      lang="hr"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div className="flex items-center gap-2 px-4 py-3 border-b md:border-b-0 md:border-r border-border">
                  <Calendar size={16} className="text-muted-foreground shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none mb-0.5">
                      {t("explore.checkOut", "Check-out")}
                    </span>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn ? (() => {
                        const d = new Date(checkIn);
                        d.setDate(d.getDate() + 1);
                        return d.toISOString().split("T")[0];
                      })() : tomorrowISO()}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="text-sm bg-transparent border-0 outline-none text-foreground cursor-pointer w-[130px]"
                      style={{ colorScheme: "light dark" }}
                      lang="hr"
                    />
                  </div>
                </div>

                {/* Search button */}
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-4 font-semibold text-sm hover:bg-primary/90 transition-colors md:rounded-none md:rounded-r-2xl shrink-0"
                >
                  <Search size={18} />
                  {t("explore.search", "Search")}
                </button>
              </div>

              {/* Night count hint */}
              {nights > 0 && (
                <p className="text-center text-primary-foreground/80 text-sm mt-3">
                  {nights} {nights === 1 ? t("explore.night", "night") : t("explore.nights", "nights")} &nbsp;·&nbsp;
                  {formatDateEU(committedCheckIn)} – {formatDateEU(committedCheckOut)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ─── Filters bar ─────────────────────────────────────────────── */}
        <div className="bg-card border-b border-border py-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 text-sm"
            >
              <SlidersHorizontal size={16} />
              {t("explore.filters", "Filters")}
              <ChevronDown
                size={14}
                className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </Button>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-9 text-sm border-0 bg-muted/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">{t("explore.topRated", "Top Rated")}</SelectItem>
                <SelectItem value="price-low">{t("explore.priceLowHigh", "Price: Low to High")}</SelectItem>
                <SelectItem value="price-high">{t("explore.priceHighLow", "Price: High to Low")}</SelectItem>
                <SelectItem value="reviews">{t("explore.mostReviews", "Most Reviews")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ─── Advanced Filter Panel ───────────────────────────────────── */}
        {showFilters && (
          <section className="bg-card border-b border-border py-5 animate-fade-in">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap gap-6 items-start">
                {/* Amenities */}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                    {t("explore.amenities", "Amenities")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {amenitiesOptions.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full cursor-pointer hover:bg-muted/80 text-sm capitalize"
                      >
                        <Checkbox
                          checked={selectedAmenities.includes(amenity)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAmenities([...selectedAmenities, amenity]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
                            }
                          }}
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special */}
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 block">
                    {t("explore.special", "Special")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 bg-gold/10 text-gold px-3 py-1.5 rounded-full cursor-pointer text-sm font-medium">
                      <Checkbox
                        checked={showLastMinuteOnly}
                        onCheckedChange={(c) => setShowLastMinuteOnly(c as boolean)}
                      />
                      {t("explore.now4TodayOnly", "Now4Today Only")}
                    </label>
                    <label className="flex items-center gap-2 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full cursor-pointer text-sm font-medium">
                      <Checkbox
                        checked={showWinterStorageOnly}
                        onCheckedChange={(c) => setShowWinterStorageOnly(c as boolean)}
                      />
                      {t("explore.winterStorage", "Winter Storage")}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ─── Results ─────────────────────────────────────────────────── */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {mooringsLoading_ ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                {useGeo && (
                  <span className="ml-3 text-sm text-muted-foreground">
                    Geocoding location…
                  </span>
                )}
              </div>
            ) : (
              <>
                {/* Results header */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground text-sm">
                    <span className="font-semibold text-foreground">{filteredMoorings.length}</span>
                    {" "}{t("explore.mooringsFound", "moorings found")}
                    {buildResultLabel() && (
                      <span className="text-muted-foreground"> {buildResultLabel()}</span>
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={viewMode === "grid" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      <Grid size={16} className="mr-1" /> {t("explore.grid", "Grid")}
                    </Button>
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                      className={viewMode === "map" ? "bg-secondary text-secondary-foreground" : ""}
                    >
                      <MapIcon size={16} className="mr-1" /> {t("explore.map", "Map")}
                    </Button>
                  </div>
                </div>

                {/* Map view */}
                {viewMode === "map" && (
                  <div className="mb-8">
                    <ExploreMap moorings={filteredMoorings} />
                  </div>
                )}

                {/* Ad banner */}
                <div className="mb-6">
                  <AdBanner position="sidebar" size="small" />
                </div>

                {/* Grid view */}
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
                            ownerId={mooring.ownerId}
                            ownerName={mooring.ownerName}
                            ownerPhone={mooring.ownerPhone}
                            description={mooring.description}
                            winterStorage={mooring.winterStorage}
                            initialCheckIn={committedCheckIn || undefined}
                            initialCheckOut={committedCheckOut || undefined}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-20">
                        <X className="mx-auto text-muted-foreground mb-4" size={48} />
                        <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                          {committedCheckIn && committedCheckOut
                            ? t("explore.noneAvailable", "No moorings available for these dates")
                            : t("explore.noMoorings", "No moorings found")}
                        </h3>
                        <p className="text-muted-foreground">
                          {committedCheckIn && committedCheckOut
                            ? t("explore.tryOtherDates", "Try different dates or a different location.")
                            : t("explore.tryAdjusting", "Try adjusting your filters or search query.")}
                        </p>
                        {(committedCheckIn || committedLocation) && (
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => {
                              setLocationInput(""); setCommittedLocation("");
                              setCheckIn(""); setCommittedCheckIn("");
                              setCheckOut(""); setCommittedCheckOut("");
                            }}
                          >
                            {t("explore.clearSearch", "Clear search")}
                          </Button>
                        )}
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